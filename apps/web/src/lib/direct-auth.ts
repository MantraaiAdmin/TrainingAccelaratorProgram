import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { Client } from 'pg';

const REPAIR_STATEMENTS = [
  `DO $$ BEGIN
     CREATE TYPE "StudentCommissionTier" AS ENUM ('AUTO', 'STANDARD', 'PREMIUM');
   EXCEPTION WHEN duplicate_object THEN null;
   END $$;`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "commissionTier" "StudentCommissionTier" NOT NULL DEFAULT 'AUTO';`,
];

type DirectLoginResult = {
  user: Record<string, unknown>;
  accessToken: string;
  refreshToken: string;
};

function canDirectLogin(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim() && process.env.JWT_SECRET?.trim());
}

export async function directLogin(
  email: string,
  password: string,
): Promise<DirectLoginResult | 'invalid' | null> {
  if (!canDirectLogin()) return null;

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('localhost')
      ? undefined
      : { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    for (const sql of REPAIR_STATEMENTS) {
      await client.query(sql);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const result = await client.query<{
      id: string;
      email: string;
      passwordHash: string;
      firstName: string;
      lastName: string;
      role: string;
      avatarUrl: string | null;
      xp: number;
      level: number;
      streak: number;
      isActive: boolean;
      collegeId: string | null;
      departmentId: string | null;
      year: number | null;
    }>(
      `SELECT id, email, "passwordHash", "firstName", "lastName", role, "avatarUrl",
              xp, level, streak, "isActive", "collegeId", "departmentId", year
       FROM "User"
       WHERE lower(email) = $1
       LIMIT 1`,
      [normalizedEmail],
    );

    const user = result.rows[0];
    if (!user || !user.isActive || !user.passwordHash) return 'invalid';

    const valid = await bcrypt.compare(password, user.passwordHash).catch(() => false);
    if (!valid) return 'invalid';

    const refreshToken = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await client.query(
      `INSERT INTO "RefreshToken" (id, token, "userId", "expiresAt", "createdAt")
       VALUES ($1, $2, $3, $4, NOW())`,
      [randomUUID(), refreshToken, user.id, expiresAt],
    );

    void client.query(`UPDATE "User" SET "lastLoginAt" = NOW() WHERE id = $1`, [user.id]);

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const accessToken = await new SignJWT({
      sub: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(process.env.JWT_EXPIRES_IN || '15m')
      .sign(secret);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        isActive: user.isActive,
        collegeId: user.collegeId,
        departmentId: user.departmentId,
        year: user.year,
      },
      accessToken,
      refreshToken,
    };
  } finally {
    await client.end();
  }
}
