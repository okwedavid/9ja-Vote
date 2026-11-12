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
