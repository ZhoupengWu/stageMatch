const map = L.map("map").setView([45.695, 9.67], 13);
const intre = L.marker([45.592, 9.301]).addTo(map);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributori',
}).addTo(map);

const marker = L.marker([45.695, 9.67]).addTo(map);
marker.bindPopup('<a href="www.google.com">Questa è Bergamo</a>').openPopup();

async function calcolaPercorso() {
    const API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjY5NzY4MGNiZWViZjQ5MGQ4ZjNhNWFiZjBkZTBmZGMxIiwiaCI6Im11cm11cjY0In0=";

    // coordinate in formato [lon, lat]
    const start = [9.66, 45.697];
    const end = [9.703, 45.672];

    /* const now = new Date();
    now.setHours(10, 0, 0, 0);
    const oraPartenza = now.toISOString(); */

    const response = await fetch( "https://api.openrouteservice.org/v2/directions/driving-car", {
        method: "POST",
        headers: {
            Authorization: API_KEY,
            "Content-Type": "application/json",
            "Accept": "application/json, application/geo+json"
        },
        body: JSON.stringify({
            coordinates: [start, end],
            // altre opzioni qui se servono
        })
    });

    if (!response.ok) {
        const text = await response.text();

        document.getElementById("info").innerHTML = `<p style="color:red">Errore API ${response.status}: ${text}</p>`;

        return;
    }

    const data = await response.json();
    mostraRisultati(data);
}

// === 3. Mostra risultati e disegna sulla mappa ===
function mostraRisultati(data) {
    const infoDiv = document.getElementById("info");
    infoDiv.innerHTML = "<h3>Risultati trovati:</h3>";

    if (!data) {
        infoDiv.innerHTML += '<p style="color:red">Risposta API vuota</p>';
        console.error('Risposta API vuota:', data);
        return;
    }

    // supporta sia GeoJSON { features: [...] } sia formati come { routes: [...] }
    const features = Array.isArray(data.features) ? data.features
                    : Array.isArray(data.routes) ? data.routes
                    : [];

    if (!window._routeLayers) window._routeLayers = [];
    window._routeLayers.forEach(l => map.removeLayer(l));
    window._routeLayers = [];

    if (features.length === 0) {
        infoDiv.innerHTML += '<p style="color:orange">Nessun percorso trovato nella risposta API. Controlla console.</p>';
        console.log('API response completa:', data);
        return;
    }

    features.forEach((feature, index) => {
        // summary fallback come prima
        const summary = (feature.properties && feature.properties.summary) || feature.summary || {};
        const durata = summary.duration ? (summary.duration / 60).toFixed(1) : "—";
        const distanzaKm = summary.distance ? (summary.distance / 1000).toFixed(2) : "—";
        const camminata = Math.round(summary.walkingDistance || 0);

        infoDiv.innerHTML += `
            <div data-idx="${index}" style="margin:15px 0; padding:10px; border:1px solid #ccc; cursor:pointer;">
                <b>Opzione ${index + 1}</b> — ${durata} min — ${distanzaKm} km — ${camminata} m a piedi — ${ summary.changes !== undefined ? summary.changes + " cambi" : "diretto" }
            </div>
        `;

        // Normalizza la geometria in un Feature GeoJSON valido
        let geojsonFeature = null;

        // caso già Feature GeoJSON
        if (feature && feature.type === 'Feature' && feature.geometry) {
            geojsonFeature = feature;
        }
        // caso route object con .geometry (oggetto con coordinates)
        else if (feature && feature.geometry && typeof feature.geometry === 'object' && Array.isArray(feature.geometry.coordinates)) {
            geojsonFeature = { type: 'Feature', geometry: feature.geometry, properties: feature.properties || {} };
        }
        // caso array di coordinates (es. routes[].coordinates)
        else if (feature && Array.isArray(feature.coordinates)) {
            geojsonFeature = { type: 'Feature', geometry: { type: 'LineString', coordinates: feature.coordinates }, properties: feature.properties || {} };
        }
        // caso geometry come stringa encoded (polyline) -> prova a decodificare (richiede libreria o funzione)
        else if (feature && typeof feature.geometry === 'string') {
            console.warn('Geometry is encoded string — decode needed:', feature.geometry);
            // se usi @mapbox/polyline caricato nell'HTML puoi decodare così:
            // const coordsLatLon = polyline.decode(feature.geometry, 6); // [lat,lon]
            // const coordsLonLat = coordsLatLon.map(([lat, lon]) => [lon, lat]);
            // geojsonFeature = { type: 'Feature', geometry: { type: 'LineString', coordinates: coordsLonLat.map(([lat,lon]) => [lon,lat]) }, properties: feature.properties || {} };
        }

        if (!geojsonFeature) {
            console.error('Impossibile ottenere GeoJSON valido per feature:', feature);
            return; // salta questo elemento
        }

        const colore = index === 0 ? "#0066ff" : "#ff6600";
        const layer = L.geoJSON(geojsonFeature, {
            style: { color: colore, weight: 6, opacity: 0.7 },
        }).addTo(map);

        window._routeLayers.push(layer);
    });

    // aggiungi listener sui div creati (ora hanno data-idx)
    infoDiv.querySelectorAll('div[data-idx]').forEach(el => {
        el.addEventListener('click', () => evidenziaPercorso(Number(el.dataset.idx)));
    });

    // Zoom sul primo percorso
    try {
        const bounds = L.geoJSON(features[0]).getBounds();
        map.fitBounds(bounds);
    } catch (e) {
        console.warn('Impossibile calcolare bounds dal primo feature:', e);
    }
}

// Evidenzia un percorso quando ci clicchi sopra
function evidenziaPercorso(indice) {
    // (opzionale: puoi fare zoom o cambiare colore solo di quello)
    alert("Percorso " + (indice + 1) + " selezionato!");
}