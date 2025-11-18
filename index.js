const map = L.map('map').setView([45.7696, 14.6483], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributori'
}).addTo(map);

const marker = L.marker([41.9028, 12.4964]).addTo(map);
marker.bindPopup("<b>Ciao!</b><br>Questa è Roma.").openPopup();