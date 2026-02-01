const button = document.getElementById("percorso");

let mode = "";
let prev_layer = null;
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
 * @throws {Error} Se la richiesta al backend fallisce, gli indirizzi non sono validi o il mezzo di trasporto non è selezionato
 *
 * @description
 * - Recupera gli indirizzi di partenza e arrivo dagli input
 * - Valida che entrambi gli indirizzi e il mezzo di trasporto siano stati inseriti
 * - Effettua una richiesta al backend per ottenere il percorso in formato GeoJSON
 * - Rimuove il percorso precedente se presente
 * - Visualizza il nuovo percorso sulla mappa con stile rosso
 * - Adatta la vista della mappa ai confini del percorso
 */
async function calcolaPercorso() {
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

    if (prev_layer) {
        map.removeLayer(prev_layer);
        prev_layer = null;
    }

    prev_layer = L.geoJSON(data, { style: { color: 'red', weight: 4 } }).addTo(map);

    if (prev_layer.getBounds) map.fitBounds(prev_layer.getBounds());
}

button.addEventListener("click", calcolaPercorso);

/**
 * Recupera suggerimenti di indirizzi dall'API Photon Komoot in base all'input dell'utente.
 * Mostra gli indirizzi corrispondenti in un menu a tendina e gestisce la selezione.
 *
 * @async
 * @function suggestion
 * @this {HTMLInputElement} L'elemento input il cui valore viene usato per la ricerca dell'indirizzo
 * @returns {Promise<void>}
 * @throws {Error} Se la richiesta all'API fallisce o la risposta non può essere elaborata
 *
 * @descrizione
 * - Pulisce e codifica l'indirizzo inserito dall'utente
 * - Interroga l'API Photon con coordinate e lingua preferita
 * - Estrae le informazioni degli indirizzi (via, civico, CAP, città) dalla risposta
 * - Visualizza i suggerimenti come link cliccabili nel relativo menu a tendina
 * - Gestisce il click sui suggerimenti per compilare l'input e nascondere il menu
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