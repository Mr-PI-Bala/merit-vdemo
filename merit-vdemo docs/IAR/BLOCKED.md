# MERIT vDemo blocked-state record

**Status:** BLOCKED

**Recorded:** 2026-09-09

**Scope:** v01 vaulted production integration and the forkable `merit-vdemo` showcase.

This record explains why the requested full-capability showcase cannot be declared ready. It records observed facts only; it contains no secret values.

## What was attempted

1. Reviewed the `merit-prod` checkout, its AGENTS boundary, local verification scripts, deployed health contract, Portal routes, usage routes, and v00/v01 hostname split.
2. Probed the live v01 gateway, store, subscriber provider, utilities host, and utilities package registry with `npm run probe:v01` from the showcase repository.
3. Recovered the provider source checkouts for review. Installed the declared `merit-subs` Python dependencies in an isolated environment and ran its test suite and FastAPI TestClient checks.
4. Inspected the private vault by key names only. Added `scripts/devchain/export_v01_runtime.py` with project allowlists, `_V01` projection, destination containment checks, overwrite protection, sandbox enforcement, and read-back verification.
5. Exported 19 gateway, 16 store, and 9 subscriber v01 environment entries to `C:\Tools\DevChain\local\v01-runtime-20260908`. No values were printed, committed, or copied into the consumer repository.
6. Built `merit-vdemo` with v01-only package pins, SRI verification, a server-only gateway adapter, a MeritSubs adapter, explicit capability manifest, fork guidance, local serving, and CI. `npm run verify` passes all eight boundary tests and the build.
7. Created and published the private-vault changes, including tag `vault-v0.5.60`. Created `AgentDraven/merit-vdemo`, staged its application source, and published a full source mirror at `Mr-PI-Bala/merit-vdemo` with passing GitHub Actions.
8. Corrected a consumer adapter defect so JSON POST requests include `Content-Type: application/json`; the regression test and remote CI pass.

## Why it is blocked

### V01-BLK-01 — subscriber provider deployment failure — fix ready, deployment pending

`https://merit-subsv01.vercel.app/api/v1/health` returns HTTP 500 `FUNCTION_INVOCATION_FAILED`. The same failure occurs through the gateway route `/api/meritsubs/api/v1/health` and `/showcase`.

The recovered source is locally runnable: its isolated environment now passes `python -m pytest -q` with 31 tests; with `VERCEL=1` and no Supabase variables, local `/api/v1/health` and `/api/v1/showcase` return 200, and unauthenticated entitlements correctly return 401. The fix in `AgentDraven/merit-subs` commit `b5bafa9` / tag `v0.0.24` detects Vercel/Lambda, uses writable `/tmp/meritsubs` paths for file fallbacks, adds audit-tail support for the selected path, and uses the same writable fallback for subscriber persistence. The live v01 deployment still needs this revision deployed and the health/showcase/entitlements probes rerun.

### V01-BLK-02 — gateway capability backends are pending

The live gateway health response identifies AMA, journal, and leaderboard as `new_mesh_pending`. A configured backing-service string is not evidence of persistence, authorization, or a successful user journey, so the related acceptance rows remain open.

### V01-BLK-03 — commerce has no catalog

`https://merit-storev01.vercel.app/api/v1/health` returns 200 and reports Square sandbox plus Supabase enabled, but `offerings=0` and `registrations=0`. Checkout and entitlement synchronization cannot be tested without an app-specific catalog offering.

### V01-BLK-04 — referral package is not published on the v01 registry

The v01 registry exposes `merit_usage_meter` but no `merit_referral`. The source checkout contains a newer referral implementation, but importing an unverified source package would violate the pinned v01 artifact boundary.

### V01-BLK-05 — metering is not acceptance-ready

The deployed ingest contract is not proven authenticated or persistent. The consumer adapter therefore rejects subscriber identity fields and records only a safe event shape, but cannot claim working provider metering until authenticated ingest, persistence, deduplication, and retrieval are demonstrated.

### V01-BLK-06 — owner repository CI authorization

The AgentDraven GitHub token has `repo` access but not `workflow`. GitHub rejects a push containing `.github/workflows/verify.yml`. The owner repository therefore contains the application source and immutable tag `v0.1.0-alpha.1`, while its CI workflow is still pending account authorization. The Mr-PI-Bala mirror has the complete source and passing CI.

### V01-BLK-07 — v01 deployment operator access is incomplete

The workstation has no valid `VERCEL_TOKEN` for the Vercel CLI, and the isolated v01 login/profile and portable Node path recorded by the vault are not restored here. Deployment repair and v01 environment synchronization cannot be claimed from this workstation.

## Fix sequence

1. Restore the isolated v01 Vercel operator session and portable Node runtime. Verify Vercel account, team `meritecosystemv01`, and each v01 project before changing any environment or deployment.
2. Deploy `AgentDraven/merit-subs` commit `b5bafa9` / tag `v0.0.24` to `merit-subsv01`. Inspect the deployment revision, Python runtime selection, dependency installation, and required v01 environment names.
3. Require positive probes for subscriber health, showcase, guest/email/freemium onboarding, forged/expired bearer rejection, entitlements, and sandbox checkout handoff. Record deployment revision and timestamps. Keep BLK-01 open until the deployed routes return validated responses.
4. Replace each `new_mesh_pending` gateway backing entry with a deployed provider route. Prove journal and AMA persistence, leaderboard calculation, app isolation, subscriber authorization, moderation, and idempotent writes using two apps and two subscribers.
5. Provision a sandbox catalog for `merit-vdemo` and a separate fork-proof app. Exercise checkout, webhook signature validation, entitlement transition, replay rejection, cancellation, and downgrade behavior.
6. Publish `merit_referral` through the v01 utilities registry with immutable bytes and SRI, or explicitly remove referral from the release acceptance scope. Implement authenticated persistent metering with capability-count-only telemetry and duplicate-event handling.
7. Approve the AgentDraven GitHub `workflow` scope, push `.github/workflows/verify.yml` to `AgentDraven/merit-vdemo`, and verify CI on the owner-aligned repository.
8. Run the complete acceptance set in `IMPLEMENTATION.md`, perform a clean fork using only public configuration, and change this document to **UNBLOCKED** only when every blocked acceptance row has direct provider and hosted UX evidence.

## Unblock criteria

The showcase may leave BLOCKED only when all of the following are true:

- `npm run probe:v01` exits successfully and reports no pending or missing required provider capability.
- Subscriber health and identity flows return validated responses on the deployed v01 host.
- Store health reports a non-empty sandbox catalog and a completed webhook-to-entitlement test exists.
- AMA, journal, leaderboard, metering, and referral acceptance rows have direct persistence and authorization evidence.
- Two-app and two-subscriber isolation tests pass without trusting caller-supplied identity.
- The owner repository contains the CI workflow and its run passes.
- Vault export remains names-only in evidence, operator-only on disk, and absent from the consumer source, build output, and browser configuration.

## Evidence locations

- Consumer acceptance plan: `merit-vdemo docs/IAR/IMPLEMENTATION.md`
- Consumer capability boundary: `cfg/capabilities.json`
- Read-only probe: `scripts/probe-v01.mjs`
- Gateway boundary: `app_logic/gateway_client.mjs`
- Vault export helper: `C:\DApps\merit-private-vault\scripts\devchain\export_v01_runtime.py`
- Operator projection: `C:\Tools\DevChain\local\v01-runtime-20260908`
- Vault record: `C:\DApps\merit-private-vault\env\catalogs\MERIT-v01.HOWTO.md`

## Credential wiring state

Vault SSOT remains in the three project files under `C:\DApps\merit-private-vault\env\`. The v01 operator projections are at `C:\Tools\DevChain\local\v01-runtime-20260908\merit-prod\.env.local`, `...\merit-store\.env.local`, and `...\merit-subs\.env.local`. The corresponding gitignored local runtime files are now `C:\DApps\merit-prod\.env.local`, `C:\DApps\merit-store\.env.local`, and `C:\DApps\merit-subs\.env.local`. They are not tracked or copied into `merit-vdemo`. `run_meritsubs.py` loads the subscriber file for local serving without overriding explicit process environment values. Vercel does not read any local file: the same names must be configured on each v01 project, then a deployment must be triggered and verified.

## Key audit — 2026-09-09

This audit used the projected values in memory and reports names, checks, and outcomes only. No secret value was printed, committed, or sent to `merit-vdemo`.

| Key name | Runtime/check | Observed result | Error or gap |
|---|---|---|---|
| `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | All three local projections; Supabase REST read | Local names are present, but the projected Supabase hostname does not resolve (`No such host is known`) | The v01 Supabase URL/project reference is stale or unavailable; hosted persistence is unverified |
| `MERIT_TENANT_GATEWAY_KEY` | `GET https://merit-prod.vercel.app/api/tenant/usage` with `X-Merit-Consumer: merit-vdemo` | HTTP 401 | The projected gateway key is rejected by the deployed gateway, or the deployed v01 key was not synchronized |
| `VERCEL_TOKEN` | Vercel CLI `whoami` | FAIL: “token provided … is not valid” | Deployment and environment sync cannot run from this workstation until an isolated valid v01 profile/token is restored |
| `MERITSUBS_JWT_SECRET` + `MERITSUBS_ADMIN_KEY` | Local `merit-subs` TestClient with `.env.local` | Present; local health returns 200 with `supabase` backend | Hosted subscriber health remains HTTP 500 because the fixed revision and hosted env have not been deployed |
| `MERITSUBS_PUBLIC_BASE_URL` | Hosted subscriber health | HTTP 500 `FUNCTION_INVOCATION_FAILED` | Serverless import previously attempted to create read-only `output/audit`; deploy the `/tmp` fallback fix and recheck |
| `MERITSTORE_BASE_URL` + `MERITSTORE_WEBHOOK_SECRET` | Hosted store health and webhook path | Health HTTP 200; webhook/checkout not proven | Store reports `offerings: 0`, so there is no v01 catalog item to exercise |
| `SQUARE_ACCESS_TOKEN` + `SQUARE_ENVIRONMENT` | Sandbox `GET /v2/locations` | HTTP 200; sandbox mode confirmed | Token is usable, but no app-specific offering is provisioned |
| `MERIT_METERED_API_BASE_URL` | Hosted gateway/probe | Gateway is reachable, but authenticated persistence is not proven | Metering acceptance remains open until auth, deduplication, persistence, and retrieval are demonstrated |
| `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET` | Names-only projection review | Present in the prod projection; no live OAuth test was attempted | Refresh/verify in Zoom before claiming room-media capability |
| `RESEND_API_KEY` | Names-only projection review | Present in the prod/store projections; no email send was attempted | Refresh/verify in Resend before claiming notification capability |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | Names-only projection review | Present in prod projection; local shape not exercised | Verify application subject and rotate as a pair if push delivery is required |

### How to update or refresh the failing keys

- Restore an isolated v01 Vercel CLI profile (portable config under `C:\Tools\vercel-v01`), authenticate to the `meritecosystemv01` team, and replace the invalid `VERCEL_TOKEN`. Keep it outside all repositories.
- Confirm the v01 Supabase project URL and service-role key in the vault. Rotate the service key if the project was recreated, re-run `export_v01_runtime.py`, apply the subscriber/audit/store migrations, and sync the names to the matching Vercel projects.
- Reconcile `MERIT_TENANT_GATEWAY_KEY` with the value configured on `merit-prod`; rotate it in the vault and deploy both sides if the gateway returns 401.
- Deploy the `merit-subs` serverless fix (`b5bafa9` / `v0.0.24` or newer), then configure `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `MERITSUBS_JWT_SECRET`, `MERITSUBS_ADMIN_KEY`, and the store webhook names on `merit-subsv01` before probing health and identity routes.
- Keep `SQUARE_ENVIRONMENT=sandbox`; refresh the sandbox access token/application/location trio in Square and provision a `merit-vdemo` offering before checkout tests.
- Rotate `MERITSTORE_WEBHOOK_SECRET` and subscriber JWT/admin secrets only through their provider/vault source, re-project, sync to Vercel, and rerun signed webhook plus replay tests.
- Refresh Zoom OAuth credentials, Resend API credentials, and the VAPID key pair in their respective consoles only if those capabilities are in the release scope; re-project names into the prod runtime and run a safe provider check.
- Publish `merit_referral` to the v01 utilities registry and pin its immutable SRI before enabling referral in the showcase.
- Never place any of these secret values in `merit-vdemo`, browser configuration, build output, or public documentation.
