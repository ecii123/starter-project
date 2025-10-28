// CSS imports
import '../styles/styles.css';
import 'tiny-slider/dist/tiny-slider.css';
import 'leaflet/dist/leaflet.css';
import { dicoding, landmark, streets, trainStops, zoo } from './geojson.js';

// Components
import App from './pages/app';
import { registerServiceWorker } from './utils';

import L from 'leaflet'; // tambahkan kalau belum ada import ini

// Inisialisasi peta


// src/scripts/index.js
document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.getElementById('main-content'),
    drawerButton: document.getElementById('drawer-button'),
    navigationDrawer: document.getElementById('navigation-drawer'), 
    skipLinkButton: document.querySelector('.skip-link'), 
  });
  await registerServiceWorker();

  console.log('Berhasil mendaftarkan service worker.');

  if (!localStorage.getItem('token')) {
    window.location.hash = '/login';
  }
  
  await app.renderPage();

 let currentHash = window.location.hash;

window.addEventListener('hashchange', async () => {
  if (window.location.hash !== currentHash) {
    currentHash = window.location.hash;
    await app.renderPage();
  }
});
});

const myMap = L.map('map', {
  center: [-6.200000, 106.816666], // contoh koordinat Jakarta
  zoom: 13,
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(myMap);

const dicodingLayer = L.geoJSON(dicoding);
dicodingLayer.addTo(myMap);
const landmarkLayer = L.geoJSON(landmark);
landmarkLayer.addTo(myMap);
const trainStopsLayer = L.geoJSON(trainStops);
trainStopsLayer.addTo(myMap);
const streetsLayer = L.geoJSON(streets);
streetsLayer.addTo(myMap);
const zooLayer = L.geoJSON([zoo]);
zooLayer.addTo(myMap);

const featuresGroup = L.featureGroup([
  dicodingLayer,
  landmarkLayer,
  trainStopsLayer,
  streetsLayer,
  zooLayer,
]);
myMap.fitBounds(featuresGroup.getBounds());

// Pendaftaran Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./service-worker.js')
      .then(reg => {
        console.log('Service Worker terdaftar:', reg.scope);
      })
      .catch(err => {
        console.error('Gagal mendaftar Service Worker:', err);
      });
  });
}