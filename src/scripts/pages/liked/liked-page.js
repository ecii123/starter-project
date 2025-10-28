import L from 'leaflet';
import LikeDB from '../../data/database.js'; // Impor IndexedDB

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
    // Jika belum login, arahkan ke login
    if (!localStorage.getItem('token')) {
      window.location.hash = '/login';
      return;
    }

    // Ambil dan render liked stories dari IndexedDB
    await this.fetchAndRenderLikedStories();
  }

  async fetchAndRenderLikedStories() {
    const likedStories = await LikeDB.getAll(); // Ambil semua story yang disukai dari IndexedDB
    const list = document.getElementById('storyList');
    list.innerHTML = '';

    if (likedStories.length === 0) {
      list.innerHTML = '<p>No liked stories yet.</p>'; // Pesan jika kosong
      return;
    }

    // Inisialisasi peta
    const map = L.map('map').setView([0, 0], 2);
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
        <button class="unlike-btn" data-id="${story.id}">Unlike</button> <!-- Tombol untuk unlike -->
      `;
      item.tabIndex = 0;

      // Event klik unlike
      item.querySelector('.unlike-btn').addEventListener('click', async (e) => {
        const storyId = e.target.dataset.id;
        await LikeDB.delete(storyId);
        alert('Story unliked');
        await this.fetchAndRenderLikedStories(); // Refresh list setelah unlike
      });

      // Event klik story -> fokus ke marker
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

      // Tambahkan marker ke peta jika ada lokasi
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
  }
}