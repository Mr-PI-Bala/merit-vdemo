import { createAppShell, setStatusState } from '/vendor/merit_ux/0.1.2/merit_ux.mjs';
import { verifyHealth } from './config.mjs';

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
    <section class="workspace-intro"><h1>Your workspace</h1>
    <p>Bring your journal, conversations, events, and membership together.</p></section>
    <nav class="workspace-nav" aria-label="Workspace actions"><button id="check-connection" type="button">Check connection</button></nav>
    <p id="connection-status" role="status">Connection has not been checked.</p>
    <section aria-label="Your activity"><div id="workspace-grid"></div></section>
    <p class="workspace-note">This preview includes your app shell and workbench. Member features are not available in this build.</p>`;
  const api = window.merit_workbench;
  if (typeof api?.MeritWorkbenchLayout !== 'function') throw new Error('Workbench package unavailable');
  const workbench = new api.MeritWorkbenchLayout({
    theme: 'merit-play', mode: 'readonly', gridTitle: 'Your activity',
    columns: [{ id: 'title', label: 'Title' }, { id: 'kind', label: 'Activity' }],
    loadRows: async () => [],
  });
  await workbench.mount(document.getElementById('workspace-grid'));
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
