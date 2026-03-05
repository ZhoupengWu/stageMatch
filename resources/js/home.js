/* ═══════════════════════════════════════════════════════
   home.js — stageMatch Dashboard
   ═══════════════════════════════════════════════════════ */

/* ─── DATI AZIENDE ──────────────────────────────────────
   In produzione sostituire con:
       const res  = await fetch('/api/companies/matches');
       const data = await res.json();
       renderCompanies(data);

   Il formato dell'oggetto è il contratto con il backend.
   ────────────────────────────────────────────────────── */
const MOCK_COMPANIES = [
    {
        id: 1,
        initials: 'AT',
        name: 'Alpha Tech Srl',
        sector: '💻 Sviluppo Software',
        matchPct: 94,
        tags: ['Python', 'JavaScript', 'Flask'],
        description: 'Azienda bergamasca specializzata nello sviluppo di applicazioni web e mobile per il settore industriale.',
        distanceKm: 12,
        durationMin: 18,
        city: 'Dalmine',
        address: 'Via Roma 12, Dalmine BG',
        contacts: {
            email: 'stage@alphatech.it',
            web: 'www.alphatech.it',
            phone: '035 123 456'
        }
    },
    {
        id: 2,
        initials: 'BS',
        name: 'Beta Systems',
        sector: '🔒 Cybersecurity',
        matchPct: 81,
        tags: ['Networking', 'Linux', 'Python'],
        description: 'Società di consulenza specializzata in sicurezza informatica e infrastrutture di rete per PMI lombarde.',
        distanceKm: 8,
        durationMin: 12,
        city: 'Seriate',
        address: 'Via Industria 5, Seriate BG',
        contacts: {
            email: 'hr@betasystems.it',
            web: 'www.betasystems.it',
            phone: '035 654 321'
        }
    },
    {
        id: 3,
        initials: 'GI',
        name: 'Gamma Informatica',
        sector: '☁️ Cloud & DevOps',
        matchPct: 74,
        tags: ['Docker', 'AWS', 'CI/CD'],
        description: 'Provider di servizi cloud e automazione per aziende del territorio bergamasco e bresciano.',
        distanceKm: 7,
        durationMin: 10,
        city: 'Curno',
        address: 'Via Milano 88, Curno BG',
        contacts: {
            email: 'tirocini@gammainf.it',
            web: 'www.gammainformatica.it',
            phone: '035 789 000'
        }
    },
    {
        id: 4,
        initials: 'DN',
        name: 'Delta Networks',
        sector: '📡 Telecomunicazioni',
        matchPct: 61,
        tags: ['SQL', 'Java', 'IoT'],
        description: 'Azienda nel settore delle reti di telecomunicazione con focus su soluzioni IoT industriali.',
        distanceKm: 15,
        durationMin: 22,
        city: 'Stezzano',
        address: 'Via Orio 3, Stezzano BG',
        contacts: {
            email: 'info@deltanetworks.it',
            web: 'www.deltanetworks.it',
            phone: '035 901 234'
        }
    }
];

/* ─── STATO ───────────────────────────────────────────── */
let companiesLoaded = false;

/* ═══════════════════════════════════════════════════════
   renderCompanies(companies)
   Riceve un array di oggetti azienda e popola il pannello.
   Chiamata sia con dati mock che con dati reali da API.
   ═══════════════════════════════════════════════════════ */
function renderCompanies(companies) {
    const list     = document.getElementById('cpList');
    const empty    = document.getElementById('cpEmpty');
    const badge    = document.getElementById('companiesBadge');
    const subtitle = document.getElementById('cpSubtitle');

    badge.textContent = companies.length;

    if (!companies || companies.length === 0) {
        list.style.display  = 'none';
        empty.style.display = 'flex';
        subtitle.textContent = 'Nessuna azienda compatibile';
        return;
    }

    const count = companies.length;
    subtitle.textContent  = `${count} aziend${count === 1 ? 'a' : 'e'} compatibil${count === 1 ? 'e' : 'i'}`;
    empty.style.display   = 'none';
    list.style.display    = 'flex';
    list.innerHTML        = '';

    companies.forEach((company, index) => {
        const isBest = index === 0;
        const tags   = company.tags.map(t => `<span class="co-tag">${t}</span>`).join('');
        const safeCompany = encodeURIComponent(JSON.stringify(company));

        const card = document.createElement('div');
        card.className   = `co-card${isBest ? ' best' : ''}`;
        card.dataset.id  = company.id;

        card.innerHTML = `
            <div class="co-top" onclick="toggleCompanyCard(this.closest('.co-card'))">
                <div class="co-row1">
                    <div class="co-logo">${company.initials}</div>
                    <div class="co-info">
                        <div class="co-name">${company.name}</div>
                        <div class="co-sector">${company.sector}</div>
                    </div>
                    <div class="co-match">
                        <div class="co-pct">${company.matchPct}%</div>
                        <div class="co-pct-label">match</div>
                    </div>
                </div>
                <div class="co-bar-wrap">
                    <div class="co-bar" style="width:${company.matchPct}%"></div>
                </div>
                <div class="co-tags">${tags}</div>
                <div class="co-meta">
                    <div class="co-meta-item">📍 <span>${company.city} · ${company.distanceKm} km</span></div>
                    <div class="co-meta-sep">·</div>
                    <div class="co-meta-item">⏱ <span>${company.durationMin} min in auto</span></div>
                </div>
            </div>

            <div class="co-toggle" onclick="toggleCompanyCard(this.closest('.co-card'))">
                Dettagli e contatti <span class="co-chevron">▾</span>
            </div>

            <div class="co-details">
                <div class="co-details-inner">
                    <div class="co-desc">${company.description}</div>
                    <div class="co-contacts">
                        <div class="co-contact-row">
                            ✉️ <a href="mailto:${company.contacts.email}">${company.contacts.email}</a>
                        </div>
                        <div class="co-contact-row">
                            🌐 <a href="https://${company.contacts.web}" target="_blank">${company.contacts.web}</a>
                        </div>
                        <div class="co-contact-row">
                            📞 <span>${company.contacts.phone}</span>
                        </div>
                    </div>
                    <button class="co-map-btn" onclick="redirectToMap(event, decodeURIComponent('${safeCompany}'))">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                             fill="none" stroke="white" stroke-width="2.5"
                             stroke-linecap="round" stroke-linejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                        Mostra percorso sulla mappa
                    </button>
                </div>
            </div>
        `;

        list.appendChild(card);
    });
}

/* ═══════════════════════════════════════════════════════
   loadCompanies()
   Simula una chiamata API con un breve delay.
   In produzione sostituire il setTimeout con fetch():

       const res  = await fetch('/api/companies/matches');
       const data = await res.json();
       renderCompanies(data);
   ═══════════════════════════════════════════════════════ */
async function loadCompanies() {
    document.getElementById('cpLoading').style.display = 'flex';
    document.getElementById('cpList').style.display    = 'none';

    await new Promise(resolve => setTimeout(resolve, 800)); // ← sostituire con fetch()

    document.getElementById('cpLoading').style.display = 'none';
    renderCompanies(MOCK_COMPANIES);
}

/* ═══════════════════════════════════════════════════════
   redirectToMap(event, companyJSON)
   Reindirizza a index.html passando i dati dell'azienda
   come parametri URL. index.html li legge con URLSearchParams
   per pre-compilare gli input e avviare il percorso.
   ═══════════════════════════════════════════════════════ */
function redirectToMap(event, companyJSON) {
    event.stopPropagation();

    const company = JSON.parse(companyJSON);

    // Indirizzo di partenza: in produzione verrà dal profilo utente (sessione/DB)
    const userAddress = 'Bergamo, BG';

    const params = new URLSearchParams({
        startaddress: userAddress,
        endaddress:   company.address,
        endname:      company.name,
        routemode:    'driving-car'
    });

    window.location.href = `index.html?${params.toString()}`;
}

/* ─── PANNELLO AZIENDE: apri / chiudi ─────────────────── */
function openCompaniesPanel() {
    document.getElementById('companiesPanel').classList.add('open');
    document.getElementById('mainContent').classList.add('panel-open');
    document.getElementById('navCompanies').classList.add('active');

    if (!companiesLoaded) {
        companiesLoaded = true;
        loadCompanies();
    }

    // Su mobile chiude la sidebar per fare spazio
    if (window.innerWidth <= 820) {
        closeSidebar();
    }
}

function closeCompaniesPanel() {
    document.getElementById('companiesPanel').classList.remove('open');
    document.getElementById('mainContent').classList.remove('panel-open');
    document.getElementById('navCompanies').classList.remove('active');
}

/* ─── COMPANY CARD: espandi / comprimi ────────────────── */
function toggleCompanyCard(card) {
    card.classList.toggle('expanded');
}

/* ─── NAVIGAZIONE SIDEBAR ─────────────────────────────── */
function setActive(el) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    el.classList.add('active');
    closeCompaniesPanel();
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

    // Selezione mezzo di trasporto nella hero card
    document.querySelectorAll('.t-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('.t-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
        });
    });

    // ESC chiude pannello aziende e sidebar mobile
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeCompaniesPanel();
            closeSidebar();
        }
    });
});