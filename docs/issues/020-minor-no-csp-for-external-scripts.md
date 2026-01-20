# Minor: External Scripts Loaded Without Subresource Integrity (SRI)

## Priority
🟡 **Minor** - Security Hardening

## Location
`src/core/compiler/client/worker.ts:3`

## Problem Description
Pyodide is loaded from CDN without Subresource Integrity (SRI) verification:

```typescript
// src/core/compiler/client/worker.ts:3
self.importScripts('https://cdn.jsdelivr.net/pyodide/v0.29.1/full/pyodide.js')
```

## Security Risk

### What is SRI?
Subresource Integrity ensures that the file loaded from CDN hasn't been tampered with:

```html
<!-- Without SRI (vulnerable) -->
<script src="https://cdn.example.com/library.js"></script>

<!-- With SRI (secure) -->
<script
  src="https://cdn.example.com/library.js"
  integrity="sha384-hash123"
  crossorigin="anonymous">
</script>
```

### Attack Scenario
```
1. Attacker compromises CDN or DNS
2. Replaces pyodide.js with malicious version
3. Malicious code executes in user's browser
4. Can steal sessions, execute arbitrary code
```

## Why This Matters

### 1. Web Worker Context
Pyodide loads in a Web Worker, which:
- Has full JavaScript execution capabilities
- Can make network requests
- Can access localStorage/sessionStorage
- Can communicate with main thread

### 2. Code Execution Context
Pyodide **executes user code**, so compromising it means:
- All user code execution is compromised
- Can inject malicious Python code
- Can exfiltrate user code

### 3. No Verification Currently
```typescript
// No integrity check
self.importScripts('https://cdn.jsdelivr.net/pyodide/v0.29.1/full/pyodide.js')
```

## Solutions

### Option 1: Use SRI in Import Scripts (Limited)
**Problem**: `importScripts()` in Web Workers doesn't support SRI directly.

### Option 2: Fetch and Verify Before Loading (Recommended)
```typescript
// src/core/compiler/client/worker.ts
const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.29.1/full/pyodide.js'
const PYODIDE_INTEGRITY = 'sha384-['hash from SRI generator']'

async function loadPyodideWithSRI() {
  const response = await fetch(PYODIDE_URL)
  const script = await response.text()

  // Verify integrity
  const hashBuffer = await crypto.subtle.digest(
    'SHA-384',
    new TextEncoder().encode(script)
  )
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashBase64 = btoa(String.fromCharCode(...hashArray))

  if (hashBase64 !== PYODIDE_INTEGRITY.replace('sha384-', '')) {
    throw new Error('Pyodide integrity check failed')
  }

  // Execute verified script
  // Note: This is tricky in workers
  // Alternative: use eval or Function constructor
  return new Function(script)()
}
```

### Option 3: Bundle Pyodide (Most Secure)
```typescript
// Install pyodide as package
pnpm add pyodide

// Import directly (bundled)
import * as pyodide from 'pyodide'
```

**Pros**:
- No external network requests
- No CDN dependency
- Full integrity (bundled with app)
- Faster initial load

**Cons**:
- Larger bundle size (~10MB)
- Longer app startup

### Option 4: Self-Host Pyodide (Recommended Balance)
```bash
# Download Pyodide
wget https://cdn.jsdelivr.net/pyodide/v0.29.1/full/pyodide.js
wget https://cdn.jsdelivr.net/pyodide/v0.29.1/full/pyodide.js.map
wget https://cdn.jsdelivr.net/pyodide/v0.29.1/full/pyodide_wasm.data

# Store in public/
mv pyodide.* public/pyodide/
```

```typescript
// Load from own origin
self.importScripts('/pyodide/pyodide.js')
```

**Pros**:
- Same-origin (browser security applies)
- No external dependency
- Can add own integrity checks
- Control over updates

**Cons**:
- Need to host files
- Must handle updates manually

## Labels
`minor` `security` `sri` `cdn` `external-dependencies`

## Related Issues
- #011 - Missing security headers (CSP)

## Steps to Fix

### Immediate: Self-Host Pyodide
1. Download Pyodide files to `public/pyodide/`
2. Update worker to load from local path
3. Add to CSP: `script-src 'self'`
4. Test in development

### Short Term: Add Integrity Check
5. Generate SRI hash for downloaded file
6. Add integrity verification in worker
7. Fail on verification error

### Long Term: Consider Bundling
8. Evaluate bundle size impact
9. Consider lazy loading strategy
10. Implement progressive loading

## Generating SRI Hash
```bash
# Download file
curl -o pyodide.js https://cdn.jsdelivr.net/pyodide/v0.29.1/full/pyodide.js

# Generate SRI hash
openssl dgst -sha384 -binary pyodide.js | openssl base64 -A

# Output: sha384-[hash]
```

## CSP Update
When loading from CDN, CSP must allow it:
```javascript
// next.config.mjs
{
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' https://cdn.jsdelivr.net",
    // ...
  ].join('; ')
}
```

When self-hosted:
```javascript
{
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval'",  // No CDN!
    // ...
  ].join('; ')
}
```

## Verification
After fix, verify in browser DevTools:
```javascript
// Check worker source
// Should show: /pyodide/pyodide.js (local)
// Or: https://cdn.jsdelivr.net/pyodide/... (with SRI)
```

## Additional Context
This is particularly important for a code execution platform. Compromising the execution environment is a severe security risk. While the likelihood is low, the impact is very high.

## Best Practices
1. **Prefer self-hosting** for critical dependencies
2. **Use SRI** when using CDNs
3. **Pin versions** (already done: v0.29.1)
4. **Monitor** for security updates
5. **Have a plan** for CDN outages

## References
- [MDN: Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)
- [SRI Generator](https://www.srihash.org/)
- [Pyodide Security](https://pyodide.org/en/stable/usage/security-in-pyodide.html)
