# Contributing

## Branches

- `main`: reviewed, releasable. No direct commits. Merges need project-owner approval.
- `development`: integration branch. Feature branches merge here by pull request.
- `feature/<area>-<short-name>`, `fix/<short-name>`, `docs/<short-name>`.

## Commits

Conventional Commits: `type(scope): summary`, for example `feat(api): add results read endpoints`.
Types: `feat`, `fix`, `docs`, `test`, `chore`, `refactor`, `ci`, `security`.

## Before opening a pull request

```bash
npm run typecheck && npm test && npm run build
```

## Hard rules

1. No secrets, credentials, private keys or real personal data in the repository.
2. No real party or candidate may be added without a source reference to an INEC publication.
3. Every screen and API response that shows results carries the demonstration label.
4. No code path may enable real-election voting. `real_voting_enabled` is constrained to `false` in the schema.
5. Never store biometrics. Never store a ballot choice next to an identity.
