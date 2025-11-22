/* import "@mapbox/polyline"; */

const button = document.getElementById("percorso");
const display_path = document.getElementById("path");
const indication = document.getElementById("ind");
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

    const response = await fetch( "https://api.openrouteservice.org/v2/directions/driving-car/json", {
        method: "POST",
        headers: {
            Authorization: API_KEY,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            coordinates: [
                start,
                end
            ]
        })
    });

    if (!response.ok) {
        throw new Error(`Code error ${response.status}`);

    }

    const data = await response.json();

    const route = data.routes[0];
    const coordinates = polyline.decode(route.geometry);
    const latlngs = coordinates.map(c => [c[0], c[1]]);
    L.polyline(latlngs, { color: 'red', weight: 4 }).addTo(map);

    const distance = route.summary.distance / 1000;
    const time = route.summary.duration / 3600;
    display_path.innerText = `Distanza: ${distance} km\nTempo: ${time} h`;

    route.segments.forEach(segment => {
        segment.steps.forEach(step => {
            indication.innerText = step.instruction;
            console.log(step.instruction);
        });
    });
}

button.addEventListener("click", calcolaPercorso);