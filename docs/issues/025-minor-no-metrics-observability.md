# Minor: No Metrics or Observability Infrastructure

## Priority
🟡 **Minor** - Production Monitoring & Analytics

## Location
Application-wide - missing metrics collection and observability

## Problem Description
No structured metrics collection for:
- Business metrics (lessons completed, users active)
- Performance metrics (response times, database queries)
- Resource metrics (CPU, memory, disk)
- Custom metrics (code executions, errors)

## Missing Metrics

### Business Metrics
```typescript
// No tracking of:
- Daily Active Users (DAU)
- Lessons completed today
- Code executions today
- Signups today
- Revenue (if paid)
```

### Performance Metrics
```typescript
// No tracking of:
- API response times (p50, p95, p99)
- Database query times
- E2B execution times
- Page load times
- Time to Interactive (TTI)
```

### Error Metrics
```typescript
// No tracking of:
- Error rate by endpoint
- Error rate by user
- Error rate by feature
- Failed code executions
```

## Current State

### Manual Logging (Inefficient)
```typescript
console.log("Code executed", compiler, success)
// Can't aggregate
// Can't graph
// Can't alert
```

### Database Queries Only
```typescript
// Can get basic stats from DB
const userCount = await payload.count({ collection: 'users' })
// But slow, no history, no trends
```

## Expected Behavior

### Metrics Integration

#### Option 1: Prometheus + Grafana (Recommended)

**Client Metrics:**
```typescript
// src/lib/metrics.ts
import { Counter, Histogram, Gauge } from 'prom-client'

export const metrics = {
  // Counters
  codeExecutions: new Counter({
    name: 'python_code_executions_total',
    help: 'Total number of code executions',
    labelNames: ['compiler', 'success'],
  }),

  lessonCompletions: new Counter({
    name: 'python_lesson_completions_total',
    help: 'Total number of lessons completed',
    labelNames: ['course', 'lesson'],
  }),

  activeUsers: new Gauge({
    name: 'python_active_users',
    help: 'Number of currently active users',
  }),

  // Histograms
  apiResponseTime: new Histogram({
    name: 'python_api_response_time_seconds',
    help: 'API response time in seconds',
    labelNames: ['endpoint', 'method'],
    buckets: [0.1, 0.5, 1, 2, 5, 10],
  }),

  codeExecutionTime: new Histogram({
    name: 'python_code_execution_time_seconds',
    help: 'Code execution time in seconds',
    labelNames: ['compiler'],
    buckets: [0.5, 1, 2, 5, 10, 30, 60],
  }),
}
```

**Usage:**
```typescript
// Track code execution
const startTime = Date.now()
try {
  const result = await compileCode(code, compiler)
  metrics.codeExecutions.inc({ compiler, success: 'true' })
  metrics.codeExecutionTime.observe(
    { compiler },
    (Date.now() - startTime) / 1000
  )
} catch (error) {
  metrics.codeExecutions.inc({ compiler, success: 'false' })
  throw error
}
```

**Metrics Endpoint:**
```typescript
// src/app/api/metrics/route.ts
import { register } from 'prom-client'

export async function GET() {
  return Response.json(await register.metrics(), {
    headers: { 'Content-Type': 'text/plain' }
  })
}
```

#### Option 2: Vercel Analytics (Simpler)
```typescript
// _app.tsx
import { Analytics } from '@vercel/analytics/react'

export default function App() {
  return (
    <>
      <Analytics />
      {/* ... */}
    </>
  )
}
```

#### Option 3: PostHog/Mixpanel (Product Analytics)
```typescript
import posthog from 'posthog-js'

posthog.init('phc_...', { api_host: 'https://app.posthog.com' })

// Track events
posthog.capture('lesson_completed', {
  course: 'python-basics',
  lesson: 'variables',
  duration: 300,
})
```

### Dashboard Examples

**Grafana Dashboard:**
```
┌─────────────────────────────────────────┐
│  Python Secrets - Production Dashboard  │
├─────────────────────────────────────────┤
│  Active Users (24h)                     │
│  ████ 1,234 users                      │
│                                         │
│  Code Executions (24h)                  │
│  ████████ 12,456 executions            │
│                                         │
│  API Response Time (p95)                │
│  ███████████████ 245ms                 │
│                                         │
│  Error Rate                             │
│  ██ 0.5%                                │
└─────────────────────────────────────────┘
```

## Benefits

### 1. Real-Time Monitoring
```typescript
// See metrics as they happen
// Know immediately if something breaks
```

### 2. Trend Analysis
```
Code executions over time:
  Mon: 10,000
  Tue: 12,000
  Wed: 11,500
  Thu: 15,000  ← Growth!
```

### 3. Performance Optimization
```
Which endpoints are slow?
GET /api/lessons/*: 500ms (p95)  ← Slow!
GET /api/courses/*: 50ms (p95)
```

### 4. Capacity Planning
```
Current CPU: 45%
Current memory: 60%
Predicted: Need to scale in 2 weeks
```

### 5. Business Intelligence
```
Most popular lessons:
1. Variables (2,341 completions)
2. Loops (1,987 completions)
3. Functions (1,654 completions)
```

## Labels
`minor` `monitoring` `metrics` `observability` `analytics`

## Related Issues
- #024 - No error monitoring (Sentry)
- #016 - No structured logging
- #005 - Missing error handling

## Steps to Fix

### Phase 1: Basic Metrics
1. Choose metrics provider (Prometheus recommended)
2. Install dependencies
3. Set up basic counter (code executions)
4. Create metrics endpoint
5. Test locally

### Phase 2: Key Metrics
6. Add active users gauge
7. Add response time histogram
8. Track lesson completions
9. Track errors

### Phase 3: Visualization
10. Set up Grafana
11. Create dashboards
12. Add alerts
13. Share with team

### Phase 4: Product Analytics
14. Add user funnel tracking
15. Add feature usage tracking
16. Add retention analysis
17. A/B testing support

## Recommended Stack

### Self-Hosted (Free)
```
Prometheus (metrics collection)
+ Grafana (visualization)
+ AlertManager (alerts)
```

### Managed (Easier)
```
Vercel Analytics (free)
+ Datadog (paid)
+ New Relic (paid)
```

### Simple (Free)
```
Prometheus (collect)
+ Grafana Cloud (free tier)
```

## Key Metrics to Track

### Business
```yaml
Daily Active Users: Gauge
Lessons Completed: Counter
Code Executions: Counter
New Signups: Counter
```

### Performance
```yaml
API Response Time: Histogram (p50, p95, p99)
Database Query Time: Histogram
Page Load Time: Histogram
Time to First Byte: Histogram
```

### Infrastructure
```yaml
CPU Usage: Gauge
Memory Usage: Gauge
Disk Usage: Gauge
Active Connections: Gauge
```

### Errors
```yaml
Error Rate: Counter (by endpoint)
Failed Code Executions: Counter
Database Errors: Counter
```

## Alerting Examples

```yaml
# Alert rules
alerts:
  - name: HighErrorRate
    condition: error_rate > 5%
    duration: 5m
    action: Slack notification

  - name: SlowAPI
    condition: api_p95 > 1s
    duration: 10m
    action: Email on-call

  - name: HighMemory
    condition: memory > 90%
    duration: 5m
    action: Auto-scale pods
```

## Documentation
Create `docs/METRICS.md`:
```markdown
## Metrics & Monitoring

### Viewing Metrics
Grafana dashboard: https://metrics.python-secrets.com

### Key Metrics
- DAU: Currently 1,234 users
- Code executions/day: ~15,000
- Average response time: 245ms (p95)

### Adding New Metrics
See src/lib/metrics.ts for examples.
```

## Additional Context
Metrics are essential for:
- Production operations
- Business intelligence
- Performance optimization
- Capacity planning
- Debugging issues

## Privacy Considerations
```typescript
// Don't track PII
metrics.userActions.inc({
  action: 'lesson_completed',
  // DON'T include: userId, email, name
  course: 'python-basics',
  lesson: 'variables'
})
```

## Best Practices
1. **Start simple**: Track 5-10 key metrics
2. **Label wisely**: Too many labels = high cardinality
3. **Set alerts**: Don't just watch, react
4. **Review dashboards**: Weekly review with team
5. **Iterate**: Add metrics as needed

## References
- [Prometheus Best Practices](https://prometheus.io/docs/practices/naming/)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)
- [RED Method (Rate, Errors, Duration)](https://www.weave.works/blog/the-red-method-key-metrics-for-microservices/)
