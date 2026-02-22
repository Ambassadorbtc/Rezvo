# Domain Silos

rezvo.app and rezvo.co.uk are **solid silos** — treat them as if they were on different servers, from a frontend point of view.

## Boundaries

| rezvo.app | rezvo.co.uk |
|-----------|-------------|
| Marketing homepage | Consumer directory landing |
| Partner booking portal (login, dashboard) | Directory search, listings, FAQs |
| NO directory/search/listing pages | Full directory experience |
| Booking flow | Booking flow |

## Deployment

- **rezvo.app** → `DEPLOY-REZVO-APP.bat` (178.128.33.73)
- **rezvo.co.uk** → `DEPLOY.bat` (146.190.111.28)

Each domain has its own server and build. Deploy to both when making frontend changes.

## Frontend Rules

1. Use `utils/domain.js` — `isRezvoApp()`, `isRezvoCoUk()`, `getDomainConfig()`
2. Never hardcode hostnames or cross-link domains
3. URLs, support email, booking links: use `getDomainConfig()` for domain-appropriate defaults
4. Routes that belong to only one domain must gate and redirect on the other

See `.cursor/rules/domain-silos.mdc` for AI guidance.
