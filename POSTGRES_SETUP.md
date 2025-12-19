# PostgreSQL Connection Setup Guide

## Installation Complete ✓

The PostgreSQL connection has been successfully configured for your NestJS application.

### Installed Packages:
- `@nestjs/typeorm` - NestJS TypeORM integration
- `typeorm` - ORM library
- `pg` - PostgreSQL driver
- `@nestjs/config` - Configuration module
- `dotenv` - Environment variable loader

### Configuration Files Created:

1. **`.env`** - Environment variables file (add to .gitignore)
2. **`.env.example`** - Template for environment variables
3. **`src/database/database.config.ts`** - Database configuration
4. **`src/users/entities/user.entity.ts`** - Example User entity

### Setup Instructions:

#### 1. Install PostgreSQL
If you don't have PostgreSQL installed, download it from https://www.postgresql.org/download/

#### 2. Create a Database
```bash
# Using psql (PostgreSQL command line)
CREATE DATABASE oliva_db;
```

Or update the `.env` file with your database credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=your_database_name
```

#### 3. Start the Application
```bash
npm run start:dev
```

The application will automatically:
- Connect to PostgreSQL
- Create/synchronize tables based on entities
- Enable logging in development mode

### Creating Entities:

Create new entity files in `src/[feature]/entities/` following the User entity pattern:

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('table_name')
export class MyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;
}
```

Then add to `src/database/database.config.ts` entities array.

### TypeORM CLI Commands:

```bash
# Run migrations
npm run typeorm migration:run

# Create migration
npm run typeorm migration:create

# Revert migration
npm run typeorm migration:revert
```

### Common Issues:

**Connection refused?**
- Ensure PostgreSQL server is running
- Check DB_HOST, DB_PORT, and credentials in `.env`

**Table not created?**
- Enable `synchronize: true` in database.config.ts (development only)
- Or create migrations manually

For more info: https://typeorm.io/
