# Minor: No Health Check or Readiness Endpoints

## Priority
🟡 **Minor** - Operations & Monitoring

## Location
Missing API endpoints for health monitoring

## Problem Description
The application lacks standard health check endpoints for:
- Load balancer health checks
- Container orchestration (Kubernetes)
- Monitoring systems
- Deployment automation

## Missing Endpoints

### 1. Health Check
```
GET /health  ← Missing
```
Should indicate if the application is running.

### 2. Readiness Check
```
GET /ready  ← Missing
```
Should indicate if the application can handle traffic.

### 3. Liveness Check
```
GET /live  ← Missing
```
Should indicate if the application needs restart.

## Use Cases

### Load Balancer
```
Load Balancer → GET /health
If 200: Route traffic
If 503: Remove from rotation
```

### Kubernetes
```yaml
# deployment.yaml
livenessProbe:
  httpGet:
    path: /live
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

### Monitoring
```yaml
# Prometheus scrape
scrape_configs:
  - job_name: 'python-secrets'
    metrics_path: '/health'
    interval: 30s
```

### Deployments
```bash
# Zero-downtime deployment
1. Deploy new container
2. Wait for /ready to return 200
3. Add to load balancer
4. Remove old container
```

## Expected Implementation

### `/health` - Basic Health
```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '0.1.0',
  })
}
```

### `/ready` - Readiness Check
```typescript
// src/app/api/ready/route.ts
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  const checks = {
    database: false,
    redis: false,
    e2b: false,
  }

  // Check database
  try {
    const payload = await getPayload({ config })
    await payload.find({ collection: 'courses', limit: 1 })
    checks.database = true
  } catch (error) {
    // Database not ready
  }

  // Check E2B API key
  checks.e2b = !!process.env.E2B_API_KEY

  // All checks pass?
  const allHealthy = Object.values(checks).every(Boolean)

  if (allHealthy) {
    return NextResponse.json({
      status: 'ready',
      checks,
    })
  }

  return NextResponse.json(
    {
      status: 'not_ready',
      checks,
    },
    { status: 503 }
  )
}
```

### `/live` - Liveness Check
```typescript
// src/app/api/live/route.ts
import { NextResponse } from 'next/server'

let live = true

export async function GET() {
  if (live) {
    return NextResponse.json({ status: 'alive' })
  }
  return NextResponse.json({ status: 'dead' }, { status: 503 })
}

// Call this if app enters broken state
export function markUnhealthy() {
  live = false
}
```

### `/metrics` - Metrics Endpoint (Optional)
```typescript
// src/app/api/metrics/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const metrics = {
    requests_total: 12345,
    requests_active: 42,
    memory_usage_mb: process.memoryUsage().heapUsed / 1024 / 1024,
    cpu_usage_percent: 45,
  }

  return NextResponse.json(metrics)
}
```

## Labels
`minor` `monitoring` `operations` `kubernetes` `deployment`

## Related Issues
- #024 - No monitoring
- #025 - No metrics/observability

## Steps to Fix

### Phase 1: Basic Health
1. Create `/api/health` endpoint
2. Return basic status
3. Test locally

### Phase 2: Readiness Probe
4. Create `/api/ready` endpoint
5. Check database connection
6. Check external dependencies
7. Return 503 if not ready

### Phase 3: Liveness Probe
8. Create `/api/live` endpoint
9. Implement health state tracking
10. Add recovery mechanism

### Phase 4: Integration
11. Update Docker healthcheck
12. Configure Kubernetes probes
13. Set up load balancer checks
14. Add monitoring alerts

## Docker Healthcheck
```dockerfile
# Dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1
```

## Kubernetes Configuration
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: python-secrets
spec:
  replicas: 3
  selector:
    matchLabels:
      app: python-secrets
  template:
    metadata:
      labels:
        app: python-secrets
    spec:
      containers:
      - name: app
        image: python-secrets:latest
        ports:
        - containerPort: 3000
        livenessProbe:
          httpGet:
            path: /api/live
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## Response Examples

### Healthy Response
```json
{
  "status": "healthy",
  "timestamp": "2025-01-20T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "0.1.0"
}
```

### Not Ready Response
```json
{
  "status": "not_ready",
  "checks": {
    "database": true,
    "redis": false,
    "e2b": true
  }
}
```

### Dead Response (503)
```json
{
  "status": "unhealthy",
  "error": "Database connection failed"
}
```

## Additional Context
Health check endpoints are a production requirement for:
- Container orchestration (Kubernetes, ECS)
- Load balancers (ALB, NLB)
- Auto-scaling groups
- Monitoring systems (Datadog, New Relic)

## Best Practices
1. **Keep it fast**: Health checks should return in < 100ms
2. **No auth**: Public endpoints (no sensitive data)
3. **Cached checks**: Don't hammer dependencies
4. **Grace period**: Allow startup time before checks
5. **Separate concerns**: Health ≠ Ready ≠ Live

## References
- [Kubernetes Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [Docker Healthcheck](https://docs.docker.com/engine/reference/builder/#healthcheck)
- [Microservice Health Checks](https://martinfowler.com/articles/microservice-health.html)
