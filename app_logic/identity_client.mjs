/**
 * Server-side MeritSubs adapter. The bearer token is returned to the app's
 * session layer; this module never persists it or places it in public config.
 */
export function createIdentityClient({ gatewayClient, appId }) {
  if (!gatewayClient || !/^[a-z][a-z0-9-]{2,62}$/.test(String(appId || ''))) throw new Error('Identity client requires a valid app id and gateway client');
  const call = (path, options = {}) => gatewayClient.capability('meritsubs', `api/v1/${path}`, options);
  return Object.freeze({
    onboardGuest: ({ handle }) => call('subscribers/onboard/guest', { method: 'POST', body: { handle, consumer_id: appId } }),
    onboardEmail: ({ email }) => call('subscribers/onboard/email', { method: 'POST', body: { email, consumer_id: appId } }),
    onboardFreemium: ({ handle, email }) => call('subscribers/onboard/freemium', { method: 'POST', body: { handle, email, consumer_id: appId } }),
    entitlements: (bearer) => call('entitlements', { bearer }),
    checkout: ({ subscriberId, plan, bearer }) => {
      if (!/^[a-zA-Z0-9_-]{3,128}$/.test(String(subscriberId || ''))) throw new Error('Invalid subscriber id');
      if (!['certified-verify', 'plus-monthly', 'couples-monthly', 'studio-monthly'].includes(plan)) throw new Error('Unsupported plan');
      return call(`subscribers/${encodeURIComponent(subscriberId)}/checkout/meritstore`, { method: 'POST', bearer, body: { plan, tenant: appId } });
    },
  });
}
