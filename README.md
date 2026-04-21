# stageMatch

Applicazione Flask per gestire l'accesso degli utenti, raccogliere i dati di profilo e visualizzare percorsi su mappa tra due indirizzi.

## Descrizione

**stageMatch** integra un front-end Flask con autenticazione SSO, completamento del primo accesso, informativa privacy, profilo utente e una mappa interattiva. La parte geografica usa OpenStreetMap, Photon/Nominatim per la ricerca degli indirizzi e OpenRouteService per il calcolo del percorso.

Il progetto contiene due servizi Flask:

- `app.py`: applicazione principale, pagine HTML, autenticazione, profilo utente e proxy verso le API geografiche.
- `server.py`: API locale di supporto per geocoding e routing, in ascolto su `127.0.0.1:5001`.

La directory `test_auth/` contiene un esempio separato di blueprint SSO riutilizzabile.

## Funzionalità

- Autenticazione SSO con modalità `production` e modalità `dev` per lo sviluppo locale.
- Completamento del profilo al primo accesso con consenso privacy versionato.
- Area utente autenticata con homepage, profilo e mappa.
- Ricerca indirizzi con suggerimenti tramite Photon.
- Calcolo percorsi tramite OpenRouteService, con supporto per auto, bici e tragitti a piedi.
- Mappa interattiva basata su Leaflet e dati OpenStreetMap.
- Database locale gestito con SQLAlchemy.

## Tecnologie

| Categoria | Tecnologie |
|---|---|
| Backend | Python, Flask, Flask-CORS, Werkzeug |
| Autenticazione | PyJWT, middleware SSO in `auth/` |
| Database | SQLAlchemy |
| Frontend | HTML, CSS, JavaScript |
| Mappe | Leaflet, OpenStreetMap |
| API geografiche | OpenRouteService, Photon, Nominatim |
| HTTP | requests, aiohttp |

## Requisiti

- Python 3.10+
- Browser moderno
- Connessione internet per mappe e servizi geografici
- Chiave OpenRouteService (`ORS_API_KEY`) per il calcolo dei percorsi

## Installazione

Clona il repository e prepara l'ambiente:

```bash
git clone https://github.com/ZhoupengWu/stageMatch.git
cd stageMatch
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Su Windows l'attivazione dell'ambiente virtuale è:

```bash
.venv\Scripts\activate
```

## Configurazione

Copia il template delle variabili d'ambiente:

```bash
cp .env.example .env
```

Imposta almeno questi valori per lo sviluppo locale:

```env
ORS_API_KEY=la-tua-chiave-openrouteservice
SSO_MODE=dev
DEV_USER_EMAIL=demo@example.com
SERVER_SECRET_KEY=una-stringa-lunga-e-casuale
PORTAL_URL=http://127.0.0.1:5000
DB_CONNECTION_STRING=users.db
PORT=5000
DEBUG=True
PRIVACY_POLICY_VERSION=2026-04-21
```

In produzione imposta anche:

```env
SSO_MODE=production
JWT_SECRET=segreto-condiviso-con-il-portale-sso
APP_AUDIENCE=identificativo-app
DEBUG=False
```

Ottieni una chiave OpenRouteService da <https://openrouteservice.org/dev/#/signup>.

## Avvio

Avvia il backend geografico:

```bash
python server.py
```

Il servizio ascolta su `http://127.0.0.1:5001`.

In un secondo terminale, con lo stesso virtualenv attivo, avvia l'app principale:

```bash
python app.py
```

L'app ascolta sulla porta configurata in `.env` con `PORT`. Con la configurazione consigliata è disponibile su `http://127.0.0.1:5000`.

## Sviluppo con SSO simulato

Con `SSO_MODE=dev` non serve un portale SSO reale. Puoi avviare una sessione visitando:

```text
http://127.0.0.1:5000/dev/login
```

Oppure puoi simulare un utente specifico:

```text
http://127.0.0.1:5000/auth/login?email=utente@example.com
```

Al primo accesso l'app reindirizza al completamento del profilo. Dopo il salvataggio del profilo, l'utente accede alla homepage e alla mappa.

## Utilizzo

1. Avvia `server.py` e `app.py`.
2. Esegui il login in modalità dev o tramite portale SSO in produzione.
3. Completa il profilo se è il primo accesso.
4. Apri la mappa dall'area autenticata.
5. Inserisci indirizzo di partenza e destinazione.
6. Scegli il mezzo di trasporto e calcola il percorso.

## Endpoint principali

### Applicazione (`app.py`)

| Metodo | Endpoint | Accesso | Descrizione |
|---|---|---|---|
| `GET` | `/` | Pubblico | Landing page |
| `GET` | `/login` | Pubblico | Pagina di login |
| `GET` | `/privacy` | Pubblico | Informativa privacy |
| `GET` | `/auth/login` | Pubblico | Callback SSO o login simulato in dev |
| `GET` | `/auth/logout` | Autenticato | Logout |
| `GET`, `POST` | `/logged/complete` | Autenticato | Completamento profilo |
| `GET` | `/logged/homepage` | Autenticato | Homepage utente |
| `GET` | `/logged/map` | Autenticato | Mappa |
| `GET` | `/dev/login` | Solo dev | Shortcut per login simulato |
| `GET` | `/api/users/profile` | Autenticato | Profilo utente in JSON |
| `POST` | `/api/users/profile/save` | Autenticato | Salvataggio profilo |
| `POST` | `/photon` | Autenticato | Proxy verso il backend Photon |
| `POST` | `/routejson` | Autenticato | Proxy verso il backend routing |

### Backend geografico (`server.py`)

| Metodo | Endpoint | Descrizione |
|---|---|---|
| `GET` | `/photon` | Suggerimenti indirizzi da Photon |
| `GET` | `/routejson` | Percorso GeoJSON da OpenRouteService |

Esempio:

```text
GET http://127.0.0.1:5001/routejson?startaddress=Milano&endaddress=Roma&routemode=driving-car
```

Parametri di `/routejson`:

- `startaddress`: indirizzo di partenza.
- `endaddress`: indirizzo di arrivo.
- `routemode`: modalità OpenRouteService, per esempio `driving-car`, `foot-walking` o `cycling-regular`.

## Struttura del progetto

```text
stageMatch/
├── app.py                       # Applicazione Flask principale
├── server.py                    # Backend API per geocoding e routing
├── requirements.txt             # Dipendenze Python
├── .env.example                 # Template configurazione locale
├── auth/                        # Autenticazione e middleware SSO
├── database/                    # Helper database e modelli SQLAlchemy
├── resources/
│   ├── html/                    # Template HTML
│   ├── css/                     # Stili
│   ├── js/                      # Script frontend
│   └── img/                     # Immagini
├── test_auth/                   # Esempio separato di blueprint SSO
├── snapshots/                   # Documenti PDF del progetto
├── CONTRIBUTING.md              # Linee guida per contribuire
├── LICENSE                      # Licenza Apache 2.0
└── NOTICE                       # Riconoscimenti e attribuzioni
```

## Testing e verifica manuale

Non è presente una test suite top-level. Per validare una modifica:

- avvia `python server.py` e `python app.py`;
- verifica login dev o SSO, completamento profilo e logout;
- controlla homepage, salvataggio profilo e consenso privacy;
- prova suggerimenti indirizzo, rendering mappa e generazione percorso;
- se tocchi `auth/` o flussi SSO, verifica anche l'app in `test_auth/`.

## Troubleshooting

| Problema | Soluzione |
|---|---|
| L'app parte su una porta inattesa | Controlla `PORT` nel file `.env`. |
| Login dev non funziona | Verifica `SSO_MODE=dev`, `SERVER_SECRET_KEY` e `DEV_USER_EMAIL`. |
| Redirect logout verso un URL inatteso | Controlla `PORTAL_URL`. |
| Percorsi non calcolati | Verifica `ORS_API_KEY` e che `server.py` sia avviato su `127.0.0.1:5001`. |
| Suggerimenti o mappe non caricano | Verifica la connessione internet e l'accesso ai servizi OpenStreetMap/Photon. |
| Errori CORS | Verifica che l'app principale usi `127.0.0.1:5000` o aggiorna le origini in `server.py`. |

## Contribuire

Leggi [CONTRIBUTING.md](./CONTRIBUTING.md) per branch, commit e Pull Request.

## Licenza e attribuzioni

Il progetto è distribuito sotto licenza Apache License 2.0. Consulta [LICENSE](./LICENSE) per il testo completo.

Le attribuzioni del progetto e dei servizi di terze parti sono raccolte in [NOTICE](./NOTICE).

## Autori

- [Zhoupeng Wu](https://github.com/ZhoupengWu) - sviluppo front-end, back-end e documentazione.
- [Riccardo Bertuletti](https://github.com/Bertu08) - sviluppo front-end.
- [Viktor Kachan](https://github.com/Relunax255) - sviluppo back-end.
