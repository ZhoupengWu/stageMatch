/* pages.js — interazioni condivise per privacy, termini, contatti, dashboard */

document.addEventListener('DOMContentLoaded', () => {

    /* ── NAVBAR: ombra allo scroll ────────────────────────────── */
    const navbar = document.querySelector('nav');
    if (navbar) {
      window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 10);
      }, { passive: true });
    }
  
    /* ── SCROLL REVEAL generico ───────────────────────────────── */
    const revealEls = document.querySelectorAll(
      '.prose-section, .stat-card, .channel-card, .contact-form-card,\
       .contact-info, .dash-card, .activity-item'
    );
  
    if (revealEls.length) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08 });
  
      revealEls.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(18px)';
        el.style.transition =
          `opacity 0.5s ease ${i * 0.055}s, transform 0.5s ease ${i * 0.055}s`;
        io.observe(el);
      });
    }
  
    /* ── TOC: evidenzia sezione attiva ───────────────────────── */
    const tocLinks = document.querySelectorAll('.toc-list a');
    const sections = document.querySelectorAll('[data-section]');
  
    if (tocLinks.length && sections.length) {
      const tocIO = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.dataset.section;
            tocLinks.forEach(a => {
              a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
            });
          }
        });
      }, { rootMargin: '-20% 0px -60% 0px' });
  
      sections.forEach(s => tocIO.observe(s));
    }
  
    /* ── FORM CONTATTI: submit con feedback ───────────────────── */
    const contactForm = document.getElementById('contactForm');
    const feedback    = document.getElementById('formFeedback');
  
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('.form-submit');
        btn.disabled = true;
        btn.textContent = 'Invio in corso…';
  
        // Simula invio (sostituire con fetch reale a Flask)
        setTimeout(() => {
          btn.textContent = 'Messaggio inviato ✓';
          btn.style.background = 'var(--c-accent2)';
          btn.style.color = '#0d0f14';
          if (feedback) feedback.classList.add('show');
          contactForm.reset();
        }, 1200);
      });
    }
  
    /* ── DASHBOARD: tab switching ─────────────────────────────── */
    const tabBtns   = document.querySelectorAll('[data-tab]');
    const tabPanels = document.querySelectorAll('[data-panel]');
  
    if (tabBtns.length) {
      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const target = btn.dataset.tab;
          tabBtns.forEach(b => b.classList.remove('active'));
          tabPanels.forEach(p => {
            p.style.display = p.dataset.panel === target ? 'block' : 'none';
          });
          btn.classList.add('active');
        });
      });
      // Attiva il primo tab di default
      if (tabBtns[0]) tabBtns[0].click();
    }
  
  });