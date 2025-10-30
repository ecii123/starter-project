// CSS imports
import '../styles/styles.css';
import 'tiny-slider/dist/tiny-slider.css';
import 'leaflet/dist/leaflet.css';

// JS imports
import L from 'leaflet';
import { dicoding, landmark, streets, trainStops, zoo } from './geojson.js';
import App from './pages/app';
import { registerServiceWorker } from './utils';

// Jalankan setelah DOM siap
document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.getElementById('main-content'),
    drawerButton: document.getElementById('drawer-button'),
    navigationDrawer: document.getElementById('navigation-drawer'),
    skipLinkButton: document.querySelector('.skip-link'),
  });

  await registerServiceWorker();
  console.log('Berhasil mendaftarkan service worker.');

  // Redirect ke login jika belum login
  if (!localStorage.getItem('token')) {
    window.location.hash = '/login';
  }

  await app.renderPage();

  // Rerender halaman saat hash berubah
  let currentHash = window.location.hash;
  window.addEventListener('hashchange', async () => {
    if (window.location.hash !== currentHash) {
      currentHash = window.location.hash;
      await app.renderPage();
    }
  });
});

// =====================
// LEAFLET MAP SETUP
// =====================

// Pastikan elemen map ada di halaman
document.addEventListener('DOMContentLoaded', () => {
  const mapElement = document.getElementById('map');
  if (!mapElement) return; // Jangan jalankan kalau halaman tidak punya #map

  // Hapus instance lama kalau ada (fix error "Map container is already initialized")
  if (L.DomUtil.get('map') !== null) {
    L.DomUtil.get('map')._leaflet_id = null;
  }

  // Inisialisasi peta
  const myMap = L.map('map').setView([-6.2, 106.8], 10); // Lokasi default: Jakarta

  // Tambahkan layer dasar (OpenStreetMap)
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(myMap);

  // Tambahkan layer lain (satellite)
  const satellite = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      attribution: 'Tiles &copy; Esri',
    }
  );

  // Tambahkan kontrol untuk ganti layer
  L.control.layers({
    OpenStreetMap: osm,
    Satellite: satellite,
  }).addTo(myMap);

  // Tambahkan layer GeoJSON
  const dicodingLayer = L.geoJSON(dicoding).addTo(myMap);
  const landmarkLayer = L.geoJSON(landmark).addTo(myMap);
  const trainStopsLayer = L.geoJSON(trainStops).addTo(myMap);
  const streetsLayer = L.geoJSON(streets).addTo(myMap);
  const zooLayer = L.geoJSON([zoo]).addTo(myMap);

  // Gabungkan semua layer
  const featuresGroup = L.featureGroup([
    dicodingLayer,
    landmarkLayer,
    trainStopsLayer,
    streetsLayer,
    zooLayer,
  ]);

  // Fit ke semua fitur
  myMap.fitBounds(featuresGroup.getBounds());
});
