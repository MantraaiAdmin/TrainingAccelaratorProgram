import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TracksModule } from './tracks/tracks.module';
import { ProgressModule } from './progress/progress.module';
import { CodeExecutionModule } from './code-execution/code-execution.module';
import { AiModule } from './ai/ai.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { ProjectsModule } from './projects/projects.module';
import { GamificationModule } from './gamification/gamification.module';
import { AdminModule } from './admin/admin.module';
import { CertificatesModule } from './certificates/certificates.module';
import { CollegesModule } from './colleges/colleges.module';
import { StorageModule } from './storage/storage.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    TracksModule,
    ProgressModule,
    CodeExecutionModule,
    AiModule,
    QuizzesModule,
    AssignmentsModule,
    ProjectsModule,
    GamificationModule,
    AdminModule,
    CertificatesModule,
    CollegesModule,
    StorageModule,
    AnnouncementsModule,
    HealthModule,
  ],
})
export class AppModule {}
