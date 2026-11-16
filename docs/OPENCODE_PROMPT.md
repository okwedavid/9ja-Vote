# Prompt for opencode: test everything, deploy it, ship the app

Paste everything inside the block into opencode at the repository root.

````markdown
You are taking the repository `9ja-Vote` from "it builds locally" to "it is tested, deployed and shippable".
Work methodically, prove every step with real command output, and stop at the human gates listed at the end.

## Hard rules — these are not negotiable

- This is a **demonstration** platform. It is not an INEC service, has no voting feature and must never declare a
  winner. Do not add voting, tallying or declaration logic.
- Keep every "DEMONSTRATION" banner, disclaimer and the `X-Data-Classification` response header.
- Never commit secrets. `.env`, `.env.production`, `key.properties`, keystores and tokens stay out of git.
  If you need a secret, generate it with `openssl rand -hex 32` and put it only in the untracked env file.
- Do not invent political parties or candidates; the fictional placeholders stay fictional.
- Do not upgrade NestJS 11, jest 29 or `@nestjs/throttler@6.4.0`; do not run `npm audit fix --force`.
- No hardcoded or default credentials. The only way to create an administrator is
  `npm run seed:admin -w @9ja-vote/api -- --email …`, or the Command Centre as a super administrator.
- Do not force-push, do not commit to `main` directly, and do not delete tests to make a check pass.
- If a step needs a decision that costs money, touches DNS, or creates a store listing, **stop and ask the owner**.

Read first: `README.md`, `ARCHITECTURE.md`, `SECURITY.md`, `docs/deployment/README.md`,
`docs/mobile/shipping.md`, `docs/OWNER_CHECKLIST.md`.

---

## Phase 1 — prove the code works

```bash
node -v && npm -v && docker --version && docker compose version
git switch -c release/verify 2>/dev/null || git switch release/verify

npm ci
npm run build:packages
npm run typecheck
npm test
npm run build
```

Expected: 23 API tests pass, typecheck is clean, four production builds succeed.

Then run the stack and check it for real:

```bash
npm run start -w @9ja-vote/api &        # :4000
npm run start -w @9ja-vote/public-web & # :3000
npm run start -w @9ja-vote/admin &      # :3001
npm run start -w @9ja-vote/broadcast &  # :3002

curl -fsS localhost:4000/api/v1/health
curl -fsSI localhost:4000/api/v1/health | grep -i x-data-classification      # DEMONSTRATION
curl -fsS localhost:3000/api/v1/health                                       # same-origin proxy works
for p in 3000 3001 3002; do curl -s -o /dev/null -w "$p %{http_code}\n" localhost:$p; done
curl -s -o /dev/null -w '%{http_code}\n' localhost:3001/            # 307 → /login
```

Front-end routes that must return 200 on `:3000`: `/`, `/elections`, `/parties`, `/parties/dp-a`, `/results`,
`/results/LA`, `/results/LA?lga=LA-LGA-01`, `/voter-education`, `/voter-education/check-your-registration`,
`/polling-units`, `/help`, `/accessibility`, `/privacy`. On `:3002`: `/`, `/?transparent=1`, `/?mode=lower-third`.

**API and RBAC checks** (this is the part that matters most):

```bash
# 1. Create a super administrator; keep the printed password out of the shell history
npm run seed:admin -w @9ja-vote/api -- --email owner@example.org --name "Owner" --role SUPER_ADMINISTRATOR
# 2. Sign in
TOKEN=$(curl -s -X POST localhost:4000/api/v1/auth/login -H 'content-type: application/json' \
  -d '{"email":"owner@example.org","password":"<printed>"}' | python3 -c 'import json,sys;print(json.load(sys.stdin)["accessToken"])')
curl -s localhost:4000/api/v1/auth/me -H "authorization: Bearer $TOKEN"
curl -s localhost:4000/api/v1/admin/metrics -H "authorization: Bearer $TOKEN"
# 3. Separation of duties: a super administrator must NOT be able to verify results (expect 403)
curl -s -o /dev/null -w '%{http_code}\n' -X POST localhost:4000/api/v1/results/states/LA/transition \
  -H "authorization: Bearer $TOKEN" -H 'content-type: application/json' -d '{"to":"DISPUTED"}'
# 4. Unauthenticated writes must be rejected (expect 401)
curl -s -o /dev/null -w '%{http_code}\n' -X POST localhost:4000/api/v1/results/states/LA/transition \
  -H 'content-type: application/json' -d '{"to":"DISPUTED"}'
# 5. There must be no voting endpoint at all (expect 404)
curl -s -o /dev/null -w '%{http_code}\n' -X POST localhost:4000/api/v1/votes
```

Then create a verification officer, sign in as them, move a state through the workflow, and confirm the
transition and the audit entry both appear:

```bash
npm run seed:admin -w @9ja-vote/api -- --email verifier@example.org --name "Verifier" --role RESULTS_VERIFICATION_OFFICER
# …sign in as verifier, pick a state in UNDER_VERIFICATION, POST {"to":"VERIFIED","note":"…"}
curl -s "localhost:4000/api/v1/admin/audit?limit=20" -H "authorization: Bearer $TOKEN" | grep -i transition
```

In the Command Centre (`:3001`) sign in with the super administrator and check: overview KPIs render, the
audit log lists the entries, Administrators shows both accounts, Security settings can start MFA setup, and
Results verification shows "No action available for your role" for a super administrator (correct) but offers
actions for the verification officer.

If any check fails, fix the cause — never the test. Record what you changed.

---

## Phase 2 — container and deploy

```bash
docker build -f apps/api/Dockerfile -t 9ja-vote-api:test .
docker build -f apps/public-web/Dockerfile -t 9ja-vote-public:test .
docker build -f apps/admin/Dockerfile -t 9ja-vote-admin:test .
docker build -f apps/broadcast/Dockerfile -t 9ja-vote-broadcast:test .
```

Use `docs/deployment/README.md` as the source of truth. Choose a host with the owner (a single VPS with Docker
Compose is the recommended default), then:

1. Create `.env.production` from `.env.production.example`; generate Postgres, Redis and both JWT secrets.
2. Set the three domains; confirm DNS already points at the host before starting Caddy.
3. `docker compose --env-file .env.production -f infrastructure/docker/docker-compose.prod.yml up -d --build`
4. Create the first administrator inside the container, then enable MFA on it immediately.
5. Confirm Postgres is healthy and the migration tables exist:
   `docker compose … exec postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\dt'`
6. Run the smoke tests over HTTPS, including the `X-Data-Classification` header.
7. Set up nightly `pg_dump` plus a tar of the `apidata` volume, and rehearse one restore.
8. Point an uptime monitor at `/api/v1/health`.
9. Keep `API_DOCS_ENABLED=false` and never publish port 4000 to the internet.

Report the real URLs you verified. If something cannot be verified from where you run, say so explicitly.

---

## Phase 3 — Android bundle and iOS archive

Follow `docs/mobile/shipping.md` exactly.

```bash
cd apps/mobile
flutter doctor
flutter create . --platforms android,ios --project-name nine_ja_vote --org ng.ninejavote
flutter pub get && flutter analyze && flutter test
```

Fix analyzer and test failures properly (the Flutter source was written without a compiler, so expect a few).
Then:

1. Generate the upload keystore; store it outside the repo; wire `android/key.properties` and the release
   signing config; confirm both are git-ignored.
2. `flutter build appbundle --release` and report the AAB path and size.
3. Install the release APK on a device or emulator and walk the eight home tiles; every screen must show the
   demonstration banner and nothing may crash.
4. For iOS, if a Mac with Xcode is not available, stop and report that clearly instead of guessing.
5. Do not upload to Google Play or App Store Connect without the owner's explicit approval and credentials.

---

## Phase 4 — hand back

Produce a report with exactly these sections:

1. **Tested** — every command, its real result, and anything that failed.
2. **Fixed** — file-by-file list with one line each and why.
3. **Deployed** — host, URLs, verification output, and what still needs the owner.
4. **Mobile** — analyze/test output, AAB path and size, device checks, iOS status.
5. **Not done / blocked** — with the exact blocker (DNS, credentials, store account, legal sign-off, Mac).
6. **Risks before launch** — pull from `docs/deployment/README.md` §6 and say which are still open.

Commit in logical steps on a branch and show the diff. Never push to `main`. Never commit a secret.

## Stop and ask before

- Buying or resizing a server, registering a domain, or ordering a certificate.
- Creating or touching DNS records.
- Publishing anything to Google Play, App Store Connect, or a public URL with the owner's brand.
- Enabling Hausa/Yoruba/Igbo/Pidgin strings, or adding real party/candidate data.
- Changing the licence, the disclaimer wording, or the emblem.
````
