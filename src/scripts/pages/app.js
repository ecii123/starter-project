// src/scripts/pages/app.js
import routes from '../routes/routes.js';
import { getActiveRoute } from '../routes/url-parser';
import {
  generateAuthenticatedNavigationListTemplate,
  generateUnauthenticatedNavigationListTemplate,
  generateSubscribeButtonTemplate,
  generateUnsubscribeButtonTemplate,
  generateTestNotificationButtonTemplate,
} from '../templates';
import { isServiceWorkerAvailable, setupSkipToContent, transitionHelper } from '../utils';
import { subscribe, unsubscribe, isCurrentPushSubscriptionAvailable } from '../utils/notification-helper'; // Tambahkan unsubscribe

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();
  }

  #setupDrawer() {
    if (!this.#drawerButton || !this.#navigationDrawer) return;

    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (
        this.#navigationDrawer &&
        this.#drawerButton &&
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
      }

      if (this.#navigationDrawer) {
        this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
          if (link.contains(event.target)) {
            this.#navigationDrawer.classList.remove('open');
          }
        });
      }
    });
  }

  async #setupNavigation() {
    const navList = document.getElementById('nav-list');
    if (navList) {
      const isLoggedIn = !!localStorage.getItem('token');
      if (isLoggedIn) {
        navList.innerHTML = generateAuthenticatedNavigationListTemplate();
      } else {
        navList.innerHTML = generateUnauthenticatedNavigationListTemplate();
      }

      const logoutBtn = document.getElementById('logout-link');
     if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    this.#setupNavigation();
    if (window.location.hash !== '/login') {
      window.location.hash = '/login';
    }
  });
}

    }
  }

  async #setupPushNotification() {
    const pushNotificationTools = document.getElementById('push-notification-tools');
    console.log('Checking pushNotificationTools:', pushNotificationTools); // Debug
    if (pushNotificationTools) {
      const isSubscribed = await isCurrentPushSubscriptionAvailable();
      console.log('Is subscribed:', isSubscribed); // Debug
      if (isSubscribed) {
        pushNotificationTools.innerHTML = generateUnsubscribeButtonTemplate();
        const unsubscribeButton = document.getElementById('unsubscribe-button');
        if (unsubscribeButton) {
          unsubscribeButton.addEventListener('click', async () => {
            await unsubscribe(); // Batalkan langganan
            await this.#setupPushNotification(); // Perbarui tombol setelah unsubscribe
          });
        }
        // Tambahkan tombol test jika subscribed
        pushNotificationTools.innerHTML += generateTestNotificationButtonTemplate();
        const testButton = document.getElementById('test-notification-button');
        if (testButton) {
          testButton.addEventListener('click', () => {
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.ready.then(registration => {
                registration.showNotification('Test Notification', {
                  body: 'This is a test push notification!',
                  icon: '/icon.png' // Ganti dengan path icon jika ada
                });
              });
            } else {
              alert('Service Worker tidak tersedia.');
            }
          });
        }
      } else {
        pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();
        const subscribeButton = document.getElementById('subscribe-button');
        if (subscribeButton) {
          subscribeButton.addEventListener('click', async () => {
            await subscribe(); // Langganan
            await this.#setupPushNotification(); // Perbarui tombol setelah subscribe
          });
        }
      }
    } else {
      console.error('push-notification-tools tidak ditemukan');
    }
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url] || routes['/'];
  
    document.startViewTransition(async () => {
      this.#content.innerHTML = await page.render();
      await page.afterRender();

      await this.#setupNavigation();
      await this.#setupPushNotification(); // Jalankan langsung setelah navigasi
    });
  }
}

export default App;