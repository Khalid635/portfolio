const CACHE_VERSION = 'v2';
const CACHE_NAME = `portfolio-cache-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  './',
  'index.html',
  'style.css',
  'script.js',
  'manifest.json',
  'Profile_picture.jpg',
  'Resume.txt',
  'icon-192.png'
];

const CDN_HOSTS = [
  'cdn.jsdelivr.net',
  'cdnjs.cloudflare.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(
        PRECACHE_URLS.map(url =>
          cache.add(url).catch(error => console.warn('Precache failed for', url, error))
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names
          .filter(name => name.startsWith('portfolio-cache-') && name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate') {
      const fallback = await cache.match('index.html');
      if (fallback) return fallback;
    }
    return Response.error();
  }
}

async function staleWhileRevalidate(event) {
  const request = event.request;
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const refresh = fetch(request)
    .then(response => {
      if (response && (response.ok || response.type === 'opaque')) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    event.waitUntil(refresh);
    return cached;
  }
  return (await refresh) || Response.error();
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;


  if (!sameOrigin && !CDN_HOSTS.includes(url.hostname)) return;

  const isSiteFile = sameOrigin &&
    (request.mode === 'navigate' || /\.(html|css|js|json|txt)$/i.test(url.pathname));

  if (isSiteFile) {
    event.respondWith(networkFirst(request));
  } else {
    event.respondWith(staleWhileRevalidate(event));
  }
});
