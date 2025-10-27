// CSS imports
import '../styles/styles.css';
import 'tiny-slider/dist/tiny-slider.css';
import 'leaflet/dist/leaflet.css';

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