import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Scope,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RoleSlugEnum } from 'src/common/enum/role-slug.enum';
import { NoAccessPermissionError } from 'src/common/exceptions/exception';

@Injectable({ scope: Scope.REQUEST })
export class RoleInterceptor implements NestInterceptor {
  private roles: RoleSlugEnum[] = [];
  constructor(roles: RoleSlugEnum[]) {
    this.roles = roles;
  }
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const user = context.switchToHttp().getRequest().user;

    if (
      this.roles.includes(user.role) ||
      user.role === RoleSlugEnum.ADMIN
    ) {
      return next.handle().pipe();
    } else {
      throw new NoAccessPermissionError();
    }
  }
}
