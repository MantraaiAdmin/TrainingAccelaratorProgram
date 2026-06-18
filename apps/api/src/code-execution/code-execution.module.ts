import { Module } from '@nestjs/common';
import { CodeExecutionService } from './code-execution.service';
import { CodeExecutionController } from './code-execution.controller';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [GamificationModule],
  controllers: [CodeExecutionController],
  providers: [CodeExecutionService],
  exports: [CodeExecutionService],
})
export class CodeExecutionModule {}
