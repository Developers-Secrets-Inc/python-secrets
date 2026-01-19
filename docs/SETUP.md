# Development Setup

Complete guide to set up Python Secrets for local development.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js**: Version `^18.20.2 || >=20.9.0`
  - Check version: `node --version`
  - Download: [nodejs.org](https://nodejs.org/)
- **pnpm**: Version `^9 || ^10` (required - do not use npm or yarn)
  - Install: `npm install -g pnpm`
  - Check version: `pnpm --version`
- **Git**: For cloning the repository

**Why pnpm?** This project uses pnpm for efficient disk space usage and faster installs. The package.json has `pnpm`-specific configurations.

## External Accounts Setup

### 1. Supabase (Required)

Supabase provides the PostgreSQL database and is required for the application to run.

1. **Create Account**: [supabase.com](https://supabase.com)
2. **Create Project**:
   - Click "New Project"
   - Choose organization (or create one)
   - Set project name (e.g., `python-secrets-dev`)
   - Set database password (save it securely)
   - Choose region closest to you
   - Click "Create new project"
3. **Get Connection String**:
   - Go to Project Settings → Database
   - Find "Connection string" section
   - Copy the **URI** format (not the Transaction pool)
   - Replace `[YOUR-PASSWORD]` with your database password
   - Format: `postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres`

### 2. E2B (Required for Playground)

E2B provides server-side Python execution in isolated environments. The playground is currently development-only and will be removed in production.

1. **Create Account**: [e2b.dev](https://e2b.dev)
2. **Get API Key**:
   - Go to Dashboard → API Keys
   - Copy your API key
3. **Environment Variable**: The E2B SDK automatically reads the `E2B_API_KEY` environment variable

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd python-secrets-2
```

### 2. Install Dependencies

```bash
pnpm install
```

**Note**: This may take a few minutes as pnpm installs all dependencies including Payload CMS, Next.js, and other packages.

### 3. Generate Payload Types

Payload CMS requires TypeScript types generation for type safety:

```bash
pnpm payload generate:types
```

This creates `payload-types.ts` based on your collection configurations.

## Environment Configuration

### 1. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` and set the following variables:

#### Database Configuration

```bash
# PostgreSQL Connection String (from Supabase)
DATABASE_URL=postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres

# Alternative format with individual parameters (also supported):
# POSTGRES_USER=postgres
# POSTGRES_PASSWORD=[YOUR-PASSWORD]
# POSTGRES_HOST=aws-0-[region].pooler.supabase.com
# POSTGRES_PORT=6543
# POSTGRES_DATABASE=postgres
```

#### Payload CMS Configuration

```bash
# Secret for Payload CMS (generate a secure random string)
PAYLOAD_SECRET=your-secure-random-string-here-min-32-chars
```

**Generate PAYLOAD_SECRET**:

```bash
openssl rand -base64 32
# Or use: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### E2B Configuration

```bash
# E2B API Key for server-side Python execution
E2B_API_KEY=e2b_[your-api-key-here]
```

#### Application URL

```bash
# Base URL of your application (for auth callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Better Auth Configuration (Optional)

If you're using Better Auth for authentication, you may need:

```bash
# Better Auth configuration
BETTER_AUTH_SECRET=your-auth-secret-here
BETTER_AUTH_URL=http://localhost:3000/api/auth
```

**Note**: These variables depend on your Better Auth setup. Check `src/lib/auth.ts` and `src/lib/auth-client.ts` for required variables.

### Complete .env Example

```bash
# Database
DATABASE_URL=postgresql://postgres.abc123:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Payload CMS
PAYLOAD_SECRET=your-generated-secret-here-minimum-32-characters-long

# E2B (Python Execution)
E2B_API_KEY=e2b_k1234567890abcdefghijklmnopqrstuvwxyz

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Better Auth (if configured)
BETTER_AUTH_SECRET=your-auth-secret
BETHER_AUTH_URL=http://localhost:3000/api/auth
```

## Database Setup

### PostgreSQL with Supabase

The database schema is automatically managed by Payload CMS. Tables will be created on first run.

1. **Verify Connection**: Ensure your `DATABASE_URL` is correct
2. **Run the Application**: Start the dev server (see below)
3. **Auto-Migration**: Payload will automatically create tables on first startup

**No manual migrations needed** - Payload CMS handles schema synchronization.

### Seed Data (Optional)

If you have seed scripts for development (e.g., sample courses, lessons):

```bash
# Check if seed script exists
pnpm db:seed
# Or manually run seed files if available
```

**Note**: Seed scripts may not be implemented yet. Check with the team for data seeding procedures.

## Start Development Server

### 1. Start the Development Server

```bash
pnpm dev
```

The application will start on `http://localhost:3000`

**Expected Output**:

```
  ▲ Next.js 15.4.10
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Ready in 2.3s
```

### 2. Access the Application

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Payload Admin**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Playground** (dev-only): [http://localhost:3000/playground](http://localhost:3000/playground)

## Verify Setup

### 1. Check Payload Admin

1. Navigate to [http://localhost:3000/admin](http://localhost:3000/admin)
2. You should see the Payload CMS login screen
3. Create your admin account (first user becomes admin)

### 2. Check Database Connection

- If Payload admin loads, the database connection is working
- Tables were automatically created in your Supabase database
- Verify in Supabase Dashboard → Table Editor

### 3. Test the Playground (Optional)

1. Navigate to [http://localhost:3000/playground](http://localhost:3000/playground)
2. Write a simple Python code: `print("Hello World")`
3. Test both compilers:
   - **Pyodide (Client)**: Runs in browser, no API needed
   - **E2B (Server)**: Requires valid `E2B_API_KEY`

**Expected Result**: Both should display `Hello World` in the output panel.

### 4. Create Test User

1. Sign up through the frontend at `/signup` or `/login`
2. Verify user appears in Supabase Dashboard → Authentication → Users
3. Verify user appears in Payload Admin → Users collection

## Useful Development Scripts

### Core Commands

```bash
# Start development server
pnpm dev

# Start fresh (clears .next cache)
pnpm devsafe

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint

# Run tests
pnpm test
# Or separately:
pnpm test:int   # Integration tests (Vitest)
pnpm test:e2e   # End-to-end tests (Playwright)
```

### Payload Commands

```bash
# Generate TypeScript types from collections
pnpm payload generate:types

# Generate import map for better module resolution
pnpm payload generate:importmap

# Open Payload CLI
pnpm payload
```

### Type Checking

```bash
# TypeScript type checking (not in package.json but recommended)
npx tsc --noEmit
```

## Troubleshooting

### Database Connection Issues

**Error**: `connection refused` or `authentication failed`

**Solutions**:
1. Verify `DATABASE_URL` is correct
2. Check Supabase project is not paused
3. Ensure password doesn't contain special characters that need URL encoding
4. Try connecting from Supabase Dashboard's SQL Editor to verify credentials

### Payload Types Missing

**Error**: `Cannot find module './payload-types.ts'`

**Solution**:
```bash
pnpm payload generate:types
```

### E2B API Errors

**Error**: `401 Unauthorized` or `E2B_API_KEY not found`

**Solutions**:
1. Verify `E2B_API_KEY` is set in `.env`
2. Check the key is valid in E2B Dashboard
3. Restart dev server after adding the key
4. **Note**: Playground is dev-only, you can use Pyodide (client) without E2B

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solutions**:
```bash
# Find process using port 3000
lsof -i :3000
# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 pnpm dev
```

### Module Not Found Errors

**Error**: `Cannot find module '...'`

**Solutions**:
1. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules
   pnpm install
   ```
2. Ensure you're using `pnpm`, not `npm` or `yarn`
3. Check `package.json` has the dependency

### Payload Admin Shows Blank Screen

**Solutions**:
1. Check browser console for errors
2. Clear `.next` cache: `pnpm devsafe`
3. Verify `PAYLOAD_SECRET` is set
4. Check database connection (see Database Connection Issues above)

### Build Errors

**Error**: TypeScript or build errors during `pnpm build`

**Solutions**:
```bash
# Regenerate Payload types
pnpm payload generate:types

# Type check to see specific errors
npx tsc --noEmit

# Clear cache and rebuild
rm -rf .next
pnpm build
```

## Next Steps

After setup is complete:

1. **Read Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md) - Understand the codebase structure
2. **Project Structure**: [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Learn about folder organization
3. **Collections**: [COLLECTIONS.md](./COLLECTIONS.md) - Database schema and data models
4. **API**: [API.md](./API.md) - Custom API routes and endpoints
5. **Compilers**: [COMPILERS.md](./COMPILERS.md) - Python execution system

## Getting Help

If you encounter issues not covered here:

1. Check the documentation in the `docs/` folder
2. Review the codebase for examples
3. Check Payload CMS docs: [payloadcms.com/docs](https://payloadcms.com/docs)
4. Check Next.js docs: [nextjs.org/docs](https://nextjs.org/docs)
5. Check E2B docs: [e2b.dev/docs](https://e2b.dev/docs)
