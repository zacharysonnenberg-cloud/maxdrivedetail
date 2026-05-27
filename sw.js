/* ═══════════════════════════════════════════
   MaxDriveDetail — Service Worker
   Caches the page shell for offline viewing
═══════════════════════════════════════════ */
const CACHE = 'maxdrive-v8';
const SHELL = [
  '/',
  '/index.html',
  '/services.html',
  '/gallery.html',
  '/contact.html',
  '/book.html',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600&family=Barlow+Condensed:wght@400;500;600;700;800;900&display=swap'
];

// Assets that change often — always network-first
const NETWORK_FIRST = ['/Logo.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Network-first for HTML and frequently-updated assets
  if (url.pathname.endsWith('.html') || url.pathname === '/' || NETWORK_FIRST.includes(url.pathname)) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }))
    );
  }
});
