export const V01_GATEWAY = 'https://merit-prodv01.vercel.app';

export function publicConfig(env = {}) {
  const id = String(env.MERIT_APP_ID || 'merit-vdemo');
  const name = String(env.MERIT_APP_NAME || 'MERIT VDemo');
  if (!/^[a-z][a-z0-9-]{2,62}$/.test(id)) throw new Error('MERIT_APP_ID must be a 3–63 character app slug');
  if (!name.trim() || name.length > 80 || /[<>\x00-\x1f]/.test(name)) throw new Error('MERIT_APP_NAME must be plain text, up to 80 characters');
  return Object.freeze({
    appId: id, name, ecosystem: 'v01', gateway: V01_GATEWAY,
    registerUrl: `${V01_GATEWAY}/store/${id}/register`,
    healthUrl: `${V01_GATEWAY}/api/health`,
  });
}

export function verifyHealth(health) {
  return Boolean(health?.ok === true && health.canonical_base_url === V01_GATEWAY
    && health.backing_services?.meritstore === 'https://merit-storev01.vercel.app'
    && health.backing_services?.meritutilsPackages === 'https://merit-utilsv01.vercel.app');
}
