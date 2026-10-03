---
description: Security-focused code review based on common application security risks and secure coding practices
---

# Security Analysis

Expert guidance for identifying security weaknesses in application code.

## Input Validation
- Validate untrusted input before processing it.
- Do not assume client-side validation is sufficient.
- Check types, ranges, formats, and allowed values.

## Injection Risks
Look for:
- SQL injection
- Command injection
- Cross-site scripting (XSS)
- Template injection
- Path traversal
- Unsafe dynamic code execution

## Authentication and Authorization
- Verify authentication before protected operations.
- Enforce authorization server-side.
- Avoid trusting user-controlled identity or role information.

## Secrets
- Never hardcode API keys, passwords, tokens, or private credentials.
- Use environment variables or secure secret management.
- Avoid logging sensitive credentials.

## Data Protection
- Minimize exposure of sensitive data.
- Avoid logging passwords, tokens, and personal information.
- Use secure transport for sensitive communication.

## Dependencies
- Identify risky or unnecessary dependencies.
- Watch for unsafe package usage and known insecure patterns.

## Error Handling
- Do not expose internal stack traces or secrets to users.
- Return safe error messages while logging useful diagnostic information securely.

## Severity Guidelines
- Critical: Direct compromise, credential exposure, or severe unauthorized access.
- High: Significant exploitable security weakness.
- Medium: Meaningful security weakness requiring specific conditions.
- Low: Defense-in-depth or minor security concern.

## Output:
For each security issue provide:
1. Description
2. Vulnerability category
3. Severity
4. Why it is risky
5. Recommended remediation
6. Safe code example when useful
