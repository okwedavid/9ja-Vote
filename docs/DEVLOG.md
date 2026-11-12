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
