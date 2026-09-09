import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { publicConfig, verifyHealth } from '../app_logic/config.mjs';
import { verifyArtifact, artifactUrl } from '../scripts/artifacts.mjs';
import { createGatewayClient, safeMeterEvent } from '../app_logic/gateway_client.mjs';

test('fork identity changes all generated app routes without exposing unrelated env', () => {
  const config = publicConfig({ MERIT_APP_ID: 'second-app', MERIT_APP_NAME: 'Second app', SUPABASE_SERVICE_ROLE_KEY: 'secret-sentinel', MERIT_TENANT_GATEWAY_KEY: 'another-secret' });
  assert.equal(config.registerUrl, 'https://merit-prodv01.vercel.app/store/second-app/register');
  assert.equal(JSON.stringify(config).includes('secret'), false);
  assert.equal(JSON.stringify(config).includes('merit-vdemo'), false);
});
test('invalid app identities cannot become URLs or markup', () => {
  for (const id of ['../other', 'x?admin=1', 'my/app', '<script>', 'a']) assert.throws(() => publicConfig({ MERIT_APP_ID: id }));
  assert.throws(() => publicConfig({ MERIT_APP_NAME: '<img src=x>' }));
});
test('healthy v00 response cannot satisfy v01 connection check', () => {
  assert.equal(verifyHealth({ ok: true, canonical_base_url: 'https://merit-prod.vercel.app' }), false);
  assert.equal(verifyHealth({ ok: true, canonical_base_url: 'https://merit-prodv01.vercel.app', backing_services: { meritstore: 'https://merit-storev01.vercel.app', meritutilsPackages: 'https://merit-utilsv01.vercel.app' } }), true);
});
test('modified package bytes and cross-plane asset URLs fail closed', () => {
  const bytes = Buffer.from('verified fixture');
  const hash = `sha384-${createHash('sha384').update(bytes).digest('base64')}`;
  verifyArtifact(bytes, hash);
  assert.throws(() => verifyArtifact(Buffer.from('modified fixture'), hash));
  assert.throws(() => artifactUrl('https://pkg-meritutils.vercel.app', 'merit_ux/0.1.2/merit_ux.mjs'));
  assert.throws(() => artifactUrl('https://merit-prodv01.vercel.app/pkg/meritutils', '../secrets'));
});
test('server gateway adapter binds every request to the fork app and strips caller subscriber ids', async () => {
  const calls = [];
  const client = createGatewayClient({ gateway: 'https://merit-prodv01.vercel.app', appId: 'second-app', gatewayKey: 'server-key-that-is-long', fetchImpl: async (url, init) => {
    calls.push({ url, init });
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
  }});
  await client.tenant('journal', { bearer: 'verified-session', body: { text: 'private', subscriber_id: 'forged' } });
  assert.equal(calls[0].init.headers['X-Merit-Consumer'], 'second-app');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer verified-session');
  assert.equal(JSON.parse(calls[0].init.body).subscriber_id, undefined);
  assert.throws(() => createGatewayClient({ gateway: 'https://merit-prod.vercel.app', appId: 'second-app', gatewayKey: 'server-key-that-is-long' }));
});
test('meter event allowlist rejects identity and keeps only capability counts', () => {
  assert.deepEqual(safeMeterEvent({ schema: 'merit.telemetry.event.v1', event_type: 'journal.create', occurred_at: '2026-09-09T00:00:00Z', capability: 'journal', quantity: 1, consumer_id: 'second-app', email: undefined }), { schema: 'merit.telemetry.event.v1', event_type: 'journal.create', occurred_at: '2026-09-09T00:00:00Z', capability: 'journal', quantity: 1, consumer_id: 'second-app' });
  assert.throws(() => safeMeterEvent({ schema: 'merit.telemetry.event.v1', event_type: 'journal.create', subscriber_id: 'private' }));
});
