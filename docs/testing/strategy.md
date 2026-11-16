# Testing strategy

| Type | Tool | State |
|---|---|---|
| Unit | Jest | Results aggregation and labelling: in place |
| API integration | Jest + Supertest | Health, results, no write or vote routes: in place |
| Mobile interface | `flutter test` | Two widget tests written, not yet run |
| Authentication, authorization | Jest + Supertest | Day 2 and Day 5 |
| Duplicate participation | Concurrent requests against PostgreSQL | Day 5 |
| Database consistency | Migration up on an empty database, constraint tests | Day 2 |
| Load | k6 against public read routes | Day 6 |
| Offline and poor network | Throttled browser runs, API-down fallback | Fallback in place, tests Day 6 |
| Accessibility | axe, keyboard and screen-reader walkthrough | Day 6 |
| Security regression | Gitleaks and `npm audit` in CI now; ZAP baseline Day 6 | Partly in place |

All test data is synthetic and generated deterministically in `packages/shared-types`.

## What actually runs today

- `npm test` — 23 tests: synthetic dataset invariants (37 states, no declared winner, totals reconcile), workflow
  graph and permission checks, audit appending, password hashing and policy, TOTP generation/verification, token
  signing, and an integration suite that boots the Nest app against a temporary store.
- `npm run typecheck` — strict TypeScript across every workspace package.
- `npm run build` — API compilation plus three production Next.js builds.

## Not yet automated (and what would close it)

| Gap | How to close it |
|---|---|
| Browser rendering, keyboard navigation, contrast | Playwright suite against `:3000`–`:3002`; axe-core checks per page |
| Auth flows through the real cookie/session path | Playwright sign-in test, plus a super-admin-cannot-verify assertion |
| Docker images and the production compose stack | `docker build` in CI, then `compose up` on a disposable host |
| Flutter screens | `flutter analyze`, `flutter test`, integration test on an emulator |
| Postgres schema and migration | Run `0001_init.sql` against Postgres 17 in CI, assert table and constraint names |
| Load and rate-limit behaviour | k6 or autocannon against the results endpoints |
| Accessibility | Manual screen-reader pass plus automated checks; record known gaps publicly |
