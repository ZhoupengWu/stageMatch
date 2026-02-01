# 🗺️ stageMatch

Trova il percorso migliore verso la tua destinazione con un'interfaccia moderna e intuitiva.

## 📋 Descrizione

**stageMatch** è un'applicazione web full-stack che consente agli utenti di calcolare e visualizzare percorsi tra due indirizzi su una mappa interattiva. L'applicazione supporta molteplici mezzi di trasporto (auto, bicicletta, a piedi) e fornisce suggerimenti di indirizzi in tempo reale.

## ✨ Funzionalità

- 🛣️ **Calcolo percorsi avanzato** - Calcola rotte ottimizzate tramite OpenRouteService API
- 🗺️ **Mappa interattiva** - Visualizzazione con Leaflet.js basata su OpenStreetMap
- 🔍 **Suggerimenti indirizzi in tempo reale** - Autocomplete tramite API Photon Komoot
- 🚗 **Selezione mezzo di trasporto** - Supporto per auto, bicicletta e percorsi a piedi
- 🎨 **Interfaccia moderna** - Design responsivo con pannello di controllo collapsibile
- ⌨️ **Accessibilità** - Supporto per tastiera (ESC per chiudere il pannello) e riduzione movimento

## 🛠️ Tecnologie utilizzate

| Categoria | Tecnologie |
|-----------|-----------|
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla) |
| **Librerie JS** | Leaflet.js 1.9.4 (mappe), Bootstrap 4.3.1 |
| **API esterne** | Photon Komoot (geocoding), OpenRouteService (routing), Nominatim (geocoding) |
| **Backend** | Python Flask 3.1.2, Flask-CORS |
| **Dati geografici** | OpenStreetMap |
| **HTTP Async** | aiohttp, asyncio |

## 📦 Requisiti

- Python 3.10+
- Browser moderno con supporto ES6+
- Chiave API OpenRouteService (ORS_API_KEY)

## 🚀 Installazione

### 1. Clona il repository
```bash
git clone https://github.com/ZhoupengWu/stageMatch.git
cd stageMatch
```

### 2. Configura l'ambiente Python
```bash
# Crea un ambiente virtuale
python -m venv .venv

# Attiva l'ambiente
# Su Windows:
.venv\Scripts\activate

# Su macOS/Linux:
source .venv/bin/activate
```

### 3. Installa le dipendenze
```bash
pip install -r requirements.txt
```

### 4. Configura le variabili d'ambiente
Crea un file `.env` nella root del progetto:
```env
ORS_API_KEY=your_openrouteservice_api_key_here
```

Ottieni una chiave API gratuita su [OpenRouteService](https://openrouteservice.org/dev/#/signup)

### 5. Avvia i server

**Front-end:**
```bash
python app.py
# Applicazione disponibile su http://127.0.0.1:5000
```

**Back-end (API):**
```bash
python server.py
# Server in ascolto su http://127.0.0.1:5001
```

### 6. Apri l'applicazione
Visita `http://127.0.0.1:5000` nel tuo browser

## 📖 Utilizzo

1. **Inserisci partenza** - Digita l'indirizzo di partenza nel primo campo
2. **Suggerimenti** - Vedrai suggerimenti automatici mentre digiti
3. **Seleziona destinazione** - Ripeti per l'indirizzo di arrivo
4. **Scegli mezzo** - Clicca su 🚗 (auto), 🚶 (a piedi) o 🚴 (bicicletta)
5. **Calcola** - Clicca "Mostra Percorso"
6. **Visualizza** - La rotta apparirà in rosso sulla mappa

### Scorciatoie da tastiera
- **ESC** - Chiudi il pannello di controllo

## 📂 Struttura del progetto

```
stageMatch/
├── app.py                          # Server Flask frontend
├── server.py                       # Server Flask API backend
├── requirements.txt                # Dipendenze Python
├── .env                            # Variabili d'ambiente (da creare)
├── .gitignore
├── .gitattributes
├── .editorconfig
├── README.md                       # Documentazione
├── CONTRIBUTING.md                 # Linee guida contributori
├── resources/
│   ├── html/
│   │   └── index.html              # Pagina principale
│   ├── js/
│   │   └── index.js                # Logica applicazione
│   └── css/
│       └── index.css               # Stili
└── snapshots/                      # Documenti pdf del progetto
```

## 🔧 Endpoint API

### `GET /routejson`
Calcola un percorso tra due indirizzi

**Parametri:**
- `startaddress` - Indirizzo di partenza
- `endaddress` - Indirizzo di destinazione
- `routemode` - Mezzo di trasporto (driving-car, foot-walking, cycling-regular)

**Esempio:**
```
GET http://127.0.0.1:5001/routejson?startaddress=Milano&endaddress=Roma&routemode=driving-car
```

**Risposta:** GeoJSON con la geometria del percorso

## 🐛 Troubleshooting

| Problema | Soluzione |
|----------|-----------|
| CORS errors | Verifica che backend giri su `http://127.0.0.1:5001` |
| Chiave API non valida | Controlla il file `.env` e la chiave ORS |
| Indirizzi non trovati | Usa indirizzi completi o cambia il bias geografico |
| Mappa non carica | Verifica la connessione a internet (richiede OSM) |

## 🤝 Come contribuire

Leggi le [Linee Guida per i Contributori](./CONTRIBUTING.md) per:
- Naming dei branch
- Convenzioni nei commit
- Processo di Pull Request

## 📄 Licenza

Questo progetto è sotto licenza di the Apache License 2.0.
See the [LICENSE](./LICENSE) file for details.

This project uses third-party libraries and services.
See the [NOTICE](./NOTICE) file for attributions.

## 👨‍💻 Autori

- Team di sviluppo stageMatch

## 🙏 Ringraziamenti

- OpenStreetMap per i dati geografici
- Leaflet.js per la libreria mappe
- OpenRouteService per il routing
- Photon Komoot per il geocoding