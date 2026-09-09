# MERIT VDemo

A forkable app showcase for the MERIT v01 ecosystem. Implementation is in progress; this repository is not yet a verified full-capability release.

The app consumes hosted MERIT services. Provider source, platform administration credentials, and private vault policy do not belong in this repository. Forks use their own app identity and scoped access; they never inherit showcase credentials.

The app source is MIT licensed. Hosted MERIT services and downloaded provider packages retain their own terms; this license does not relicense them. Generated provider assets are excluded from Git.

See [the implementation plan](merit-vdemo%20docs/IAR/IMPLEMENTATION.md) for requirements, dependencies, and release evidence.

## Run the current preview

Install Node.js 22 or newer, then run `npm run verify` and `npm start`. Open `http://127.0.0.1:4317`.

The build downloads four pinned assets through the v01 gateway and checks their SHA-384 integrity before writing `dist/`. It stops if a package differs or is unavailable. There is no dependency on a sibling checkout or the private vault.

The current preview mounts the actual merit_ux shell and merit_workbench and can check its v01 gateway connection. It has no member-data backend yet; the activity grid is empty. A successful connection check is not full provider acceptance.

The checked-in [capability manifest](cfg/capabilities.json) is the source for what this alpha claims. It marks only the shell and workbench as implemented; identity, journal, community, commerce, referral, and notifications remain planned, and metering is blocked on the provider ingest implementation.

Run `npm run probe:v01` for a read-only status matrix of the v01 gateway, store, subscriber, and utilities hosts. It reports status codes and safe service markers only; it does not authenticate, write data, or send messages.

To prepare your own app, copy `.env.example` to `.env.local`, change `MERIT_APP_ID` and `MERIT_APP_NAME`, and rebuild. Only these public settings enter the build. Provider credentials remain on the platform. App-scoped provisioning, member journeys, hosted publishing, and clean-fork release validation are still being implemented.
