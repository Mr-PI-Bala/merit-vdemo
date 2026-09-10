/** The public v01 feature map used by the showcase and its fork checklist. */
export const V01_FEATURES = Object.freeze([
  { id: 'identity', route: '/api/gw/meritsubs/api/v1/subscribers/onboard', methods: ['POST'], provider: 'merit-subsv01' },
  { id: 'entitlements', route: '/api/gw/meritsubs/api/v1/entitlements', methods: ['GET'], provider: 'merit-subsv01' },
  { id: 'journal', route: '/api/tenant/journal', methods: ['GET', 'POST', 'DELETE'], provider: 'merit-prodv01' },
  { id: 'ama', route: '/api/tenant/questions', methods: ['GET', 'POST', 'DELETE'], provider: 'merit-prodv01' },
  { id: 'leaderboard', route: '/api/gw/leaderboard', methods: ['GET'], provider: 'merit-prodv01' },
  { id: 'community', route: '/api/tenant/contributions', methods: ['GET', 'POST', 'DELETE'], provider: 'merit-prodv01' },
  { id: 'rooms', route: '/api/tenant/rooms', methods: ['GET', 'POST', 'DELETE'], provider: 'merit-prodv01' },
  { id: 'calendar', route: '/api/gw/room-media/book', methods: ['GET', 'POST'], provider: 'merit-prodv01' },
  { id: 'notifications', route: '/api/tenant/alerts', methods: ['GET', 'POST', 'DELETE'], provider: 'merit-prodv01' },
  { id: 'store', route: '/api/gw/meritstore', methods: ['GET', 'POST'], provider: 'merit-storev01' },
  { id: 'referral', route: 'merit_referral', methods: ['SDK'], provider: 'merit-utilsv01' },
  { id: 'metering', route: '/api/events/ingest', methods: ['POST'], provider: 'merit-utilsv01' },
  { id: 'analytics', route: '/api/events/ingest', methods: ['POST', 'GET'], provider: 'merit-utilsv01' },
]);

export function featureById(id) {
  const feature = V01_FEATURES.find((item) => item.id === id);
  if (!feature) throw new Error(`Unknown V01 feature: ${id}`);
  return feature;
}
