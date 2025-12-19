# Multi-Tenancy SaaS Architecture Guide

## Overview
Implemented a multi-tenancy SaaS pattern using TypeORM with a central `Church` entity as the organizational tenant. All data (Users, Members) are scoped to a Church organization.

## Entity Relationship Diagram

```
Church (SaaS Tenant)
  ├─ 1:N → Users (churchId required)
  │   ├─ 1:N → Members (userId optional)
  │
  └─ 1:N → Members (churchId required)
```

## Entity Structure

### Church Entity (`src/entities/church.entity.ts`)
Central organization entity representing a single SaaS tenant:

```typescript
@Entity('churches')
export class Church {
  id: UUID (Primary Key)
  name: String
  address?: String
  phone?: String
  email: String (Unique)
  subscriptionPlan: String (FREE, BASIC, PRO)
  status: String (ACTIVE, SUSPENDED)
  createdAt: DateTime
  updatedAt: DateTime
  users: User[] (OneToMany)
  members: Member[] (OneToMany)
}
```

### User Entity (Updated `src/entities/user.entity.ts`)
```typescript
@Entity('users')
@Index(['churchId'])
export class User {
  id: UUID
  churchId: String (Foreign Key - Required) ← NEW
  email: String (Unique)
  password: String
  role: String (ADMIN, USER)
  state: String (ACTIVE, INACTIVE)
  confirmCode?: String
  createdAt: DateTime
  updatedAt: DateTime
  members: Member[] (OneToMany)
  church: Church (ManyToOne) ← NEW
}
```

### Member Entity (Updated `src/entities/member.entity.ts`)
```typescript
@Entity('members')
@Index(['userId'])
@Index(['churchId']) ← NEW
export class Member {
  id: UUID
  churchId: String (Foreign Key - Required) ← NEW
  name: String
  phone?: String
  birthDate?: Date
  status: String (ACTIVE, INACTIVE)
  baptismStatus: String (PENDING, COMPLETED)
  createdAt: DateTime
  userId?: String (Foreign Key - Optional)
  user?: User (ManyToOne)
  church: Church (ManyToOne) ← NEW
}
```

## Database Schema

### Automatic Table Creation
When `synchronize: true` (development mode), TypeORM creates:

```sql
-- Churches Table
CREATE TABLE churches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  address VARCHAR,
  phone VARCHAR,
  email VARCHAR UNIQUE NOT NULL,
  subscriptionPlan VARCHAR NOT NULL,
  status VARCHAR NOT NULL,
  createdAt TIMESTAMP DEFAULT now(),
  updatedAt TIMESTAMP DEFAULT now()
);

-- Users Table (Updated)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  churchId UUID NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  role VARCHAR NOT NULL,
  state VARCHAR NOT NULL,
  confirmCode VARCHAR,
  createdAt TIMESTAMP DEFAULT now(),
  updatedAt TIMESTAMP DEFAULT now(),
  CONSTRAINT FK_users_churchId FOREIGN KEY (churchId) REFERENCES churches(id)
);
CREATE INDEX idx_users_churchId ON users(churchId);

-- Members Table (Updated)
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  churchId UUID NOT NULL,
  userId UUID,
  name VARCHAR NOT NULL,
  phone VARCHAR,
  birthDate DATE,
  status VARCHAR NOT NULL,
  baptismStatus VARCHAR NOT NULL,
  createdAt TIMESTAMP DEFAULT now(),
  CONSTRAINT FK_members_churchId FOREIGN KEY (churchId) REFERENCES churches(id),
  CONSTRAINT FK_members_userId FOREIGN KEY (userId) REFERENCES users(id)
);
CREATE INDEX idx_members_churchId ON members(churchId);
CREATE INDEX idx_members_userId ON members(userId);
```

## Multi-Tenancy Implementation Patterns

### 1. Guard-Based Church Isolation (Request-Scoped)

```typescript
// src/auth/church-tenant.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class ChurchTenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // From JWT/Auth
    
    // Attach churchId to request for service-level filtering
    request.churchId = user.churchId;
    
    if (!user.churchId) {
      throw new ForbiddenException('Church context required');
    }
    
    return true;
  }
}
```

### 2. Service-Level Filtering

```typescript
// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Always filter by churchId
  async findByChurch(churchId: string, email: string) {
    return this.usersRepository.findOne({
      where: { churchId, email },
      relations: ['church', 'members'],
    });
  }

  async findAllByChurch(churchId: string) {
    return this.usersRepository.find({
      where: { churchId },
      relations: ['members'],
    });
  }

  async createForChurch(churchId: string, data: CreateUserDto) {
    return this.usersRepository.save({
      churchId,
      ...data,
    });
  }
}
```

### 3. Request-Aware Service Injection

```typescript
// src/users/users.controller.ts
import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ChurchTenantGuard } from '../auth/church-tenant.guard';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(ChurchTenantGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getUsers(@Request() req) {
    // req.churchId is set by ChurchTenantGuard
    return this.usersService.findAllByChurch(req.churchId);
  }

  @Post()
  async createUser(@Request() req, @Body() createUserDto) {
    return this.usersService.createForChurch(req.churchId, createUserDto);
  }
}
```

### 4. Church Service for Tenant Management

```typescript
// src/churches/churches.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Church } from '../entities/church.entity';

@Injectable()
export class ChurchesService {
  constructor(
    @InjectRepository(Church)
    private churchesRepository: Repository<Church>,
  ) {}

  async create(name: string, email: string) {
    return this.churchesRepository.save({
      name,
      email,
      subscriptionPlan: 'FREE',
      status: 'ACTIVE',
    });
  }

  async findById(id: string) {
    return this.churchesRepository.findOne({
      where: { id },
      relations: ['users', 'members'],
    });
  }

  async findByEmail(email: string) {
    return this.churchesRepository.findOne({
      where: { email },
    });
  }

  async updateSubscriptionPlan(id: string, plan: string) {
    return this.churchesRepository.update(id, { subscriptionPlan: plan });
  }

  async suspend(id: string) {
    return this.churchesRepository.update(id, { status: 'SUSPENDED' });
  }
}
```

## Module Setup

```typescript
// src/churches/churches.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Church } from '../entities/church.entity';
import { ChurchesService } from './churches.service';
import { ChurchesController } from './churches.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Church])],
  providers: [ChurchesService],
  controllers: [ChurchesController],
  exports: [ChurchesService],
})
export class ChurchesModule {}
```

## User Registration Flow (Multi-Tenant)

```typescript
// Registration: Create Church → Create User → Create Member

async registerChurch(registerDto: RegisterChurchDto) {
  // 1. Create Church (organization)
  const church = await this.churchesService.create(
    registerDto.churchName,
    registerDto.churchEmail,
  );

  // 2. Create Admin User for this Church
  const user = await this.usersService.createForChurch(church.id, {
    email: registerDto.adminEmail,
    password: await hash(registerDto.password),
    role: 'ADMIN',
    state: 'ACTIVE',
  });

  // 3. Optionally create initial Member
  if (registerDto.memberName) {
    await this.membersService.createForChurch(church.id, {
      name: registerDto.memberName,
      userId: user.id,
    });
  }

  return { church, user };
}
```

## Tenant Data Isolation Best Practices

### ✓ DO:
```typescript
// Always include churchId in WHERE clause
const users = await usersRepository.find({
  where: { churchId: req.churchId }
});

// Always set churchId when creating
await usersRepository.save({
  churchId: req.churchId,
  ...data
});

// Use indexes for performance
@Index(['churchId'])
```

### ✗ DON'T:
```typescript
// Never load all users without filtering
const users = await usersRepository.find();

// Never forget churchId validation
const users = await usersRepository.findOne({ where: { email } });

// Never trust client-provided churchId
const churchId = req.body.churchId; // ❌ Use req.user.churchId instead
```

## Performance Optimization

### Indexes Created:
```sql
-- Fast lookups by church
CREATE INDEX idx_users_churchId ON users(churchId);
CREATE INDEX idx_members_churchId ON members(churchId);
CREATE INDEX idx_members_userId ON members(userId);

-- Fast lookups within church
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_churches_email ON churches(email);
```

### Query Optimization Examples:
```typescript
// Efficiently load all data for a church
const church = await churchesRepository.findOne({
  where: { id: churchId },
  relations: ['users', 'members'], // Eager load
});

// Efficiently count members in a church
const memberCount = await membersRepository.count({
  where: { churchId }
});

// Pagination within church
const [users, total] = await usersRepository.findAndCount({
  where: { churchId },
  skip: 0,
  take: 10,
});
```

## Migration Strategy (Production)

For production deployments, disable `synchronize` and use migrations:

```bash
# Generate migration for multi-tenancy
npx typeorm migration:generate src/migrations/AddMultiTenancy

# Run migration
npx typeorm migration:run
```

## Testing Multi-Tenancy

```typescript
// Test: Verify data isolation between churches
async testDataIsolation() {
  // Create Church A
  const churchA = await churchesService.create('Church A', 'a@church.com');
  const userA = await usersService.createForChurch(churchA.id, { ... });

  // Create Church B
  const churchB = await churchesService.create('Church B', 'b@church.com');
  const userB = await usersService.createForChurch(churchB.id, { ... });

  // Verify isolation: Church A cannot see Church B's users
  const usersA = await usersService.findAllByChurch(churchA.id);
  expect(usersA).not.toContain(userB);
}
```

## References
- [NestJS Multi-Tenancy](https://docs.nestjs.com/security/multi-tenancy)
- [TypeORM Relations](https://typeorm.io/relations)
- [TypeORM Query Builder](https://typeorm.io/select-query-builder)
- [SaaS Architecture Best Practices](https://www.postgresql.org/docs/current/sql-syntax.html)
