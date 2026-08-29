const CACHE = 'nutrient-floor-v6';
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/assets/hero.webp', '/assets/icon-192.png', '/assets/icon-512.png', '/@vite/client', '/src/main.ts', '/src/style.css', '/src/model.ts', '/src/store.ts'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => Promise.all(SHELL.map(url => cache.add(url).catch(() => undefined))))));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim().then(() => caches.keys()).then(keys => Promise.all(keys.filter(key => key.startsWith('nutrient-floor-') && key !== CACHE).map(key => caches.delete(key))))));
self.addEventListener('message', event => { if (event.data === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(hit => {
    if (hit) return hit;
    return fetch(event.request).then(response => {
      if (new URL(event.request.url).origin === location.origin && response.ok) caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
      return response;
    }).catch(() => event.request.mode === 'navigate' ? caches.match('/index.html') : Response.error());
  }));
});
