import { createHash } from 'node:crypto';

export function verifyArtifact(bytes, expected) {
  if (!/^sha384-[A-Za-z0-9+/]{64}$/.test(expected)) throw new Error('Invalid SHA-384 integrity pin');
  if (`sha384-${createHash('sha384').update(bytes).digest('base64')}` !== expected) {
    throw new Error('Package integrity mismatch; update only from a verified provider release');
  }
}

export function artifactUrl(base, path) {
  if (base !== 'https://merit-prodv01.vercel.app/pkg/meritutils') throw new Error('Only the v01 package gateway is supported');
  if (!/^[a-z_]+\/\d+\.\d+\.\d+\/[a-zA-Z0-9_.-]+$/.test(path)) throw new Error('Invalid package artifact path');
  return `${base}/${path}`;
}
