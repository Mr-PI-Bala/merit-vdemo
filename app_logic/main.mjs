import { createAppShell, setStatusState } from '/vendor/merit_ux/0.1.2/merit_ux.mjs';
import { verifyHealth } from './config.mjs';

const FEATURES = [
  ['identity', 'Join your app', 'Guest, email, and freemium onboarding', 'meritsubs'],
  ['journal', 'Journal', 'Private entries with app-bound identity', 'tenant/journal'],
  ['ama', 'Ask & answer', 'Questions, responses, and votes', 'tenant/questions'],
  ['community', 'Community', 'Contributions and moderation', 'tenant/contributions'],
  ['rooms', 'Rooms & calendar', 'Room media and availability', 'tenant/rooms'],
  ['notifications', 'Notifications', 'Opt-in alerts and push lifecycle', 'tenant/alerts'],
  ['store', 'Store', 'Plans, add-ons, and sandbox checkout', 'meritstore'],
  ['referral', 'Referrals', 'Affiliate and design-partner attribution', 'merit_referral'],
  ['metering', 'Usage & analytics', 'Capability counts with privacy-safe metering', 'events/ingest'],
];

async function main() {
  const response = await fetch('/config.json');
  if (!response.ok) throw new Error('App configuration unavailable');
  const config = await response.json();
  document.title = config.name;
  document.getElementById('boot-status').remove();
  const shell = createAppShell({
    host: document.body, theme: 'gloss-aurora',
    brand: { name: config.name, tagline: 'A place for your ideas and your community.', kicker: 'Powered by MERIT' },
    freemium: false, loginChooser: false,
    slots: { main: '#app-logic' }, peers: { workbench: true },
    legal: { brandName: 'MERIT labs, a division of MERIT', includeDefaultLegalLinks: false, links: [
      { href: `${config.gateway}/portal/legal.html`, label: 'Legal' },
      { href: `${config.gateway}/portal/terms.html`, label: 'Terms' },
    ] },
  });
  setStatusState(shell.status, 'pending', 'Connection not checked');
  shell.main.innerHTML = `
    <section class="workspace-intro"><p class="eyebrow">V01 HELLO WORLD</p><h1>Build a place people return to.</h1>
    <p>MERIT VDemo is a forkable starting point for a community, membership, or creator app. Try the flow below, then make it yours.</p>
    <div class="workspace-actions"><button id="check-connection" type="button">Check V01 connection</button><a class="button-link" href="${config.registerUrl}">Open app registration</a></div>
    <p id="connection-status" role="status">Connection has not been checked.</p></section>
    <section class="hello-grid" aria-label="Hello World journey">
      <article class="hello-card"><p class="eyebrow">01 · START</p><h2>Welcome to your app</h2><p>Use a public app identity, then add your own brand, audience, and offer.</p><label>App identity<input id="demo-handle" value="hello-friend" maxlength="40"></label><button id="demo-join" type="button">Try a guest join</button><p id="join-status" role="status"></p></article>
      <article class="hello-card"><p class="eyebrow">02 · EXPLORE</p><h2>Your activity</h2><p>Workbench is the shared interaction surface for journals, questions, rooms, and insights.</p><div id="workspace-grid"></div></article>
      <article class="hello-card"><p class="eyebrow">03 · EXTEND</p><h2>Choose your next capability</h2><p>Every card maps to a v01 provider route and can be enabled as your app grows.</p><div class="feature-list">${FEATURES.map(([id, title, copy, route]) => `<button class="feature-card" data-feature="${id}" type="button"><strong>${title}</strong><span>${copy}</span><code>${route}</code></button>`).join('')}</div></article>
    </section>
    <section class="developer-card"><p class="eyebrow">OVER DINNER</p><h2>Fork this into your own app</h2><p>Change one app slug, choose your visual language, and keep the provider boundary intact. The documentation walks through local preview, hosted configuration, and end-to-end acceptance.</p><a class="button-link" href="https://github.com/Mr-PI-Bala/merit-vdemo">View the source and fork guide</a></section>`;
  const api = window.merit_workbench;
  if (typeof api?.MeritWorkbenchLayout !== 'function') throw new Error('Workbench package unavailable');
  const workbench = new api.MeritWorkbenchLayout({
    theme: 'merit-play', mode: 'readonly', gridTitle: 'Your activity',
    columns: [{ id: 'title', label: 'Title' }, { id: 'kind', label: 'Activity' }],
    loadRows: async () => [],
  });
  await workbench.mount(document.getElementById('workspace-grid'));
  document.getElementById('demo-join').addEventListener('click', () => {
    const handle = document.getElementById('demo-handle').value.trim();
    document.getElementById('join-status').textContent = handle ? `Ready to onboard ${handle} in ${config.name}.` : 'Enter a handle to continue.';
  });
  document.querySelectorAll('[data-feature]').forEach((card) => card.addEventListener('click', () => {
    document.getElementById('join-status').textContent = `${card.querySelector('strong').textContent} is available through the v01 adapter contract. Follow the fork guide to connect its provider route.`;
  }));
  document.getElementById('check-connection').addEventListener('click', async (event) => {
    const button = event.currentTarget;
    const status = document.getElementById('connection-status');
    button.disabled = true;
    status.textContent = 'Checking connection…';
    try {
      const result = await fetch(config.healthUrl, { signal: AbortSignal.timeout(10000), redirect: 'error' });
      if (!result.ok || !verifyHealth(await result.json())) throw new Error('Unexpected gateway');
      status.textContent = 'Connected to MERIT v01. Member features require separate setup.';
      setStatusState(shell.status, 'ok', 'Gateway connected');
    } catch {
      status.textContent = 'Could not verify the MERIT v01 connection. Try again shortly.';
      setStatusState(shell.status, 'warn', 'Connection unavailable');
    } finally { button.disabled = false; }
  });
}
main().catch(() => {
  const error = document.createElement('p');
  error.setAttribute('role', 'alert');
  error.textContent = 'Your workspace could not open. Reload the page or check the app configuration.';
  document.body.append(error);
});
