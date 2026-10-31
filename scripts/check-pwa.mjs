import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const output = resolve('dist/stoXevo/browser');
for (const file of ['index.html', 'ngsw-worker.js', 'manifest.webmanifest']) {
  if (!existsSync(resolve(output, file)))
    throw new Error(`Missing PWA artifact: ${file}`);
}
const manifest = JSON.parse(readFileSync(resolve(output, 'ngsw.json'), 'utf8'));
if (!manifest.hashTable['/index.html'])
  throw new Error('App shell is not cached');
for (const [url, expected] of Object.entries(manifest.hashTable)) {
  const content = readFileSync(resolve(output, `.${url}`));
  if (createHash('sha1').update(content).digest('hex') !== expected) {
    throw new Error(`Service-worker cache hash mismatch: ${url}`);
  }
}
console.log(
  `PWA artifacts verified: ${Object.keys(manifest.hashTable).length} cached files.`
);
