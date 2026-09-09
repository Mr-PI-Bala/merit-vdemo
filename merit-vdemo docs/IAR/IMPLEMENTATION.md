# MERIT VDemo implementation and acceptance

Status: shell/workbench foundation implemented locally; provider and member journeys incomplete. Review date: 2026-09-08 (America/Los_Angeles).

## Intended product

One forkable showcase lets a builder experience and reuse the supported v01 capability set: branded app shell/workbench, identity and entitlements, personal journal, questions and leaderboard, community rooms and calendar, notifications and push, sheets, referral, metering, store registration and sandbox checkout. The same app must work with a fresh app identity without access to the operator's private vault.

"Full capability" requires working user journeys and provider evidence. A link, configured-key boolean, static fixture, or package export is insufficient. Unsupported or incomplete capabilities remain tracked here until implemented and verified. Production money and third-party message delivery require their own explicit operational scope.

## Architecture and ownership

- merit-vdemo owns app_logic, product configuration, branding, app-scoped server adapters, the fork workflow, and end-to-end acceptance.
- merit-prod owns gateway contracts and its canonical production Portal. v01 deployment must use an explicit isolated build/profile and preserve existing canonical production hostname ownership.
- merit-store owns catalog, registration, checkout, payment webhooks, and commerce persistence.
- merit-subs owns subscriber authentication, verified identity, subscription state, and entitlement contracts.
- merit-utils owns versioned PAR packages, merit_ux shells, merit_meter ingestion, and merit_referral. Consume packages; do not copy private provider source into the showcase.
- merit-agent-skills/Hub owns public create, ecosystem selection, compatibility pins, and reproducible fork onboarding.
- The private vault owns provider credentials, environment projection, deployment account isolation, and release evidence. Its existing v01 HowTo remains the ecosystem gap SSOT; this file owns showcase implementation only.

## Implementation sequence

1. Recover reproducible provider revisions and establish the v01 capability/route matrix. Compare deployed artifacts with source; preserve v00. Resolve provider source versus deployment drift before redeploying.
2. Project only existing `_V01` credentials into their owning server runtimes. Validate key presence, validity, minimum privilege, target account, and schema independently. Never ship platform-wide gateway, service-role, Square, Zoom, Resend, or signing keys to a browser or public fork.
3. Establish tenant-bound provisioning and verified subscriber identity. Provision a showcase tenant and a second isolated test app; bind credentials to app identity. Reject forged identity and cross-app access before enabling private journals or member administration.
4. Pin v01 PAR artifacts with verified integrity. Mount the actual merit_ux createAppShell for all app pages. Prove workbench and shell rendering on desktop and mobile.
5. Implement app journeys in app_logic with provider adapters, loading/empty/error states, and persistence. Complete every acceptance row below; no silent v00 fallbacks.
6. Provision store offerings and sandbox registration/checkout. Prove webhook signature, replay protection, idempotency, and resulting entitlements. Keep live payments behind a separately evidenced money gate.
7. Complete privacy-preserving metering/referral and opt-in notifications. Verify provider ingest and count attribution; no subscriber PII in usage events.
8. Prove fork portability from a clean checkout with a second app name, fresh scoped access, and no vault. Promote public v01 catalog and CompatSet only after ecosystem publish gates pass. Publish a source template and hosted showcase, then perform closeout.

## Acceptance requirements

- VD-MPD-01: explicit v01 routing; all selected backends belong to v01; v00 aliases unchanged. Evidence: route matrix, deployment revision, health plus positive operation probes.
- VD-VLT-01: names-only credential manifest, scoped projection, ignored local env, no secret in source/build/browser/logs. Evidence: export verification and secret scan.
- VD-MSU-01: sign-in/sign-out, verified session, Free/Plus entitlement transitions, expired/revoked/forged session rejection. Evidence: provider and browser tests with two accounts.
- VD-MPD-02: app-bound credentials and subscriber-bound storage. Evidence: two-app and two-subscriber read/write/delete denial tests; no trust in caller-supplied subscriber IDs.
- VD-MTU-01: actual createAppShell and workbench, pinned JS/CSS integrity, responsive navigation and keyboard operation. Evidence: package checks and browser screenshots.
- VD-APP-01: journal create/read/update/delete persists privately across reload; AMA question/respond/vote and leaderboard obey entitlement caps. Evidence: real provider persistence, account isolation, limit tests.
- VD-APP-02: community contributions and moderation, rooms, calendar availability/booking, sheet edits. Evidence: provider operations, conflict handling, persistence and authorization.
- VD-APP-03: opt-in push/notification lifecycle, permission denial, revoke, delivery receipts and idempotency. Evidence: consented recipient tests; never send messages merely to populate proof.
- VD-MST-01: app-specific storefront/branding, Free/Plus/add-ons, sandbox checkout, webhook-to-entitlement synchronization and replay rejection. Evidence: sandbox transaction and provider callback tests.
- VD-MTU-02: merit_meter and merit_referral integration; usage contains app/capability counts only. Evidence: ingest persistence, attribution, duplicate/error handling, PII inspection.
- VD-SKL-01: fresh fork changes one app identity and obtains own scoped configuration without the vault; no showcase names remain in operational paths. Evidence: second-app clean-room walkthrough, local and hosted verification.
- VD-REL-01: supported package/CompatSet pins, completed release gates, hosted UX proof and source release. Evidence: immutable revisions, test reports, hosted URL and independent fork replay.

## Current evidence and limitations

The v01 gateway and store health endpoints returned HTTP 200 during the review. Gateway health reports version 0.1.92 with configured tenant/Zoom/VAPID/notify flags; these flags do not prove functionality. Its AMA/journal/leaderboard backing entries say pending. Store reports sandbox payments and zero offerings/registrations. Public skills still gate v01. Source reconciliation, scoped identity, provider operations, showcase app implementation, fork replay, deployment and release remain incomplete.

Fresh probe update: on 2026-09-09, `https://merit-subsv01.vercel.app/api/v1/health`, the gateway route `/api/meritsubs/api/v1/health`, and `/showcase` returned HTTP 500 `FUNCTION_INVOCATION_FAILED`. Identity and entitlement acceptance is therefore blocked by a live provider failure, independently of the consumer adapter.

Local gateway evidence: merit-prod `npm run verify` and `npm run e2e` pass on the current v00 checkout, including webpage-shell checks, usage HTML, route redirects, canonical store registration, retired-alias rejection, and Portal routes. Playwright screenshots were skipped because the package is not installed in this checkout. These results establish v00 source/runtime health only; they do not prove deployed v01 parity.

Provider source evidence: the recovered `merit-subs` checkout has a valid `requirements.txt`, but this workstation has none of FastAPI, PyJWT, or pytest installed (`python -c "import api.app"` fails on `ModuleNotFoundError: jwt`; the test runner fails on missing pytest). This is a reproducibility gap to resolve in an isolated provider environment before diagnosing or redeploying the live HTTP 500.

Runtime recovery evidence: an isolated Python 3.12 environment at `C:\Temp\merit-subs-v01-venv` installed the declared requirements plus pytest. `python test_meritsubs.py` passes 30 tests; FastAPI TestClient returns `/api/v1/health` 200, `/api/v1/showcase` 200, and rejects unauthenticated `/api/v1/entitlements` with 401. The application source is therefore locally runnable; the deployed 500 requires Vercel build/runtime logs, environment parity, or deployment-source comparison.

Repository portability: `.github/workflows/verify.yml`, `CONTRIBUTING.md`, and `SECURITY.md` now define a no-secret fork workflow and run `npm run verify` on every push and pull request.

Remote CI evidence: the first workflow run failed because the repository lacked a lockfile. Added `package-lock.json` and pushed `d480423`; GitHub Actions run `34311567411` completed successfully on that commit. Fork reproducibility now has a passing remote test signal.

Latest probe evidence: `npm run probe:v01` on 2026-09-09 reports gateway 200 (0.1.92), store 200 (sandbox, zero offerings), utilities homepage and registry 200, and subscriber 500 (`FUNCTION_INVOCATION_FAILED`). The registry exposes `merit_usage_meter` but has no `merit_referral` package. The probe correctly leaves `ready=false` for the subscriber outage, pending AMA/journal/leaderboard backends, empty store catalog, and missing referral package. A repository secret scan found no credential-pattern matches. The verified source is published in `Mr-PI-Bala/merit-vdemo`; an owner-aligned `AgentDraven/merit-vdemo` repository now exists, but its initial workflow-containing push awaits GitHub workflow-scope approval.

Current gateway checkout evidence: `C:\DApps\merit-prod\npm run e2e` passes the local portal, route, usage, redirect, and production health checks. The run skips Playwright screenshots because that dependency is absent. This confirms the v00 checkout and hosted gateway contract; it does not establish v01 provider parity.

## Completion record

No acceptance row is ACCEPT yet. Record the exact command, revision, timestamp, result, and evidence path per row as implementation progresses. This plan does not authorize marking scaffold-only work as a completed showcase.

### Foundation implementation evidence

- `npm run verify`: four boundary tests pass; build downloaded and SHA-384 verified the live v01 shell 0.1.2 and workbench 0.4.13 JS/CSS. Pins live in `cfg/packages.json`. Live v01 registry lacks the newer meter/referral entries found in source; do not silently import v00 packages.
- Local in-app browser at `http://127.0.0.1:4317`: actual shell, legal footer, workbench grid/inspector rendered. Clicking Check connection confirmed the v01 gateway response. Fixed global workbench loading after the first browser check exposed the wrong module loading mode.
- Public build config allowlists only app identity and generated v01 URLs. Tests reject invalid IDs, extra secret environment values in output, modified package bytes, and cross-plane URLs. A second-app test changes generated registration identity without inheriting the showcase ID.
- These checks cover foundation portions of VD-MTU-01, VD-VLT-01, and VD-SKL-01 only. They do not prove private data, member auth, transactions, mobile rendering, hosted deployment, or complete clean-fork onboarding.
- `app_logic/gateway_client.mjs` now provides the server-only v01 adapter seam: every request is bound to the app slug, journal writes discard caller-supplied subscriber IDs, capability names are allowlisted, and meter events reject subscriber identity fields. Tests cover these boundaries. This is an authorization boundary and request builder, not evidence that deployed gateway authorization or meter persistence is fixed.
- `cfg/capabilities.json` is the alpha claim boundary. It records every requested capability, its v01 route/provider, and whether it is implemented, planned, or blocked. Only shell and workbench are currently implemented; the manifest test rejects v00 and legacy provider routes and prevents accidental overclaiming.
- `app_logic/identity_client.mjs` now gives the server adapter explicit MeritSubs operations for guest/email/freemium onboarding, entitlement reads, and sandbox checkout. It binds `consumer_id`/tenant to the fork app and validates subscriber IDs and plans. Boundary tests cover these request shapes; they do not claim live identity or checkout success.
- The gateway adapter now fails closed when initialized in a browser context. This keeps `MERIT_TENANT_GATEWAY_KEY` server-only by construction; the public build has no gateway client import.
- `npm run probe:v01` is a repeatable read-only provider gate. It checks gateway, store, subs, and utils HTTP status plus safe service/version markers and fails if any required host is unavailable or the gateway identity is inconsistent. The 2026-09-09 run reports gateway/store/utils 200 and subs 500 `FUNCTION_INVOCATION_FAILED`, so the gate correctly fails. It performs no authenticated or mutating operation.
- The probe also fails when the gateway health declares `new_mesh_pending` backends or the store reports zero offerings. Latest run reports five blockers: subscriber host unavailable, AMA/journal/leaderboard pending, and empty store catalog. This makes HTTP 200 health insufficient for v01 release readiness.
