// src/scripts/utils/index.js
export function isServiceWorkerAvailable() {
  return 'serviceWorker' in navigator;
}

export async function registerServiceWorker() {
  if (isServiceWorkerAvailable()) {
    try {
      const registration = await navigator.serviceWorker.register('/starter-project/sw.bundle.js'); // Use subfolder path
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  } else {
    console.log('Service Worker API unsupported');
  }
}