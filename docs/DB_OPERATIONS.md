# Database Operations

Common commands for managing the LearnSphere database.

## 1. Reset Database (Safest for Dev)
To completely wipe the database and re-apply the schema + seeds:
```bash
npx prisma migrate reset
```
**Effect**:
- Drops the database.
- Creates it again.
- Applies all migrations.
- Runs the seed script (`prisma/seed.ts`).

## 2. Seed Database only
To run the seed script without resetting:
```bash
npx prisma db seed
```

## 3. Create Migration
After modifying `prisma/schema.prisma`:
```bash
npx prisma migrate dev --name <migration-name>
```

## 4. View Data (GUI)
```bash
npx prisma studio
```
