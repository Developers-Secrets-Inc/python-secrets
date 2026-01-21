# Code Execution Strategy

## Execution Engines

### Dual Engine System

#### Pyodide (Client-Side)
- **Technology**: WebAssembly Python runtime
- **Location**: Runs in user's browser
- **Best for**: Simple scripts, quick demos, basic Python
- **Advantages**:
  - Zero server cost
  - Fast execution for simple code
  - No network latency
  - Privacy (code doesn't leave browser)

#### E2B (Server-Side)
- **Technology**: E2B Code Interpreter
- **Location**: Isolated server environments
- **Best for**: Complex projects, full Python ecosystem, long-running code
- **Advantages**:
  - Complete Python package support
  - True sandbox isolation
  - Multiple file support
  - Production-like environment

### Automatic Engine Selection
```
Simple Code → Pyodide (free, fast)
Complex Code → E2B (powerful, cost)
```

**Selection Criteria:**
- Code length/complexity
- Package dependencies
- Execution time
- Multi-file projects

## Access Policy

### Open Access
- **All users** can execute code
- No paywall for code execution
- Learning requires hands-on practice

### Rate Limiting (Cost Control)

#### Free Users
- **Rate limit**: X executions per hour/day (to be determined)
- **Priority**: Queue behind paid users during high load
- **Session timeout**: X minutes of inactivity

#### Paid Users
- **Higher rate limit**: More executions per hour/day
- **Priority**: Queue priority
- **Longer sessions**: Extended timeout
- **More resources**: Higher memory/CPU limits

### Anonymous Users
- **Basic execution**: Can run code with tight limits
- **No persistence**: Code not saved
- **IP-based limits**: Prevent abuse
- **Encouragement**: "Create account to save your code"

## Rate Limiting Strategy

### Goals
1. **Cost protection**: Don't exhaust E2B budget
2. **Fair usage**: Prevent abuse
3. **Conversion incentive**: Paid users get better limits
4. **Good UX**: Limits don't hinder learning

### Implementation

#### Limits by Tier
| Tier | Hourly | Daily | Session | Resources |
|------|--------|-------|---------|-----------|
| Anonymous | Low | Low | Short | Basic |
| Free | Medium | Medium | Medium | Standard |
| Paid | High | High | Long | Extended |

#### Rate Limit Responses
- **Approaching limit**: Warning message
- **At limit**: Queue request or deny with upgrade prompt
- **Paid users**: Always have capacity

## Execution Features

### Single File Execution
- Quick code snippets
- Interactive learning
- Instant feedback

### Multi-File Projects
- Full application structure
- Multiple Python files
- Dependencies (requirements.txt)
- File system navigation

### Output Display
- stdout: Program output
- stderr: Error messages
- Execution time
- Memory usage (for optimization learning)

### Code Persistence
- **Authenticated users**: Auto-save code snapshots
- **Per-lesson workspace**: Restore previous code
- **Project templates**: Starting code for exercises

## Cost Management

### Monitoring
- Track E2B API costs
- Cost per user tier
- Most expensive operations
- Anomaly detection

### Optimization
- Prefer Pyodide when possible
- Cache E2B environments
- Pool E2B sessions
- Kill idle sessions quickly

### Budget Controls
- Monthly spending caps
- Auto-throttle when approaching budget
- Alerts for unusual usage
- Cost per acquisition tracking

## Abuse Prevention

### Detection
- Rate limit bypassing attempts
- Malicious code patterns
- Crypto mining attempts
- Infinite loops

### Prevention
- Execution timeout
- Memory limits
- Network restrictions
- Code analysis (basic)

## Future Enhancements

### Advanced Features (Post-MVP)
- Collaboration (shared workspaces)
- Code history/versioning
- Custom environments
- GPU support (for ML courses)
