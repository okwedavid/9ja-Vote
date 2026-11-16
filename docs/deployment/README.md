# Hosting 9ja Vote

Everything in this repository runs as five containers: the NestJS API, three Next.js front ends
(public site, Command Centre, broadcast graphics), plus Postgres, Redis and Caddy for TLS.

> **Before any public launch:** the legal checklist in `docs/legal/approval-checklist.md` must be signed off.
> The platform must keep saying, on every screen and in every API response, that it is a demonstration and is
> not affiliated with INEC. Do not remove those labels to "look official".

---

## 1. What you need

| Item | Why | Notes |
|---|---|---|
| A Linux server | Runs the containers | 2 vCPU / 4 GB RAM is enough for the demo; 4 vCPU / 8 GB for a pilot |
| A domain name | TLS and stable links | Three subdomains: public, admin, live (broadcast) |
| DNS access | Point subdomains at the server | A records for `www`, `admin`, `live` |
| Docker Engine + Compose v2 | Builds and runs the stack | Installed on the server |
| A password manager | Holds generated credentials | No secrets live in this repository |
| Optional: object storage | Backups | Any S3-compatible bucket |

Cost expectations (also in `ARCHITECTURE.md` §10): a demo runs at roughly **US$50–150/month**;
a pilot at **US$600–1,500/month**; election-night peaks are a different conversation
(**US$5,000–20,000+**) because of bandwidth and on-call staffing.

---

## 2. Fastest correct path: one VPS with Docker Compose

```bash
# 1. On the server (Ubuntu 24.04 example)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker "$USER" && newgrp docker
sudo apt-get install -y git ufw

# 2. Firewall: SSH, HTTP, HTTPS only
sudo ufw allow OpenSSH && sudo ufw allow 80,443/tcp && sudo ufw --force enable

# 3. Get the code
git clone https://github.com/okwedavid/9ja-Vote.git && cd 9ja-Vote
git switch main   # or a tagged release

# 4. Secrets
cp .env.production.example .env.production
openssl rand -hex 32   # paste into JWT_ACCESS_SECRET
openssl rand -hex 32   # paste into JWT_REFRESH_SECRET
openssl rand -base64 24 # POSTGRES_PASSWORD
openssl rand -base64 24 # REDIS_PASSWORD
# fill PUBLIC_DOMAIN, ADMIN_DOMAIN, BROADCAST_DOMAIN and GIT_SHA
chmod 600 .env.production

# 5. Build and start (first build takes several minutes)
docker compose --env-file .env.production \
  -f infrastructure/docker/docker-compose.prod.yml up -d --build

# 6. Create the first administrator (password printed once)
docker compose --env-file .env.production \
  -f infrastructure/docker/docker-compose.prod.yml exec api \
  npm run seed:admin -- --email you@example.ng --name "Your Name" --role SUPER_ADMINISTRATOR

# 7. Check
docker compose --env-file .env.production -f infrastructure/docker/docker-compose.prod.yml ps
curl -fsS https://www.example.ng/api/v1/health
```

Caddy obtains and renews certificates automatically once DNS points at the server. Open
`https://admin.example.ng`, sign in with the seeded account, and enable two-factor authentication
immediately (Security settings).

### Smoke test after every deploy

```bash
curl -fsS https://www.example.ng/api/v1/health        # {"status":"ok","mode":"DEMONSTRATION",...}
curl -fsSI https://www.example.ng/api/v1/health | grep -i x-data-classification   # DEMONSTRATION
curl -fsS https://www.example.ng/api/v1/results/national | head -c 200
curl -fsS https://www.example.ng/ -o /dev/null -w '%{http_code}\n'
curl -fsS https://admin.example.ng/login -o /dev/null -w '%{http_code}\n'
curl -fsS https://live.example.ng/ -o /dev/null -w '%{http_code}\n'
```

---

## 3. How the pieces fit

```
Internet ──▶ Caddy (443, TLS, security headers)
              ├── www.example.ng     ──▶ public-web (3000)
              ├── admin.example.ng   ──▶ admin (3001)   [noindex + sign-in + MFA]
              └── live.example.ng    ──▶ broadcast (3002) [OBS browser source]
                    └── all three proxy /api/* ──▶ api (4000, not published)
                                                    ├── postgres (5432, internal only)
                                                    └── redis (6379, internal only)
```

Only Caddy publishes ports. The API and databases are reachable only inside the Docker network.
Browsers never call the API directly: each Next app rewrites `/api/*` to `http://api:4000`, so there is no
CORS surface and no need to expose the API publicly.

**Data today.** The API serves synthetic data and keeps workflow state, audit entries and administrator
accounts in a JSON document at `/data/store.json` (the `apidata` volume). That is deliberate for the
demonstration. Postgres is running with the schema from `infrastructure/database/migrations/0001_init.sql`
so the migration path can be rehearsed, but the API does not read from it yet. Replacing the store with
Postgres is the next engineering decision (ARCHITECTURE.md §12) and must happen before any real pilot.

---

## 4. Alternative hosts

| Host | Fit | Notes |
|---|---|---|
| Any VPS (Hetzner, DigitalOcean, AWS Lightsail, Contabo) | **Recommended** | Cheapest, full control, Docker Compose works as-is |
| Fly.io | Good for the three Next apps + API | Deploy each `Dockerfile` separately; attach Postgres/Upstash Redis; set `API_INTERNAL_URL` per app |
| Render / Railway | Easiest managed path | Same per-service Docker deploys; managed Postgres and Redis |
| Kubernetes | Not yet | Nothing here needs it; do not add it for a demo |

If you use a managed platform, point each service's internal URL at the API service and keep the same
environment variables. Do not publish the API to the internet unless a platform forces it — if it does,
set `CORS_ORIGINS` to the exact front-end origins and keep `API_DOCS_ENABLED=false`.

---

## 5. Operations

**Backups.** Postgres and `/data` both matter once real content exists.

```bash
# Nightly, keep 14 days, off-box
docker compose --env-file .env.production -f infrastructure/docker/docker-compose.prod.yml \
  exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > /backups/db-$(date +%F).sql.gz
docker run --rm -v 9ja-vote_apidata:/data -v /backups:/out alpine \
  tar czf /out/api-data-$(date +%F).tar.gz -C /data .
```

Restore by piping the dump back into `psql` and untarring the `apidata` volume. Rehearse a restore once.

**Updates.** `git pull && docker compose ... up -d --build`. Caddy keeps certificates. Roll back by
checking out the previous tag and rebuilding.

**Monitoring.** Any uptime checker on `https://www.example.ng/api/v1/health` (expect 200 and
`mode":"DEMONSTRATION"`), plus `docker compose ps` for container health. Watch disk: Docker images and
Postgres grow.

**Logs.** `docker compose ... logs -f api` — audit entries live in the application, not only in logs.

**Accounts.** Create colleagues from the Command Centre as super administrator, or
`npm run seed:admin -- --list` inside the API container to review who exists.

---

## 6. Before you call it live

This is the honest gate list. Items marked **blocking** must be done first.

- [ ] **Blocking** — Legal review signed (`docs/legal/approval-checklist.md`): not an INEC platform, no voting, no voter register.
- [ ] **Blocking** — Replace the AI-generated Aso Rock and slideshow images with licensed photography, or keep the AI disclosure visible.
- [ ] **Blocking** — Replace the provisional emblem decision: keep the shield, or obtain written permission for anything resembling the Coat of Arms.
- [ ] **Blocking** — Real secrets in `.env.production`, file mode 600, never committed. Rotate anything that leaked.
- [ ] **Blocking** — MFA enabled on every administrator account; no shared logins.
- [ ] **Blocking** — Backups running and a restore rehearsed.
- [ ] Party and candidate data: still fictional placeholders. Do not publish real names without INEC-sourced references.
- [ ] Hausa, Yoruba, Igbo and Pidgin strings reviewed by native speakers before enabling.
- [ ] Accessibility audit (keyboard and screen reader) recorded; known gaps listed publicly.
- [ ] Privacy notice reviewed by counsel; cookie policy matches reality (the public site sets none).
- [ ] Incident contact and takedown process agreed.
- [ ] Load test the results endpoints before any high-traffic broadcast.
- [ ] If results are ever ingested from a real source: signed data-sharing agreement, source references and timestamps on every record.

---

## 7. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| 502 from Caddy | Container down or still starting | `docker compose ps`, then `logs <service>` |
| Login fails after restart | No JWT secrets set, so ephemeral secrets were used | Set both JWT secrets in `.env.production` and recreate the API |
| "Sign in to use this endpoint" everywhere | Clock skew or expired 30-minute token | Re-sign-in; check server time (`timedatectl`) |
| Admin pages show "Could not reach the API" | `API_INTERNAL_URL` wrong inside the network | Must be `http://api:4000` |
| Certificate not issued | DNS not pointing at the server, or port 80 blocked | Check `dig`, open port 80, read `docker compose logs caddy` |
| Broadcast overlay has a black background in OBS | Opened without the overlay flag | Use `https://live.example.ng/?transparent=1`, or `?mode=lower-third` |
