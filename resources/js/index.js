const map = L.map("map").setView([45.695, 9.67], 13);
const intre = L.marker([45.592, 9.301]).addTo(map);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributori',
}).addTo(map);
const marker = L.marker([45.695, 9.67]).addTo(map);
marker.bindPopup('<a href="www.google.com">Questa è Bergamo</a>').openPopup();

async function calcolaPercorso() {
  const API_KEY =
    "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjY5NzY4MGNiZWViZjQ5MGQ4ZjNhNWFiZjBkZTBmZGMxIiwiaCI6Im11cm11cjY0In0=";

  // coordinate in formato [lon, lat]
  const start = [9.66, 45.697];
  const end = [9.703, 45.672];

  const now = new Date();
  now.setHours(10, 0, 0, 0);
  const oraPartenza = now.toISOString();

  const response = await fetch(
    "https://api.openrouteservice.org/v2/directions/driving-car",
    {
      method: "POST",
      headers: {
        Authorization: API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates: [start, end],
        // altre opzioni qui se servono
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    document.getElementById(
      "info"
    ).innerHTML = `<p style="color:red">Errore API ${response.status}: ${text}</p>`;
    return;
  }

  const data = await response.json();
  mostraRisultati(data);
}

// === 3. Mostra risultati e disegna sulla mappa ===
function mostraRisultati(data) {
  const infoDiv = document.getElementById("info");
  infoDiv.innerHTML = "<h3>Risultati trovati:</h3>";

  // Rimuovi percorsi precedenti
  map.eachLayer((layer) => {
    if (layer instanceof L.GeoJSON) map.removeLayer(layer);
  });

  data.features.forEach((feature, index) => {
    const props = feature.properties;
    const durata = (props.summary.duration / 60).toFixed(1);
    const camminata = Math.round(props.summary.walkingDistance);

    infoDiv.innerHTML += `
      <div style="margin:15px 0; padding:10px; border:1px solid #ccc; cursor:pointer;"
           onclick="evidenziaPercorso(${index})">
        <b>Opzione ${index + 1}</b> — ${durata} min — ${camminata} m a piedi —
        ${
          props.summary.changes !== undefined
            ? props.summary.changes + " cambi"
            : "diretto"
        }
      </div>`;

    // Disegna il percorso (anche i tratti a piedi)
    const colore = index === 0 ? "#0066ff" : "#ff6600";
    L.geoJSON(feature, {
      style: { color: colore, weight: 6, opacity: 0.7 },
    }).addTo(map);
  });

  // Zoom sul primo percorso
  if (data.features.length > 0) {
    const bounds = L.geoJSON(data.features[0]).getBounds();
    map.fitBounds(bounds);
  }
}

// Evidenzia un percorso quando ci clicchi sopra
function evidenziaPercorso(indice) {
  // (opzionale: puoi fare zoom o cambiare colore solo di quello)
  alert("Percorso " + (indice + 1) + " selezionato!");
}
