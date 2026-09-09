import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicConfig } from '../app_logic/config.mjs';
import { artifactUrl, verifyArtifact } from './artifacts.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
try { process.loadEnvFile(path.join(root, '.env.local')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const config = publicConfig(process.env);
const pins = JSON.parse(await fs.readFile(path.join(root, 'cfg/packages.json'), 'utf8'));
const files = await Promise.all(pins.artifacts.map(async (artifact) => {
  const response = await fetch(artifactUrl(pins.base, artifact.path), { redirect: 'error', signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`Package HTTP ${response.status}: ${artifact.path}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  verifyArtifact(bytes, artifact.sri);
  return { ...artifact, bytes };
}));
// Validate every package before touching the build output.
const dist = path.join(root, 'dist');
await fs.mkdir(dist, { recursive: true });
for (const file of files) {
  const dest = path.join(dist, 'vendor', file.path);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, file.bytes);
}
await fs.cp(path.join(root, 'public'), dist, { recursive: true });
await fs.cp(path.join(root, 'app_logic'), path.join(dist, 'app_logic'), { recursive: true });
await fs.writeFile(path.join(dist, 'config.json'), JSON.stringify(config, null, 2));
console.log(`Built ${config.appId}: ${files.length} v01 artifacts verified; public config allowlisted.`);
