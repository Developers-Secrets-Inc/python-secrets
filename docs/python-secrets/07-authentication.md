# Authentication Strategy

## Current Implementation (MVP)

### Authentication Method
- **Provider**: Better Auth
- **Primary Method**: Email/Password
- **Required for**:
  - Saving progress
  - Accessing paid content
  - Persistent code workspace
  - Challenge submissions

### Account Access
- **Free content**: Can browse without account? (to be confirmed)
- **Code execution**: Available to all users (with rate limits)
- **Progress saving**: Requires account

## Future Enhancements

### Social Login Providers (Planned)
- Google OAuth
- Discord OAuth
- GitHub OAuth

**Timing**: After MVP, when focusing on growth and user convenience

## User Roles

### Free Users
- Email/password authentication
- Access to all free content
- Code execution with rate limits
- Basic progress tracking

### Paid Users
- All free user benefits
- Access to paid courses/content
- Higher rate limits (possibly)
- Certificate/completion tracking
- Portfolio project workspace

## Authentication Flow

### Sign Up
```
Email → Password → Verification (optional) → Account Created → Welcome Flow
```

### Sign In
```
Email → Password → Dashboard → Resume Learning
```

### Future Social Login
```
Provider Button → OAuth Flow → Profile Data → Account Creation/Linking → Dashboard
```

## Security Considerations

### Password Requirements
- Minimum length: 8 characters
- No strict complexity rules (user experience focused)
- Secure hashing by Better Auth

### Session Management
- Secure session tokens
- Remember me functionality
- Session expiration (configurable)

### Account Recovery
- Password reset via email
- Email verification for security

## Integration Points

### With Code Execution
- Authentication required for persistent workspaces
- Rate limits tied to user account (vs. IP-based for anonymous)

### With Progress Tracking
- Must be authenticated to save:
  - Lesson completion
  - Quiz answers
  - Challenge solutions
  - Code snapshots

### With Payments
- Authentication required before purchase
- User account linked to payment
- Access granted to paid content after purchase
