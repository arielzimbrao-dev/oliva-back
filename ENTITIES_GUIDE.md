# User and Member Entities Guide

## Overview
Implemented TypeORM entities for `User` and `Member` with PostgreSQL support, following NestJS best practices.

## Entity Relationships

### User Entity (`src/entities/user.entity.ts`)
- **Fields:**
  - `id` (UUID, Primary Key) - Auto-generated
  - `email` (String, Unique) - User email address
  - `password` (String) - Hashed password
  - `role` (String) - ADMIN, USER, etc.
  - `state` (String) - ACTIVE, INACTIVE
  - `createdAt` (DateTime) - Auto-created timestamp
  - `updatedAt` (DateTime) - Auto-updated timestamp
  - `confirmCode` (String, Optional) - Email confirmation code
  - `members` (OneToMany) - Related Member records

### Member Entity (`src/entities/member.entity.ts`)
- **Fields:**
  - `id` (UUID, Primary Key) - Auto-generated
  - `name` (String) - Member name
  - `phone` (String, Optional) - Contact phone
  - `birthDate` (Date, Optional) - Birth date
  - `status` (String) - ACTIVE, INACTIVE
  - `baptismStatus` (String) - PENDING, COMPLETED
  - `createdAt` (DateTime) - Auto-created timestamp
  - `userId` (String, Optional) - Foreign Key to User
  - `user` (ManyToOne) - Related User (optional)
  - **Indexes:** userId is indexed for fast queries

## Relations
```
User (1) ──── (0..*) Member
  └─ One User can have multiple Members
  └─ A Member can optionally belong to a User
```

## Database Configuration
Updated in `src/database/database.config.ts`:
- Entities automatically loaded from `[User, Member]`
- Auto-synchronization enabled in development
- Logging enabled in development for debugging

## Creating Services & Controllers

### 1. Create User Service
```bash
nest g service users --no-spec
```

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

  async create(email: string, password: string, role: string) {
    return this.usersRepository.save({
      email,
      password,
      role,
      state: 'ACTIVE',
    });
  }

  async findByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string) {
    return this.usersRepository.findOne({ 
      where: { id },
      relations: ['members'] 
    });
  }
}
```

### 2. Create Member Service
```bash
nest g service members --no-spec
```

```typescript
// src/members/members.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../entities/member.entity';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private membersRepository: Repository<Member>,
  ) {}

  async create(name: string, userId?: string) {
    return this.membersRepository.save({
      name,
      userId,
      status: 'ACTIVE',
      baptismStatus: 'PENDING',
    });
  }

  async findByUserId(userId: string) {
    return this.membersRepository.find({
      where: { userId },
      relations: ['user'],
    });
  }

  async findById(id: string) {
    return this.membersRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }
}
```

## Registering in Module

Update your feature module:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Member } from '../entities/member.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Member])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
```

## Running the App

```bash
# Development with auto-reload
npm run start:dev

# Build for production
npm run build

# Run production build
npm run start:prod
```

When the app starts:
1. TypeORM automatically synchronizes the schema with the database
2. The `users` table is created with unique constraint on `email`
3. The `members` table is created with `userId` index
4. Relations are properly configured

## Database Migrations (Production)

For production, disable `synchronize` and use migrations:

1. Generate migration:
```bash
npx typeorm migration:generate src/migrations/CreateUserAndMember
```

2. Run migration:
```bash
npx typeorm migration:run
```

## Querying Examples

```typescript
// Find user with all members
const user = await usersRepository.findOne({
  where: { email: 'user@example.com' },
  relations: ['members'],
});

// Find members for a user
const members = await membersRepository.find({
  where: { userId: user.id },
});

// Update with relations
user.state = 'INACTIVE';
await usersRepository.save(user);
```

## References
- [NestJS TypeORM Docs](https://docs.nestjs.com/techniques/database#typeorm-integration)
- [TypeORM Relations](https://typeorm.io/relations)
- [TypeORM Query Builder](https://typeorm.io/select-query-builder)
