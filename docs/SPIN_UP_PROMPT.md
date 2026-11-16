# Spin-up prompt (copy and paste)

Paste everything inside the block below into a fresh coding agent session that has this repository cloned.
It is written to get the whole stack running and **nothing else** — no feature work, no redesigns.

````markdown
You are bringing the repository `9ja-Vote` from a fresh clone to a fully running local stack. Your only job is
to get everything in it running and verified. Do not add features, do not restyle anything, do not refactor,
do not rename things, and do not "improve" the architecture while you are here. If a step needs a judgement
call beyond running the code, stop and ask.

## What this project is (so you do not break the rules while running it)

9ja Vote is a Nigerian election-information, voter-services and results-transparency project with a
**controlled, non-binding demonstration** mode. Read `README.md`, `ARCHITECTURE.md`, `SECURITY.md` and
`CONTRIBUTING.md` before typing any command.

Hard rules that apply while you run it:

- No real voting, no vote-casting endpoint, no winner declaration. Every figure is synthetic.
- Never commit `.env`, secrets, keys, real personal data or real voter data.
- Do not remove or hide the "DEMONSTRATION" banners, disclaimers, or the `X-Data-Classification` header.
- Do not invent political parties or candidates; the placeholder parties are intentional.
- Keep the API read-only (GET only).
- Do not upgrade NestJS 11, jest 29 or `@nestjs/throttler@6.4.0` — that combination is pinned on purpose.
- Do not run `npm audit fix --force`.
- Work on a branch, never on `main`. Do not force-push. Do not open or merge a pull request without the owner.

## Goal / definition of done

All of the following true at the same time, on one machine:

1. `npm ci` completes at the repo root.
2. `npm run typecheck` and `npm test` are clean (API tests: 10 passing).
3. Postgres 17 and Redis 7 run in Docker and the schema in `infrastructure/database/migrations/0001_init.sql`
   is applied (tables visible in `\dt`).
4. Four services respond with HTTP 200:
   - API `http://localhost:4000/api/v1/health` (Swagger at `/docs`)
   - Public site `http://localhost:3000`
   - Command Centre `http://localhost:3001`
   - Broadcast scoreboard `http://localhost:3002`
5. `http://localhost:3000/api/v1/health` returns the API payload (proves the same-origin `/api/*` rewrite works).
6. The Flutter app builds and starts on an emulator (`flutter analyze` clean, `flutter test` passing), or you
   report precisely which tool is missing.
7. You produce the report described at the end.

## Steps

### 0. Preflight — check before installing anything

```bash
node -v          # need 22 or newer
npm -v           # need 10 or newer
git --version
docker --version && docker compose version
flutter --version
```

If Node, npm or Docker is missing or too old, stop and report it; the web stack cannot be substituted.
Flutter missing is acceptable — finish everything else, then report it as the one blocker.

### 1. Install

```bash
git switch -c development 2>/dev/null || git switch development   # never work on main
npm ci
```

`npm ci` must be used, not `npm install`, so `package-lock.json` stays authoritative. Do not add dependencies
to make a step pass.

### 2. Local environment file

```bash
cp .env.example .env
```

Fill in real local values (never commit `.env`; confirm it is git-ignored):

- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` — required by Docker Compose, it refuses to start without them.
- `REDIS_PASSWORD` — required by Docker Compose.
- `DATABASE_URL` — `postgresql://USER:PASSWORD@127.0.0.1:5432/DB`
- `REDIS_URL` — `redis://:PASSWORD@127.0.0.1:6379`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — long random strings (`openssl rand -hex 32`). Unused today, still set them.
- `API_PORT=4000`, `API_DOCS_ENABLED=true`, `RATE_LIMIT_PER_MINUTE=120`
- `CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002`
- `API_INTERNAL_URL=http://127.0.0.1:4000`
- `REAL_VOTING_ENABLED=false`, `INEC_RESULTS_INTEGRATION_ENABLED=false` — leave both false. This is not optional.

Leave provider keys blank. Note: the Next.js apps do **not** read the root `.env`; if you need to override
`API_INTERNAL_URL` or `ALLOWED_DEV_ORIGINS` for a tunnel, export them in the shell that starts those apps.

### 3. Build

```bash
npm run build:packages   # packages/shared-types must be compiled before the apps
npm run build            # api (tsc) + three Next.js production builds
```

### 4. Data services

```bash
docker compose --env-file .env -f infrastructure/docker/docker-compose.yml up -d
docker compose --env-file .env -f infrastructure/docker/docker-compose.yml ps
```

Wait for both healthchecks to pass. The migration is mounted at `/docker-entrypoint-initdb.d`, so it runs
automatically on a **fresh** volume. Then confirm it actually applied:

```bash
set -a; . ./.env; set +a
docker compose --env-file .env -f infrastructure/docker/docker-compose.yml exec postgres \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\dt'
```

You should see `users`, `participation_events`, `demo_ballots`, `result_records`, `audit_log` and the rest.
If the volume already existed and tables are missing, apply the migration by hand
(`psql ... < infrastructure/database/migrations/0001_init.sql`) and say so in the report.
The API does not depend on Postgres yet — it serves synthetic data from `packages/shared-types` — so a database
problem must be reported, not worked around by changing API code.

### 5. Run the four services

Use the built output (`start` scripts), in this order, one terminal each:

```bash
npm run start -w @9ja-vote/api          # port 4000
npm run start -w @9ja-vote/public-web   # port 3000
npm run start -w @9ja-vote/admin        # port 3001
npm run start -w @9ja-vote/broadcast    # port 3002
```

All of them must bind `0.0.0.0` so they also work behind a proxy or tunnel. For active development later,
`npm run dev:api`, `dev:public`, `dev:admin`, `dev:broadcast` exist — do not switch to them for this task.

### 6. Verify the web stack

```bash
curl -s  localhost:4000/api/v1/health
curl -s  localhost:4000/api/v1/elections | head -c 400
curl -s  localhost:4000/api/v1/parties   | head -c 400
curl -s  localhost:4000/api/v1/results/national | head -c 400
curl -sI localhost:4000/api/v1/health | grep -i 'x-data-classification'
curl -s  localhost:3000/api/v1/health            # must return the API payload, not HTML
for p in 3000 3001 3002; do printf "%s -> " $p; curl -s -o /dev/null -w '%{http_code}\n' localhost:$p; done
curl -sI localhost:3000 | head -1
```

Expected: health `{"status":"ok",...,"realVotingEnabled":false}`, header
`X-Data-Classification: DEMONSTRATION`, three 200s. If a browser or Playwright/Chromium is available, also load
the three sites and confirm the demo banner is visible on each; say whether you actually saw it.

### 7. Flutter app

```bash
cd apps/mobile
flutter create . --platforms android,ios --project-name nine_ja_vote --org ng.ninejavote
flutter pub get
flutter analyze
flutter test
flutter run            # needs a running emulator or device
```

`flutter create .` only generates the missing `android/` and `ios/` platform folders; it must not overwrite the
existing `lib/` code. Do not commit the generated platform folders or build output unless the owner asks.

### 8. Checks

```bash
npm run typecheck
npm test
```

Both must be clean. Do not silence a failure by deleting a test or loosening a tsconfig.

## When something fails

Try the obvious fix once. If it fails again, stop, keep the full error text, and report it — do not rewrite
architecture, do not downgrade packages, do not disable type checking or tests to get green output.

Known rough edges you may hit, all already documented in `docs/DEVLOG.md`:

- The API has no database, no auth and no write endpoints yet — that is the intended Day 1 state.
- `npm audit` shows ~20 low/moderate advisories in the Jest toolchain; runtime deps are clean. Leave them.
- CI is not active: the workflow is at `infrastructure/ci/github-actions-ci.yml` and needs copying to
  `.github/workflows/ci.yml` with the right permissions. Do not try to push workflow files.
- The Aso Rock and slideshow images are AI-generated placeholders. Do not replace or regenerate them.

## Report back with exactly this

1. **Running now** — each service, its URL, and the HTTP status you observed.
2. **Verified** — the check commands you ran and their real output (tests, typecheck, `\dt` table list).
3. **Not working** — anything failed or skipped, with the exact error and what you tried.
4. **Tooling still missing** — e.g. Flutter SDK, Xcode, Docker, emulator, browser, and the exact install step.
5. **Changes you made** — file list and one line each; commit hash if you committed. Nothing else should change.
6. **Owner decisions** — only if you hit a real blocker; point at the relevant item in
   `docs/OWNER_CHECKLIST.md` or section 12 of `ARCHITECTURE.md`.
````
