let map = L.map('map').setView([0,0], 13); 
let currentLayer = null;
let currentMarker = null;
const DIV_RESULT = document.getElementById("result");
function displayMap() {
  

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
}
function showPath(coords) {
  if (currentLayer!=null) map.removeLayer(currentLayer);
  if (currentMarker!=null) map.removeLayer(currentMarker);
  // 2. OpenRouteService routing request
  const apiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjYzNjJmMmZlNDJkZTRmM2Y5NzYwODI3YWZjMDFhNmMzIiwiaCI6Im11cm11cjY0In0=";
  const url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson";

  const requestBody = {
    coordinates: [
      [coords.Start.Lon, coords.Start.Lat],  // Point A
      [coords.End.Lon, coords.End.Lat]   // Point B
    ]
  };
  try {
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
    currentLayer = L.geoJSON(data, { style: { color: 'red', weight: 4 } }).addTo(map);
    currentMarker = L.marker([coords.End.Lat, coords.End.Lon]).addTo(map);
    map.setView([coords.End.Lat, coords.End.Lon], 10);
  });
  }
  catch (error) {DIV_RESULT.innerText="Errore nella ricerca del percorso: " + error}
}
let btnPercorso = document.getElementById("btnPercorso");
let tbindirizzoPartenza = document.getElementById("tbindirizzopartenza");
let tbindirizzoArrivo = document.getElementById("tbindirizzoarrivo");
btnPercorso.addEventListener("click", async () => {
    
    let coords = await getCoordinates(tbindirizzoPartenza.value, tbindirizzoArrivo.value);
    //let coords = await getCoordinates("via Giacomo Quarenghi, Bergamo", "via Mauro Gavazzeni, Bergamo");
    //alert("latitudine arrivo: " + coords.CoordsEnd.Lat.toString() + " longitudine arrivo: " + coords.CoordsEnd.Lon.toString());
    showPath(coords);
    

});

async function getCoordinates(addressStart, addressEnd) {
    /*quando i dati li prenderemo dai db è preferibile che la stringa dell'indirizzo sia 

          Via {nome} {numero}, {CAP} {città}

      per evitare possibili ambiguità */
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
            coordsStart.push(lat);
            coordsStart.push(lon);
       //   alert(`Lat: ${lat}, Lon: ${lon}`);
        } else {
            alert("Indirizzo non trovato");
        }
    } catch (error) {
       alert(error);
        DIV_RESULT.textContent = "Errore nella richiesta conversione indirizzo partenza";
    }
    try {
        const response = await fetch(urlEnd);
        const data = await response.json();

        if (data.length > 0) {
            const lat = data[0].lat;
            const lon = data[0].lon;
            coordsEnd.push(lat);
            coordsEnd.push(lon);
           // alert(`Lat: ${lat}, Lon: ${lon}`);
            
        } else {
            alert("Indirizzo non trovato");
        }
    } catch (error) {
       alert(error);
        DIV_RESULT.textContent = "Errore nella richiesta conversione indirizzo arrivo";
    }
    let coords = {
      Start: {
        Lat: coordsStart[0],
        Lon: coordsStart[1]
      },
      End: {
        Lat: coordsEnd[0],
        Lon: coordsEnd[1]
      }

    }
    return coords;

}
window.addEventListener("load", () => {
  displayMap();
})