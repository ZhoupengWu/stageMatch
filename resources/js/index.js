const button = document.getElementById("percorso");

const input_address_start = document.getElementById("address_start");
const input_address_end = document.getElementById("address_end");
const div_suggestion_start = document.getElementById("suggestions_start");
const div_suggestion_end = document.getElementById("suggestions_end");
const initial_coordinates = [45.695, 9.67];

const map = L.map("map").setView([initial_coordinates[0], initial_coordinates[1]], 13);
const intre = L.marker([45.592, 9.301]).addTo(map);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributori',
}).addTo(map);

const marker = L.marker([45.695, 9.67]).addTo(map);
marker.bindPopup('Questa è Bergamo').openPopup();

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

/**
 * Fetches address suggestions from the Photon Komoot API based on user input.
 * Displays matching addresses in a dropdown and handles selection.
 *
 * @async
 * @function suggestion
 * @this {HTMLInputElement} - The input element whose value is used for the address query
 * @returns {Promise<void>}
 * @throws {Error} If the API request fails or the response cannot be parsed
 *
 * @description
 * - Trims and encodes the input address
 * - Queries the Photon API with coordinates and language preferences
 * - Parses response features into address objects (street, number, postal code, city)
 * - Renders suggestions as clickable links in the appropriate suggestion div
 * - Attaches click listeners to populate the input field and hide suggestions on selection
 */
async function suggestion() {
    const address = this.value.trim();
    let div_suggestion;

    if (this === input_address_start) div_suggestion = div_suggestion_start;
    else div_suggestion = div_suggestion_end;

    try {
        const response = await fetch(
            `https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&lat=${initial_coordinates[0]}&lon=${initial_coordinates[1]}&limit=5&lang=en`
        );

        const data = await response.json();
        const data_address = data.features.map((feature, index) => (
            {
                id: index,
                indirizzo_via: feature.properties.street || feature.properties.name,
                indirizzo_civico: feature.properties.housenumber || "",
                indirizzo_cap: feature.properties.postcode,
                indirizzo_city: feature.properties.city
            }
        ));

        const data_address_html = data_address.map(data => {
            return `
            <a href="#" id="${data.id}">${data.indirizzo_via} ${data.indirizzo_civico} ${data.indirizzo_cap} ${data.indirizzo_city}</a>
            `
        });

        div_suggestion.innerHTML = data_address_html.join('');
        div_suggestion.classList.remove("not-visible");

        for (let i = 0; i < data_address_html.length; ++i) {
            const dah = document.getElementById(`${i}`);
            dah.addEventListener("click", () => {
                this.value = dah.textContent;
                div_suggestion.classList.add("not-visible");
                div_suggestion.innerHTML = "";
            });
        }
    } catch (error) {
        throw new Error(error);
    }
}

input_address_start.addEventListener("blur", suggestion);
input_address_end.addEventListener("blur", suggestion);

// GESTIONE TOGGLE PANNELLO CON ROTAZIONE FRECCIA
document.addEventListener("DOMContentLoaded", () => {
    const panel = document.getElementById("controlPanel");
    const toggle = document.getElementById("togglePanel");

    if (!panel || !toggle) {
        console.error("Panel o toggle non trovati");
        return;
    }

    // Event listener per aprire/chiudere il pannello
    // La rotazione della freccia è gestita automaticamente dal CSS!
    toggle.addEventListener("click", () => {
        panel.classList.toggle("open");

        // Log opzionale per debug
        if (panel.classList.contains("open")) {
            console.log("Pannello aperto - Freccia ruotata ◀");
        } else {
            console.log("Pannello chiuso - Freccia normale ▶");
        }
    });

    // Opzionale: chiudi il pannello premendo ESC
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && panel.classList.contains("open")) {
            panel.classList.remove("open");
            console.log("Pannello chiuso con ESC");
        }
    });
});

// GESTIONE MEZZI DI TRASPORTO
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".transport-modes .mode").forEach(btn => {
        btn.addEventListener("click", () => {
            // Rimuovi active da tutti
            document.querySelectorAll(".mode").forEach(b => b.classList.remove("active"));

            // Aggiungi active a quello cliccato
            btn.classList.add("active");

            const mode = btn.dataset.mode;
            console.log("Mezzo selezionato:", mode);

            // Qui puoi aggiungere la logica per cambiare il tipo di routing
            // Es: aggiorna il calcolo del percorso in base al mezzo
        });
    });
});