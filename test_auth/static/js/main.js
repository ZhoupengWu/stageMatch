/**
 * SSO Blueprint — main.js
 * Utility JavaScript lato client.
 * Nessuna dipendenza esterna richiesta.
 */

/* ============================================================
   FLASH MESSAGES — auto-dismiss dopo 5 secondi
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {

    const alerts = document.querySelectorAll('.alert[data-autodismiss]');
    alerts.forEach(function (el) {
        const delay = parseInt(el.dataset.autodismiss) || 5000;
        setTimeout(function () {
            el.style.transition = 'opacity 0.4s ease';
            el.style.opacity = '0';
            setTimeout(function () { el.remove(); }, 450);
        }, delay);
    });

    /* ============================================================
       CONFIRM DIALOGS — attributo data-confirm su qualsiasi form/button
       Esempio: <button data-confirm="Sei sicuro?">Elimina</button>
       ============================================================ */
    document.querySelectorAll('[data-confirm]').forEach(function (el) {
        el.addEventListener('click', function (e) {
            const msg = el.dataset.confirm || 'Sei sicuro di voler procedere?';
            if (!window.confirm(msg)) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    });

    /* ============================================================
       ACTIVE NAV LINK — aggiunge classe "active" al link corrente
       ============================================================ */
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(function (link) {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });

    /* ============================================================
       SESSION TIMER — mostra un avviso prima della scadenza
       (opzionale, basato su data-session-expires nell'header)
       ============================================================ */
    const expiresEl = document.querySelector('[data-session-expires]');
    if (expiresEl) {
        const expiresAt = parseInt(expiresEl.dataset.sessionExpires) * 1000;
        const warnBefore = 5 * 60 * 1000; // 5 minuti prima

        function checkExpiry() {
            const remaining = expiresAt - Date.now();
            if (remaining > 0 && remaining < warnBefore) {
                showSessionWarning(Math.round(remaining / 60000));
            } else if (remaining <= 0) {
                window.location.reload();
            }
        }

        setInterval(checkExpiry, 30000);
    }

    function showSessionWarning(minutesLeft) {
        if (document.getElementById('session-warn')) return;
        const banner = document.createElement('div');
        banner.id = 'session-warn';
        banner.className = 'alert alert-warning';
        banner.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;max-width:360px;box-shadow:0 4px 20px rgba(0,0,0,0.15);';
        banner.innerHTML = '⏱️ La tua sessione scade tra <strong>' + minutesLeft + ' minuti</strong>. Salva il lavoro.';
        document.body.appendChild(banner);
    }

});

/* ============================================================
   UTILITY GLOBALE — esposta come window.Blueprint
   ============================================================ */
window.Blueprint = {

    /**
     * Mostra un toast temporaneo
     * @param {string} message
     * @param {'success'|'error'|'info'|'warning'} type
     * @param {number} duration ms
     */
    toast: function (message, type, duration) {
        type = type || 'info';
        duration = duration || 3500;

        var el = document.createElement('div');
        el.className = 'alert alert-' + type;
        el.style.cssText = [
            'position:fixed',
            'bottom:24px',
            'right:24px',
            'z-index:9999',
            'max-width:380px',
            'box-shadow:0 4px 20px rgba(0,0,0,0.15)',
            'animation:slideIn 0.3s ease'
        ].join(';');
        el.textContent = message;
        document.body.appendChild(el);

        setTimeout(function () {
            el.style.opacity = '0';
            el.style.transition = 'opacity 0.4s';
            setTimeout(function () { el.remove(); }, 420);
        }, duration);
    },

    /**
     * Copia testo negli appunti
     * @param {string} text
     */
    copyToClipboard: function (text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(function () {
                Blueprint.toast('Copiato negli appunti', 'success', 2000);
            });
        } else {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            Blueprint.toast('Copiato negli appunti', 'success', 2000);
        }
    }
};
