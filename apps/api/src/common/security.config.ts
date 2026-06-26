export function validateSecurityConfig(): void {
  const isProd = process.env.NODE_ENV === 'production';
  const jwtSecret = process.env.JWT_SECRET?.trim();

  if (isProd) {
    if (!jwtSecret || jwtSecret.length < 32) {
      throw new Error('JWT_SECRET must be set to at least 32 characters in production');
    }
    if (
      jwtSecret === 'your-super-secret-jwt-key-change-in-production' ||
      jwtSecret === 'dev-secret' ||
      jwtSecret === 'constel-jwt-secret-change-in-production'
    ) {
      throw new Error('JWT_SECRET must not use a default or placeholder value in production');
    }
  }
}

export function isPublicRegistrationAllowed(): boolean {
  return process.env.ALLOW_PUBLIC_REGISTRATION === 'true';
}

export function isCodeExecutionAllowed(): boolean {
  if (process.env.NODE_ENV !== 'production') return true;
  if (process.env.USE_DOCKER_SANDBOX === 'true') return true;
  return process.env.ALLOW_LOCAL_CODE_EXECUTION === 'true';
}
