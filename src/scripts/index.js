// CSS imports
import '../styles/styles.css';
import 'tiny-slider/dist/tiny-slider.css';
import 'leaflet/dist/leaflet.css';
import { dicoding, landmark, streets, trainStops, zoo } from './geojson.js';

// Components
import App from './pages/app';
import { registerServiceWorker } from './utils';

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

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});

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

