/* ═══════════════════════════════════════════════════════
   home.js — stageMatch Dashboard
   ═══════════════════════════════════════════════════════ */

/* ─── DATI MOCK ───────────────────────────────────────────
   In produzione sostituire con fetch() verso le API Flask.
   ─────────────────────────────────────────────────────── */

const MOCK_COMPANIES = [
    {
        id: 1, initials: 'AT', name: 'Alpha Tech Srl',
        sector: '💻 Sviluppo Software', matchPct: 94,
        tags: ['Python', 'JavaScript', 'Flask'],
        description: 'Azienda bergamasca specializzata nello sviluppo di applicazioni web e mobile per il settore industriale.',
        distanceKm: 12, durationMin: 18, city: 'Dalmine',
        address: 'Via Roma 12, Dalmine BG',
        contacts: { email: 'stage@alphatech.it', web: 'www.alphatech.it', phone: '035 123 456' }
    },
    {
        id: 2, initials: 'BS', name: 'Beta Systems',
        sector: '🔒 Cybersecurity', matchPct: 81,
        tags: ['Networking', 'Linux', 'Python'],
        description: 'Società di consulenza specializzata in sicurezza informatica e infrastrutture di rete per PMI lombarde.',
        distanceKm: 8, durationMin: 12, city: 'Seriate',
        address: 'Via Industria 5, Seriate BG',
        contacts: { email: 'hr@betasystems.it', web: 'www.betasystems.it', phone: '035 654 321' }
    },
    {
        id: 3, initials: 'GI', name: 'Gamma Informatica',
        sector: '☁️ Cloud & DevOps', matchPct: 74,
        tags: ['Docker', 'AWS', 'CI/CD'],
        description: 'Provider di servizi cloud e automazione per aziende del territorio bergamasco e bresciano.',
        distanceKm: 7, durationMin: 10, city: 'Curno',
        address: 'Via Milano 88, Curno BG',
        contacts: { email: 'tirocini@gammainf.it', web: 'www.gammainformatica.it', phone: '035 789 000' }
    },
    {
        id: 4, initials: 'DN', name: 'Delta Networks',
        sector: '📡 Telecomunicazioni', matchPct: 61,
        tags: ['SQL', 'Java', 'IoT'],
        description: 'Azienda nel settore delle reti di telecomunicazione con focus su soluzioni IoT industriali.',
        distanceKm: 15, durationMin: 22, city: 'Stezzano',
        address: 'Via Orio 3, Stezzano BG',
        contacts: { email: 'info@deltanetworks.it', web: 'www.deltanetworks.it', phone: '035 901 234' }
    }
];

const MOCK_ROUTES = [
    {
        id: 1, mode: 'driving-car',
        from: 'Bergamo Centro', to: 'Alpha Tech Srl — Dalmine',
        distanceKm: 12.4, durationMin: 18, date: 'Ieri',
        startaddress: 'Bergamo, BG', endaddress: 'Via Roma 12, Dalmine BG'
    },
    {
        id: 2, mode: 'foot-walking',
        from: 'Stazione FS Bergamo', to: 'Beta Systems — Seriate',
        distanceKm: 3.1, durationMin: 38, date: '2 giorni fa',
        startaddress: 'Stazione di Bergamo, BG', endaddress: 'Via Industria 5, Seriate BG'
    },
    {
        id: 3, mode: 'cycling-regular',
        from: 'Bergamo Centro', to: 'Gamma Informatica — Curno',
        distanceKm: 7.8, durationMin: 28, date: '5 giorni fa',
        startaddress: 'Bergamo, BG', endaddress: 'Via Milano 88, Curno BG'
    },
    {
        id: 4, mode: 'driving-car',
        from: 'Bergamo Nord', to: 'Delta Networks — Stezzano',
        distanceKm: 15.2, durationMin: 22, date: '1 settimana fa',
        startaddress: 'Bergamo Nord, BG', endaddress: 'Via Orio 3, Stezzano BG'
    },
    {
        id: 5, mode: 'driving-car',
        from: 'Bergamo Centro', to: 'Alpha Tech Srl — Dalmine',
        distanceKm: 12.4, durationMin: 17, date: '10 giorni fa',
        startaddress: 'Bergamo, BG', endaddress: 'Via Roma 12, Dalmine BG'
    },
    {
        id: 6, mode: 'foot-walking',
        from: 'Bergamo Bassa', to: 'Beta Systems — Seriate',
        distanceKm: 4.2, durationMin: 52, date: '2 settimane fa',
        startaddress: 'Bergamo Bassa, BG', endaddress: 'Via Industria 5, Seriate BG'
    }
];

/* ─── HELPERS ─────────────────────────────────────────── */
const modeLabel = { 'driving-car': 'Auto', 'foot-walking': 'A piedi', 'cycling-regular': 'Bici' };
const modeIcon = { 'driving-car': '🚗', 'foot-walking': '🚶', 'cycling-regular': '🚴' };
const modeBadge = { 'driving-car': 'car', 'foot-walking': 'walk', 'cycling-regular': 'bike' };

/* ════════════════════════════════════════════════════════
   NAVIGAZIONE SEZIONI
   showSection('dashboard' | 'aziende' | 'percorsi')
   Nasconde tutte le sezioni e mostra solo quella richiesta.
   ════════════════════════════════════════════════════════ */
const SECTIONS = ['sectionDashboard', 'sectionAziende', 'sectionPercorsi'];
let aziendeLoaded = false;
let percorsiLoaded = false;
let currentFilter = 'all';

function showSection(name) {
    const map = {
        dashboard: 'sectionDashboard',
        aziende: 'sectionAziende',
        percorsi: 'sectionPercorsi'
    };
    SECTIONS.forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
    document.getElementById(map[name]).classList.remove('hidden');

    // Lazy-load al primo accesso
    if (name === 'aziende' && !aziendeLoaded) {
        aziendeLoaded = true;
        loadCompanies();
    }
    if (name === 'percorsi' && !percorsiLoaded) {
        percorsiLoaded = true;
        renderRoutes(MOCK_ROUTES);
    }

    // Mobile: chiudi sidebar
    if (window.innerWidth <= 820) closeSidebar();
}

/* ─── setActive ───────────────────────────────────────── */
function setActive(el) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    if (el) el.classList.add('active');
}

/* ════════════════════════════════════════════════════════
   AZIENDE MATCH
   Renderizza le card nella sezione principale (non panel).
   ════════════════════════════════════════════════════════ */
function renderCompanies(companies) {
    const list = document.getElementById('aziendeList');
    const empty = document.getElementById('aziendeEmpty');
    const badge = document.getElementById('badgeAziende');
    const subtitle = document.getElementById('aziendeSubtitle');

    badge.textContent = companies.length;

    if (!companies || companies.length === 0) {
        list.style.display = 'none';
        empty.style.display = 'flex';
        subtitle.textContent = 'Nessuna azienda compatibile trovata';
        return;
    }

    const n = companies.length;
    subtitle.textContent = `${n} aziend${n === 1 ? 'a' : 'e'} compatibil${n === 1 ? 'e' : 'i'} con il tuo profilo`;
    empty.style.display = 'none';
    list.style.display = 'grid';
    list.innerHTML = '';

    companies.forEach((c, i) => {
        const isBest = i === 0;
        const tags = c.tags.map(t => `<span class="co-tag">${t}</span>`).join('');
        const safeC = encodeURIComponent(JSON.stringify(c));

        const card = document.createElement('div');
        card.className = `co-card${isBest ? ' best' : ''}`;
        card.dataset.id = c.id;

        card.innerHTML = `
          <div class="co-top" onclick="toggleCard(this.closest('.co-card'))">
            <div class="co-row1">
              <div class="co-logo">${c.initials}</div>
              <div class="co-info">
                <div class="co-name">${c.name}</div>
                <div class="co-sector">${c.sector}</div>
              </div>
              <div class="co-match">
                <div class="co-pct">${c.matchPct}%</div>
                <div class="co-pct-label">match</div>
              </div>
            </div>
            <div class="co-bar-wrap"><div class="co-bar" style="width:${c.matchPct}%"></div></div>
            <div class="co-tags">${tags}</div>
            <div class="co-meta">
              <div class="co-meta-item">📍 <span>${c.city} · ${c.distanceKm} km</span></div>
              <div class="co-meta-sep">·</div>
              <div class="co-meta-item">⏱ <span>${c.durationMin} min in auto</span></div>
            </div>
          </div>
          <div class="co-toggle" onclick="toggleCard(this.closest('.co-card'))">
            Dettagli e contatti <span class="co-chevron">▾</span>
          </div>
          <div class="co-details">
            <div class="co-details-inner">
              <div class="co-desc">${c.description}</div>
              <div class="co-contacts">
                <div class="co-contact-row">✉️ <a href="mailto:${c.contacts.email}">${c.contacts.email}</a></div>
                <div class="co-contact-row">🌐 <a href="https://${c.contacts.web}" target="_blank">${c.contacts.web}</a></div>
                <div class="co-contact-row">📞 <span>${c.contacts.phone}</span></div>
              </div>
              <button class="co-map-btn" onclick="goToMap(event, decodeURIComponent('${safeC}'))">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                     fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                Mostra percorso sulla mappa
              </button>
            </div>
          </div>
        `;
        list.appendChild(card);
    });
}

async function loadCompanies() {
    document.getElementById('aziendeLoading').style.display = 'flex';
    document.getElementById('aziendeList').style.display = 'none';

    /* ── Sostituire con fetch reale: ──────────────────────────
       const res  = await fetch('/api/companies/matches');
       const data = await res.json();
       renderCompanies(data);
       ─────────────────────────────────────────────────────── */
    await new Promise(r => setTimeout(r, 700));

    document.getElementById('aziendeLoading').style.display = 'none';
    renderCompanies(MOCK_COMPANIES);
}

function toggleCard(card) {
    card.classList.toggle('expanded');
}

/* ════════════════════════════════════════════════════════
   I MIEI PERCORSI
   Renderizza la lista completa con filtri per mezzo.
   ════════════════════════════════════════════════════════ */
function renderRoutes(routes, filter = 'all') {
    const list = document.getElementById('percorsiList');
    const count = document.getElementById('percorsiCount');

    const filtered = filter === 'all' ? routes : routes.filter(r => r.mode === filter);
    count.textContent = routes.length;
    document.getElementById('badgePercorsi').textContent = routes.length;

    if (filtered.length === 0) {
        list.innerHTML = `
          <div class="routes-empty">
            <div style="font-size:40px;opacity:.35;">📭</div>
            <span>Nessun percorso trovato per questo mezzo.</span>
          </div>`;
        return;
    }

    list.innerHTML = filtered.map(r => {
        const label = modeLabel[r.mode] || r.mode;
        const icon = modeIcon[r.mode] || '🚗';
        const badge = modeBadge[r.mode] || 'car';
        const safeR = encodeURIComponent(JSON.stringify(r));

        return `
        <div class="route-card" data-mode="${r.mode}">
          <div class="route-card-icon">${icon}</div>
          <div class="route-card-info">
            <div class="route-card-title">${r.from} → ${r.to}</div>
            <div class="route-card-meta">
              <span>📅 <strong>${r.date}</strong></span>
              <span>📏 <strong>${r.distanceKm} km</strong></span>
              <span>⏱ <strong>${r.durationMin} min</strong></span>
              <span class="route-badge ${badge}">${label}</span>
            </div>
          </div>
          <div class="route-card-actions">
            <button class="btn-repeat" onclick="repeatRoute(decodeURIComponent('${safeR}'))">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                   fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              Ripeti
            </button>
          </div>
        </div>`;
    }).join('');
}

function repeatRoute(routeJSON) {
    const r = JSON.parse(routeJSON);
    const params = new URLSearchParams({
        startaddress: r.startaddress,
        endaddress: r.endaddress,
        routemode: r.mode
    });
    window.location.href = `index.html?${params.toString()}`;
}

/* ════════════════════════════════════════════════════════
   REDIRECT MAPPA (da card azienda)
   ════════════════════════════════════════════════════════ */
function goToMap(event, companyJSON) {
    event.stopPropagation();
    const c = JSON.parse(companyJSON);
    const params = new URLSearchParams({
        startaddress: 'Bergamo, BG',   // ← sostituire con indirizzo da sessione utente
        endaddress: c.address,
        endname: c.name,
        routemode: 'driving-car'
    });
    window.location.href = `index.html?${params.toString()}`;
}

/* ─── ANTEPRIMA PERCORSI RECENTI (nella dashboard) ───── */
function renderRecentRoutes() {
    const list = document.getElementById('recentRoutesList');
    const recent = MOCK_ROUTES.slice(0, 3);

    list.innerHTML = recent.map(r => `
      <div class="route-item">
        <div class="route-icon">${modeIcon[r.mode] || '🚗'}</div>
        <div class="route-info">
          <div class="route-from-to">${r.from} → ${r.to}</div>
          <div class="route-meta">${r.date} · ${r.distanceKm} km · ${r.durationMin} min</div>
        </div>
        <span class="route-badge ${modeBadge[r.mode] || 'car'}">${modeLabel[r.mode] || 'Auto'}</span>
      </div>`).join('');
}

/* ─── SIDEBAR MOBILE ──────────────────────────────────── */
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('active');
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').classList.remove('active');
}

/* ─── INIZIALIZZAZIONE ────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

    /* Anteprima percorsi nella dashboard */
    renderRecentRoutes();

    /* Transport pills nella hero card */
    document.querySelectorAll('.t-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('.t-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
        });
    });

    /* Filtri percorsi */
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            if (percorsiLoaded) renderRoutes(MOCK_ROUTES, currentFilter);
        });
    });

    /* ESC chiude sidebar mobile */
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeSidebar();
    });
});