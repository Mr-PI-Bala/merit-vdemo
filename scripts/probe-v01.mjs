const services = [
  ['gateway', 'https://merit-prodv01.vercel.app/api/health'],
  ['store', 'https://merit-storev01.vercel.app/api/v1/health'],
  ['subs', 'https://merit-subsv01.vercel.app/api/v1/health'],
  ['utils', 'https://merit-utilsv01.vercel.app/'],
];

const checks = [];
for (const [name, url] of services) {
  try {
    const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(20000) });
    const text = await response.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch { /* homepage or platform error */ }
    checks.push({ name, url, status: response.status, ok: response.ok, service: json?.service || null, version: json?.version || null, error: json?.error || (response.ok ? null : text.slice(0, 120)) });
  } catch (error) {
    checks.push({ name, url, status: null, ok: false, service: null, version: null, error: error.name || 'request_failed' });
  }
}

const gateway = checks.find((item) => item.name === 'gateway');
const consistency = gateway?.service === 'merit-prod-gateway' && gateway?.ok === true;
const ready = consistency && checks.every((item) => item.ok);
console.log(JSON.stringify({ ecosystem: 'v01', checkedAt: new Date().toISOString(), consistency, ready, checks }, null, 2));
if (!ready) process.exitCode = 1;
