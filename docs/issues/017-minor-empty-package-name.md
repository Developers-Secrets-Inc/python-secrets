# Minor: Empty Package Name in package.json

## Priority
🟡 **Minor** - Package Metadata

## Location
`package.json:2`

## Problem Description
The package name is an empty string:

```json
{
  "name": "",
  "version": "1.0.0",
  "description": "A blank template to get started with Payload 3.0"
}
```

## Issues

### 1. Package Management Problems
```bash
# NPM warnings
npm warn python-secrets@1.0.0 No description
npm warn python-secrets@1.0.0 No repository field
```

### 2. Lockfile Confusion
- `pnpm-lock.yaml` references empty name
- Hard to identify in `node_modules`
- Dependency tree unclear

### 3. Publishing Issues
- Cannot publish to npm (name required)
- If someone tries, will fail

### 4. Metadata Accuracy
- Description says "blank template"
- Version is 1.0.0 but this is active development
- Repository field missing
- Bugs/Homepage URLs missing

## Expected package.json

```json
{
  "name": "python-secrets",
  "version": "0.1.0",
  "description": "An interactive Python learning platform with real-time code execution",
  "author": "Python Secrets Team",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/python-secrets"
  },
  "homepage": "https://github.com/your-org/python-secrets#readme",
  "bugs": {
    "url": "https://github.com/your-org/python-secrets/issues"
  },
  "keywords": [
    "python",
    "education",
    "learning",
    "code-execution",
    "e2b",
    "pyodide",
    "nextjs",
    "payloadcms"
  ]
}
```

## Version Number

### Current
```json
"version": "1.0.0"
```

### Recommended
```json
"version": "0.1.0"
```

**Reasoning**: Semantic Versioning for unstable software:
- `0.x.y` = Initial development
- `1.0.0` = First stable release
- This is clearly not stable yet (see issues list!)

## Labels
`minor` `package-metadata` `documentation` `good-first-issue`

## Steps to Fix
1. Add package name: `python-secrets`
2. Update version to `0.1.0`
3. Update description to match project
4. Add repository field
5. Add keywords
6. Add bugs/homepage URLs
7. Remove generic description

## Verification
```bash
# Should show proper package info
npm pack --dry-run

# Should show name in output
pnpm list --depth=0
```

## Additional Context
This appears to be a leftover from the Payload CMS template. The description "A blank template to get started with Payload 3.0" confirms this. Should be updated to reflect the actual project.

## Publishing Consideration
Even if not planning to publish to npm, proper package.json is important for:
- Monorepo tooling
- Dependency updates
- License compliance
- Project identification

## Related Standards
- [package.json docs](https://docs.npmjs.com/cli/v10/configuring-npm/package-json)
- [Semantic Versioning](https://semver.org/)
- [Node.js package.json guidelines](https://nodejs.org/api/packages.html)
