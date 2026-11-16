# Project owner action checklist

| # | Needed from you | Needed by | Status |
|---|---|---|---|
| 1 | Git repository and access | Day 1 | Done (`okwedavid/9ja-Vote`) |
| 2a | Copy `infrastructure/ci/github-actions-ci.yml` to `.github/workflows/ci.yml` to switch CI on | Day 2 | Open |
| 2 | Create a `development` branch and protect `main` (require pull request review) | Day 2 | Open |
| 3 | Decisions in ARCHITECTURE.md section 12 | Day 2 | Open |
| 4 | Branding: final name, logo, and Coat of Arms permission or approval of the provisional emblem | Day 4 | Open |
| 5 | Licensed photographs, including Aso Rock, to replace AI-generated images | Day 7 | Open |
| 6 | Cloud hosting account and region choice | Day 6 | Open |
| 7 | Domain name | Day 6 | Open |
| 8 | Email delivery provider account | Day 2 | Open |
| 9 | SMS / OTP provider account | Day 2 | Open |
| 10 | Identity verification provider, if any (demo uses synthetic records) | Later | Open |
| 11 | INEC engagement: proposal letter, technical consultation, data-sharing request | Start now | Open |
| 12 | Electoral-law and data-protection counsel | Start now | Open |
| 13 | Independent penetration test booking | Before launch | Open |
| 14 | Budget approval (see ARCHITECTURE.md section 10) | Day 6 | Open |
| 15 | Secrets manager for deployment credentials. Never send secrets in chat or commit them | Day 6 | Open |
| 16 | A Mac with Xcode and an Apple Developer account for iOS builds | Day 7 | Open |
| 17 | Native-speaker translators for Hausa, Yoruba, Igbo and Pidgin | Day 6 | Open |
| 18 | Run `npm run seed:admin` on the server and store the generated password in a password manager | Deploy day | Open |
| 19 | Enable TOTP MFA on every administrator account before sharing the admin URL | Deploy day | Open |
| 20 | Approve the persistence decision: JSON store for the demo, then Drizzle + Postgres (ARCHITECTURE.md §12) | Day 3 | Open |
| 21 | Google Play developer account (US$25 one-off) and an upload keystore, stored offline | Day 7 | Open |
| 22 | Decide iOS scope (needs a Mac, Xcode and the US$99/year Apple developer programme) | Day 7 | Open |
| 23 | Approve the public wording of every disclaimer, especially "not affiliated with INEC" | Before launch | Open |
| 24 | Choose whether the broadcast graphics domain stays public or is restricted to the newsroom network | Before launch | Open |
| 25 | Agree the incident contact and takedown process (who answers, within what time) | Before launch | Open |

Nothing here assumes you already hold government approvals or access to official voter data.
