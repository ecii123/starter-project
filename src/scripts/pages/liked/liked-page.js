import L from 'leaflet';
import LikeDB from '../../data/database.js'; // Impor IndexedDB
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let map; // variabel global map

// konfigurasi ikon marker agar tidak error 404
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

export default class LikedPage {
  async render() {
    return `
      <section class="container">
        <h1>Liked Stories</h1>
        <div id="map" style="height: 400px; margin-bottom: 20px;"></div>
        <ul id="storyList"></ul>
      </section>
    `;
  }

  async afterRender() {
    if (!localStorage.getItem('token')) {
      window.location.hash = '/login';
      return;
    }

    await this.fetchAndRenderLikedStories();
  }

  async fetchAndRenderLikedStories() {
    const likedStories = await LikeDB.getAll();
    const list = document.getElementById('storyList');
    list.innerHTML = '';

    if (likedStories.length === 0) {
      list.innerHTML = '<p>No liked stories yet.</p>';
      if (map) {
        map.remove(); // hapus peta jika ada
        map = null;
      }
      return;
    }

    // jika map sudah pernah diinisialisasi, hapus dulu
    if (map) {
      map.remove();
      map = null;
    }

    // inisialisasi ulang peta
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

    likedStories.forEach(story => {
      const item = document.createElement('li');
      item.innerHTML = `
        <h3>${story.name}</h3>
        <p>${story.description}</p>
        <img src="${story.photoUrl}" alt="${story.description}">
        <p>Created: ${new Date(story.createdAt).toLocaleString()}</p>
        <button class="unlike-btn" data-id="${story.id}">Unlike</button>
      `;
      item.tabIndex = 0;

      // event: unlike
      item.querySelector('.unlike-btn').addEventListener('click', async (e) => {
        const storyId = e.target.dataset.id;
        await LikeDB.delete(storyId);
        alert('Story unliked');
        await this.fetchAndRenderLikedStories(); // refresh ulang daftar
      });

      // event: klik item -> fokus ke marker
      item.addEventListener('click', () => {
        markers.forEach(m => m.setOpacity(0.5));
        const marker = markers.find(m => m.storyId === story.id);
        if (marker) {
          marker.setOpacity(1);
          map.flyTo([story.lat, story.lon], 10);
        }
      });

      // event: tekan enter -> klik
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') item.click();
      });

      list.appendChild(item);

      // tambah marker ke peta
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
    });

    // sesuaikan tampilan map agar semua marker terlihat
    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds(), { maxZoom: 10 });
    }
  }
}
