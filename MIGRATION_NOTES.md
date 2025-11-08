# basicPopulate Migration to Database

## Summary
The `basicPopulate.ts` controller has been refactored to fetch data from the PostgreSQL database instead of TypeScript JSON files. This ensures consistency across both Kubernetes and local Docker deployments.

## Changes Made

### File Modified
- **`CotOAgent-Back/src/controllers/basicPopulate.ts`**

### What Changed
1. **Removed file-based imports**: Removed imports from `Spells.ts`, `Classes.ts`, and `Races.ts`
2. **Added database connection**: Initialized PostgreSQL connection pool using `pg` package with `DATABASE_URL` or `DEFAULT_CONNECTION` environment variable
3. **Database queries implemented** for each endpoint:
   - `/api/classes` - Queries from `classes` table
   - `/api/races` - Queries from `races` table
   - `/api/spells` - Queries from `spells` table
   - `/api/spellbooks` - Queries from `spellbooks` and `spells` tables with joins

### Key Features
- **Proper connection management**: Each endpoint acquires a client from the pool and releases it after the query
- **Validation**: All responses are validated using existing Zod schemas
- **Error handling**: Comprehensive error handling with detailed error messages
- **Works with both environments**: 
  - Uses `DATABASE_URL` environment variable (set in docker-compose for local and K8s deployments)
  - Falls back to `DEFAULT_CONNECTION` if needed

## Database Requirements
The existing database schema already supports all required functionality:
- `classes` table with `classification`, `class_name`, `description`
- `races` table with `campaign`, `name`, `description`
- `spells` table with `spell_name`, `mana_cost`, `hit_die`, `description`
- `spellbooks` table with `spell_branch`, `book_level` (and FK to spells)

## Testing Instructions

### Local Docker
1. Ensure data is populated in the database via `/api/import/*` endpoints
2. Test endpoints:
   ```bash
   curl http://localhost:3000/api/classes
   curl http://localhost:3000/api/races
   curl http://localhost:3000/api/spells
   curl http://localhost:3000/api/spellbooks
   ```

### Kubernetes
The same endpoints will work once data is populated in the pod's database.

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (format: `postgresql://user:password@host:port/database`)
- `DEFAULT_CONNECTION`: Fallback connection string if `DATABASE_URL` not set
