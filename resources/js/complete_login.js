/* ════════════════════════════════════════════
   complete.js — StageMatch profile completion
   ════════════════════════════════════════════ */

"use strict";

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

/* ── Field inputs ── */
const fields = {
    data_nascita: document.getElementById("data_nascita"),
    comune: document.getElementById("comune"),
    codice_fiscale: document.getElementById("codice_fiscale"),
    telefono: document.getElementById("telefono"),
    indirizzo: document.getElementById("indirizzo"),
    // disabled (JWT)
    nome: document.getElementById("nome"),
    cognome: document.getElementById("cognome"),
    email: document.getElementById("email"),
};

/* ════════════════════════════════════
   JWT — auto-fill disabled fields
   Adatta extractJwtPayload() al tuo
   sistema di auth (cookie / header).
   ════════════════════════════════════ */
function getCookie(name) {
    const match = document.cookie.match(
        new RegExp("(?:^|;\\s*)" + name + "=([^;]*)"),
    );
    return match ? decodeURIComponent(match[1]) : null;
}

function extractJwtPayload(token) {
    try {
        const base64 = token
            .split(".")[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");
        return JSON.parse(atob(base64));
    } catch {
        return null;
    }
}

function prefillFromJwt() {
    // Legge il token dal cookie "access_token" — cambia il nome se necessario
    const token = getCookie("access_token");
    if (!token) return;

    const payload = extractJwtPayload(token);
    if (!payload) return;

    // Mappa claim JWT → input (adatta i nomi dei claim al tuo provider)
    const map = {
        nome: payload.given_name || payload.nome || "",
        cognome: payload.family_name || payload.cognome || "",
        email: payload.email || "",
    };

    Object.entries(map).forEach(([key, value]) => {
        if (fields[key] && value) fields[key].value = value;
    });
}

/* ════════════════════════════════════
   Validazioni
   ════════════════════════════════════ */

/**
 * Codice Fiscale italiano — 16 caratteri alfanumerici con struttura fissa.
 * Regex conforme alla specifica ministeriale.
 */
const CF_REGEX =
    /^[A-Z]{6}[0-9LMNPQRSTUV]{2}[ABCDEHLMPRST]{1}[0-9LMNPQRSTUV]{2}[A-Z]{1}[0-9LMNPQRSTUV]{3}[A-Z]{1}$/i;

function validateCF(value) {
    const v = value.trim().toUpperCase();
    if (!v) return "Il codice fiscale è obbligatorio.";
    if (v.length !== 16)
        return "Il codice fiscale deve avere esattamente 16 caratteri.";
    if (!CF_REGEX.test(v)) return "Formato codice fiscale non valido.";
    return null;
}

/**
 * Telefono — accetta formati italiani e internazionali:
 *   +39 333 1234567 | 3331234567 | 02 1234567 | +1-800-555-0100
 */
const TEL_REGEX =
    /^\+?[0-9]{1,4}?[\s.\-]?(\(?\d{2,4}\)?[\s.\-]?)?\d{3,4}[\s.\-]?\d{3,5}([\s.\-]?\d{1,4})?$/;

function validateTelefono(value) {
    const v = value.trim();
    if (!v) return "Il telefono è obbligatorio.";
    const digits = v.replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15)
        return "Inserisci un numero di telefono valido (8–15 cifre).";
    if (!TEL_REGEX.test(v)) return "Formato numero di telefono non valido.";
    return null;
}

/**
 * Comune — solo lettere, spazi, apostrofi, trattini. Min 2 caratteri.
 * Copre nomi come "Reggio Emilia", "Sant'Agata", "Ascoli-Satriano".
 */
const COMUNE_REGEX = /^[A-ZÀ-Ùa-zà-ù]{2,}[A-ZÀ-Ùa-zà-ù\s'\-]*$/;

function validateComune(value) {
    const v = value.trim();
    if (!v) return "Il comune è obbligatorio.";
    if (v.length < 2) return "Inserisci un comune valido.";
    if (!COMUNE_REGEX.test(v))
        return "Il comune può contenere solo lettere, spazi, apostrofi o trattini.";
    return null;
}

function validateDataNascita(value) {
    if (!value) return "La data di nascita è obbligatoria.";
    const date = new Date(value);
    const now = new Date();
    const age = (now - date) / (365.25 * 24 * 3600 * 1000);
    if (age < 10) return "Data di nascita non valida.";
    if (age > 100) return "Data di nascita non plausibile.";
    return null;
}

function validateIndirizzo(value) {
    if (!value) return "Seleziona un indirizzo di studio.";
    return null;
}

/* Mappa field id → funzione di validazione */
const validators = {
    data_nascita: validateDataNascita,
    comune: validateComune,
    codice_fiscale: validateCF,
    telefono: validateTelefono,
    indirizzo: validateIndirizzo,
};

/* Mostra / nasconde errore inline */
function showError(fieldId, message) {
    const el = document.getElementById("err-" + fieldId);
    const input = fields[fieldId];
    if (el) el.textContent = message || "";
    if (input) {
        if (message) input.classList.add("invalid");
        else input.classList.remove("invalid");
    }
}

/* Valida un singolo campo e aggiorna UI. Ritorna true se ok. */
function validateField(fieldId) {
    const validator = validators[fieldId];
    if (!validator) return true;
    const value = fields[fieldId]?.value ?? "";
    const error = validator(value);
    showError(fieldId, error);
    return !error;
}

/* Valida tutti i campi modificabili. Ritorna true se tutti ok. */
function validateAll() {
    let allValid = true;
    Object.keys(validators).forEach((id) => {
        if (!validateField(id)) allValid = false;
    });
    return allValid;
}

/* ── Validazione live (on blur) ── */
Object.keys(validators).forEach((id) => {
    const el = fields[id];
    if (!el) return;
    el.addEventListener("blur", () => validateField(id));
    el.addEventListener("input", () => {
        // Rimuove errore appena si inizia a correggere
        if (el.classList.contains("invalid")) validateField(id);
    });
});

/* ── CF → uppercase live ── */
fields.codice_fiscale.addEventListener("input", () => {
    const pos = fields.codice_fiscale.selectionStart;
    fields.codice_fiscale.value = fields.codice_fiscale.value.toUpperCase();
    fields.codice_fiscale.setSelectionRange(pos, pos);
});

/* ════════════════════════════════════
   Modal open / close
   ════════════════════════════════════ */
function openModal() {
    overlay.classList.add("visible");
    document.body.style.overflow = "hidden";
    // Focus primo campo editabile
    setTimeout(() => fields.data_nascita?.focus(), 400);
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
   Form submit
   ════════════════════════════════════ */
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateAll()) {
        // Scroll al primo errore
        const firstInvalid = form.querySelector(".invalid");
        if (firstInvalid)
            firstInvalid.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        return;
    }

    /* UI loading */
    submitBtn.disabled = true;
    submitLabel.textContent = "Salvataggio…";

    try {
        const payload = new FormData(form);

        const res = await fetch("/logged/complete", {
            method: "POST",
            body: payload,
            // Se preferisci JSON:
            // headers: { 'Content-Type': 'application/json' },
            // body: JSON.stringify(Object.fromEntries(payload)),
        });

        if (!res.ok) {
            const msg = await res.text().catch(() => "");
            throw new Error(msg || `Errore HTTP ${res.status}`);
        }

        /* Successo */
        showSuccess(res);
    } catch (err) {
        console.error("[StageMatch] Submit error:", err);
        submitBtn.disabled = false;
        submitLabel.textContent = "Salva e continua";

        // Mostra errore globale sotto il form
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

/* ── Schermata successo + redirect ── */
function showSuccess(res) {
    form.style.display = "none";
    successMsg.style.display = "flex";
    modalFooter.style.display = "none";

    // Avvia progress bar → redirect dopo 2 s
    requestAnimationFrame(() => {
        progressFill.style.width = "100%";
    });

    setTimeout(() => {
        if (res?.redirected && res.url) {
            window.location.href = res.url;
        } else {
            window.location.href = "/logged/homepage";
        }
    }, 2100);
}

/* ════════════════════════════════════
   Init
   ════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
    prefillFromJwt();

    // Apre automaticamente il modal (la pagina serve solo a questo)
    openModal();
});