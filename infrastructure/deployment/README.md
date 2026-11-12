# Deployment (preparation notes)

Nothing is deployed yet. Target layout, to be confirmed by the project owner:

| Component | Suggested hosting | Notes |
|---|---|---|
| public-web, broadcast | CDN-fronted Node hosting | Public, cacheable, read-only |
| admin | Separate hostname, IP allow-list / VPN, MFA | Never share an origin with public traffic |
| api | Container service, 2+ instances behind WAF | Public read routes and admin routes split by path and later by deployment |
| PostgreSQL | Managed, encrypted, PITR backups, read replica for results | |
| Redis | Managed, password + TLS | Cache and queues |

Build and run each service:

```bash
npm ci
npm run build
npm run start -w @9ja-vote/api          # :4000
npm run start -w @9ja-vote/public-web   # :3000
npm run start -w @9ja-vote/admin        # :3001
npm run start -w @9ja-vote/broadcast    # :3002
```

OBS: add a Browser source at the broadcast URL, 1920x1080. Append `?transparent=1` for an overlay.
Dockerfiles and infrastructure-as-code are deferred to Day 7.
