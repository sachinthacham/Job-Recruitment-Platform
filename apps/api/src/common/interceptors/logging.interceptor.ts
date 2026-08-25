import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip } = request;
    const correlationId = request.headers['x-correlation-id'] as string;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse<Response>();
          const { statusCode } = response;
          const duration = Date.now() - startTime;

          this.logger.log(
            JSON.stringify({
              correlationId,
              method,
              url,
              statusCode,
              duration: `${duration}ms`,
              ip,
              userAgent: userAgent.substring(0, 100),
            }),
          );
        },
        error: (error: Error) => {
          const duration = Date.now() - startTime;

          this.logger.error(
            JSON.stringify({
              correlationId,
              method,
              url,
              duration: `${duration}ms`,
              ip,
              error: error.message,
            }),
          );
        },
      }),
    );
  }
}
