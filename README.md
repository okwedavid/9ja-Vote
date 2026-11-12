# 9ja Vote

**Your Voice. Your Future. Your Nigeria.**

An independent Nigerian election information, results-transparency and controlled-demonstration platform
(internal project name: Project Nigeria Vote).

> **This is not an INEC platform and not a voting system.** Legally operative remote voting is not implemented.
> Every figure in this repository is synthetic test data. Creating an account does not register anyone to vote.
> The platform never declares a winner.

## What is in the repository

| Path | What it is | State |
|---|---|---|
| `apps/public-web` | Next.js public site: Aso Rock backdrop, 3D slideshow, results demo | Builds and runs |
| `apps/broadcast` | Next.js 1920x1080 TV scoreboard for OBS | Builds and runs |
| `apps/admin` | Next.js Command Centre shell with the RBAC matrix | Builds and runs, no sign-in yet |
| `apps/api` | NestJS read-only demo API with Swagger at `/docs` | Builds, runs, 10 tests pass |
| `apps/mobile` | Flutter app source (welcome + home) | Written, **not yet compiled** |
| `packages/shared-types` | Domain types, RBAC map, synthetic dataset | Builds |
| `packages/design-system` | Colour tokens and shared CSS | In use by all web apps |
| `infrastructure/` | Docker Compose (Postgres, Redis), SQL schema draft, deployment notes | Draft, not yet executed |
| `docs/` | Legal checklist, owner checklist, API, testing, dev log | |

Start with [ARCHITECTURE.md](ARCHITECTURE.md) and [SECURITY.md](SECURITY.md).

## Run it

Requires Node 22+.

```bash
npm ci
npm run build
npm run start -w @9ja-vote/api          # http://localhost:4000/docs
npm run start -w @9ja-vote/public-web   # http://localhost:3000
npm run start -w @9ja-vote/admin        # http://localhost:3001
npm run start -w @9ja-vote/broadcast    # http://localhost:3002  (add ?transparent=1 for an OBS overlay)
```

Checks: `npm run typecheck` and `npm test`.

Mobile: see [apps/mobile/README.md](apps/mobile/README.md) for Android Studio setup.

Database (optional today, the API does not use it yet): copy `.env.example` to `.env`, set the Postgres and
Redis passwords, then `docker compose --env-file .env -f infrastructure/docker/docker-compose.yml up -d`.

## Images

The Aso Rock backdrop and slideshow pictures are **AI-generated illustrations**, not photographs. Replace them
with licensed photography before any public launch (`apps/*/public/images`, `apps/mobile/assets/images`).
The shield emblem is provisional and is deliberately not the Coat of Arms.

## Contributing

Branch and commit conventions are in [CONTRIBUTING.md](CONTRIBUTING.md). Never commit secrets or real personal data.
