import L from 'leaflet';
import LikeDB from '../../data/database.js'; // database IndexedDB
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});


export default class HomePage {
  async render() {
    return `
      <section class="container">
        <h1>Stories</h1>
        <div id="map" style="height: 400px; margin-bottom: 20px;"></div>
        <ul id="storyList"></ul> <!-- Elemen ini ditambahkan agar story dapat dirender -->
      </section>
    `;
  }

  async afterRender() {
    // Jika belum login, arahkan ke halaman login
    if (!localStorage.getItem('token')) {
      window.location.hash = '/login';
      return;
    }

    // Ambil dan tampilkan story
    await this.fetchAndRenderStories();

    // Jika ada flag untuk refresh halaman home
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

    // Inisialisasi peta
    const map = L.map('map').setView([0, 0], 2);
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    });
    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri'
    });
    osm.addTo(map);

    // Tambahkan kontrol layer
    L.control.layers({
      "OpenStreetMap": osm,
      "Satellite": satellite
    }).addTo(map);

    const markers = [];

    // Render setiap story ke dalam list dan peta
    for (const story of stories) {
      const item = document.createElement('li');

      // Cek apakah story sudah disukai di IndexedDB
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

      // Event klik tombol Like
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

      // Event: klik story -> fokus ke marker
      item.addEventListener('click', () => {
        markers.forEach(m => m.setOpacity(0.5));
        const marker = markers.find(m => m.storyId === story.id);
        if (marker) {
          marker.setOpacity(1);
          map.flyTo([story.lat, story.lon], 10);
        }
      });

      // Event: tekan Enter -> klik story
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
  }
}
