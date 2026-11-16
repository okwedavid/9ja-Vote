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

## Implemented controls (Day 2)

- **Authentication**: scrypt password hashing, HS256 tokens with separate access and refresh secrets, 30-minute
  access lifetime, server-side revocation on sign-out, 5-attempt lockout for 15 minutes, uniform error text for
  unknown accounts and wrong passwords.
- **MFA**: TOTP for administrators, enabled only after a valid code. No default or seeded credentials exist.
- **Authorization**: permission guards on every Command Centre route. Separation of duties is enforced by the
  server, not by hiding buttons: a super administrator cannot verify or dispute a result.
- **Secrets**: no secret is committed. If `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` are missing or shorter than
  32 characters the API generates ephemeral secrets and warns — deliberately degraded, never hardcoded.
- **Audit**: every sign-in, failed sign-in, account change and result transition is appended to a log the UI
  cannot edit or delete.
- **Data classification**: `X-Data-Classification: DEMONSTRATION` on every API response; banners on every screen.
- **Transport and headers**: Caddy terminates TLS with HSTS; the API sets Helmet defaults; Next apps set
  `X-Content-Type-Options` and `Referrer-Policy`; the admin surface sends `X-Robots-Tag: noindex`.
- **Input handling**: `class-validator` with `whitelist` and `forbidNonWhitelisted`; strict TypeScript; no `any`
  in request handling; parameterised SQL in the drafted schema; no dynamic SQL string building.
- **Rate limiting**: global throttler, configurable per minute.
- **State handling**: the demo store is written atomically (temp file + rename) with mode `0600`, outside git.

## Residual risks after Day 2

1. **The demo store is a JSON file**, not a database. It has no concurrency control beyond single-process
   writes, no encryption at rest beyond disk-level controls, and no multi-instance story. Do not run more than
   one API instance against it.
2. **Tokens are stateless** apart from the in-memory revocation list, so revoking a session only survives until
   the API restarts. Postgres-backed sessions are the fix.
3. **No refresh-token rotation or reuse detection** yet; a stolen refresh token stays valid for 7 days.
4. **No email or SMS verification**, so an administrator's email is not proven to belong to them.
5. **MFA is optional** in code; the runbook requires it, the software does not force it. Add an enforcement flag
   before any pilot.
6. **Postgres and Redis run unused** behind the API; nothing currently attacks them, and nothing protects data
   in them either.
7. **The Flutter app is uncompiled**, so no mobile security claims can be made yet.
8. **No independent penetration test**, WAF or DDoS protection.
9. **`npm audit` still reports 20 low/moderate advisories** in the Jest toolchain; runtime dependencies are clean.
