// src/scripts/templates.js
import { showFormattedDate } from './utils';

// Template untuk card story
export function generateStoryItemTemplate({ id, name, description, photoUrl, createdAt }) {
  return `
    <div tabindex="0" class="story-item" data-storyid="${id}">
      <img class="story-item__image" src="${photoUrl}" alt="${name}">
      <div class="story-item__body">
        <h2 class="story-item__title">${name}</h2>
        <p>${description}</p>
        <p>Created: ${showFormattedDate(createdAt, 'id-ID')}</p>
      </div>
    </div>
  `;
}

// Template tombol Subscribe
export function generateSubscribeButtonTemplate() {
  return `
    <button id="subscribe-button" class="btn subscribe-button">
      Subscribe <i class="fas fa-bell"></i>
    </button>
  `;
}

// Template tombol Unsubscribe
export function generateUnsubscribeButtonTemplate() {
  return `
    <button id="unsubscribe-button" class="btn unsubscribe-button">
      Unsubscribe <i class="fas fa-bell-slash"></i>
    </button>
  `;
}

export function generateTestNotificationButtonTemplate() {
  return `
    <button id="test-notification-button" class="btn test-notification-button">
      Test Notification <i class="fas fa-bell"></i>
    </button>
  `;
}

// Navigasi untuk user yang sudah login
export function generateAuthenticatedNavigationListTemplate() {
  return `
    <li id="push-notification-tools" class="push-notification-tools"></li>
    <li id="home-link"><a href="#/">Home</a></li>
    <li id="add-story-link"><a href="#/add-story">Add Story</a></li>
    <li id="liked-link"><a href="#/liked">Liked Stories</a></li>
    <li id="logout-link"><a href="#">Logout</a></li>
  `;
}

// Navigasi untuk user yang belum login
export function generateUnauthenticatedNavigationListTemplate() {
  return `
    <li id="push-notification-tools" class="push-notification-tools"></li>
    <li id="home-link"><a href="#/">Home</a></li>
    <li id="login-link"><a href="#/login">Login</a></li>
    <li id="register-link"><a href="#/register">Register</a></li>
  `;
}
