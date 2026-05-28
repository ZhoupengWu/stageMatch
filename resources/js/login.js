const loginBtn = document.getElementById('loginBtn');

window.addEventListener("pageshow", () => {
    loginBtn.textContent = 'Accedi con Google';
    loginBtn.disabled = false;
    loginBtn.style.opacity = '1';
});

loginBtn.addEventListener('click', () => {
    loginBtn.textContent = 'Accesso in corso…';
    loginBtn.disabled = true;
    loginBtn.style.opacity = '0.7';

    setTimeout(() => {
        window.location.href = "/sso/login";
    }, 800);
});