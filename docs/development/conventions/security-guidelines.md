---
last_updated: "2025-11-25"
description: "Security practices and standards for So Quotable to protect user data and prevent vulnerabilities"

# === Security Configuration ===
authentication: "Convex Auth"      # Convex Auth (email/password + OAuth)
authorization: "RBAC"              # Role-based access control
encryption_at_rest: "Convex"       # Convex handles encryption
encryption_in_transit: "TLS"       # HTTPS/TLS for all connections
secret_management: "env_vars"      # Environment variables
security_headers: true             # Implement security headers
rate_limiting: "Convex"            # Convex rate limiting
cors_policy: "strict"              # Strict CORS configuration
---

# Security Guidelines

**Referenced by Commands:** security-auditor agent, `/security-audit`

## Purpose

This document defines security practices and standards for the So Quotable project to protect user data and prevent vulnerabilities.

## Platform-Specific Security

### Convex Backend Security

**Built-in Protections**:

- Automatic input validation via TypeScript validators
- Type-safe queries and mutations
- No SQL injection risk (document database with type-safe API)
- Automatic HTTPS/TLS for all connections
- Built-in authentication via Convex Auth

**Authentication** (Convex Auth):

```typescript
import { requireAuth } from "./lib/auth";

// Protect functions with authentication
export const create = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    // Returns userId or throws "Authentication required"
    const userId = await requireAuth(ctx);

    // Create resource with ownership tracking
    return await ctx.db.insert("quotes", {
      ...args,
      createdBy: userId,  // Required field for all resources
      createdAt: Date.now(),
    });
  },
});
```

**Authorization Patterns** (Owner or Admin):

```typescript
import { requireOwnerOrAdmin, requireAdmin } from "./lib/auth";

// Check resource ownership OR allow admin bypass
export const update = mutation({
  args: { id: v.id("quotes"), text: v.string() },
  handler: async (ctx, { id, text }) => {
    const quote = await ctx.db.get(id);
    if (!quote) throw new Error("Quote not found");

    // Throws "Not authorized" if not owner and not admin
    await requireOwnerOrAdmin(ctx, quote.createdBy);

    return await ctx.db.patch(id, { text, updatedAt: Date.now() });
  },
});

// Admin-only operations
export const cleanup = mutation({
  handler: async (ctx) => {
    // Throws "This action requires admin privileges" if not admin
    await requireAdmin(ctx);
    // ... admin-only operation
  },
});
```

### Cloudinary Security

- Use signed URLs for sensitive operations
- Configure upload presets with restrictions
- Implement file size limits
- Enable auto-moderation if available
- Use secure API credentials (environment variables)

## Core Security Principles

### 1. Defense in Depth

Implement multiple layers of security:

- Input validation
- Authentication
- Authorization
- Encryption
- Logging and monitoring

### 2. Least Privilege

- Grant minimum necessary permissions
- Use role-based access control (RBAC)
- Regularly review and revoke unnecessary access
- Separate duties where appropriate

### 3. Secure by Default

- Default to secure configurations
- Require explicit opt-in for less secure options
- Fail securely (deny access on error)
- No security through obscurity

### 4. Zero Trust

- Never trust, always verify
- Authenticate every request
- Validate all inputs
- Verify all outputs

## Authentication

### Password Security

- **Never** store passwords in plain text
- Use strong hashing (bcrypt, Argon2)
- Enforce password complexity requirements
- Implement password strength meter
- Consider passwordless options (magic links, WebAuthn)

### Session Management

- Use secure, httpOnly cookies
- Implement session timeout
- Regenerate session IDs after login
- Implement logout functionality
- Use CSRF tokens

### Multi-Factor Authentication (MFA)

- Offer MFA for all users
- Require MFA for admin accounts
- Support multiple MFA methods
- Provide backup codes

## Authorization

### Access Control

- Implement RBAC or ABAC
- Verify authorization on every request
- Check permissions server-side
- Don't rely on client-side checks

### API Security

- Require authentication for protected endpoints
- Validate authorization for all actions
- Use API keys or tokens
- Implement rate limiting
- Log access attempts

## Input Validation

### Validate All Inputs

- Validate on both client and server
- Use allowlists, not blocklists
- Validate data type, length, format
- Sanitize inputs before processing

### Prevent Injection Attacks

**SQL Injection:**

- Use parameterized queries
- Use ORM with proper escaping
- Never concatenate user input into queries

**XSS (Cross-Site Scripting):**

- Escape all user-generated content
- Use Content Security Policy (CSP)
- Validate and sanitize HTML input
- Use framework-provided escaping

**Command Injection:**

- Avoid system calls with user input
- Use safe APIs instead of shell commands
- Sanitize any necessary command inputs

## Data Protection

### Encryption

**Data in Transit:**

- Use HTTPS/TLS for all connections
- Use strong cipher suites
- Implement HSTS (HTTP Strict Transport Security)
- Keep TLS certificates up to date

**Data at Rest:**

- Encrypt sensitive data in database
- Use encryption for file storage
- Secure encryption keys properly
- Consider field-level encryption

### Sensitive Data

- Minimize collection of sensitive data
- Store only what's necessary
- Implement data retention policies
- Securely delete when no longer needed
- Never log sensitive information

## File Uploads

- Validate file types (check content, not just extension)
- Limit file sizes
- Scan for malware
- Store uploads outside web root
- Use random filenames
- Implement access controls
- Never execute uploaded files

## Error Handling

- Don't expose sensitive information in errors
- Log errors securely
- Use generic error messages for users
- Implement proper logging
- Monitor for suspicious patterns

## Dependencies

### Dependency Management

- Keep dependencies up to date
- Regularly scan for vulnerabilities
- Use automated security updates
- Vet dependencies before use
- Minimize dependency count

### Supply Chain Security

- Verify package integrity
- Use lock files (package-lock.json, yarn.lock)
- Audit dependencies regularly
- Monitor for known vulnerabilities

## API Security

### Rate Limiting

- Implement rate limiting per user/IP
- Prevent brute force attacks
- Protect against DDoS
- Implement exponential backoff

### CORS (Cross-Origin Resource Sharing)

- Configure CORS properly
- Allow only trusted origins
- Avoid using wildcard (\*)
- Validate Origin header

## Logging and Monitoring

### What to Log

- Authentication attempts (success/failure)
- Authorization failures
- Input validation failures
- Application errors
- Configuration changes
- Admin actions

### What NOT to Log

- Passwords
- Session tokens
- Credit card numbers
- Personal identifiable information (PII)
- API keys

### Monitoring

- Monitor for suspicious patterns
- Set up alerts for anomalies
- Regular security audits
- Incident response plan

## Security Headers

Implement these HTTP security headers:

```
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## Environment Variables

- Never commit secrets to version control
- Use environment variables for sensitive config
- Use secret management tools
- Rotate secrets regularly
- Different secrets per environment

## Code Reviews

Security focus during code review:

- Input validation
- Authentication/authorization checks
- Sensitive data handling
- Error handling
- Dependency updates
- Security best practices

## Security Testing

### Regular Testing

- Automated security scans
- Dependency vulnerability scanning
- Penetration testing
- Security code reviews
- Static code analysis

### Before Production

- Security audit
- Vulnerability assessment
- Compliance check
- Penetration testing

## Incident Response

### Preparation

- Incident response plan documented
- Team roles defined
- Contact information current
- Backup and recovery procedures

### Response Steps

1. Identify and contain
2. Investigate and assess
3. Eradicate threat
4. Recover systems
5. Post-incident review
6. Update procedures

## Compliance

Consider relevant regulations:

- GDPR (if handling EU user data)
- CCPA (if handling California user data)
- COPPA (if users under 13)
- PCI DSS (if handling payment cards)
- HIPAA (if handling health information)

## Security Tools

Use automated security tools:

```bash
# Dependency scanning
npm audit
snyk test

# Static analysis
eslint-plugin-security
semgrep

# Container scanning
docker scan

# Secret scanning
git-secrets
trufflehog
```

## Security Checklist

Before deployment:

- [ ] All dependencies updated
- [ ] Security scan passed
- [ ] HTTPS enforced
- [ ] Authentication implemented
- [ ] Authorization verified
- [ ] Input validation complete
- [ ] Sensitive data encrypted
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Logging configured
- [ ] Error handling secure
- [ ] Secrets in environment variables
- [ ] CORS configured properly
- [ ] File upload security implemented

## Resources

- OWASP Top 10
- OWASP Cheat Sheet Series
- CWE (Common Weakness Enumeration)
- CVE (Common Vulnerabilities and Exposures)

## Regular Reviews

- Review these guidelines quarterly
- Update based on new threats
- Learn from security incidents
- Stay current with best practices

---

_Security is everyone's responsibility. When in doubt, ask for a security review._
