import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { repairProductionSchema } from './database-repair';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    await repairProductionSchema(this);

    // Verify auth-critical schema before accepting traffic.
    try {
      await this.$queryRaw`SELECT "commissionTier" FROM "User" LIMIT 1`;
      this.logger.log('Database schema verified for auth');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Auth schema verification failed: ${message}`);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
