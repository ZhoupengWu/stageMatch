const loginBtn = document.getElementById('loginBtn');

window.addEventListener("pageshow", () => {
    loginBtn.textContent = 'Login';
    loginBtn.disabled = false;
    loginBtn.style.opacity = '1';
});

loginBtn.addEventListener('click', () => {
    loginBtn.textContent = 'Login in corso…';
    loginBtn.disabled = true;
    loginBtn.style.opacity = '0.65';

    setTimeout(() => {
        window.location.href = "/auth/login";
    }, 1000);
});