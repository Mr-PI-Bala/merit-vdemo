const services = [
  ['gateway', 'https://merit-prodv01.vercel.app/api/health'],
  ['store', 'https://merit-storev01.vercel.app/api/v1/health'],
  ['subs', 'https://merit-subsv01.vercel.app/api/v1/health'],
  ['utils', 'https://merit-utilsv01.vercel.app/'],
  ['utils-registry', 'https://merit-utilsv01.vercel.app/registry.json'],
];

const checks = [];
for (const [name, url] of services) {
  try {
    const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(20000) });
    const text = await response.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch { /* homepage or platform error */ }
    checks.push({ name, url, status: response.status, ok: response.ok, service: json?.service || null, version: json?.version || null, details: name === 'gateway' ? { backing_services: json?.backing_services || null } : name === 'store' ? { offerings: json?.store?.offerings ?? null, registrations: json?.store?.registrations ?? null } : name === 'utils-registry' ? { packages: Object.keys(json?.packages || {}) } : null, error: json?.error || (response.ok ? null : text.slice(0, 120)) });
  } catch (error) {
    checks.push({ name, url, status: null, ok: false, service: null, version: null, details: null, error: error.name || 'request_failed' });
  }
}

const gateway = checks.find((item) => item.name === 'gateway');
const consistency = gateway?.service === 'merit-prod-gateway' && gateway?.ok === true;
const blockers = [];
if (!consistency) blockers.push('gateway identity is inconsistent');
for (const item of checks.filter((entry) => !entry.ok)) blockers.push(`${item.name} is unavailable`);
for (const [name, value] of Object.entries(gateway?.details?.backing_services || {})) {
  if (String(value).includes('pending')) blockers.push(`gateway backing ${name} is pending`);
}
const store = checks.find((item) => item.name === 'store');
if (store?.details?.offerings === 0) blockers.push('store has no offerings');
const registry = checks.find((item) => item.name === 'utils-registry');
for (const required of ['merit_meter', 'merit_referral']) {
  if (!registry?.details?.packages?.includes(required)) blockers.push(`utils registry missing ${required}`);
}
const ready = blockers.length === 0;
console.log(JSON.stringify({ ecosystem: 'v01', checkedAt: new Date().toISOString(), consistency, ready, blockers, checks }, null, 2));
if (!ready) process.exitCode = 1;
