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
| `apps/public-web` | Next.js public site: Aso Rock backdrop, 3D slideshow, calendar, parties, voter education, polling units, results drill-down | Builds and runs |
| `apps/broadcast` | Next.js 1920×1080 TV scoreboard, ticker and lower-third for OBS | Builds and runs |
| `apps/admin` | Command Centre: real sign-in, TOTP MFA, verification queue, audit log, accounts, platform status | Builds and runs |
| `apps/api` | NestJS API: results workflow, RBAC, audit trail, content, polling units, auth | Builds, runs, 23 tests pass |
| `apps/mobile` | Flutter app: 8 module screens with bundled demo content | Written, **not yet compiled** |
| `packages/shared-types` | Domain types, RBAC map, synthetic dataset | Builds |
| `packages/design-system` | Colour tokens and shared CSS | In use by all web apps |
| `infrastructure/` | Docker Compose (dev + production), Caddyfile, SQL schema draft, deployment notes | Dev compose runs; production stack untested here |
| `docs/` | Legal checklist, owner checklist, API, testing, dev log | |

Start with [ARCHITECTURE.md](ARCHITECTURE.md) and [SECURITY.md](SECURITY.md).

## Run it

Requires Node 22+.

```bash
npm ci
npm run build
npm run start -w @9ja-vote/api          # http://localhost:4000/docs
npm run start -w @9ja-vote/public-web   # http://localhost:3000
npm run start -w @9ja-vote/admin        # http://localhost:3001  (sign-in required)
npm run start -w @9ja-vote/broadcast    # http://localhost:3002  (?transparent=1 or ?mode=lower-third)

# Create the first administrator — no default credentials exist anywhere
npm run seed:admin -w @9ja-vote/api -- --email you@example.org --name "Your Name" --role SUPER_ADMINISTRATOR
```

The seed script prints a generated password **once**. Put it in a password manager, sign in, and enable
two-factor authentication in Security settings. `npm run seed:admin -- --list` shows who exists.

Checks: `npm run typecheck` and `npm test` (23 API tests).

Deployment: `docs/deployment/README.md` (Docker Compose + Caddy, with a pre-launch gate list).
Mobile release: `docs/mobile/shipping.md`. Machine-readable task prompts: `docs/SPIN_UP_PROMPT.md`,
`docs/OPENCODE_PROMPT.md`.

Mobile: see [apps/mobile/README.md](apps/mobile/README.md) for Android Studio setup.

Database (optional today, the API does not use it yet): copy `.env.example` to `.env`, set the Postgres and
Redis passwords, then `docker compose --env-file .env -f infrastructure/docker/docker-compose.yml up -d`.

The API keeps workflow state, accounts and the audit trail in `apps/api/.data/store.json` (git-ignored). Delete
that file to reset the demonstration. Production replaces it with Postgres — see ARCHITECTURE.md §12.

## Images

The Aso Rock backdrop and slideshow pictures are **AI-generated illustrations**, not photographs. Replace them
with licensed photography before any public launch (`apps/*/public/images`, `apps/mobile/assets/images`).
The shield emblem is provisional and is deliberately not the Coat of Arms.

## Contributing

Branch and commit conventions are in [CONTRIBUTING.md](CONTRIBUTING.md). Never commit secrets or real personal data.
