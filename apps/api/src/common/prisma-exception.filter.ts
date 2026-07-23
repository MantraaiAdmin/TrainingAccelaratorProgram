import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientInitializationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(
    exception: Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientInitializationError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    this.logger.error(
      `Prisma error ${'code' in exception ? exception.code : 'INIT'}: ${exception.message}`,
      exception.stack,
    );

    const isProd = process.env.NODE_ENV === 'production';
    const message = isProd
      ? 'Database error — please try again shortly'
      : exception.message;

    response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      message,
      ...(isProd ? {} : { prismaCode: 'code' in exception ? exception.code : 'INIT' }),
    });
  }
}
