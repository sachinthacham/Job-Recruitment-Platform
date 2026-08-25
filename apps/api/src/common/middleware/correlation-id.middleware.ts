import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generates or propagates a correlation ID for request tracing.
 * If the incoming request has X-Correlation-ID, it is preserved.
 * Otherwise, a new UUID is generated.
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const correlationId =
      (req.headers['x-correlation-id'] as string) || uuidv4();

    req.headers['x-correlation-id'] = correlationId;
    _res.setHeader('X-Correlation-ID', correlationId);

    next();
  }
}
