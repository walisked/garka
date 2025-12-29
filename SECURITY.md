# Security Checklist for Garka

This document lists security controls implemented and recommended next steps.

Implemented
- JWT token revocation via `RevokedToken` (server-side logout) with TTL index.
- Rate limiting for auth endpoints and webhook endpoints (`authLimiter`, `webhookLimiter`).
- Webhook signature verification using HMAC (Monnify) and `MONNIFY_WEBHOOK_SECRET` / `MONNIFY_API_SECRET` as fallback.
- Webhook replay protection using `WebhookEvent` with unique eventId and 7-day TTL.
- Request validation on critical endpoints and role-based middleware checks.

Recommended / Planned
- Enforce strict webhook replay window and stricter rate limits for production traffic.
- Add replay nonce validation at provider-level and support idempotency keys for internal operations.
- Implement secrets rotation procedures and key management (use AWS KMS/HashiCorp Vault/Secrets Manager).
- Add audit logging for sensitive actions (payouts, approvals, invites) with immutable storage for logs.
- Enable TLS-only configuration and HSTS on production servers.
- Implement 2FA for admin accounts and monitoring/alerting for suspicious login attempts.
- Periodic dependency vulnerability scanning and SCA (e.g., dependabot, Snyk).

Operational
- Rotate Monnify secrets at least quarterly and provide a playbook for rotation: update env, verify E2E, rotate webhooks.
- Add monitoring and alerts for failed webhooks, repeated signature failures, and stuck payout transactions.

Contact
- Security owner: @maintainer
- Incident response: create issue and tag `security` label and notify incident response team.
