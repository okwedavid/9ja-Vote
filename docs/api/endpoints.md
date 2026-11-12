# API specification

Base path `/api/v1`. Interactive documentation: `/docs` (Swagger). Every response carries the header
`X-Data-Classification: DEMONSTRATION`.

## Implemented

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Liveness, mode and `realVotingEnabled: false` |
| GET | `/elections` | Elections (one synthetic election today) |
| GET | `/parties` | Parties (synthetic placeholders today) |
| GET | `/results/national` | National summary, parties, per-state results |
| GET | `/results/states/:code` | One state's result |

## Planned

| Day | Method and path | Auth | Notes |
|---|---|---|---|
| 2 | POST `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout` | public / session | Argon2id, rotating refresh tokens, stricter rate limit |
| 2 | POST `/auth/recovery/request`, `/auth/recovery/confirm` | public | Uniform responses, no account enumeration |
| 2 | GET/PATCH `/me`, GET/DELETE `/me/sessions/:id` | user | |
| 3 | POST `/demo/identity-verifications` | user | Synthetic references only |
| 3 | GET `/demo/eligibility` | user | Always labelled as a demonstration |
| 3 | GET `/polling-units?state=&lga=&ward=` | public | Paginated |
| 4 | GET `/parties/:id`, `/candidates`, `/candidates/:id`, `/elections/:id`, `/calendar` | public | Paginated, cached |
| 5 | GET `/results/:electionId/{national,states/:code,lgas/:code,wards/:code,polling-units/:code}` | public | Cached in Redis |
| 5 | POST `/demo/elections/:id/participations` | user | `Idempotency-Key` header, nonce, unique per user and election |
| 5 | `/admin/*` (change requests, approvals, results ingest and verify, audit log, users) | admin + MFA | Permission per route, all writes audited |

Conventions: JSON, cursor pagination (`?cursor=&limit=`), problem-details errors, ISO 8601 UTC timestamps.
