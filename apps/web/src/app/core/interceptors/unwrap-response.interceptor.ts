import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs';

interface EnvelopeBody {
  success: boolean;
  data?: unknown;
  meta?: unknown;
}

function isEnvelope(body: unknown): body is EnvelopeBody {
  return !!body && typeof body === 'object' && 'success' in body && 'data' in body;
}

/**
 * The API wraps every response in `{ success, data, meta, requestId }`
 * (see apps/api TransformInterceptor). Unwrap it here so the rest of the
 * app can work with the actual payload directly: a plain response becomes
 * just its `data`, while a paginated list response keeps its `meta`
 * alongside `data` as `{ data, meta }` (see PaginatedResult<T>).
 */
export const unwrapResponseInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    map((event) => {
      if (event instanceof HttpResponse && isEnvelope(event.body)) {
        const body = event.body.meta
          ? { data: event.body.data, meta: event.body.meta }
          : event.body.data;
        return event.clone({ body });
      }
      return event;
    }),
  );
};
