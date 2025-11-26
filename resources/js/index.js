const button = document.getElementById("percorso");

const input_address_start = document.getElementById("address_start");
const input_address_end = document.getElementById("address_end");

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

    const response = await fetch( "https://api.openrouteservice.org/v2/directions/driving-car/geojson", {
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

    L.geoJSON(data, { style: { color: 'red', weight: 4 } }).addTo(map);
}

button.addEventListener("click", calcolaPercorso);

async function getCoordinates(addressStart, addressEnd) {
    if (!addressStart) {
        console.error("Devi inserire un indirizzo di partenza!");
        alert("Devi inserire un indirizzo di partenza!");

        return;
    }

    if (!addressEnd) {
        console.error("Devi inserire un indirizzo di arrivo!");
        alert("Devi inserire un indirizzo di arrivo!");

        return;
    }

    const urlStart = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressStart)}&format=json&limit=1`;
    const urlEnd = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressEnd)}&format=json&limit=1`;

    let coordsStart = [];
    let coordsEnd = [];

    /*
        Richiesta del primo indirizzo
    */
    try {
        const response = await fetch(urlStart);
        const data = await response.json();

        if (data.length > 0) {
            const lat = data[0].lat;
            const lon = data[0].lon;
            coordsStart.push(lat, lon);
        }
        else {
            console.error("Qualcosa è andato storto!");

            return;
        }
    } catch (error) {
        console.error(error);
        alert(error);

        return;
    }

    /*
        Richiesta del secondo indirizzo
    */
    try {
        const response = await fetch(urlEnd);
        const data = await response.json();

        if (data.length > 0) {
            const lat = data[0].lat;
            const lon = data[0].lon;
            coordsEnd.push(lat, lon);
        }
        else {
            console.error("Qualcosa è andato storto!");

            return;
        }
    } catch (error) {
        console.error(error);
        alert(error);

        return;
    }

    const coords = [coordsStart, coordsEnd];

    return coords;
}