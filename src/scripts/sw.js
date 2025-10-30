import { precacheAndRoute, matchPrecache } from 'workbox-precaching';
import { registerRoute, setCatchHandler } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

// Cache semua file hasil build (HTML, JS, CSS)
precacheAndRoute(self.__WB_MANIFEST);

// Cache halaman utama agar bisa offline
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// Cache gambar tile dari OpenStreetMap
registerRoute(
  ({ url }) =>
    url.origin.startsWith('https://a.tile.openstreetmap.org') ||
    url.origin.startsWith('https://b.tile.openstreetmap.org') ||
    url.origin.startsWith('https://c.tile.openstreetmap.org'),
  new StaleWhileRevalidate({
    cacheName: 'osm-tiles',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 100, // simpan maksimal 100 tile
        maxAgeSeconds: 7 * 24 * 60 * 60, // seminggu
      }),
    ],
  })
);

// Offline fallback page
setCatchHandler(async ({ event }) => {
  if (event.request.destination === 'document') {
    return matchPrecache('/offline.html');
  }
  return Response.error();
});
