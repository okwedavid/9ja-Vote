import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { DATA_CLASSIFICATION } from '@9ja-vote/shared-types';
import { Observable } from 'rxjs';

/**
 * Stamps every response so that no consumer (app, website, broadcaster) can
 * mistake demonstration data for official results.
 */
@Injectable()
export class ClassificationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    context.switchToHttp().getResponse().setHeader('X-Data-Classification', DATA_CLASSIFICATION);
    return next.handle();
  }
}
