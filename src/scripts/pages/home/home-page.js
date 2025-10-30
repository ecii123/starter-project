import L from 'leaflet';
import LikeDB from '../../data/database.js'; // database IndexedDB
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { dicoding, landmark, streets, trainStops, zoo } from '../../geojson.js';

let map;

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

export default class HomePage {
  async render() {
    return `
      <section class="container">
        <h1>Stories</h1>
        <div id="map" style="height: 400px; margin-bottom: 20px;"></div>
        <ul id="storyList"></ul>
      </section>
    `;
  }

  async afterRender() {
    // Cek login
    if (!localStorage.getItem('token')) {
      window.location.hash = '/login';
      return;
    }

    await this.fetchAndRenderStories();

    // Jika ada flag refresh
    if (localStorage.getItem('refreshHome') === 'true') {
      localStorage.removeItem('refreshHome');
      await this.fetchAndRenderStories();
    }
  }

  async fetchAndRenderStories() {
    const token = localStorage.getItem('token');
    const response = await fetch('https://story-api.dicoding.dev/v1/stories?page=1&size=100', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const storiesData = await response.json();
    const stories = storiesData.listStory || [];
    const list = document.getElementById('storyList');
    list.innerHTML = '';

    // Jika map sudah ada, hapus dulu instance lama
    if (map) {
      map.remove();
    }

    // Inisialisasi peta baru
    map = L.map('map').setView([0, 0], 2);
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    });
    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri'
    });
    osm.addTo(map);

    L.control.layers({
      "OpenStreetMap": osm,
      "Satellite": satellite
    }).addTo(map);

    const markers = [];

    // Tambahkan semua story
    for (const story of stories) {
      const item = document.createElement('li');
      const liked = await LikeDB.get(story.id);

      item.innerHTML = `
        <h3>${story.name}</h3>
        <p>${story.description}</p>
        <img src="${story.photoUrl}" alt="${story.description}">
        <p>Created: ${new Date(story.createdAt).toLocaleString()}</p>
        <button class="like-btn" data-id="${story.id}">
          ${liked ? '❤️ Liked' : '🤍 Like'}
        </button>
      `;
      item.tabIndex = 0;

      // Event like/unlike
      item.querySelector('.like-btn').addEventListener('click', async (e) => {
        const button = e.target;
        const storyId = button.getAttribute('data-id');
        const isLiked = await LikeDB.get(storyId);

        if (isLiked) {
          await LikeDB.delete(storyId);
          button.textContent = '🤍 Like';
        } else {
          await LikeDB.put(story);
          button.textContent = '❤️ Liked';
        }
      });

      // Klik story -> fokus ke marker
      item.addEventListener('click', () => {
        markers.forEach(m => m.setOpacity(0.5));
        const marker = markers.find(m => m.storyId === story.id);
        if (marker) {
          marker.setOpacity(1);
          map.flyTo([story.lat, story.lon], 10);
        }
      });

      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') item.click();
      });

      list.appendChild(item);

      // Tambahkan marker ke peta
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(map)
          .bindPopup(`
            <b>${story.name}</b><br>
            ${story.description}<br>
            <img src="${story.photoUrl}" alt="${story.description}" width="100">
          `);
        marker.storyId = story.id;
        markers.push(marker);
      }
    }

    // Tambahkan GeoJSON setelah map dan layer dasar sudah siap
    try {
      const dicodingLayer = L.geoJSON(dicoding);
      const landmarkLayer = L.geoJSON(landmark);
      const trainStopsLayer = L.geoJSON(trainStops);
      const streetsLayer = L.geoJSON(streets);
      const zooLayer = L.geoJSON([zoo]);

      const featuresGroup = L.featureGroup([
        dicodingLayer,
        landmarkLayer,
        trainStopsLayer,
        streetsLayer,
        zooLayer,
      ]);

      if (featuresGroup.getLayers().length > 0) {
        featuresGroup.addTo(map);
        map.fitBounds(featuresGroup.getBounds(), { maxZoom: 15 });
      }
    } catch (err) {
      console.warn('Gagal menambahkan geojson ke map:', err);
    }
  }
}
