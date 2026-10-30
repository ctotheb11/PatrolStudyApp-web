// Service worker: caches the whole app so it works with no signal. Bump VERSION when the data or
// code changes so phones pick up the update.
const VERSION = 'txs-v4';
const FILES = [
  './', 'index.html', 'css/app.css', 'js/logic.js', 'js/terms.js', 'js/app.js',
  'data/offenses.js', 'data/statutes.js', 'manifest.webmanifest', 'icon.svg', 'icon-180.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// Cache first, then network; update the cache in the background.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.match(e.request).then(hit => {
    const net = fetch(e.request).then(res => {
      if (res.ok) caches.open(VERSION).then(c => c.put(e.request, res.clone()));
      return res;
    }).catch(() => hit);
    return hit || net;
  }));
});
