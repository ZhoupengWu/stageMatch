# SSO Blueprint - Template di integrazione SSO

Questo README riguarda solo l'applicazione di esempio in `test_auth/`.
Per l'app principale consulta il README nella root del repository.

Applicazione Flask **minimale e documentata** da usare come punto di partenza
per qualsiasi team che deve integrare il portale SSO centralizzato nella propria applicazione.

Il blueprint non fa nulla di utile di per sé: contiene solo l'ossatura - autenticazione,
struttura delle route, template, file statici - che ogni team dovrà riempire con
la propria logica di business.

---

## Struttura del progetto

```
sso-blueprint/
│
├── app.py                        # Applicazione Flask principale
├── requirements.txt
├── .env.example                  # Template variabili d'ambiente - copiare in .env
├── ecosystem.config.js           # Configurazione PM2 per production
├── start.sh                      # Script di avvio Linux
│
├── shared_modules/
│   ├── __init__.py
│   └── sso_middleware.py         # Middleware SSO - copiare nella propria app
│                                 #    Contiene: SSOMiddleware, WhitelistManager, RateLimiter
│
├── templates/
│   ├── base.html                 # Layout comune autenticato (header, nav, footer)
│   │                             # Carica static/css/main.css e static/js/main.js
│   ├── index.html                # Landing page pubblica, non estende base.html
│   ├── dashboard.html            # Pagina riservata - Dashboard
│   ├── reports.html              # Pagina riservata - Reports
│   └── settings.html             # Pagina riservata - Impostazioni utente
│
├── static/
│   ├── css/
│   │   └── main.css              # Stili globali: variabili, layout, tutti i componenti
│   ├── js/
│   │   └── main.js               # Utility JS: toast, confirm dialog, nav attiva, session timer
│   └── img/
│       └── favicon.svg           # Favicon SVG
│
└── data/
    └── whitelist.json            # Creato automaticamente al primo avvio
```

---

## Pagine dell'applicazione

| URL | Accesso | Descrizione |
|---|---|---|
| `/` | **Pubblico** | Landing page con link al login SSO |
| `/sso/login` | Pubblico | Callback SSO: riceve il JWT dal portale o simula il login in dev |
| `/logout` | Autenticato | Logout + redirect al portale SSO |
| `/dashboard` | 🔒 Riservato | Area principale per l'utente autenticato |
| `/reports` | 🔒 Riservato | Esempio di seconda pagina riservata |
| `/settings` | 🔒 Riservato | Preferenze utente |
| `/api/session-stats` | 🔒 Riservato | JSON con statistiche sessioni attive |
| `/dev/auto-login` | Solo dev | Shortcut per login simulato (403 in production) |

---

## Flusso SSO - production

```
Utente → Portale SSO checkin
       → il portale genera un JWT firmato e reindirizza a:
         https://tua-app.example.com/sso/login?token=<JWT>
       → l'app valida il JWT
       → verifica whitelist
       → verifica rate limit
       → crea sessione Flask
       → redirect a /dashboard
```

```
Logout → /logout
       → session.clear() + rimozione sessione dal RateLimiter
       → redirect al Portale SSO
```

---

## Configurazione - .env

Copia `.env.example` in `.env` e compila i valori:

```bash
cp .env.example .env
```

| Variabile | Obbligatoria | Descrizione |
|---|---|---|
| `SSO_MODE` | ✅ | `production` oppure `dev` |
| `JWT_SECRET` | Sì, in production | Secret condiviso col portale SSO; deve essere identico |
| `APP_AUDIENCE` | Sì, in production | Identificativo univoco dell'app nel JWT, per esempio `mia-app` |
| `PORTAL_URL` | Sì | URL del portale SSO, usato per redirect login e logout |
| `SERVER_SECRET_KEY` | Sì | Secret Flask per firmare i cookie di sessione |
| `DEV_USER_EMAIL` | Solo dev | Email predefinita in modalità dev (default: `demo@example.com`) |
| `MAX_SESSIONS_PER_USER` | No | Max sessioni simultanee per utente (default: `3`) |
| `MAX_SESSIONS_GLOBAL` | No | Max sessioni attive totali nell'app (default: `100`) |
| `PORT` | No | Porta dell'applicazione (default: `3020`) |
| `DEBUG` | No | `True` o `False`; mai `True` in production |

---

## Modalità sviluppo (SSO_MODE=dev)

In modalità `dev` **non serve il portale SSO reale**. Il meccanismo di autenticazione
è completamente simulato: basta chiamare `/sso/login` direttamente dal browser,
senza fornire alcun JWT. Il token non viene richiesto né validato.

### Configurazione minima per dev

Nel file `.env`:

```env
SSO_MODE=dev
DEV_USER_EMAIL=tuanome@example.com
SERVER_SECRET_KEY=qualsiasi-stringa-va-bene-in-dev
PORTAL_URL=http://localhost:5000
```

`JWT_SECRET` e `APP_AUDIENCE` **non sono necessari** in modalità dev.

### Avvio

```bash
python app.py
```

L'app parte su `http://localhost:3020`.

### Come fare il login in dev

Esistono tre modi, tutti equivalenti. In tutti i casi l'app crea la sessione e
reindirizza automaticamente a `/dashboard`.

---

**Metodo 1 - shortcut `/dev/auto-login`**

```
http://localhost:3020/dev/auto-login
```

Reindirizza a `/sso/login` usando l'email impostata in `DEV_USER_EMAIL` nel `.env`.
Il modo più rapido per avviare una sessione durante lo sviluppo.

> Questa route restituisce **403** in modalità production.

---

**Metodo 2 - `/sso/login` senza parametri**

```
http://localhost:3020/sso/login
```

Identico al metodo 1: usa `DEV_USER_EMAIL` dal `.env`.

---

**Metodo 3 - `/sso/login?email=...` con email personalizzata**

```
http://localhost:3020/sso/login?email=mario.rossi@azienda.com
```

Permette di simulare il login come un utente specifico senza modificare il `.env`.
Utile per testare scenari diversi nella stessa sessione di sviluppo:

```
# Utente normale
http://localhost:3020/sso/login?email=utente@azienda.com

# Admin
http://localhost:3020/sso/login?email=admin@azienda.com

# Utente non in whitelist (per testare il rifiuto)
http://localhost:3020/sso/login?email=nonautorizzato@altro.com
```

---

### Logout in dev

Il logout funziona come in modalità production:
`/logout` pulisce la sessione Flask, rimuove la sessione dal RateLimiter
e reindirizza a `PORTAL_URL`.

In dev `PORTAL_URL` punta tipicamente al portale in locale (`http://localhost:5000`).
Se il portale non è attivo, il browser mostrerà un errore di connessione:
la sessione è già stata pulita correttamente.

---

### Testare la whitelist in dev

1. Abilita la whitelist modificando `data/whitelist.json`:

```json
{
  "enabled": true,
  "emails": [
    "autorizzato@example.com"
  ]
}
```

2. Login con utente autorizzato: accede normalmente alla dashboard.

```
http://localhost:3020/sso/login?email=autorizzato@example.com
```

3. Login con utente non in lista: pagina di errore 403.

```
http://localhost:3020/sso/login?email=nonautorizzato@example.com
```

---

## Avvio in production

```bash
bash start.sh
```

Lo script crea il virtualenv se non esiste, installa le dipendenze e avvia l'app.

Con PM2:

```bash
pm2 start ecosystem.config.js
```

---

## Proteggere una route

Il decorator `@sso_middleware.sso_login_required` è tutto ciò che serve:

```python
@app.route('/mia-pagina-riservata')
@sso_middleware.sso_login_required
def mia_pagina():
    user = session['user']   # dict con: email, name, picture, googleId, authenticated_at
    return render_template('mia_pagina.html', user=user, portal_url=SSO_CONFIG['portal_url'])
```

Il decorator verifica automaticamente:
- che esista una sessione Flask valida
- che la sessione sia ancora registrata nel RateLimiter (non scaduta lato server)
- aggiorna il timestamp `last_seen` ad ogni request

---

## Aggiungere una nuova pagina riservata

**1.** Crea `templates/mia_pagina.html` estendendo `base.html`:

```html
{% extends 'base.html' %}
{% block title %}Mia Pagina — Blueprint App{% endblock %}

{% block extra_head %}
<style>
  /* stili specifici di questa pagina */
</style>
{% endblock %}

{% block content %}
<div class="page-header">
    <h1>Mia Pagina</h1>
    <p>Descrizione breve.</p>
</div>
<div class="card">
    <!-- contenuto -->
</div>
{% endblock %}
```

**2.** Aggiungi la route in `app.py`:

```python
@app.route('/mia-pagina')
@sso_middleware.sso_login_required
def mia_pagina():
    user = session['user']
    return render_template('mia_pagina.html', user=user, portal_url=SSO_CONFIG['portal_url'])
```

**3.** Aggiungi il link nella nav di `templates/base.html`:

```html
<a href="{{ url_for('mia_pagina') }}"
   class="nav-link {% if request.endpoint == 'mia_pagina' %}active{% endif %}">
    Mia Pagina
</a>
```

---

## Static files

### main.css — classi disponibili

| Componente | Classi principali |
|---|---|
| Layout | `.main-content`, `.page-header` |
| Header | `.app-header`, `.header-brand`, `.header-nav`, `.nav-link.active`, `.header-user` |
| Card | `.card`, `.card-title`, `.card-subtitle` |
| Alert | `.alert-success`, `.alert-error`, `.alert-warning`, `.alert-info` |
| Bottoni | `.btn-primary`, `.btn-secondary`, `.btn-danger` |
| Form | `.form-group`, `.label-hint` |
| Tabelle | `.data-table` |
| Badge | `.badge-success`, `.badge-warning`, `.badge-info`, `.badge-neutral` |
| Griglie | `.grid-2`, `.grid-3`, `.grid-4`, `.grid-auto` |
| Utility | `.text-muted`, `.text-small`, `.flex-between`, `.mt-*`, `.mb-*` |

### main.js — funzionalità

Attivate automaticamente al caricamento di ogni pagina:

- **Auto-dismiss** — elementi `.alert[data-autodismiss="5000"]` spariscono dopo N ms
- **Confirm dialog** — `data-confirm="Sei sicuro?"` su qualsiasi tag chiede conferma prima del click
- **Nav attiva** — evidenzia il `.nav-link` corrispondente al path corrente
- **Session timer** — mostra un avviso 5 minuti prima della scadenza se presente `[data-session-expires]`

API globale:

```javascript
Blueprint.toast('Salvato!', 'success', 3000);        // success | error | warning | info
Blueprint.copyToClipboard('testo da copiare');
```

---

## Whitelist

`data/whitelist.json` viene creato automaticamente al primo avvio con whitelist disabilitata:

```json
{
  "enabled": false,
  "emails": []
}
```

- **`enabled: false`** → tutti gli account SSO sono ammessi (default)
- **`enabled: true`** → solo gli indirizzi in `emails` possono accedere

Modifica il file manualmente oppure usa le API di `WhitelistManager` in `app.py`:

```python
whitelist_manager.set_enabled(True)
whitelist_manager.add_email("utente@azienda.com")
whitelist_manager.remove_email("ex-utente@azienda.com")
```

Un account non in whitelist che prova ad accedere riceve una risposta **403 - Account Non Autorizzato**
prima ancora che venga creata una sessione.

---

## Rate Limiting

Due limiti indipendenti configurabili nel `.env`:

| Variabile | Default | Descrizione |
|---|---|---|
| `MAX_SESSIONS_PER_USER` | `3` | Max sessioni simultanee per lo stesso account |
| `MAX_SESSIONS_GLOBAL` | `100` | Max sessioni attive totali nell'app |

Comportamento:
- ogni login SSO riuscito registra una sessione con ID univoco nel `RateLimiter`
- ogni request su route protette aggiorna il timestamp `last_seen`
- sessioni inattive da più di 8 ore vengono rimosse automaticamente
- il logout esplicito rimuove subito la sessione dal contatore
- se un limite è superato, l'utente vede **429 - Troppe Sessioni Attive**

> ⚠️ **Nota multi-processo:** il `RateLimiter` usa memoria condivisa tra thread dello
> stesso processo. Con gunicorn e più worker ogni processo ha il proprio contatore separato.
> Per ambienti multi-processo sostituire il backend con **Redis**.

---

## Checklist production

Prima di andare live con la propria applicazione:

- [ ] `JWT_SECRET` configurato e **identico** a quello del portale SSO
- [ ] `APP_AUDIENCE` registrato sul portale SSO per questa applicazione
- [ ] `SERVER_SECRET_KEY` stringa lunga e casuale (min 32 caratteri)
- [ ] `SSO_MODE=production`
- [ ] `DEBUG=False`
- [ ] Cookie: `SECURE=True`, `HTTPONLY=True`, `SAMESITE=Lax`
- [ ] Nginx configurato con `proxy_set_header` corretti e `location /static/` servita
- [ ] Whitelist abilitata o scelta consapevole di lasciarla disabilitata
- [ ] Limiti rate limiting rivisti in base al carico atteso
- [ ] Valutato Redis per il `RateLimiter` se si usano più worker
