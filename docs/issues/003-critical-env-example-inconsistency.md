# Critical: .env.example References MongoDB Instead of PostgreSQL

## Priority
🔴 **Critical** - Developer Experience & Onboarding

## Location
`.env.example:1`

## Problem Description
The `.env.example` file contains a MongoDB connection string:

```env
DATABASE_URL=mongodb://127.0.0.1/your-database-name
```

However, the project is configured to use **PostgreSQL** via `@payloadcms/db-postgres` (see `src/payload.config.ts:86-91`).

## Impact
- New developers cannot start the application without debugging
- Confusion about which database to use
- Failed migrations and connection errors
- Wasted time troubleshooting database setup
- Inconsistent with actual project configuration

## Expected .env.example
```env
# Database - PostgreSQL (Required)
DATABASE_URL=postgresql://user:password@localhost:5432/python_secrets

# Payload CMS Secret (Required)
PAYLOAD_SECRET=your-random-secret-key-here

# E2B API Key (Required - for Python code execution)
E2B_API_KEY=your-e2b-api-key

# Application URL (Required)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Additional environment variables
# NODE_ENV=development
```

## Related Files
- `src/payload.config.ts` - Uses `postgresAdapter`
- `docker-compose.yml` - Also incorrectly references MongoDB
- `src/lib/auth.ts` - Uses pg (PostgreSQL) Pool

## Labels
`bug` `critical` `documentation` `good-first-issue` `onboarding`

## Related Issues
- #004 - docker-compose.yml also uses MongoDB instead of PostgreSQL

## Steps to Fix
1. Update `.env.example` with correct PostgreSQL connection string
2. Add all missing required environment variables
3. Document each variable with its purpose
4. Update `docs/SETUP.md` if it references the old example
5. Test with a fresh developer onboarding

## Additional Context
This issue causes immediate friction for new contributors and must be fixed before anyone else tries to set up the project.
