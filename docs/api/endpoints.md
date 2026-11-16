# API specification

Base path `/api/v1`. Interactive documentation at `/docs` (Swagger; disable with `API_DOCS_ENABLED=false` in
production). Every response carries `X-Data-Classification: DEMONSTRATION`.

All data is synthetic. The API has **no voting, tallying or declaration endpoint** and never returns a winner
(`declaredWinner` is always `null`).

## Public

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Liveness, mode, `realVotingEnabled: false`, store version, uptime |
| GET | `/meta` | Version, feature flags, locale states, compliance flags |
| GET | `/elections` | Elections plus the demonstration calendar |
| GET | `/elections/:id` | One election with its calendar |
| GET | `/parties` | Fictional parties, each with its candidate |
| GET | `/parties/:id` | Party, candidate profile and manifesto pledges |
| GET | `/results/national` | National summary, party totals, 37 state records |
| GET | `/results/states/:code` | One state's figures and status |
| GET | `/results/states/:code/lgas` | LGA breakdown (deterministically derived, synthetic) |
| GET | `/results/states/:code/lgas/:lgaCode` | LGA record with ward children |
| GET | `/polling-units?state=LA&lga=&q=&limit=` | Synthetic polling-unit search |
| GET | `/polling-units/:code` | One synthetic polling unit |
| GET | `/content/education` · `/content/education/:slug` | Voter education library |
| GET | `/content/faq` · `/content/glossary` | Plain-language explanation and terms |
| GET | `/content/locales` | Locale register with review status |
| GET | `/content/sources` | Source register (what a figure must be traceable to) |
| GET | `/notifications` | In-app demonstration notifications |
| POST | `/notifications/:id/read` | Mark an example notification read |

## Authentication

Access tokens are short-lived (30 minutes), signed HS256, and carry the account id, email and role. Refresh
tokens last 7 days. Logout revokes the access token id. Sign-in is rate-logged and locked for 15 minutes after
five failures. Passwords use scrypt (Node built-in); MFA is TOTP (RFC 6238).

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/login` | public | Email + password `{ "email", "password", "totp"? }` → tokens + account |
| POST | `/auth/refresh` | public | Rotate tokens from a refresh token |
| POST | `/auth/logout` | bearer | Revoke the current access token |
| GET | `/auth/me` | bearer | Current account |
| POST | `/auth/mfa/setup` | bearer | Generate a TOTP secret + `otpauth://` URL (not yet enabled) |
| POST | `/auth/mfa/enable` | bearer | Confirm a 6-digit code and enable MFA |
| POST | `/auth/mfa/disable` | bearer | Disable MFA (password required) |
| POST | `/auth/password` | bearer | Change own password (12+ characters, letter + number) |

## Command Centre (role-gated)

Permissions are enforced by guards on the server; the UI only hides what will be rejected anyway.

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/results/workflow` | any authenticated | Queue counts and oldest pending record |
| POST | `/results/states/:code/transition` | `results.ingest` (submit) · `results.verify` (receive, verify, dispute, reopen) · `results.publish` (record declaration) | Move a record one step along the graph |
| GET | `/admin/metrics` | any authenticated | Dashboard KPIs |
| GET | `/admin/workflow` | any authenticated | Same as `/results/workflow` |
| GET | `/admin/audit?limit=&action=` | `audit.read` | Append-only audit entries |
| GET | `/admin/accounts` | `admin.users.manage` | Administrator accounts |
| POST | `/admin/accounts` | `admin.users.manage` | Create an account; returns a one-time temporary password |
| PATCH | `/admin/accounts/:id/status` | `admin.users.manage` | Suspend or reinstate (never your own account) |
| PATCH | `/admin/accounts/:id/role` | `admin.users.manage` | Change role (never your own role) |

### Workflow graph

```
AWAITING_SUBMISSION → SUBMITTED → RECEIVED → UNDER_VERIFICATION → VERIFIED → OFFICIALLY_DECLARED
        │                │           │                │              │
        └────────────────┴───────────┴────────────────┴──────────────┴──▶ DISPUTED ──▶ UNDER_VERIFICATION
```

`OFFICIALLY_DECLARED` records a declaration made by an authorised body elsewhere; it is never produced by this
platform. Values are immutable once published — a correction must create a new version.

## Conventions

- JSON in, JSON out; HTTP status codes are meaningful (400 validation, 401 unauthenticated, 403 permission,
  404 unknown, 429 throttled).
- Timestamps are ISO 8601 UTC; the interface renders WAT (`Africa/Lagos`).
- Validation uses `class-validator` with `whitelist` and `forbidNonWhitelisted`, so unexpected fields are rejected.
- Rate limit: `RATE_LIMIT_PER_MINUTE` (default 120 per minute per client).
- Swagger at `/docs` documents every route and DTO. Keep it disabled in production unless the owner asks.

## Not implemented, deliberately

Registration and password recovery for public users, demo identity verification, demo participation records,
notification delivery (email/SMS), result ingestion from any external source, and every kind of voting. These
are blocked on legal and product decisions, not on engineering effort.
