/* landing.js — stageMatch homepage interactions */

document.addEventListener('DOMContentLoaded', () => {
    /* ── SCROLL REVEAL: sezioni che entrano dal basso ─────────── */
    const revealTargets = document.querySelectorAll(
        '.feature-card, .step'
    );

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, { threshold: 0.12 });

    revealTargets.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = `opacity 0.4s ease ${i * 0.04}s, transform 0.4s ease ${i * 0.04}s`;
        observer.observe(el);
    });

    // Aggiunge la classe che scatta la transizione
    document.addEventListener('scroll', () => { }, { passive: true });

    // Aggiunge stile per .visible via JS
    const style = document.createElement('style');
    style.textContent = '.visible { opacity: 1 !important; transform: translateY(0) !important; }';
    document.head.appendChild(style);

    /* ── NAVBAR: ombra al scroll ──────────────────────────────── */
    const navbar = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        navbar.style.boxShadow = window.scrollY > 10
            ? '0 4px 24px rgba(0,0,0,0.4)'
            : 'none';
    }, { passive: true });
});