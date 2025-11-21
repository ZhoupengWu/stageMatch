function displayMap() {
    const map = L.map('map').setView([45.680, 9.7000], 13); 

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
}
function showPath() {
  
  // 2. OpenRouteService routing request
  const apiKey = "  eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjYzNjJmMmZlNDJkZTRmM2Y5NzYwODI3YWZjMDFhNmMzIiwiaCI6Im11cm11cjY0In0=";
  const url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson";

  const requestBody = {
    coordinates: [
      [9.66, 45.697],  // Point A
      [9.703, 45.672]   // Point B
    ]
  };

  fetch(url, {
    method: "POST",
    headers: {
      "Authorization": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  })
  .then(res => res.json())
  .then(data => {
    // 3. Draw the route on the map
    L.geoJSON(data, { style: { color: 'red', weight: 4 } }).addTo(map);
  });
}
let btn1 = document.getElementById("btn1");
let tbindirizzoPartenza = document.getElementById("tbindirizzopartenza");
let tbindirizzoArrivo = document.getElementById("tbindirizzoarrivo");
    btn1.addEventListener("click", async () => {
        
        let coords = await getCoordinates(tbindirizzoPartenza.value, tbindirizzoArrivo.value);
        
    });

async function getCoordinates(addressStart, addressEnd) {
   
    if (!addressStart || !addressEnd)
        {alert("inserire gli indirizzi partenza e arrivo"); return;}

    const urlStart = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressStart)}&format=json&limit=1`;
    const urlEnd = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressEnd)}&format=json&limit=1`;
    let coordsStart = [];
    let coordsEnd = [];

    try {
        const response = await fetch(urlStart);
        const data = await response.json();

        if (data.length > 0) {
            const lat = data[0].lat;
            const lon = data[0].lon;
            coordsStart.push(lat, lon);
          alert(`Lat: ${lat}, Lon: ${lon}`);
        } else {
            alert("Indirizzo non trovato");
        }
    } catch (error) {
       alert(error);
        document.getElementById('result').textContent = "Errore nella richiesta conversione indirizzo partenza";
    }
    try {
        const response = await fetch(urlEnd);
        const data = await response.json();

        if (data.length > 0) {
            const lat = data[0].lat;
            const lon = data[0].lon;
            coordsEnd.push(lat, lon);
            alert(`Lat: ${lat}, Lon: ${lon}`);
            
        } else {
            alert("Indirizzo non trovato");
        }
    } catch (error) {
       alert(error);
        document.getElementById('result').textContent = "Errore nella richiesta conversione indirizzo arrivo";
    }
    let coords = [coordsStart, coordsEnd];
    return coords;

}