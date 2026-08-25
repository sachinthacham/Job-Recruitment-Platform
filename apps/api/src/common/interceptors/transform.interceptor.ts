import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Request } from 'express';

export interface SuccessResponse<T> {
  success: true;
  data: T;
  requestId: string;
  meta?: Record<string, unknown>;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  SuccessResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<SuccessResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const requestId =
      (request.headers['x-correlation-id'] as string) || 'unknown';

    return next.handle().pipe(
      map((data) => {
        // If the data already has pagination meta, extract it
        const result = data as unknown as Record<string, unknown>;
        let meta: Record<string, unknown> | undefined;

        if (result && typeof result === 'object' && 'meta' in result) {
          meta = result.meta as Record<string, unknown>;
          data = result.data as T;
        }

        return {
          success: true as const,
          data,
          requestId,
          ...(meta && { meta }),
        };
      }),
    );
  }
}
