# Build a MERIT app over dinner

This repository is the smallest useful hello-world for a MERIT v01 app. Fork it, change the identity and the story, then keep the provider boundary intact.

## Five-minute fork

1. Fork `Mr-PI-Bala/merit-vdemo` and clone your fork.
2. Copy `.env.example` to `.env.local`.
3. Set `MERIT_APP_ID` to a new lowercase slug and `MERIT_APP_NAME` to your app name.
4. Run `npm ci`, then `npm test`.
5. Run `npm start` and open `http://127.0.0.1:4317`.
6. Use **Check V01 connection**, then try the guest join and feature cards.
7. Read `merit-vdemo docs/IAR/IMPLEMENTATION.md` before enabling hosted writes.

## What you own

Your fork owns branding, app logic, public configuration, consent copy, and the user journey. The v01 platform owns gateway contracts, subscriber identity, store/payment rails, package delivery, metering, and provider persistence.

## What stays server-side

Never put gateway keys, Supabase service keys, Square tokens, webhook secrets, JWT secrets, or provider credentials in this repository, `dist/`, browser code, or a public fork. Configure them on the owning v01 provider project through the vault/operator workflow.

## Turning on a capability

Start with the feature map in `app_logic/feature_contract.mjs`. Add the provider adapter call, loading/empty/error states, consent and entitlement rules, then add a contract test and a hosted evidence row. A green local test proves request shape; it does not prove hosted persistence.

## Make the app yours

Replace the default copy in `app_logic/main.mjs`, update `MERIT_APP_NAME`, add your own product requirements, and keep the app slug unique. A good first consumer can resemble a private podcast community, a balance/coaching room, a creator membership, or any other app that benefits from identity, content, commerce, referrals, and measurable usage.

