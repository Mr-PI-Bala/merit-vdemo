import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { publicConfig, verifyHealth } from '../app_logic/config.mjs';
import { verifyArtifact, artifactUrl } from '../scripts/artifacts.mjs';
import { createGatewayClient, safeMeterEvent } from '../app_logic/gateway_client.mjs';
import { createIdentityClient } from '../app_logic/identity_client.mjs';
import capabilities from '../cfg/capabilities.json' with { type: 'json' };
import { V01_FEATURES, featureById } from '../app_logic/feature_contract.mjs';

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
  assert.equal(artifactUrl('https://merit-utilsv01.vercel.app', 'merit_workbench/0.4.18/merit-workbench.js'), 'https://merit-utilsv01.vercel.app/merit_workbench/0.4.18/merit-workbench.js');
  assert.throws(() => artifactUrl('https://merit-prodv01.vercel.app/pkg/meritutils', 'merit_ux/0.1.2/merit_ux.mjs'));
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
  assert.equal(calls[0].init.headers['Content-Type'], 'application/json');
  assert.equal(JSON.parse(calls[0].init.body).subscriber_id, undefined);
  assert.throws(() => createGatewayClient({ gateway: 'https://merit-prod.vercel.app', appId: 'second-app', gatewayKey: 'server-key-that-is-long' }));
  globalThis.window = {};
  try { assert.throws(() => createGatewayClient({ gateway: 'https://merit-prodv01.vercel.app', appId: 'second-app', gatewayKey: 'server-key-that-is-long' }), /server-only/); }
  finally { delete globalThis.window; }
});
test('meter event allowlist rejects identity and keeps only capability counts', () => {
  assert.deepEqual(safeMeterEvent({ schema: 'merit.telemetry.event.v1', event_type: 'journal.create', occurred_at: '2026-09-09T00:00:00Z', capability: 'journal', quantity: 1, consumer_id: 'second-app', email: undefined }, 'second-app'), { schema: 'merit.telemetry.event.v1', event_type: 'journal.create', occurred_at: '2026-09-09T00:00:00Z', capability: 'journal', quantity: 1, consumer_id: 'second-app' });
  assert.throws(() => safeMeterEvent({ schema: 'merit.telemetry.event.v1', event_type: 'journal.create', subscriber_id: 'private' }));
  assert.throws(() => safeMeterEvent({ schema: 'merit.telemetry.event.v1', event_type: 'journal.create', consumer_id: 'other-app' }, 'second-app'));
});
test('MeritSubs adapter binds onboarding and checkout to the fork app', async () => {
  const calls = [];
  const gatewayClient = { capability: (name, path, options) => { calls.push({ name, path, options }); return Promise.resolve({ ok: true }); } };
  const client = createIdentityClient({ gatewayClient, appId: 'second-app' });
  await client.onboardFreemium({ handle: 'reader', email: 'reader@example.test' });
  await client.entitlements('verified-token');
  await client.checkout({ subscriberId: 'sub_123', plan: 'plus-monthly', bearer: 'verified-token' });
  assert.equal(calls[0].name, 'meritsubs');
  assert.equal(calls[0].path, 'api/v1/subscribers/onboard/freemium');
  assert.equal(calls[0].options.body.consumer_id, 'second-app');
  assert.equal(calls[2].options.body.tenant, 'second-app');
  assert.throws(() => client.checkout({ subscriberId: 'bad/id', plan: 'plus-monthly', bearer: 'token' }));
  assert.throws(() => createIdentityClient({ gatewayClient, appId: 'x' }));
});
test('capability manifest is explicit, v01-only, and does not overclaim alpha features', () => {
  const required = ['shell', 'workbench', 'identity', 'entitlements', 'journal', 'ama', 'leaderboard', 'community', 'rooms', 'calendar', 'notifications', 'store', 'metering', 'referral'];
  assert.deepEqual(Object.keys(capabilities.capabilities).sort(), required.sort());
  assert.equal(capabilities.ecosystem, 'v01');
  assert.equal(capabilities.gateway, 'https://merit-prodv01.vercel.app');
  assert.equal(capabilities.capabilities.shell.status, 'implemented');
  assert.equal(capabilities.capabilities.workbench.status, 'implemented');
  for (const [name, item] of Object.entries(capabilities.capabilities)) {
    assert.equal(item.route.includes('merit-prod.vercel.app'), false, `${name} must not use v00`);
    assert.equal(item.route.includes('soulos.vercel.app'), false, `${name} must not use legacy provider`);
    assert.equal(item.route.includes('somatune.vercel.app'), false, `${name} must not use legacy provider`);
  }
  assert.match(capabilities.capabilities.metering.blocker, /unauthenticated/);
});
test('every showcased feature has an explicit v01 route and provider contract', () => {
  const ids = V01_FEATURES.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const feature of V01_FEATURES) {
    assert.ok(feature.route.length > 0);
    assert.ok(feature.methods.length > 0);
    assert.match(feature.provider, /^merit-(prod|store|subs|utils)v01$/);
    assert.equal(featureById(feature.id).id, feature.id);
  }
  assert.throws(() => featureById('unknown'));
});
test('gateway adapter exercises every supported tenant and capability route shape', async () => {
  const calls = [];
  const client = createGatewayClient({ gateway: 'https://merit-prodv01.vercel.app', appId: 'hello-app', gatewayKey: 'server-key-that-is-long', fetchImpl: async (url, init) => {
    calls.push({ url, init });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }});
  for (const collection of ['contributions', 'questions', 'rooms', 'alerts', 'journal', 'push', 'members']) {
    await client.tenant(collection);
    await client.tenant(collection, { body: { text: 'fixture' }, bearer: 'session-token' });
    await client.removeTenantItem(collection, 'item-1', { bearer: 'session-token' });
  }
  for (const capability of ['tenant', 'ama', 'journal', 'leaderboard', 'meritsubs', 'meritstore', 'room-media', 'alerts']) await client.capability(capability);
  assert.equal(calls.length, 29);
  assert.ok(calls.every(({ init }) => init.headers['X-Merit-Consumer'] === 'hello-app'));
  assert.ok(calls.every(({ url }) => url.startsWith('https://merit-prodv01.vercel.app/')));
});
