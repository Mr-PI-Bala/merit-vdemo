# VDemo end-to-end validation

The acceptance boundary is the complete journey, not a homepage HTTP 200. Run the checks in order and attach the output to the same app, provider revisions, and deployment IDs.

## Local contract gate

- [ ] `npm ci`
- [ ] `npm test` — feature map, identity binding, tenant isolation, meter privacy, artifact integrity, and manifest checks.
- [ ] `npm run build` — downloads every pinned v01 artifact, verifies SRI, and writes only allowlisted public config.
- [ ] `npm start` — open the app over HTTP and exercise connection check, guest join, workbench, and every feature card.

## Hosted journey gate

- [ ] Gateway health and V01 backing-service identity are valid.
- [ ] Guest, email, and freemium onboarding create a verified session.
- [ ] Entitlements handle Free, Plus, expiry, revocation, and forged tokens.
- [ ] Journal, AMA, leaderboard, community, rooms, calendar, and notifications persist and enforce app/subscriber authorization.
- [ ] Store catalog contains the app's sandbox offerings; checkout produces a signed, idempotent webhook and entitlement transition.
- [ ] Referral attribution covers subscriber, offering/pack, population, and design-partner scopes.
- [ ] Metering accepts signed events, deduplicates replay, persists capability counts, and rejects PII.
- [ ] Two apps and two subscribers cannot read, write, delete, or attribute across boundaries.
- [ ] A clean fork runs with public configuration only and no vault files.

## Evidence format

Record UTC timestamp, app slug, provider host, source commit, deployment ID, route/method, redacted response status, persistence proof, and pass/fail result. Never record credential values or subscriber PII.

