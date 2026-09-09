# Security policy

Do not report credentials, subscriber data, payment data, or private vault contents in an issue. Rotate an exposed credential through its owning provider and contact the MERIT operator through the private vault workflow.

The gateway adapter is server-only. Never place `MERIT_TENANT_GATEWAY_KEY`, Supabase service-role keys, payment tokens, signing keys, or provider admin keys in browser configuration, public CI logs, or a fork.
