# Contributing to MERIT VDemo

Fork this repository, copy `.env.example` to `.env.local`, and choose a new `MERIT_APP_ID` and `MERIT_APP_NAME`. Run `npm run verify` before opening a pull request.

Keep provider credentials, subscriber data, payment data, and deployment account files out of Git. The public app build accepts only app identity settings. Server adapters must remain outside browser bundles and must bind requests to the fork’s app ID.

Use `npm run probe:v01` when evaluating provider readiness. It is read-only and currently fails while v01 subscriber, community, and store catalog blockers remain open.
