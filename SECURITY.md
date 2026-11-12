# Security

9ja Vote is a demonstration. It has not been penetration-tested or certified, and it is not attack-proof.
The aim is to make attacks difficult, detectable, containable and recoverable.

## Reporting a vulnerability

Please do not open a public issue. Use GitHub's private vulnerability reporting on this repository.
(The project owner needs to enable it and nominate a security contact.)

## What is in place today

- API: Helmet security headers, global rate limiting, strict input validation, CORS closed by default,
  read-only routes only, and a data-classification header on every response.
- Web: browsers call same-origin only; the admin and broadcast apps are marked no-index.
- No secrets, default accounts or credentials anywhere in the repository. `.env` files are git-ignored.
- CI workflow (written, not yet active: see infrastructure/ci): type checks, tests, builds, runtime dependency audit, Gitleaks secret scan.
- Schema draft: append-only audit and result tables, maker/checker constraint, identity and ballot separation.

Not yet in place: authentication, MFA, TLS termination, encryption at rest, WAF, backups, monitoring,
static analysis (CodeQL) and dynamic scanning. These are scheduled in the plan below.

## Threat model

| Threat | Example | Planned or existing control | Residual risk |
|---|---|---|---|
| Impersonation | Fake account posing as another person | Verified email or phone; demo identity is synthetic so no real identity is asserted | Accounts are not proof of identity |
| Account takeover | Credential stuffing, SIM swap | Argon2id, rate limits, breached-password check, refresh rotation with reuse detection, admin TOTP (not SMS) | Phishing of users |
| Insider threat | Admin alters a result or reads choices | Separation of duties, maker/checker, append-only tables, hash-chained audit log, no ballot-identity link | A database superuser; needs cryptographic design and independent audit |
| Denial of service | Election-night flood | CDN caching, WAF, rate limits, public read path isolated from admin and auth | Large volumetric attacks depend on the provider |
| Data manipulation | Tampered result in transit or storage | Signed source records, versioned results, reconciliation across levels, visible status and source | Compromise of the source itself |
| Replay | Resubmitting a captured request | TLS, idempotency keys, single-use nonces with expiry, unique constraints | Low |
| Device compromise | Rooted phone, malware | No secrets in the app, keystore storage, short tokens, server-side checks only | A compromised device can act as its user |
| Privacy breach | Database leak | Data minimisation, no biometrics, no real ID numbers, encryption at rest, least-privilege database roles | Email and phone exposure |
| Misinformation | Demo figures passed off as official | Banner on every screen, classification header, on-air label, no winner field | Cropped screenshots |
| Supply chain | Malicious dependency | Lockfile, `npm ci`, audit in CI, dependency updates reviewed | Zero-day in a dependency |

## Known issues

- Dev-only advisories in the Jest toolchain (`npm audit`). Runtime dependencies (`npm audit --omit=dev`) are clean.
- Swagger UI is enabled by default; set `API_DOCS_ENABLED=false` in production.

## Before any public launch

Independent penetration test, source review, restore drill, incident-response runbook, and a Data Protection
Impact Assessment. See `docs/legal/approval-checklist.md`.
