# Daily development log

## Day 1 — 12 Nov 2026

**Done**
- Monorepo (npm workspaces) with API, three Next.js apps, Flutter source, shared packages.
- Read-only demo API: health, elections, parties, national and state results. 10 tests pass.
- Public site with Aso Rock backdrop, 3D slideshow, countdown and results demo.
- Broadcast scoreboard and Command Centre shell.
- Schema draft, Docker Compose, CI workflow file, architecture, security and legal documents.

**Not done / known gaps**
- Flutter app has not been compiled or tested (no SDK in the build environment).
- SQL migration has not been run against PostgreSQL. The API still serves in-memory synthetic data.
- No authentication yet. Admin app is a read-only shell.
- Web pages were verified by build and HTTP checks only, not in a browser.
- Dev-only dependency advisories (Jest toolchain). Runtime dependencies audit clean.

**Next (Day 2)**
- Owner decisions listed in ARCHITECTURE.md section 12.
- Database access layer and migration runner, registration, login, sessions.

**CI note**: the build agent's GitHub access cannot write to `.github/workflows`, so the workflow is stored at
`infrastructure/ci/github-actions-ci.yml`. The owner should copy it to `.github/workflows/ci.yml`. It has not run yet.

## Day 2 — 16 Nov 2026

**Done**
- API grew from 4 read endpoints to a working demonstration backend: auth (scrypt + HS256 + TOTP MFA), six-role
  RBAC enforced by guards, seven-stage results workflow with an append-only audit trail, account administration,
  election calendar, parties and candidates, voter-education content, polling-unit search, notifications, meta.
- Persistence: atomic JSON store at `apps/api/.data/store.json` (git-ignored) so workflow state and accounts
  survive a restart. Postgres schema remains a draft and is still not wired.
- Public site: 12 routes — calendar, party directory with manifesto pages, results explorer with LGA/ward
  drill-down, voter education with article pages, polling-unit search, help/FAQ/sources, accessibility, privacy.
- Command Centre: real sign-in (plain form post → `/api/session`, HttpOnly cookie, works without JavaScript), MFA setup, verification queue with role-aware
  actions, audit log, administrator management, election view, platform feature status, security settings.
- Broadcast: ticker strip and a lower-third overlay mode (`?mode=lower-third`).
- Mobile: six new screens (education, calendar, parties, results, polling units, settings) plus bundled demo
  content; home tiles now navigate. Still uncompiled.
- Deployment: four Dockerfiles, `docker-compose.prod.yml` with Postgres/Redis/Caddy, Caddyfile with TLS and
  security headers, `.env.production.example`, hosting runbook, mobile shipping guide, opencode task prompt.
- Tests: 23 passing (results, workflow permissions, audit, password hashing, TOTP, tokens, integration).

**Broken / unverified**
- Docker is not available in this environment, so none of the four images or the production compose stack has
  been built or started.
- Flutter still has no SDK here: the new screens are unanalysed and untested.
- No browser was available: pages were checked by HTTP status and HTML greps, not visually.
- The production topology (Caddy TLS, three domains) has never been exercised.

**Remaining**
- Persistence decision and Postgres-backed repositories (the JSON store is demo-grade only).
- Demo identity verification and demo participation records (both need legal sign-off first).
- Postgres migration rehearsal, load test, accessibility audit, penetration test.
- Refresh-token rotation, session listing, MFA enforcement flag.

**Next**
- Owner decisions in ARCHITECTURE.md §12, the launch gates in `docs/deployment/README.md` §6, and the
  verification pass described in `docs/OPENCODE_PROMPT.md`.
