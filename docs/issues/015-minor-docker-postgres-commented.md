# Minor: PostgreSQL Service Commented Out in Docker Compose

## Priority
🟡 **Minor** - Infrastructure Consistency

## Location
`docker-compose.yml:31-42`

## Problem Description
The PostgreSQL service configuration exists but is commented out, while MongoDB (which isn't used) is active:

```yaml
depends_on:
  - mongo
  # - postgres    # ← Commented out but should be active

# ...
# Uncomment the following to use postgres    # ← Misleading comment
# postgres:
#   restart: always
#   image: postgres:latest
```

## Issues

### 1. Inconsistent with Code
- Code uses PostgreSQL via `@payloadcms/db-postgres`
- Docker Compose uses MongoDB
- PostgreSQL is commented out

### 2. Misleading Comment
```yaml
# Uncomment the following to use postgres
```
This suggests PostgreSQL is optional, but it's actually **required**.

### 3. Developer Confusion
- New devs see "uncomment to use postgres"
- May think MongoDB is the default
- Waste time debugging connection issues

## Expected docker-compose.yml

### Option 1: Only PostgreSQL (Recommended)
```yaml
version: '3.8'

services:
  payload:
    image: node:22-alpine
    ports:
      - '3000:3000'
    volumes:
      - .:/home/node/app
      - node_modules:/home/node/app/node_modules
    working_dir: /home/node/app/
    command: sh -c "corepack enable && corepack prepare pnpm@latest --activate && pnpm install && pnpm dev"
    depends_on:
      - postgres
    env_file:
      - .env
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/python_secrets

  postgres:
    image: postgres:16-alpine
    restart: always
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=python_secrets
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
  node_modules:
```

### Option 2: Remove Commented Code
If keeping MongoDB for some reason:
```yaml
services:
  postgres:
    image: postgres:16-alpine
    # ... config

  # NOTE: MongoDB is deprecated, use PostgreSQL only
  # mongo:
  #   image: mongo:latest
  #   ...
```

## Labels
`minor` `docker` `infrastructure` `consistency` `good-first-issue`

## Related Issues
- #004 - Docker Compose uses MongoDB (critical parent issue)
- #003 - .env.example has MongoDB reference

## Steps to Fix
1. Remove MongoDB service entirely
2. Uncomment PostgreSQL service
3. Update `depends_on` to reference postgres
4. Remove misleading comments
5. Add healthcheck to PostgreSQL
6. Test `docker-compose up` works

## Health Check Importance
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres"]
  interval: 10s
  timeout: 5s
  retries: 5
```
Ensures Payload waits for PostgreSQL to be ready before starting.

## Verification
```bash
# Test the setup
docker-compose up -d
docker-compose logs postgres  # Should show "ready to accept connections"
docker-compose exec postgres psql -U postgres -d python_secrets -c "SELECT 1"
```

## Additional Context
This issue compounds #004. Together they make the Docker setup completely broken. Once both are fixed, developers will be able to use `docker-compose up` successfully.

## Documentation
Update `docs/SETUP.md`:
```markdown
## Docker Setup

1. Copy environment file:
   ```bash
   cp .env.example .env
   ```

2. Start services:
   ```bash
   docker-compose up -d
   ```

3. Run migrations:
   ```bash
   docker-compose exec payload pnpm payload generate:types
   ```
```

Remove any MongoDB references from setup documentation.
