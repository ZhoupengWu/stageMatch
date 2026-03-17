/* landing.js — stageMatch homepage interactions */

document.addEventListener('DOMContentLoaded', () => {

    /* ── SEARCH: tag click popola l'input ─────────────────────── */
    const searchInput = document.querySelector('.search-bar input');
    const tags = document.querySelectorAll('.search-tags span');

    tags.forEach(tag => {
        tag.addEventListener('click', () => {
            // Rimuove l'emoji e spazi dal tag per ottenere la keyword
            const text = tag.textContent.replace(/^\S+\s*/, '').trim();
            searchInput.value = text;
            searchInput.focus();
        });
    });

    /* ── SEARCH: submit con Enter ─────────────────────────────── */
    const searchBtn = document.querySelector('.search-bar button');

    const handleSearch = () => {
        const query = searchInput.value.trim();
        if (!query) return;
        // Redirect verso la home con parametro di ricerca
        window.location.href = `/home?q=${encodeURIComponent(query)}`;
    };

    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    /* ── SCROLL REVEAL: sezioni che entrano dal basso ─────────── */
    const revealTargets = document.querySelectorAll(
        '.feature-card, .offer-card, .step, .cta-box'
    );

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    revealTargets.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = `opacity 0.5s ease ${i * 0.06}s, transform 0.5s ease ${i * 0.06}s`;
        observer.observe(el);
    });

    // Aggiunge la classe che scatta la transizione
    document.addEventListener('scroll', () => { }, { passive: true });

    // Aggiunge stile per .visible via JS (evita dipendenze extra nel CSS)
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