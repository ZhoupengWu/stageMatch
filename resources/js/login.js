/**
 * stageMatch – main.js
 * Gestisce le interazioni del bottone Login.
 */

(function () {
    'use strict';

    const loginBtn = document.getElementById('loginBtn');

    if (!loginBtn) return;

    loginBtn.addEventListener('click', handleLogin);

    function handleLogin() {
        // Feedback visivo immediato
        loginBtn.textContent = 'Accesso in corso…';
        loginBtn.disabled = true;
        loginBtn.style.opacity = '0.65';

        // Placeholder: sostituire con la logica di autenticazione reale
        setTimeout(() => {
            loginBtn.textContent = 'Login';
            loginBtn.disabled = false;
            loginBtn.style.opacity = '';
        }, 2000);
    }
})();
