const loginBtn = document.getElementById('loginBtn');

loginBtn.addEventListener('click', () => {
    loginBtn.textContent = 'Login in corso…';
    loginBtn.disabled = true;
    loginBtn.style.opacity = '0.65';

    setTimeout(() => {
        window.location.href = "/test";
    }, 1000);
});