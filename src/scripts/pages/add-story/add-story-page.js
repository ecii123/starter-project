import { addStory } from '../../data/api';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let map; // variabel global untuk menyimpan peta

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

export default class AddStoryPage {
  async render() {
    return `
      <section class="container">
        <h1>Add New Story</h1>
        <form id="addForm">
          <div>
            <label for="description">Description</label>
            <textarea id="description" required></textarea>
          </div>
          <div>
            <label for="photo">Photo</label>
            <input type="file" id="photo" accept="image/*" required>
          </div>
          <button type="button" id="cameraBtn">Use Camera</button>
          <div id="videoContainer" style="display: none;">
            <video id="video" width="320" height="240" autoplay></video>
            <button type="button" id="captureBtn">Capture</button>
            <button type="button" id="cancelBtn">Cancel</button>
            <canvas id="canvas" style="display: none;"></canvas>
          </div>
          <div id="map" style="height: 300px; margin-top: 20px;"></div>
          <input type="hidden" id="lat">
          <input type="hidden" id="lon">
          <button type="submit">Add Story</button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    if (!localStorage.getItem('token')) {
      window.location.hash = '/login';
      return;
    }

    // jika map sudah pernah dibuat, hapus dulu sebelum membuat yang baru
    if (map) {
      map.remove();
      map = null;
    }

    // inisialisasi ulang map
    map = L.map('map').setView([0, 0], 2);
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri'
    });

    L.control.layers({
      "OpenStreetMap": osm,
      "Satellite": satellite
    }).addTo(map);

    // marker klik lokasi
    let marker;
    map.on('click', (e) => {
      if (marker) map.removeLayer(marker);
      marker = L.marker(e.latlng).addTo(map);
      document.getElementById('lat').value = e.latlng.lat;
      document.getElementById('lon').value = e.latlng.lng;
    });

    // form submit
    const form = document.getElementById('addForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const description = document.getElementById('description').value;
      let photo = document.getElementById('photo').files[0];
      const lat = document.getElementById('lat').value;
      const lon = document.getElementById('lon').value;

      if (!description || !photo) {
        alert('Description and photo are required');
        return;
      }

      const response = await addStory({ description, photo, lat, lon });
      if (response.message === 'Story created successfully') {
        alert('Story added!');
        localStorage.setItem('refreshHome', 'true'); // flag untuk refresh home
        window.location.hash = '/'; // redirect ke home
      } else {
        alert(response.error || 'Add failed');
      }
    });

    // camera feature
    const cameraBtn = document.getElementById('cameraBtn');
    const video = document.getElementById('video');
    const captureBtn = document.getElementById('captureBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const canvas = document.getElementById('canvas');
    const videoContainer = document.getElementById('videoContainer');
    let stream;

    cameraBtn.addEventListener('click', async () => {
      videoContainer.style.display = 'block';
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
      } catch (error) {
        console.error('Error accessing camera:', error);
        videoContainer.style.display = 'none';
      }
    });

    captureBtn.addEventListener('click', () => {
      if (!stream) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        document.getElementById('photo').files = dataTransfer.files;
      });
      stream.getTracks().forEach(track => track.stop());
      videoContainer.style.display = 'none';
    });

    cancelBtn.addEventListener('click', () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      videoContainer.style.display = 'none';
    });
  }
}
