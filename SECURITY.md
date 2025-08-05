# Security Policy

## Supported Versions

OpenComments follows semantic versioning. The following versions are currently supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow these steps:

### 1. **DO NOT** create a public GitHub issue
- Security vulnerabilities should be reported privately
- Public disclosure can put users at risk

### 2. **Email us directly**
Send your report to: Available through our contact form

### 3. **Include in your report**
- **Description**: Clear description of the vulnerability
- **Steps to reproduce**: Detailed steps to reproduce the issue
- **Impact**: Potential impact of the vulnerability
- **Suggested fix**: If you have suggestions for fixing the issue
- **Contact information**: How we can reach you for follow-up questions

### 4. **What to expect**
- **Initial response**: Within 48 hours
- **Status updates**: Regular updates on our progress
- **Timeline**: We aim to address critical issues within 7 days
- **Credit**: We'll credit you in our security advisories (if desired)

### 5. **Responsible disclosure**
- We ask for 90 days before public disclosure
- We'll work with you to coordinate disclosure
- We'll credit you in our security advisories

## Security Features

### Authentication & Authorization
- Multi-factor authentication support
- Role-based access control (RBAC)
- Session management with secure timeouts
- Password strength requirements

### Data Protection
- All data encrypted in transit (TLS 1.3)
- Data encrypted at rest
- Row-level security (RLS) in database
- Regular security audits

### Input Validation
- Comprehensive input sanitization
- XSS protection
- SQL injection prevention
- File upload security

### Infrastructure
- SOC 2 Type II compliant hosting
- Regular security updates
- DDoS protection
- Security monitoring and alerting

## Security Best Practices

### For Users
- Use strong, unique passwords
- Enable multi-factor authentication when available
- Keep your browser and devices updated
- Report suspicious activity immediately

### For Developers
- Follow secure coding practices
- Regular security training
- Code reviews with security focus
- Automated security testing

## Security Contacts

- **Security Team**: Available through our contact form
- **Emergency**: Available through our contact form
- **PGP Key**: Available upon request

## Bug Bounty Program

We currently do not have a formal bug bounty program, but we do appreciate security researchers who responsibly disclose vulnerabilities. We may offer recognition and thanks for significant findings.

## Security Updates

- **Critical**: Released within 24 hours
- **High**: Released within 7 days  
- **Medium**: Released within 30 days
- **Low**: Released in next regular update

## Compliance

OpenComments is designed to meet government security requirements:
- FedRAMP compliance (in progress)
- FISMA guidelines
- OWASP Top 10 protection
- NIST Cybersecurity Framework alignment
