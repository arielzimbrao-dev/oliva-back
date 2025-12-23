import {
  NestInterceptor,
  Injectable,
  ExecutionContext,
  CallHandler,
  Scope,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Context, ContextKey } from './context';

@Injectable({ scope: Scope.REQUEST })
export class ContextInterceptor implements NestInterceptor {
  constructor(private readonly context: Context) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    let token = undefined;

    if (request.headers['authorization']) {
      token = request.headers['authorization'].split(' ')[1];

      this.context.setKey(ContextKey.USER, request.user);
      this.context.setKey(ContextKey.TOKEN, token);
    }

    return next.handle();
  }
}
