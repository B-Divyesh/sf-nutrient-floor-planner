import { readdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async entry => entry.isDirectory() ? files(join(directory, entry.name)) : [join(directory, entry.name)]));
  return nested.flat();
}
const paths = (await files(dist)).map(file => `/${relative(dist, file)}`);
// Cache only the offline shell and assets needed to render it. Source artwork,
// social cards, icons not used by the page, and crawl files stay out of setup.
const shellAssets = paths.filter(path =>
  /^\/assets\/[^/]+\.(?:js|css)$/.test(path) ||
  path === '/assets/hero.webp' ||
  path === '/assets/icon-192.png' ||
  path === '/manifest.webmanifest'
);
const precache = JSON.stringify([...new Set(['/', ...shellAssets])]);
const source = `const CACHE = 'nutrient-floor-v${Date.now()}';
const SHELL = ${precache};
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL))));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim().then(() => caches.keys()).then(keys => Promise.all(keys.filter(key => key.startsWith('nutrient-floor-') && key !== CACHE).map(key => caches.delete(key))))));
self.addEventListener('message', event => { if (event.data === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(caches.open(CACHE).then(cache => cache.match(url.pathname).then(hit => hit || fetch(event.request).then(response => {
    if (response.ok && !url.pathname.endsWith('/sw.js')) cache.put(url.pathname, response.clone());
    return response;
  }).catch(() => event.request.mode === 'navigate' ? cache.match('/') : Response.error()))));
});
`;
await writeFile(join(dist, 'sw.js'), source);
