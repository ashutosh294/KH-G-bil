const KH_CACHE = 'kagdiyal-bill-v1';
const KH_ASSETS = [
  './kagdiyal_bill.html',
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
      .then(keys => Promise.all(keys.filter(key => key !== KH_CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(KH_CACHE).then(cache => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
