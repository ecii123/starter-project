// src/service-worker.js
const CACHE_NAME = 'story-app-v1';
const urlsToCache = [
  '/starter-project/',
  '/starter-project/index.html',
  '/starter-project/app.bundle.js',
  '/starter-project/favicon.png',
  '/starter-project/manifest.json', // pastikan nama file ini sesuai, bukan app.webmanifest
];

self.__WB_MANIFEST; // biarkan ini, Workbox akan inject otomatis

// Install: cache file utama
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching app shell...');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Fetch: ambil dari cache dulu, lalu jaringan jika perlu
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).catch(() => caches.match('/starter-project/index.html'))
      );
    })
  );
});

// Activate: hapus cache lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  clients.claim();
});
