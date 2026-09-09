/**
 * Server-side adapter for the v01 gateway.
 * Keep this module out of browser bundles: the gateway key is platform
 * authentication, never a forker's public configuration value.
 */
const COLLECTIONS = new Set(['contributions', 'questions', 'rooms', 'alerts', 'journal', 'push', 'members']);
const CAPABILITIES = new Set(['tenant', 'ama', 'journal', 'leaderboard', 'meritsubs', 'meritstore', 'room-media', 'alerts']);

function requireSlug(value, label) {
  const result = String(value || '').trim().toLowerCase();
  if (!/^[a-z][a-z0-9-]{2,62}$/.test(result)) throw new Error(`${label} must be an app slug`);
  return result;
}

function requireGateway(value) {
  const url = new URL(String(value || ''));
  if (url.protocol !== 'https:' || url.hostname !== 'merit-prodv01.vercel.app' || url.pathname !== '/') {
    throw new Error('Only the MERIT v01 gateway is supported');
  }
  return url.origin;
}

function headers({ appId, gatewayKey, bearer }) {
  if (!gatewayKey || String(gatewayKey).length < 16) throw new Error('Server gateway key is required');
  const result = { 'X-Merit-Consumer': appId, 'X-Merit-Gateway-Key': gatewayKey, Accept: 'application/json' };
  if (bearer) result.Authorization = `Bearer ${bearer}`;
  return result;
}

function bodyForCapability(capability, body = {}) {
  if (capability === 'journal') {
    // The server derives subscriber identity from the verified bearer token.
    const { subscriber_id: _ignored, subscriberId: _ignored2, ...safe } = body;
    return safe;
  }
  return body;
}

export function createGatewayClient({ gateway, appId, gatewayKey, fetchImpl = fetch }) {
  const base = requireGateway(gateway);
  const consumer = requireSlug(appId, 'appId');
  const request = async (method, pathname, { bearer, body } = {}) => {
    const response = await fetchImpl(`${base}${pathname}`, {
      method, headers: headers({ appId: consumer, gatewayKey, bearer }),
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const text = await response.text();
    let payload = {};
    try { payload = text ? JSON.parse(text) : {}; } catch { payload = { raw: text }; }
    if (!response.ok) {
      const error = new Error(payload.message || payload.error || `Gateway HTTP ${response.status}`);
      error.status = response.status;
      error.payload = payload;
      throw error;
    }
    return payload;
  };
  return Object.freeze({
    tenant: (collection, options = {}) => {
      if (!COLLECTIONS.has(collection)) throw new Error('Unsupported tenant collection');
      const method = options.body === undefined ? 'GET' : 'POST';
      return request(method, `/api/tenant/${collection}`, { bearer: options.bearer, body: method === 'POST' ? bodyForCapability(collection, options.body) : undefined });
    },
    removeTenantItem: (collection, id, options = {}) => {
      if (!COLLECTIONS.has(collection) || !String(id || '').trim()) throw new Error('Collection and item id are required');
      return request('DELETE', `/api/tenant/${collection}?id=${encodeURIComponent(id)}`, { bearer: options.bearer });
    },
    capability: (capability, path = '', options = {}) => {
      if (!CAPABILITIES.has(capability)) throw new Error('Unsupported gateway capability');
      return request(options.method || 'GET', `/api/gw/${capability}${path ? `/${path.replace(/^\//, '')}` : ''}`, { bearer: options.bearer, body: options.body });
    },
  });
}

export function safeMeterEvent(event = {}) {
  if (event.email || event.handle || event.subscriber_id || event.subscriberId) throw new Error('Meter events cannot contain subscriber identity fields');
  const allowed = ['schema', 'event_type', 'occurred_at', 'consumer_id', 'capability', 'quantity', 'source'];
  const result = Object.fromEntries(allowed.filter((key) => event[key] !== undefined).map((key) => [key, event[key]]));
  if (result.schema !== 'merit.telemetry.event.v1') throw new Error('Unsupported meter event schema');
  return result;
}
