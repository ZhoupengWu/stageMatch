const startIcon = L.divIcon({
    className: 'custom-marker',
    html: `
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
            <defs>
                <linearGradient id="startGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#34a853;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#0f9d58;stop-opacity:1" />
                </linearGradient>
            </defs>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                  fill="url(#startGradient)"
                  stroke="#ffffff"
                  stroke-width="1.5"/>
            <circle cx="12" cy="10" r="3" fill="#ffffff"/>
        </svg>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

const endIcon = L.divIcon({
    className: 'custom-marker',
    html: `
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
            <defs>
                <linearGradient id="endGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#ea4335;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#d33028;stop-opacity:1" />
                </linearGradient>
            </defs>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                  fill="url(#endGradient)"
                  stroke="#ffffff"
                  stroke-width="1.5"/>
            <circle cx="12" cy="10" r="3" fill="#ffffff"/>
        </svg>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

const button = document.getElementById("percorso");

let wait_time;
let mode = "";
let prev_layer = null;
let prev_marker_start = null;
let prev_marker_end = null;
const input_address_start = document.getElementById("address_start");
const input_address_end = document.getElementById("address_end");
const div_suggestion_start = document.getElementById("suggestions_start");
const div_suggestion_end = document.getElementById("suggestions_end");
const initial_coordinates = [45.695, 9.67];

const map = L.map("map").setView([initial_coordinates[0], initial_coordinates[1]], 13);
// const intre = L.marker([45.592, 9.301]).addTo(map);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributori',
}).addTo(map);

const marker = L.marker(initial_coordinates).addTo(map);
marker.bindPopup('Questa è Bergamo').openPopup();

/**
 * Calcola e visualizza il percorso tra due indirizzi sulla mappa.
 *
 * @async
 * @function calcolaPercorso
 * @returns {Promise<void>}
 * @throws {Error} Se la richiesta al backend fallisce (response.ok === false), la risposta non è un GeoJSON valido,
 *                 gli indirizzi non sono stati inseriti o il mezzo di trasporto non è selezionato.
 *
 * @description
 * - Legge gli indirizzi dagli input #address_start e #address_end e valida i valori.
 * - Verifica che sia stato selezionato un mezzo di trasporto (variabile globale `mode`).
 * - Effettua una chiamata GET a /routejson del backend con startaddress, endaddress e routemode.
 * - Rimuove dalla mappa il layer GeoJSON e i marker precedenti se presenti.
 * - Aggiunge il nuovo layer GeoJSON (stile rosso, weight: 4) e posiziona due marker personalizzati (startIcon, endIcon).
 * - Chiude il pannello di controllo (rimuove la classe "open") e adatta la vista della mappa ai bounds del percorso.
 *
 * @sideEffects
 * - Modifica il DOM (chiusura pannello, eventuale visualizzazione di spinner/suggerimenti).
 * - Modifica la mappa Leaflet (rimozione/aggiunta di layer e marker, chiamata a map.fitBounds()).
 */
async function calcolaPercorso() {
    const panel = document.getElementById("controlPanel");

    const address_start = input_address_start.value.trim();
    const address_end = input_address_end.value.trim();

    if (address_start === "") {
        console.error("Devi inserire gli indirizzi!");

        return;
    }

    if (address_end === "") {
        console.error("Devi inserire gli indirizzi!");

        return;
    }

    if (mode === "") {
        console.error("Devi scegliere il mezzo con cui arrivi in destinazione!");

        return;
    }

    const response = await fetch(`http://127.0.0.1:5001/routejson?startaddress=${encodeURIComponent(address_start)}&endaddress=${encodeURIComponent(address_end)}&routemode=${encodeURIComponent(mode)}`);

    if (!response.ok) {
        throw new Error(`Code error: ${response.status} --- ${response}`);
    }

    const data = await response.json();
    const first_coordinates = 0;
    const last_coordinates = data.features[0].geometry.coordinates.length - 1;
    const f_c = data.features[0].geometry.coordinates[first_coordinates];
    const l_c = data.features[0].geometry.coordinates[last_coordinates];

    if (prev_layer && prev_marker_start && prev_marker_end) {
        map.removeLayer(prev_layer);
        prev_marker_start.remove();
        prev_marker_end.remove();

        prev_layer = null;
        prev_marker_start = null;
        prev_marker_end = null;
    }

    panel.classList.remove("open");
    prev_layer = L.geoJSON(data, { style: { color: 'red', weight: 4 } }).addTo(map);
    prev_marker_start = L.marker([f_c[1], f_c[0]], { icon: startIcon }).addTo(map);
    prev_marker_end = L.marker([l_c[1], l_c[0]], { icon: endIcon }).addTo(map);

    if (prev_layer.getBounds) map.fitBounds(prev_layer.getBounds());
}

button.addEventListener("click", calcolaPercorso);

/**
 * Recupera suggerimenti di indirizzi dall'API Photon Komoot basandosi sul valore dell'input.
 *
 * @async
 * @function suggestion
 * @this {HTMLInputElement} L'elemento input che ha invocato la funzione (start o end).
 * @returns {Promise<void>}
 * @throws {Error} Se la richiesta all'API fallisce o la risposta non può essere elaborata.
 *
 * @description
 * - Applica debounce (100ms) tramite la variabile globale `wait_time` prima di mostrare lo spinner e chiamare l'API.
 * - Interroga Photon Komoot con bias geografico (lat/lon da `initial_coordinates`) e limita a 5 risultati.
 * - Estrae via, numero civico, CAP e città dai risultati e popola il relativo container (#suggestions_start o #suggestions_end).
 * - Crea/rimuove uno spinner nell'input wrapper mentre la richiesta è in corso.
 * - Aggiunge listener sui suggerimenti per impostare `this.value`, nascondere la lista e rimuovere lo spinner.
 *
 * @sideEffects
 * - Aggiorna il DOM (spinner, lista suggerimenti, event listeners).
 * - Imposta il valore dell'input invocante tramite `this.value` alla selezione di un suggerimento.
 */
async function suggestion() {
    const address = this.value.trim();

    if (address === "") {
        console.error("Devi inserire l'indirizzo!");

        return;
    }

    let div_suggestion;
    let input_wrapper;

    if (this === input_address_start) {
        div_suggestion = div_suggestion_start;
        input_wrapper = input_address_start.parentElement;
    }
    else {
        div_suggestion = div_suggestion_end;
        input_wrapper = input_address_end.parentElement;
    }

    clearInterval(wait_time);

    wait_time = setTimeout(async () => {
        let input_spinner = input_wrapper.querySelector(".input-spinner");

        if (!input_spinner) {
            input_spinner = document.createElement("div");
            input_spinner.className = "input-spinner";
            input_spinner.innerHTML = `
                <div class="sk-chase">
                    <div class="sk-chase-dot"></div>
                    <div class="sk-chase-dot"></div>
                    <div class="sk-chase-dot"></div>
                    <div class="sk-chase-dot"></div>
                    <div class="sk-chase-dot"></div>
                    <div class="sk-chase-dot"></div>
                </div>
            `;
            input_wrapper.appendChild(input_spinner);
        }

        div_suggestion.innerHTML = `
            <div class="sk-chase">
                <div class="sk-chase-dot"></div>
                <div class="sk-chase-dot"></div>
                <div class="sk-chase-dot"></div>
                <div class="sk-chase-dot"></div>
                <div class="sk-chase-dot"></div>
                <div class="sk-chase-dot"></div>
            </div>
        `;
        div_suggestion.classList.remove("not-visible");
    }, 100);

    try {
        const response = await fetch(
            `https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&lat=${initial_coordinates[0]}&lon=${initial_coordinates[1]}&limit=5&lang=en`
        );

        if (!response.ok) {
            throw new Error(`Code error: ${response.status} --- ${response}`);
        }

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

        const input_spinner = input_wrapper.querySelector(".input-spinner");

        if (input_spinner) input_spinner.remove();

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
    } finally {
        const input_spinner = input_wrapper.querySelector(".input-spinner");

        if (input_spinner) input_spinner.remove();
    }
}

input_address_start.addEventListener("blur", suggestion);
input_address_end.addEventListener("blur", suggestion);

// GESTIONE TOGGLE PANNELLO
document.addEventListener("DOMContentLoaded", () => {
    const panel = document.getElementById("controlPanel");
    const toggle = document.getElementById("togglePanel");

    if (!panel || !toggle) {
        console.error("Panel o toggle non trovati");
        return;
    }

    toggle.addEventListener("click", () => {
        panel.classList.toggle("open");

        if (panel.classList.contains("open")) {
            console.log("Pannello aperto");
        } else {
            console.log("Pannello chiuso");
        }
    });

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
            document.querySelectorAll(".mode").forEach(b => b.classList.remove("active"));

            btn.classList.add("active");
            mode = btn.dataset.mode;
            console.log("Mezzo selezionato:", mode);
        });
    });
});