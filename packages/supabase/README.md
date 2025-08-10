# @ordo/supabase

Database package for Ordo using Drizzle ORM with Supabase PostgreSQL.

## Setup

1. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Supabase database credentials:
   ```env
   DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

## Available Scripts

### Database Operations

| Script | Description |
|--------|-------------|
| `pnpm db:generate` | Generate migration files from schema changes |
| `pnpm db:migrate` | Apply migrations to the database |
| `pnpm db:push` | Push schema changes directly to database (dev only) |
| `pnpm db:studio` | Open Drizzle Studio for database visualization |
| `pnpm db:check` | Check migration files for conflicts |
| `pnpm db:drop` | Drop all tables and data |
| `pnpm db:reset` | Drop all tables and push fresh schema |
| `pnpm db:seed` | Populate database with sample data |
| `pnpm db:fresh` | Reset database and seed with sample data |

### Development

| Script | Description |
|--------|-------------|
| `pnpm dev` | Run development server with watch mode |
| `pnpm build` | Build TypeScript to JavaScript |

## Workflow

### Development Workflow

1. **Make schema changes** in `src/db/schema.ts`
2. **Generate migration**: `pnpm db:generate`
3. **Apply migration**: `pnpm db:migrate`
4. **Seed data** (optional): `pnpm db:seed`

### Quick Development Setup

For rapid prototyping, you can skip migrations and push directly:

1. **Push schema**: `pnpm db:push`
2. **Seed data**: `pnpm db:seed`

### Fresh Start

To start with a clean database:

```bash
pnpm db:fresh
```

This will drop all tables, recreate them, and populate with sample data.

## Schema

### Users Table

```ts
{
  id: number (primary key)
  name: string
  age: number
  email: string (unique)
}
```

### Posts Table

```ts
{
  id: number (primary key)
  title: string
  content: string
  userId: number (foreign key to users)
  createdAt: timestamp
  updatedAt: timestamp
}
```

## Usage

### Import the package

```ts
import { db, usersTable, postsTable, eq } from "@ordo/supabase";
```

### Query Examples

```ts
// Get all users
const users = await db.select().from(usersTable);

// Get user by ID
const user = await db.select().from(usersTable).where(eq(usersTable.id, 1));

// Get posts with user information
const postsWithUsers = await db
  .select()
  .from(postsTable)
  .leftJoin(usersTable, eq(postsTable.userId, usersTable.id));

// Create a new user
const newUser = await db.insert(usersTable).values({
  name: "John Doe",
  age: 30,
  email: "john@example.com"
}).returning();

// Update a post
await db
  .update(postsTable)
  .set({ title: "Updated Title" })
  .where(eq(postsTable.id, 1));

// Delete a user (cascades to posts)
await db.delete(usersTable).where(eq(usersTable.id, 1));
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SUPABASE_URL` | Supabase project URL | Optional |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Optional |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Optional |

## Files Structure

```
src/
├── db/
│   ├── index.ts          # Database connection
│   ├── schema.ts         # Database schema definitions
│   └── seed.ts           # Seed data script
├── index.ts              # Package exports
drizzle.config.ts         # Drizzle configuration
.env.local                # Environment variables
.env.example              # Environment template
```

## Tips

- Use `db:push` for rapid development and prototyping
- Use `db:generate` + `db:migrate` for production workflows
- Always backup your database before running destructive operations
- Use Drizzle Studio (`pnpm db:studio`) to visualize your database
- Keep your `.env.local` file secure and never commit it to version control

## Troubleshooting

### Connection Issues

If you're having trouble connecting to Supabase:

1. Verify your `DATABASE_URL` is correct
2. Ensure your Supabase project is running
3. Check that your IP is allowed in Supabase settings
4. Try using the direct database URL instead of the pooled connection

### Migration Issues

If migrations fail:

1. Check for syntax errors in your schema
2. Verify the database is accessible
3. Use `pnpm db:check` to identify conflicts
4. Consider using `pnpm db:push` for development

### Type Issues

If you're getting TypeScript errors:

1. Run `pnpm build` to compile the package
2. Ensure all dependencies are installed
3. Check that your schema exports are correct