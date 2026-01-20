# Major: Missing Security Headers in Next.js Configuration

## Priority
🟠 **Major** - Security Hardening

## Location
`next.config.mjs`

## Problem Description
The Next.js configuration lacks security headers that protect against common web vulnerabilities:

### Missing Headers

1. **Content-Security-Policy (CSP)**
   - No XSS protection via CSP
   - External scripts can be injected
   - Inline styles/scripts allowed

2. **X-Frame-Options**
   - No clickjacking protection
   - Site can be embedded in iframes
   - Potential for UI redress attacks

3. **X-Content-Type-Options**
   - MIME-sniffing enabled
   - Files may be interpreted incorrectly

4. **Referrer-Policy**
   - Full referrer leakage
   - User navigation data exposed

5. **Permissions-Policy**
   - Unrestricted browser features
   - Camera, microphone, geolocation accessible

6. **Strict-Transport-Security (HSTS)**
   - No HTTPS enforcement
   - Man-in-the-middle attacks possible

## Current Configuration
```javascript
// next.config.mjs
const nextConfig = {
  webpack: (webpackConfig) => { ... },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
}
// No security headers!
```

## Expected Configuration
```javascript
// next.config.mjs
const nextConfig = {
  // ... existing config

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join('; ')
          },

          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },

          // Prevent MIME-sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },

          // Referrer policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },

          // Permissions policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },

          // HSTS (only in production)
          ...(process.env.NODE_ENV === 'production' ? [{
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }] : []),
        ],
      },
    ]
  },
}
```

## Risk Assessment

### High Risk
- **No CSP**: XSS attacks can steal user sessions
- **No X-Frame-Options**: Clickjacking attacks possible
- **No HSTS**: Downgrade attacks on HTTPS

### Medium Risk
- **Full referrer leakage**: Privacy issue
- **Unrestricted permissions**: Browser feature abuse

### Low Risk
- **MIME-sniffing**: Legacy browser issue

## Security Headers Report

### Current Score
```
Security Headers Test: F
├── Content-Security-Policy: ❌ Missing
├── X-Frame-Options: ❌ Missing
├── X-Content-Type-Options: ❌ Missing
├── Strict-Transport-Security: ❌ Missing
├── Referrer-Policy: ❌ Missing
└── Permissions-Policy: ❌ Missing
```

### Target Score
```
Security Headers Test: A+
├── Content-Security-Policy: ✅ Implemented
├── X-Frame-Options: ✅ DENY
├── X-Content-Type-Options: ✅ nosniff
├── Strict-Transport-Security: ✅ max-age=31536000
├── Referrer-Policy: ✅ strict-origin-when-cross-origin
└── Permissions-Policy: ✅ Restricted
```

## Special Considerations

### CSP for Pyodide
The application loads Pyodide from CDN:
```typescript
// src/core/compiler/client/worker.ts:3
self.importScripts('https://cdn.jsdelivr.net/pyodide/v0.29.1/full/pyodide.js')
```

Must include in CSP:
```
script-src 'self' https://cdn.jsdelivr.net
```

Better: Use Subresource Integrity (SRI)
```html
<script
  src="https://cdn.jsdelivr.net/pyodide/v0.29.1/full/pyodide.js"
  integrity="sha384-[HASH]"
  crossorigin="anonymous">
</script>
```

### Monaco Editor
If using Monaco editor from CDN, also needs CSP exception.

## Labels
`major` `security` `headers` `csp` `hardening`

## Related Issues
- #008 - Playground exposed
- #010 - No rate limiting

## Steps to Fix
1. Add headers() function to next.config.mjs
2. Implement basic CSP (allow current functionality)
3. Add all security headers
4. Test with development and production builds
5. Verify CSP doesn't break Pyodide or Monaco
6. Run security headers test (e.g., securityheaders.com)
7. Add SRI for external scripts

## Testing Tools
- [securityheaders.com](https://securityheaders.com)
- [Mozilla Observatory](https://observatory.mozilla.org)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com)

## Verification
```bash
# Test headers locally
curl -I https://your-domain.com

# Should see security headers in response
```

## Additional Context
Security headers are defense-in-depth measures. While they don't fix vulnerabilities, they make exploitation significantly harder. This is standard for any modern web application, especially one handling user authentication and code execution.
