import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponseBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field?: string; message: string }>;
  };
  requestId: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId =
      (request.headers['x-correlation-id'] as string) || 'unknown';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';
    let details: Array<{ field?: string; message: string }> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const res = exceptionResponse as Record<string, unknown>;
        message = (res.message as string) || message;
        errorCode = (res.error as string) || this.getErrorCode(status);

        // Handle class-validator errors
        if (Array.isArray(res.message)) {
          details = (res.message as string[]).map((msg) => ({ message: msg }));
          message = 'Validation failed';
          errorCode = 'VALIDATION_ERROR';
        }
      }
    } else if (exception instanceof Error) {
      // Never expose internal error details in production
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
        { requestId },
      );

      if (process.env.NODE_ENV === 'development') {
        message = exception.message;
      }
    }

    const responseBody: ErrorResponseBody = {
      success: false,
      error: {
        code: errorCode,
        message,
        ...(details && { details }),
      },
      requestId,
    };

    response.status(status).json(responseBody);
  }

  private getErrorCode(status: number): string {
    const codeMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
    };
    return codeMap[status] || 'UNKNOWN_ERROR';
  }
}
