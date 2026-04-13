"use strict";

/* ════════════════════════════════════════════════════════
   complete_login.js — StageMatch profile completion
   ════════════════════════════════════════════════════════ */

/* ── DOM refs ── */
const overlay = document.getElementById("modalOverlay");
const openBtn = document.getElementById("openModal");
const closeBtn = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");
const form = document.getElementById("studentForm");
const successMsg = document.getElementById("successMsg");
const modalFooter = document.getElementById("modalFooter");
const submitBtn = document.getElementById("submitBtn");
const submitLabel = document.getElementById("submitLabel");
const progressFill = document.getElementById("progressFill");

const fields = {
    nome: document.getElementById("nome"),
    cognome: document.getElementById("cognome"),
    email: document.getElementById("email"),
    data_nascita: document.getElementById("data_nascita"),
    comune_nascita: document.getElementById("comune_nascita"),
    comune_nascita_code: document.getElementById("comune_nascita_code"),
    codice_fiscale: document.getElementById("codice_fiscale"),
    telefono: document.getElementById("telefono"),
    indirizzo_studio: document.getElementById("indirizzo_studio"),
    via: document.getElementById("via"),
    civico: document.getElementById("civico"),
    cap: document.getElementById("cap"),
    citta_residenza: document.getElementById("citta_residenza"),
};

/* ════════════════════════════════════
   COMUNI — dataset caricato una volta
   Fonte: axiosbase/comuni-italiani (GitHub, pubblico)
   ════════════════════════════════════ */
let comuniDB = []; // [{nome, codiceBelfiore, provincia, regione}]

async function loadComuni() {
    try {
        const res = await fetch("https://raw.githubusercontent.com/axiostudio/comuni-italiani/refs/heads/main/data/import/json/gi_comuni.json");

        if (!res.ok) throw new Error(`[ERROR] ${res.status}`);

        const raw = await res.json();

        comuniDB = raw
            .map((c) => ({
                nome: (c.denominazione_ita || "").trim(),
                codiceBelfiore: (c.codice_belfiore || "").trim().toUpperCase(),
                provincia: (c.sigla_provincia || "").trim().toUpperCase(),
            }))
            .filter((c) => c.nome);
    } catch {
        comuniDB = [];
    }
}

function searchComuni(query, limit = 8) {
    if (!query || query.length < 2) return [];
    const q = query
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    return comuniDB
        .filter((c) => {
            const n = c.nome
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");
            return n.startsWith(q);
        })
        .slice(0, limit);
}

/* ── Autocomplete widget ── */
function setupAutocomplete(inputId, listId, { onSelect } = {}) {
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);

    if (!input || !list) return;

    let activeIdx = -1;
    let selectedValid = false;

    function renderList(results) {
        list.innerHTML = "";
        activeIdx = -1;

        if (!results.length) {
            list.classList.remove("open");

            return;
        }

        const q = input.value.trim();

        results.forEach((c, i) => {
            const li = document.createElement("li");
            const hl = c.nome.substring(0, q.length);
            const rest = c.nome.substring(q.length);
            li.innerHTML =
                `<em>${hl}</em>${rest}` +
                (c.provincia
                    ? `<span style="opacity:.45;font-size:.78em;margin-left:.5rem">${c.provincia}</span>`
                    : "");
            li.setAttribute("role", "option");
            li.addEventListener("mousedown", (e) => {
                e.preventDefault();
                selectItem(c);
            });
            list.appendChild(li);
        });

        list.classList.add("open");
    }

    function selectItem(comune) {
        input.value = comune.nome;
        selectedValid = true;
        list.classList.remove("open");
        list.innerHTML = "";

        if (onSelect) onSelect(comune);

        clearError(
            inputId
                .replace("comune_nascita", "comune_nascita")
                .replace("citta_residenza", "citta_residenza"),
        );
    }

    function highlightItem(idx) {
        const items = list.querySelectorAll("li");
        items.forEach((li, i) => li.classList.toggle("active", i === idx));
    }

    input.addEventListener("input", () => {
        selectedValid = false;

        if (fields.comune_nascita_code && inputId === "comune_nascita") {
            fields.comune_nascita_code.value = "";
        }

        renderList(searchComuni(input.value));
    });

    input.addEventListener("keydown", (e) => {
        const items = list.querySelectorAll("li");
        if (!items.length) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            activeIdx = Math.min(activeIdx + 1, items.length - 1);
            highlightItem(activeIdx);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            activeIdx = Math.max(activeIdx - 1, 0);
            highlightItem(activeIdx);
        } else if (e.key === "Enter" && activeIdx >= 0) {
            e.preventDefault();
            const results = searchComuni(input.value);
            if (results[activeIdx]) selectItem(results[activeIdx]);
        } else if (e.key === "Escape") {
            list.classList.remove("open");
        }
    });

    document.addEventListener("click", (e) => {
        if (!input.contains(e.target) && !list.contains(e.target)) {
            list.classList.remove("open");
        }
    });

    //input._acValid = () => selectedValid || comuniDB.length === 0; DA CONTROLLARE
}

/* ════════════════════════════════════
   CODICE FISCALE — calcolo puro JS
   ════════════════════════════════════ */
const CF_VOWELS = "AEIOU";
const CF_CONSONANTS = "BCDFGHJKLMNPQRSTVWXYZ";

function cfLetters(s) {
    s = s.toUpperCase().replace(/[^A-Z]/g, "");
    const consonants = s.split("").filter((c) => CF_CONSONANTS.includes(c));
    const vowels = s.split("").filter((c) => CF_VOWELS.includes(c));
    const letters = [...consonants, ...vowels, "X", "X", "X"];
    return letters.slice(0, 3).join("");
}

function cfSurname(cognome) {
    return cfLetters(cognome);
}

function cfName(nome) {
    const s = nome.toUpperCase().replace(/[^A-Z]/g, "");
    const consonants = s.split("").filter((c) => CF_CONSONANTS.includes(c));
    if (consonants.length >= 4) {
        return [consonants[0], consonants[2], consonants[3]].join("");
    }
    return cfLetters(nome);
}

const CF_MONTH_CODES = "ABCDEHLMPRST";

function cfDate(dateStr, sesso = "M") {
    // dateStr: YYYY-MM-DD
    const [y, m, d] = dateStr.split("-").map(Number);
    const year = String(y).slice(-2);
    const month = CF_MONTH_CODES[m - 1];
    const day =
        sesso === "F"
            ? String(d + 40).padStart(2, "0")
            : String(d).padStart(2, "0");
    return year + month + day;
}

const CF_ODD = {
    0: 1,
    1: 0,
    2: 5,
    3: 7,
    4: 9,
    5: 13,
    6: 15,
    7: 17,
    8: 19,
    9: 21,
    A: 1,
    B: 0,
    C: 5,
    D: 7,
    E: 9,
    F: 13,
    G: 15,
    H: 17,
    I: 19,
    J: 21,
    K: 2,
    L: 4,
    M: 18,
    N: 20,
    O: 11,
    P: 3,
    Q: 6,
    R: 8,
    S: 12,
    T: 14,
    U: 16,
    V: 10,
    W: 22,
    X: 25,
    Y: 24,
    Z: 23,
};

function cfCheckChar(partial) {
    // partial = 15-char string
    let sum = 0;
    for (let i = 0; i < 15; i++) {
        const c = partial[i];
        if (i % 2 === 0) {
            // odd positions (1-based) = even index
            sum += CF_ODD[c] ?? 0;
        } else {
            const n = parseInt(c);
            sum += isNaN(n) ? c.charCodeAt(0) - 65 : n;
        }
    }
    return String.fromCharCode(65 + (sum % 26));
}

function calculateCF(nome, cognome, dataNascita, codiceBelfiore, sesso = "M") {
    const sur = cfSurname(cognome);
    const nam = cfName(nome);
    const dat = cfDate(dataNascita, sesso);
    const belf = (codiceBelfiore || "")
        .toUpperCase()
        .padEnd(4, "X")
        .slice(0, 4);
    const partial = sur + nam + dat + belf;
    return partial + cfCheckChar(partial);
}

/* ════════════════════════════════════
   VALIDAZIONI
   ════════════════════════════════════ */
const CF_REGEX =
    /^[A-Z]{6}[0-9LMNPQRSTUV]{2}[ABCDEHLMPRST][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z]$/i;
const TEL_REGEX =
    /^\+?[0-9]{1,4}?[\s.\-]?(\(?\d{2,4}\)?[\s.\-]?)?\d{3,4}[\s.\-]?\d{3,5}([\s.\-]?\d{1,4})?$/;
const COMUNE_REGEX = /^[A-ZÀ-Ùa-zà-ù]{2,}[A-ZÀ-Ùa-zà-ù\s'\-]*$/;
const CAP_REGEX = /^\d{5}$/;

const validators = {
    data_nascita(v) {
        if (!v) return "La data di nascita è obbligatoria.";
        const age = (Date.now() - new Date(v)) / (365.25 * 24 * 3600 * 1000);
        if (age < 10 || age > 100) return "Data di nascita non valida.";
        return null;
    },
    comune_nascita(v) {
        if (!v.trim()) return "Il comune di nascita è obbligatorio.";
        if (!COMUNE_REGEX.test(v.trim())) return "Comune non valido.";
        return null;
    },
    codice_fiscale(v) {
        const s = v.trim().toUpperCase();
        if (!s) return "Il codice fiscale è obbligatorio.";
        if (s.length !== 16) return "Deve avere esattamente 16 caratteri.";
        if (!CF_REGEX.test(s)) return "Formato non valido.";
        return null;
    },
    telefono(v) {
        const s = v.trim();
        if (!s) return "Il telefono è obbligatorio.";
        const digits = s.replace(/\D/g, "");
        if (digits.length < 8 || digits.length > 15)
            return "Numero non valido (8–15 cifre).";
        if (!TEL_REGEX.test(s)) return "Formato non valido.";
        return null;
    },
    indirizzo_studio(v) {
        if (!v) return "Seleziona un indirizzo di studio.";
        return null;
    },
    via(v) {
        if (!v.trim()) return "La via è obbligatoria.";
        if (v.trim().length < 3) return "Inserisci un indirizzo valido.";
        return null;
    },
    civico(v) {
        if (!v.trim()) return "Il numero civico è obbligatorio.";
        return null;
    },
    cap(v) {
        if (!v.trim()) return "Il CAP è obbligatorio.";
        if (!CAP_REGEX.test(v.trim())) return "CAP non valido (5 cifre).";
        return null;
    },
    citta_residenza(v) {
        if (!v.trim()) return "La città di residenza è obbligatoria.";
        if (!COMUNE_REGEX.test(v.trim())) return "Città non valida.";
        return null;
    },
};

function showError(fieldId, message) {
    const errEl = document.getElementById("err-" + fieldId);
    const input = fields[fieldId];
    if (errEl) errEl.textContent = message || "";
    if (input) input.classList.toggle("invalid", !!message);
}

function clearError(fieldId) {
    showError(fieldId, null);
}

function setHint(fieldId, message) {
    const el = document.getElementById("hint-" + fieldId);
    if (el) el.textContent = message || "";
}

function validateField(id) {
    const fn = validators[id];
    if (!fn) return true;
    const el = fields[id];
    const val = el ? el.value : "";
    const err = fn(val);
    showError(id, err);
    return !err;
}

function validateAll() {
    return Object.keys(validators).reduce(
        (ok, id) => validateField(id) && ok,
        true,
    );
}

/* ── Live validation on blur ── */
Object.keys(validators).forEach((id) => {
    const el = fields[id];
    if (!el) return;
    el.addEventListener("blur", () => validateField(id));
    el.addEventListener("input", () => {
        if (el.classList.contains("invalid")) validateField(id);
    });
});

/* ── CF uppercase live ── */
fields.codice_fiscale.addEventListener("input", () => {
    const pos = fields.codice_fiscale.selectionStart;
    fields.codice_fiscale.value = fields.codice_fiscale.value.toUpperCase();
    fields.codice_fiscale.setSelectionRange(pos, pos);
});

/* ── CAP: solo numeri ── */
fields.cap.addEventListener("input", () => {
    fields.cap.value = fields.cap.value.replace(/\D/g, "").slice(0, 5);
});

/* ════════════════════════════════════
   BOTTONE CALCOLA CF
   ════════════════════════════════════ */
document.getElementById("cfCalcBtn").addEventListener("click", () => {
    const nome = fields.nome.value.trim();
    const cognome = fields.cognome.value.trim();
    const data = fields.data_nascita.value;
    const comune = fields.comune_nascita.value.trim();
    const codice = fields.comune_nascita_code.value.trim();

    const missing = [];
    if (!nome) missing.push("nome");
    if (!cognome) missing.push("cognome");
    if (!data) missing.push("data di nascita");
    if (!comune) missing.push("comune di nascita");

    if (missing.length) {
        setHint("codice_fiscale", "");
        showError("codice_fiscale", `Compila prima: ${missing.join(", ")}.`);
        return;
    }

    if (!codice) {
        // Comune digitato ma non selezionato dall'autocomplete → prova a cercarlo
        const match = comuniDB.find(
            (c) => c.nome.toLowerCase() === comune.toLowerCase(),
        );
        if (!match) {
            setHint("codice_fiscale", "");
            showError(
                "codice_fiscale",
                "Seleziona il comune dalla lista per calcolare il codice fiscale.",
            );
            return;
        }
        fields.comune_nascita_code.value = match.codiceBelfiore;
    }

    const belfiore = fields.comune_nascita_code.value;
    const cf = calculateCF(nome, cognome, data, belfiore);
    fields.codice_fiscale.value = cf;
    fields.codice_fiscale.classList.remove("invalid");
    showError("codice_fiscale", null);
    setHint(
        "codice_fiscale",
        "✓ Calcolato automaticamente - verifica che sia corretto.",
    );
});

/* ════════════════════════════════════
   MODAL open / close
   ════════════════════════════════════ */
function openModal() {
    overlay.classList.add("visible");
    document.body.style.overflow = "hidden";
    setTimeout(() => fields.data_nascita?.focus(), 420);
}

function closeModal() {
    overlay.classList.remove("visible");
    document.body.style.overflow = "";
}

openBtn.addEventListener("click", openModal);
closeBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);
overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
});
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
});

/* ════════════════════════════════════
   FORM SUBMIT
   ════════════════════════════════════ */
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateAll()) {
        const first = form.querySelector(".invalid");
        first?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
    }

    submitBtn.disabled = true;
    submitLabel.textContent = "Salvataggio…";

    try {
        const res = await fetch("/logged/complete", {
            method: "POST",
            body: new FormData(form),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        showSuccess(res);
    } catch (err) {
        console.error("[StageMatch]", err);
        submitBtn.disabled = false;
        submitLabel.textContent = "Salva e continua";

        let globalErr = document.getElementById("global-error");
        if (!globalErr) {
            globalErr = document.createElement("p");
            globalErr.id = "global-error";
            globalErr.style.cssText =
                "color:rgba(255,110,110,.9);font-size:.78rem;text-align:center;margin-top:.75rem;";
            form.appendChild(globalErr);
        }
        globalErr.textContent =
            "Si è verificato un errore. Riprova o contatta il supporto.";
    }
});

function showSuccess(res) {
    form.style.display = "none";
    successMsg.style.display = "flex";
    modalFooter.style.display = "none";
    requestAnimationFrame(() => {
        progressFill.style.width = "100%";
    });
    setTimeout(() => {
        window.location.href = res?.redirected ? res.url : "/logged/homepage";
    }, 2100);
}

/* ════════════════════════════════════
   INIT
   ════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", async () => {
    // Carica DB comuni in background
    await loadComuni();

    // Setup autocomplete
    setupAutocomplete("comune_nascita", "comune_nascita_list", {
        onSelect(comune) {
            fields.comune_nascita_code.value = comune.codiceBelfiore;
            clearError("comune_nascita");
        },
    });

    setupAutocomplete("citta_residenza", "citta_residenza_list", {
        onSelect() {
            clearError("citta_residenza");
        },
    });

    openModal();
});