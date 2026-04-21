/* ═══════════════════════════════════════════════════════
   home.js — stageMatch Dashboard
   ═══════════════════════════════════════════════════════ */

/* ─── DATI MOCK ───────────────────────────────────────────
   In produzione sostituire con fetch() verso le API Flask.
   ─────────────────────────────────────────────────────── */

   const MOCK_COMPANIES = [
    {
        id: 1,
        initials: "AT",
        name: "Alpha Tech Srl",
        sector: "Sviluppo Software",
        matchPct: 94,
        tags: ["Python", "JavaScript", "Flask"],
        description:
            "Azienda bergamasca specializzata nello sviluppo di applicazioni web e mobile per il settore industriale.",
        distanceKm: 12,
        durationMin: 18,
        city: "Dalmine",
        address: "Via Roma 12, Dalmine BG",
        contacts: {
            email: "stage@alphatech.it",
            web: "www.alphatech.it",
            phone: "035 123 456",
        },
    },
    {
        id: 2,
        initials: "BS",
        name: "Beta Systems",
        sector: "Cybersecurity",
        matchPct: 81,
        tags: ["Networking", "Linux", "Python"],
        description:
            "Società di consulenza specializzata in sicurezza informatica e infrastrutture di rete per PMI lombarde.",
        distanceKm: 8,
        durationMin: 12,
        city: "Seriate",
        address: "Via Industria 5, Seriate BG",
        contacts: {
            email: "hr@betasystems.it",
            web: "www.betasystems.it",
            phone: "035 654 321",
        },
    },
    {
        id: 3,
        initials: "GI",
        name: "Gamma Informatica",
        sector: "Cloud & DevOps",
        matchPct: 74,
        tags: ["Docker", "AWS", "CI/CD"],
        description:
            "Provider di servizi cloud e automazione per aziende del territorio bergamasco e bresciano.",
        distanceKm: 7,
        durationMin: 10,
        city: "Curno",
        address: "Via Milano 88, Curno BG",
        contacts: {
            email: "tirocini@gammainf.it",
            web: "www.gammainformatica.it",
            phone: "035 789 000",
        },
    },
    {
        id: 4,
        initials: "DN",
        name: "Delta Networks",
        sector: "Telecomunicazioni",
        matchPct: 61,
        tags: ["SQL", "Java", "IoT"],
        description:
            "Azienda nel settore delle reti di telecomunicazione con focus su soluzioni IoT industriali.",
        distanceKm: 15,
        durationMin: 22,
        city: "Stezzano",
        address: "Via Orio 3, Stezzano BG",
        contacts: {
            email: "info@deltanetworks.it",
            web: "www.deltanetworks.it",
            phone: "035 901 234",
        },
    },
];

const MOCK_ROUTES = [
    {
        id: 1,
        mode: "driving-car",
        from: "Bergamo Centro",
        to: "Alpha Tech Srl — Dalmine",
        distanceKm: 12.4,
        durationMin: 18,
        date: "Ieri",
        startaddress: "Bergamo, BG",
        endaddress: "Via Roma 12, Dalmine BG",
    },
    {
        id: 2,
        mode: "foot-walking",
        from: "Stazione FS Bergamo",
        to: "Beta Systems — Seriate",
        distanceKm: 3.1,
        durationMin: 38,
        date: "2 giorni fa",
        startaddress: "Stazione di Bergamo, BG",
        endaddress: "Via Industria 5, Seriate BG",
    },
    {
        id: 3,
        mode: "cycling-regular",
        from: "Bergamo Centro",
        to: "Gamma Informatica — Curno",
        distanceKm: 7.8,
        durationMin: 28,
        date: "5 giorni fa",
        startaddress: "Bergamo, BG",
        endaddress: "Via Milano 88, Curno BG",
    },
    {
        id: 4,
        mode: "driving-car",
        from: "Bergamo Nord",
        to: "Delta Networks — Stezzano",
        distanceKm: 15.2,
        durationMin: 22,
        date: "1 settimana fa",
        startaddress: "Bergamo Nord, BG",
        endaddress: "Via Orio 3, Stezzano BG",
    },
    {
        id: 5,
        mode: "driving-car",
        from: "Bergamo Centro",
        to: "Alpha Tech Srl — Dalmine",
        distanceKm: 12.4,
        durationMin: 17,
        date: "10 giorni fa",
        startaddress: "Bergamo, BG",
        endaddress: "Via Roma 12, Dalmine BG",
    },
    {
        id: 6,
        mode: "foot-walking",
        from: "Bergamo Bassa",
        to: "Beta Systems — Seriate",
        distanceKm: 4.2,
        durationMin: 52,
        date: "2 settimane fa",
        startaddress: "Bergamo Bassa, BG",
        endaddress: "Via Industria 5, Seriate BG",
    },
];

let currentCompanies = [];

/* ─── HELPERS ─────────────────────────────────────────── */
const svgIcon = (id, extraClass = "icon") =>
    `<span class="${extraClass}"><svg><use href="#${id}"></use></svg></span>`;

const modeLabel = {
    "driving-car": "Auto",
    "foot-walking": "A piedi",
    "cycling-regular": "Bici",
};
const modeIcon = {
    "driving-car": svgIcon("i-car"),
    "foot-walking": svgIcon("i-walk"),
    "cycling-regular": svgIcon("i-bike"),
};
const modeBadge = {
    "driving-car": "car",
    "foot-walking": "walk",
    "cycling-regular": "bike",
};

/* ════════════════════════════════════════════════════════
   NAVIGAZIONE SEZIONI
   showSection('dashboard' | 'aziende' | 'percorsi')
   Nasconde tutte le sezioni e mostra solo quella richiesta.
   ════════════════════════════════════════════════════════ */
const SECTIONS = [
    "sectionDashboard",
    "sectionAziende",
    "sectionPercorsi",
    "sectionProfilo",
    "sectionImpostazioni",
];
let aziendeLoaded = false;
let percorsiLoaded = false;
let currentFilter = "all";

function showSection(name) {
    const map = {
        dashboard: "sectionDashboard",
        aziende: "sectionAziende",
        percorsi: "sectionPercorsi",
        profilo: "sectionProfilo",
        impostazioni: "sectionImpostazioni",
    };
    SECTIONS.forEach((id) => {
        document.getElementById(id).classList.add("hidden");
    });
    document.getElementById(map[name]).classList.remove("hidden");

    // Lazy-load al primo accesso
    if (name === "aziende" && !aziendeLoaded) {
        aziendeLoaded = true;
        loadCompanies();
    }
    if (name === "percorsi" && !percorsiLoaded) {
        percorsiLoaded = true;
        renderRoutes(MOCK_ROUTES);
    }

    // Mobile: chiudi sidebar
    if (window.innerWidth <= 1100) closeSidebar();
}

/* ─── setActive ───────────────────────────────────────── */
function setActive(el) {
    document
        .querySelectorAll(".nav-item")
        .forEach((i) => i.classList.remove("active"));
    if (el) el.classList.add("active");
}

/* ════════════════════════════════════════════════════════
   AZIENDE MATCH
   Renderizza le card nella sezione principale (non panel).
   ════════════════════════════════════════════════════════ */
function renderCompanies(companies) {
    const list = document.getElementById("aziendeList");
    const empty = document.getElementById("aziendeEmpty");
    const badge = document.getElementById("badgeAziende");
    const subtitle = document.getElementById("aziendeSubtitle");

    currentCompanies = Array.isArray(companies) ? companies : [];

    badge.textContent = companies.length;

    if (!companies || companies.length === 0) {
        list.style.display = "none";
        empty.style.display = "flex";
        subtitle.textContent = "Nessuna azienda compatibile trovata";
        return;
    }

    const n = companies.length;
    subtitle.textContent = `${n} aziend${n === 1 ? "a" : "e"} compatibil${n === 1 ? "e" : "i"} con il tuo profilo`;
    empty.style.display = "none";
    list.style.display = "grid";
    list.innerHTML = "";

    companies.forEach((c, i) => {
        const isBest = i === 0;
        const tags = c.tags
            .map((t) => `<span class="co-tag">${t}</span>`)
            .join("");
        const card = document.createElement("div");
        card.className = `co-card${isBest ? " best" : ""}`;
        card.dataset.id = c.id;

        card.innerHTML = `
          <div class="co-top">
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
              <div class="co-meta-item">${svgIcon("i-pin")}<span>${c.city} · ${c.distanceKm} km</span></div>
              <div class="co-meta-sep">·</div>
              <div class="co-meta-item">${svgIcon("i-route")}<span>${c.durationMin} min in auto</span></div>
            </div>
          </div>
          <button class="co-toggle" type="button" data-action="open-company-details" data-company-id="${c.id}">
            Dettagli e contatti
          </button>
        `;
        list.appendChild(card);
    });
}

async function loadCompanies() {
    document.getElementById("aziendeLoading").style.display = "flex";
    document.getElementById("aziendeList").style.display = "none";

    /* ── Sostituire con fetch reale: ──────────────────────────
       const res  = await fetch('/api/companies/matches');
       const data = await res.json();
       renderCompanies(data);
       ─────────────────────────────────────────────────────── */
    await new Promise((r) => setTimeout(r, 700));

    document.getElementById("aziendeLoading").style.display = "none";
    renderCompanies(MOCK_COMPANIES);
}

function getCompanyById(companyId) {
    return currentCompanies.find((company) => String(company.id) === String(companyId));
}

function renderCompanyDetailsModal(company) {
    const content = document.getElementById("companyDetailsContent");

    content.innerHTML = `
      <div class="company-modal-hero">
        <div class="company-modal-logo">${company.initials}</div>
        <div class="company-modal-head">
          <div class="company-modal-name">${company.name}</div>
          <div class="company-modal-sector">${company.sector}</div>
        </div>
        <div class="company-modal-match">
          <div class="company-modal-match-pct">${company.matchPct}%</div>
          <div class="company-modal-match-label">match</div>
        </div>
      </div>
      <div class="company-modal-tags">
        ${company.tags.map((tag) => `<span class="co-tag">${tag}</span>`).join("")}
      </div>
      <div class="company-modal-grid">
        <div class="company-modal-panel">
          <div class="company-modal-section-title">Descrizione</div>
          <div class="co-desc">${company.description}</div>
        </div>
        <div class="company-modal-panel">
          <div class="company-modal-section-title">Dettagli</div>
          <div class="company-modal-info-list">
            <div class="co-contact-row">${svgIcon("i-pin")}<span>${company.address}</span></div>
            <div class="co-contact-row">${svgIcon("i-route")}<span>${company.city} · ${company.distanceKm} km · ${company.durationMin} min in auto</span></div>
          </div>
        </div>
        <div class="company-modal-panel">
          <div class="company-modal-section-title">Contatti</div>
          <div class="co-contacts">
            <div class="co-contact-row">${svgIcon("i-mail")}<a href="mailto:${company.contacts.email}">${company.contacts.email}</a></div>
            <div class="co-contact-row">${svgIcon("i-link")}<a href="https://${company.contacts.web}" target="_blank" rel="noopener noreferrer">${company.contacts.web}</a></div>
            <div class="co-contact-row">${svgIcon("i-phone")}<span>${company.contacts.phone}</span></div>
          </div>
        </div>
      </div>
      <button class="co-map-btn" type="button" data-action="go-to-company-map" data-company-id="${company.id}">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
             fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
        Mostra percorso sulla mappa
      </button>
    `;
}

function openCompanyDetails(companyId) {
    const company = getCompanyById(companyId);
    const overlay = document.getElementById("companyDetailsOverlay");

    if (!company || !overlay) return;

    renderCompanyDetailsModal(company);
    overlay.classList.add("active");
}

function closeCompanyDetails() {
    const overlay = document.getElementById("companyDetailsOverlay");
    if (!overlay) return;
    overlay.classList.remove("active");
}

/* ════════════════════════════════════════════════════════
   I MIEI PERCORSI
   Renderizza la lista completa con filtri per mezzo.
   ════════════════════════════════════════════════════════ */
function renderRoutes(routes, filter = "all") {
    const list = document.getElementById("percorsiList");
    const count = document.getElementById("percorsiCount");

    const filtered =
        filter === "all" ? routes : routes.filter((r) => r.mode === filter);
    count.textContent = routes.length;
    document.getElementById("badgePercorsi").textContent = routes.length;

    if (filtered.length === 0) {
        list.innerHTML = `
          <div class="routes-empty">
            <div class="empty-state-icon">${svgIcon("i-route")}</div>
            <span>Nessun percorso trovato per questo mezzo.</span>
          </div>`;
        return;
    }

    list.innerHTML = filtered
        .map((r) => {
            const label = modeLabel[r.mode] || r.mode;
            const icon = modeIcon[r.mode] || svgIcon("i-car");
            const badge = modeBadge[r.mode] || "car";
            const safeR = encodeURIComponent(JSON.stringify(r));

            return `
        <div class="route-card" data-mode="${r.mode}">
          <div class="route-card-icon">${icon}</div>
          <div class="route-card-info">
            <div class="route-card-title">${r.from} → ${r.to}</div>
            <div class="route-card-meta">
              <span><strong>${r.date}</strong></span>
              <span><strong>${r.distanceKm} km</strong></span>
              <span><strong>${r.durationMin} min</strong></span>
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
        })
        .join("");
}

function repeatRoute(routeJSON) {
    const r = JSON.parse(routeJSON);
    const params = new URLSearchParams({
        startaddress: r.startaddress,
        endaddress: r.endaddress,
        routemode: r.mode,
    });
    window.location.href = `/logged/map?${params.toString()}`;
}

/* ════════════════════════════════════════════════════════
   REDIRECT MAPPA (da card azienda)
   ════════════════════════════════════════════════════════ */
function goToMap(companyId) {
    const c = getCompanyById(companyId);
    if (!c) return;
    const params = new URLSearchParams({
        startaddress: "Bergamo, BG", // ← sostituire con indirizzo da sessione utente
        endaddress: c.address,
        endname: c.name,
        routemode: "driving-car",
    });
    window.location.href = `/logged/map?${params.toString()}`;
}

/* ─── ANTEPRIMA PERCORSI RECENTI (nella dashboard) ───── */
function renderRecentRoutes() {
    const list = document.getElementById("recentRoutesList");
    const recent = MOCK_ROUTES.slice(0, 3);

    list.innerHTML = recent
        .map(
            (r) => `
      <div class="route-item">
        <div class="route-icon">${modeIcon[r.mode] || svgIcon("i-car")}</div>
        <div class="route-info">
          <div class="route-from-to">${r.from} → ${r.to}</div>
          <div class="route-meta">${r.date} · ${r.distanceKm} km · ${r.durationMin} min</div>
        </div>
        <span class="route-badge ${modeBadge[r.mode] || "car"}">${modeLabel[r.mode] || "Auto"}</span>
      </div>`,
        )
        .join("");
}

/* ════════════════════════════════════════════════════════
   PROFILO — dati caricati da /api/users/profile
   ════════════════════════════════════════════════════════ */
const EMPTY_PROFILO_DATA = {
    name: "",
    surname: "",
    email: "",
    data_nascita: "",
    sesso: "",
    comune_nascita: "",
    codice_fiscale: "",
    telefono: "",
    indirizzo_studio: "",
    classe: "",
    indirizzo: "",
    picture: "",
    skills: [],
    soft_skills: [],
};
let profiloData = { ...EMPTY_PROFILO_DATA };
let profiloLoaded = false;

const ALL_SOFT_SKILLS = [
    { icon: "i-brain", label: "Problem solving" },
    { icon: "i-user", label: "Lavoro in team" },
    { icon: "i-route", label: "Gestione del tempo" },
    { icon: "i-bell", label: "Comunicazione" },
    { icon: "i-pin", label: "Attenzione ai dettagli" },
    { icon: "i-palette", label: "Creatività" },
    { icon: "i-bell", label: "Public speaking" },
    { icon: "i-route", label: "Adattabilità" },
    { icon: "i-globe", label: "Leadership" },
    { icon: "i-graduate", label: "Autoapprendimento" },
];

const SKILL_LV_MAP = { Base: 33, Intermedio: 65, Avanzato: 90 };
const SKILL_LV_DB_MAP = { Base: 1, Intermedio: 2, Avanzato: 3 };
const SKILL_LV_LABEL_MAP = { 1: "Base", 2: "Intermedio", 3: "Avanzato" };

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    })[char]);
}

function normalizeDateInput(value) {
    if (!value) return "";

    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
        return value.slice(0, 10);
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toISOString().slice(0, 10);
}

function normalizeSkillLevel(value) {
    return SKILL_LV_LABEL_MAP[value] || value || "Base";
}

function normalizeProfiloData(data) {
    return {
        ...EMPTY_PROFILO_DATA,
        ...data,
        data_nascita:
            data.data_nascita === undefined
                ? EMPTY_PROFILO_DATA.data_nascita
                : normalizeDateInput(data.data_nascita),
        skills: Array.isArray(data.skills)
            ? data.skills.map((skill) => ({
                name: skill.name || "",
                livello: normalizeSkillLevel(skill.livello),
            }))
            : [],
        soft_skills: Array.isArray(data.soft_skills)
            ? data.soft_skills.map((soft) => ({
                label: soft.label || "",
                icon: soft.icon || "i-brain",
            }))
            : [],
    };
}

function setProfiloEditEnabled(enabled) {
    const btn = document.getElementById("btnEditProfilo");

    if (!btn) return;

    btn.disabled = !enabled;
    btn.setAttribute("aria-busy", String(!enabled));
}

function renderProfiloLoading() {
    setProfiloEditEnabled(false);

    document.querySelector(".profilo-hero-name").textContent = "Caricamento profilo";
    document.querySelector(".profilo-hero-sub").textContent = "Recupero dati in corso...";

    const loadingState = `
        <div class="section-state profile-state">
            <div class="spinner"></div>
            <span>Caricamento dati profilo...</span>
        </div>
    `;

    const anagraficaEl = document.getElementById("proAnagrafica");
    const scuolaEl = document.getElementById("proScuola");
    const skillsEl = document.getElementById("proSkills");
    const softEl = document.getElementById("proSoftSkills");

    if (anagraficaEl) anagraficaEl.innerHTML = loadingState;
    if (scuolaEl) scuolaEl.innerHTML = loadingState;
    if (skillsEl) skillsEl.innerHTML = loadingState;
    if (softEl) softEl.innerHTML = loadingState;
}

function renderProfiloError() {
    setProfiloEditEnabled(false);

    document.querySelector(".profilo-hero-name").textContent = "Profilo non disponibile";
    document.querySelector(".profilo-hero-sub").textContent = "Impossibile recuperare i dati profilo.";

    const errorState = `
        <div class="section-state profile-state">
            <span>Errore nel caricamento del profilo. Ricarica la pagina.</span>
        </div>
    `;

    const anagraficaEl = document.getElementById("proAnagrafica");
    const scuolaEl = document.getElementById("proScuola");
    const skillsEl = document.getElementById("proSkills");
    const softEl = document.getElementById("proSoftSkills");

    if (anagraficaEl) anagraficaEl.innerHTML = errorState;
    if (scuolaEl) scuolaEl.innerHTML = errorState;
    if (skillsEl) skillsEl.innerHTML = errorState;
    if (softEl) softEl.innerHTML = errorState;
}

async function loadProfiloData() {
    renderProfiloLoading();

    try {
        const response = await fetch("/api/users/profile");

        if (!response.ok) throw new Error(`[ERROR] http code ${response.status}`);

        const data = await response.json();
        profiloData = normalizeProfiloData(data || {});
        profiloLoaded = true;
        updateProfiloUI(null);
        setProfiloEditEnabled(true);
    } catch (err) {
        console.error("Errore caricamento profilo:", err);
        profiloLoaded = false;
        renderProfiloError();
    }
}

/* ─── Apre il modal e popola i form ──────────────────── */
function openProfiloModal() {
    if (!profiloLoaded) {
        showToast("Attendi il caricamento del profilo");

        return;
    }

    // Anagrafica
    document.getElementById("fNome").value = profiloData.name;
    document.getElementById("fCognome").value = profiloData.surname;
    document.getElementById("fNascita").value = profiloData.data_nascita;
    document.getElementById("fCF").value = profiloData.codice_fiscale;
    document.getElementById("fComune").value = profiloData.comune_nascita;
    document.getElementById("fTel").value = profiloData.telefono;

    // Skills editor
    renderSkillsEditor();

    // Soft skills checkboxes
    renderSoftEditor();

    // Reset status
    setApiStatus("", "");

    document.getElementById("profiloOverlay").classList.add("active");
    // Attiva prima tab
    switchTab("anagrafica");
}

function closeProfiloModal() {
    document.getElementById("profiloOverlay").classList.remove("active");
}

/* ─── Tab switching ──────────────────────────────────── */
function switchTab(name) {
    document.querySelectorAll(".pro-tab").forEach((t) => {
        t.classList.toggle("active", t.dataset.tab === name);
    });
    document.querySelectorAll(".pro-tab-panel").forEach((p) => {
        p.classList.toggle(
            "active",
            p.id === "tab" + name.charAt(0).toUpperCase() + name.slice(1),
        );
    });
}

/* ─── Skill editor ───────────────────────────────────── */
function renderSkillsEditor() {
    const el = document.getElementById("proSkillsEditor");
    el.innerHTML = profiloData.skills
        .map((s, i) => `
            <div class="pro-skill-edit-row">
                <input type="text" value="${escapeHtml(s.name)}" placeholder="Es. Python" data-skill-index="${i}" data-skill-field="name"/>
                <select data-skill-index="${i}" data-skill-field="livello">
                    ${["Base", "Intermedio", "Avanzato"]
                    .map((lv) =>
                        `<option value="${lv}"${s.livello === lv ? " selected" : ""}>${lv}</option>`,
                    ).join("")}
                </select>
                <button class="pro-del-btn" data-skill-remove="${i}">✕</button>
            </div>
        `).join("");
}

function addSkillRow() {
    profiloData.skills.push({ name: "", livello: "Base" });
    renderSkillsEditor();
}

function removeSkill(i) {
    profiloData.skills.splice(i, 1);
    renderSkillsEditor();
}

/* ─── Soft skills editor ─────────────────────────────── */
function renderSoftEditor() {
    const el = document.getElementById("proSoftEditor");
    el.innerHTML = ALL_SOFT_SKILLS.map((s) => {
        const sel = profiloData.soft_skills.some((soft) => soft.label === s.label);
        return `
        <div class="pro-soft-check${sel ? " selected" : ""}" onclick="toggleSoft(this, '${s.label}')">
          <input type="checkbox"${sel ? " checked" : ""}/>
          <span class="pro-soft-check-icon">${svgIcon(s.icon)}</span>
          <span class="pro-soft-check-label">${s.label}</span>
        </div>`;
    }).join("");
}

function toggleSoft(el, label) {
    el.classList.toggle("selected");
    const idx = profiloData.soft_skills.findIndex((soft) => soft.label === label);
    if (idx === -1) {
        const found = ALL_SOFT_SKILLS.find((soft) => soft.label === label);
        profiloData.soft_skills.push({
            label,
            icon: found ? found.icon : "i-brain",
        });
    } else {
        profiloData.soft_skills.splice(idx, 1);
    }
}

/* ─── Status helper ──────────────────────────────────── */
function setApiStatus(msg, cls) {
    const el = document.getElementById("proApiStatus");
    el.textContent = msg;
    el.className =
        "pro-api-status" +
        (msg ? " show" : "") +
        (cls ? " " + cls : "");
}

function buildProfiloPayload() {
    return {
        name: profiloData.name,
        surname: profiloData.surname,
        email: profiloData.email,
        data_nascita: profiloData.data_nascita,
        sesso: profiloData.sesso,
        comune_nascita: profiloData.comune_nascita,
        codice_fiscale: profiloData.codice_fiscale,
        telefono: profiloData.telefono,
        indirizzo_studio: profiloData.indirizzo_studio,
        classe: profiloData.classe,
        indirizzo: profiloData.indirizzo,
        picture: profiloData.picture,
        skills: profiloData.skills
            .filter((skill) => String(skill.name || "").trim())
            .map((skill) => ({
                name: String(skill.name || "").trim(),
                livello: SKILL_LV_DB_MAP[skill.livello] || skill.livello,
            })),
        soft_skills: profiloData.soft_skills.map((soft) => ({
            label: soft.label,
            icon: soft.icon || "i-brain",
        })),
    };
}

/* ════════════════════════════════════════════════════════
   SALVA PROFILO — salvataggio locale
   In produzione sostituire con: fetch('/api/profile', { method: 'POST', body: JSON.stringify(profiloData) })
   ════════════════════════════════════════════════════════ */
async function salvaProfilo() {
    // Leggi valori dal form anagrafica
    profiloData.name = document.getElementById("fNome").value.trim();
    profiloData.surname = document.getElementById("fCognome").value.trim();
    profiloData.data_nascita = document.getElementById("fNascita").value;
    profiloData.codice_fiscale = document.getElementById("fCF").value.trim().toUpperCase();
    profiloData.comune_nascita = document.getElementById("fComune").value.trim();
    profiloData.telefono = document.getElementById("fTel").value.trim();
    const payload = buildProfiloPayload();
    const btn = document.getElementById("btnSalvaProfilo");
    btn.textContent = "Salvataggio...";
    btn.disabled = true;
    setApiStatus("Salvataggio in corso…", "");

    try {
        const response = await fetch("/api/users/profile/save", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`[ERROR] http code ${response.status}`);

        const result = await response.json();

        if (result.user) {
            profiloData = normalizeProfiloData(result.user);
        }

        updateProfiloUI(null);
        setApiStatus("Profilo aggiornato", "ok");
        setTimeout(closeProfiloModal, 1000);
    } catch (err) {
        console.error("Errore salvataggio profilo:", err);
        setApiStatus("Errore nel salvataggio. Riprova.", "err");
    } finally {
        btn.textContent = "Salva modifiche";
        btn.disabled = false;
    }
}

/* ─── Aggiorna la sezione profilo con i nuovi dati ───── */
function updateProfiloUI(apiResult) {
    // Nome hero
    document.querySelector(".profilo-hero-name").textContent = profiloData.name + " " + profiloData.surname;
    document.querySelector(".profilo-hero-sub").textContent = `Studente · ${profiloData.classe || ""} · ITIS Paleocapa, Bergamo`;
    const sidebarRole = document.querySelector(".user-role");

    if (sidebarRole) {
        sidebarRole.textContent = `Studente · ${profiloData.classe || ""}`;
    }

    const anagraficaEl = document.getElementById("proAnagrafica");
    if (anagraficaEl) {
        anagraficaEl.innerHTML = `
            <div class="pro-row"><span class="pro-lbl">Nome</span><span class="pro-val">${escapeHtml(profiloData.name)}</span></div>
            <div class="pro-row"><span class="pro-lbl">Cognome</span><span class="pro-val">${escapeHtml(profiloData.surname)}</span></div>
            <div class="pro-row"><span class="pro-lbl">Data di nascita</span><span class="pro-val">${escapeHtml(profiloData.data_nascita)}</span></div>
            <div class="pro-row"><span class="pro-lbl">Codice fiscale</span><span class="pro-val pro-mono">${escapeHtml(profiloData.codice_fiscale)}</span></div>
            <div class="pro-row"><span class="pro-lbl">Comune</span><span class="pro-val">${escapeHtml(profiloData.comune_nascita)}</span></div>
            <div class="pro-row"><span class="pro-lbl">Telefono</span><span class="pro-val">${escapeHtml(profiloData.telefono)}</span></div>
            <div class="pro-row"><span class="pro-lbl">Email</span><span class="pro-val">${escapeHtml(profiloData.email)}</span></div>`;
    }

    const scuolaEl = document.getElementById("proScuola");
    if (scuolaEl) {
        scuolaEl.innerHTML = `
            <div class="pro-row"><span class="pro-lbl">Istituto</span><span class="pro-val">ITIS Paleocapa</span></div>
            <div class="pro-row"><span class="pro-lbl">Indirizzo</span><span class="pro-val">${escapeHtml(profiloData.indirizzo_studio)}</span></div>
            <div class="pro-row"><span class="pro-lbl">Classe</span><span class="pro-val">${escapeHtml(profiloData.classe)}</span></div>
            <div class="pro-row"><span class="pro-lbl">Anno diploma</span><span class="pro-val">2025</span></div>`;
    }

    // Aggiorna suggerimento come tag (se presente)
    if (apiResult && apiResult.suggerimento) {
        const tagsEl = document.querySelector(".profilo-hero-tags");
        const existing = tagsEl.querySelector(".pro-tag-suggerimento");
        if (existing) existing.remove();
        const tag = document.createElement("span");
        tag.className = "pro-tag pro-tag-suggerimento";
        tag.textContent = apiResult.suggerimento;
        tagsEl.appendChild(tag);
    }

    // Ri-renderizza skills bar
    const skillsEl = document.getElementById("proSkills");
    if (skillsEl) {
        skillsEl.innerHTML = profiloData.skills
            .filter((s) => s.name)
            .map((s) => {
                const pct = SKILL_LV_MAP[s.livello] || 50;
                return `
                    <div class="pro-skill-row">
                        <span class="pro-skill-name">${escapeHtml(s.name)}</span>
                        <div class="pro-skill-bar"><div class="pro-skill-fill" style="width:${pct}%"></div></div>
                        <span class="pro-skill-lv">${escapeHtml(s.livello)}</span>
                    </div>
                `;
            })
            .join("");
    }

    // Ri-renderizza soft skills
    const softEl = document.getElementById("proSoftSkills");
    if (softEl) {
        softEl.innerHTML = profiloData.soft_skills
            .map((soft) => {
                return `
                    <div class="pro-soft-item">
                      <span class="pro-soft-icon">${svgIcon(soft.icon || "i-brain")}</span>
                      <span>${escapeHtml(soft.label)}</span>
                    </div>
                `;
            })
            .join("");
    }
}

/* ════════════════════════════════════════════════════════
   IMPOSTAZIONI
   ════════════════════════════════════════════════════════ */
let impostazioniData = {
    notifMatch: true,
    notifPercorsi: true,
    notifScuola: true,
    notifScadenze: false,
    notifEmail: true,
    privVisibilita: "school",
    privCondividi: true,
    privLink: false,
    tema: "dark",
    mezzoDefault: "driving-car",
    lingua: "it",
    reduceMotion: false,
};

/* ─── Salva toggle/select cambiati direttamente nella pagina ─ */
function saveImpostazioni() {
    impostazioniData.notifMatch =
        document.getElementById("notifMatch")?.checked;
    impostazioniData.notifPercorsi =
        document.getElementById("notifPercorsi")?.checked;
    impostazioniData.notifScuola =
        document.getElementById("notifScuola")?.checked;
    impostazioniData.notifScadenze =
        document.getElementById("notifScadenze")?.checked;
    impostazioniData.notifEmail =
        document.getElementById("notifEmail")?.checked;
    impostazioniData.privVisibilita =
        document.getElementById("privVisibilita")?.value;
    impostazioniData.privCondividi =
        document.getElementById("privCondividi")?.checked;
    impostazioniData.privLink = document.getElementById("privLink")?.checked;
    impostazioniData.mezzoDefault =
        document.getElementById("mezzoDefault")?.value;
    impostazioniData.lingua = document.getElementById("lingua")?.value;
    impostazioniData.reduceMotion =
        document.getElementById("reduceMotion")?.checked;
    showToast("Impostazione salvata");
}

/* ─── Tema segmented ─────────────────────────────────────── */
function setTema(btn) {
    document
        .querySelectorAll(".imp-seg")
        .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    impostazioniData.tema = btn.dataset.val;
    showToast("Tema aggiornato");
}

function closeImpModal() {
    document.getElementById("impOverlay").classList.remove("active");
}

function salvaImpModal() {
    saveImpostazioni();
    closeImpModal();
}

/* ─── Toast ──────────────────────────────────────────────── */
let toastTimer;
function showToast(msg) {
    const t = document.getElementById("impToast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

let notificationsMuted = false;

function updateNotificationsToggle() {
    const btn = document.getElementById("notificationsToggle");
    if (!btn) return;
    btn.classList.toggle("muted", notificationsMuted);
    btn.setAttribute("aria-pressed", String(notificationsMuted));
    btn.title = notificationsMuted
        ? "Riattiva notifiche"
        : "Disattiva notifiche";
}

/* ─── Esporta dati GDPR ──────────────────────────────────── */
function esportaDati() {
    const payload = {
        profilo: profiloData,
        impostazioni: impostazioniData,
        esportato: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "stagematch_dati.json";
    a.click();
    showToast("Download avviato");
}

/* ─── Esporta CV PDF (stub) ──────────────────────────────── */
function esportaCV() {
    showToast("Generazione PDF in corso...");
    setTimeout(() => showToast("CV pronto per il download"), 1800);
}

/* ════════════════════════════════════════════════════════
   LOGOUT MODAL
   ════════════════════════════════════════════════════════ */
function openLogoutModal() {
    document.getElementById("logoutOverlay").classList.add("active");
    document.getElementById("logoutCancel").focus();
}

function closeLogoutModal() {
    document.getElementById("logoutOverlay").classList.remove("active");
}

/* ─── SIDEBAR MOBILE ──────────────────────────────────── */
function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("open");
    document.getElementById("overlay").classList.toggle("active");
}

function closeSidebar() {
    document.getElementById("sidebar").classList.remove("open");
    document.getElementById("overlay").classList.remove("active");
}

/* ════════════════════════════════════════════════════════
   INIZIALIZZAZIONE — tutti gli event listener centralizzati
   qui, nessun onclick/onchange nel markup HTML
   ════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
    /* ── Render iniziale ─────────────────────────────────── */
    renderRecentRoutes();
    updateNotificationsToggle();
    loadProfiloData();

    /* ── Sidebar overlay (chiudi cliccando fuori) ────────── */
    document.getElementById("overlay").addEventListener("click", closeSidebar);

    /* ── Hamburger (mobile) ──────────────────────────────── */
    document
        .querySelector(".hamburger")
        .addEventListener("click", toggleSidebar);

    /* ── Nav items sidebar ───────────────────────────────── */
    document.getElementById("navDashboard").addEventListener("click", (e) => {
        e.preventDefault();
        showSection("dashboard");
        setActive(e.currentTarget);
    });
    document.getElementById("navPercorsi").addEventListener("click", (e) => {
        e.preventDefault();
        showSection("percorsi");
        setActive(e.currentTarget);
    });
    document.getElementById("navAziende").addEventListener("click", (e) => {
        e.preventDefault();
        showSection("aziende");
        setActive(e.currentTarget);
    });
    document.getElementById("navProfilo").addEventListener("click", (e) => {
        e.preventDefault();
        showSection("profilo");
        setActive(e.currentTarget);
    });
    document.getElementById("profiloButton").addEventListener("click", (e) => {
        e.preventDefault();
        showSection("profilo");
        setActive(document.getElementById("navProfilo"));
    });
    document
        .getElementById("navImpostazioni")
        .addEventListener("click", (e) => {
            e.preventDefault();
            showSection("impostazioni");
            setActive(e.currentTarget);
        });
    document.getElementById("navLogout").addEventListener("click", (e) => {
        e.preventDefault();
        openLogoutModal();
    });

    document.getElementById("aziendeList").addEventListener("click", (e) => {
        const detailsButton = e.target.closest('[data-action="open-company-details"]');
        if (detailsButton) {
            openCompanyDetails(detailsButton.dataset.companyId);
            return;
        }

        const companyCard = e.target.closest(".co-card");
        if (companyCard) openCompanyDetails(companyCard.dataset.id);
    });

    document
        .getElementById("companyDetailsClose")
        .addEventListener("click", closeCompanyDetails);
    document
        .getElementById("companyDetailsOverlay")
        .addEventListener("click", (e) => {
            if (e.target === e.currentTarget) closeCompanyDetails();
        });
    document
        .getElementById("companyDetailsContent")
        .addEventListener("click", (e) => {
            const mapButton = e.target.closest('[data-action="go-to-company-map"]');
            if (mapButton) {
                goToMap(mapButton.dataset.companyId);
            }
        });
    document.addEventListener("keydown", (e) => {
        if (
            e.key === "Escape" &&
            document
                .getElementById("companyDetailsOverlay")
                .classList.contains("active")
        ) {
            closeCompanyDetails();
        }
    });

    /* ── Bottoni dashboard ───────────────────────────────── */
    document.getElementById("btnDashAziende").addEventListener("click", () => {
        showSection("aziende");
        setActive(document.getElementById("navAziende"));
    });
    document.getElementById("btnVediPercorsi").addEventListener("click", () => {
        showSection("percorsi");
        setActive(document.getElementById("navPercorsi"));
    });

    const notificationsToggle = document.getElementById("notificationsToggle");
    if (notificationsToggle) {
        notificationsToggle.addEventListener("click", () => {
            notificationsMuted = !notificationsMuted;
            updateNotificationsToggle();
            showToast(
                notificationsMuted
                    ? "Notifiche silenziate"
                    : "Notifiche riattivate",
            );
        });
    }

    /* ── Transport pills (hero card) ─────────────────────── */
    document.querySelectorAll(".t-pill").forEach((pill) => {
        pill.addEventListener("click", () => {
            document
                .querySelectorAll(".t-pill")
                .forEach((p) => p.classList.remove("active"));
            pill.classList.add("active");
        });
    });

    /* ── Filtri percorsi ─────────────────────────────────── */
    document.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            document
                .querySelectorAll(".filter-btn")
                .forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            currentFilter = btn.dataset.filter;
            if (percorsiLoaded) renderRoutes(MOCK_ROUTES, currentFilter);
        });
    });

    /* ── Profilo: apri modal ─────────────────────────────── */
    document
        .getElementById("btnEditProfilo")
        .addEventListener("click", openProfiloModal);

    /* ── Profilo modal: tab switching ────────────────────── */
    document.querySelectorAll(".pro-tab").forEach((tab) => {
        tab.addEventListener("click", () => switchTab(tab.dataset.tab));
    });

    /* ── Profilo modal: tasto ✕ chiude il modal ─────────── */
    document
        .querySelector("#profiloOverlay .profilo-modal-close")
        .addEventListener("click", closeProfiloModal);

    /* ── Profilo modal: aggiungi competenza ──────────────── */
    document
        .querySelector(".pro-add-btn")
        .addEventListener("click", addSkillRow);

    /* ── Profilo modal: skill editor dinamico ───────────── */
    document.getElementById("proSkillsEditor").addEventListener("change", (e) => {
        const { skillIndex, skillField } = e.target.dataset;
        if (skillIndex === undefined || !skillField) return;

        profiloData.skills[Number(skillIndex)][skillField] = e.target.value;
    });
    document.getElementById("proSkillsEditor").addEventListener("click", (e) => {
        const removeButton = e.target.closest("[data-skill-remove]");
        if (!removeButton) return;

        removeSkill(Number(removeButton.dataset.skillRemove));
    });

    /* ── Profilo modal: annulla e salva ──────────────────── */
    document
        .querySelector("#profiloOverlay .logout-btn-cancel")
        .addEventListener("click", closeProfiloModal);
    document
        .getElementById("btnSalvaProfilo")
        .addEventListener("click", salvaProfilo);

    /* ── Profilo modal: chiudi cliccando fuori ───────────── */
    document.getElementById("profiloOverlay").addEventListener("click", (e) => {
        if (e.target === document.getElementById("profiloOverlay"))
            closeProfiloModal();
    });

    /* ── Impostazioni modal: chiudi e salva ──────────────── */
    document
        .querySelector("#impOverlay .logout-btn-cancel")
        .addEventListener("click", closeImpModal);
    document
        .getElementById("btnSalvaImp")
        .addEventListener("click", salvaImpModal);

    /* ── Impostazioni modal: chiudi cliccando fuori ──────── */
    document.getElementById("impOverlay").addEventListener("click", (e) => {
        if (e.target === document.getElementById("impOverlay")) closeImpModal();
    });

    /* ── Impostazioni toggles e select ──────────────────────
       Usa event delegation sull'intera sezione impostazioni
       per intercettare qualsiasi checkbox/select cambiato.  */
    document
        .getElementById("sectionImpostazioni")
        .addEventListener("change", saveImpostazioni);

    /* ── Impostazioni tema segmented ─────────────────────── */
    document.querySelectorAll(".imp-seg").forEach((btn) => {
        btn.addEventListener("click", () => setTema(btn));
    });

    /* ── Impostazioni: esporta dati e CV ─────────────────── */
    document
        .querySelector('[data-action="esportaDati"]')
        .addEventListener("click", esportaDati);
    document
        .querySelector('[data-action="esportaCV"]')
        .addEventListener("click", esportaCV);

    /* ── Logout modal ────────────────────────────────────── */
    document
        .getElementById("logoutCancel")
        .addEventListener("click", closeLogoutModal);
    document.getElementById("logoutConfirm").addEventListener("click", () => {
        window.location.href = "/auth/logout";
    });
    document.getElementById("logoutOverlay").addEventListener("click", (e) => {
        if (e.target === document.getElementById("logoutOverlay"))
            closeLogoutModal();
    });

    /* ── ESC: chiude tutti i modal ───────────────────────── */
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeSidebar();
            closeLogoutModal();
            closeProfiloModal();
            closeImpModal();
        }
    });
});