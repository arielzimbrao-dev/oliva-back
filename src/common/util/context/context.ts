import { Injectable, Scope } from '@nestjs/common';
import { RoleSlugEnum } from 'src/common/enum/role-slug.enum';

export class UserContextDto {
  id: string;
  email: string;
  name: string;
  role: RoleSlugEnum;
  churchId: string;
}

@Injectable({ scope: Scope.REQUEST })
export class Context {
  private map: Map<string, any> = new Map();

  getKey(key: ContextKey) {
    return this.map.get(key);
  }

  setKey(key: ContextKey, value: any) {
    this.map.set(key, value);
  }

  getToken() {
    return this.map.get(ContextKey.TOKEN);
  }

  getUser(): UserContextDto {
    return this.map.get(ContextKey.USER);
  }
}

export enum ContextKey {
  TOKEN = 'TOKEN',
  USER = 'USER',
}
