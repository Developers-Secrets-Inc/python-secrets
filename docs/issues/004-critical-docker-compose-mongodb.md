# Critical: Docker Compose Configuration Uses MongoDB Instead of PostgreSQL

## Priority
🔴 **Critical** - Environment Setup

## Location
`docker-compose.yml:20-29`

## Problem Description
The `docker-compose.yml` file defines a MongoDB service:

```yaml
mongo:
  image: mongo:latest
  ports:
    - '27017:27017'
```

However, the application is configured to use **PostgreSQL**:
- `src/payload.config.ts:86-91` uses `postgresAdapter`
- `src/lib/auth.ts:6` uses `pg` (PostgreSQL) Pool
- `package.json:70` includes `pg` dependency

Additionally, the PostgreSQL service is commented out:
```yaml
# postgres:
#   restart: always
#   image: postgres:latest
```

## Impact
- Docker-based development environment is completely broken
- Developers cannot use `docker-compose up` to start the project
- Inconsistency between documentation and actual setup
- Waste of time debugging connection failures

## Expected docker-compose.yml
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

volumes:
  pgdata:
  node_modules:
```

## Labels
`bug` `critical` `docker` `infrastructure` `good-first-issue`

## Related Issues
- #003 - .env.example also has MongoDB reference

## Steps to Fix
1. Remove MongoDB service from docker-compose.yml
2. Uncomment and configure PostgreSQL service
3. Update the `payload` service to depend on `postgres` instead of `mongo`
4. Update connection string in docker-compose environment
5. Test `docker-compose up` from a clean state
6. Update `docs/SETUP.md` with correct Docker instructions

## Additional Context
This issue, combined with #003, makes the project completely unable to start via Docker. Both must be fixed together.
