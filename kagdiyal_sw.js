const KH_CACHE = 'kagdiyal-bill-v3';
const KH_ASSETS = [
  './',
  './index.html',
  './kagdiyal_manifest.webmanifest',
  './kagdiyal_icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(KH_CACHE)
      .then(cache => cache.addAll(KH_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => {
        return key === KH_CACHE ? null : caches.delete(key);
      })))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const request = event.request;
  const wantsPage = request.mode === 'navigate';

  event.respondWith(
    fetch(request)
      .then(response => {
        const copy = response.clone();
        caches.open(KH_CACHE).then(cache => cache.put(request, copy));
        return response;
      })
      .catch(() => {
        return caches.match(request).then(cached => {
          if (cached) return cached;
          if (wantsPage) return caches.match('./index.html');
          return undefined;
        });
      })
  );
});
