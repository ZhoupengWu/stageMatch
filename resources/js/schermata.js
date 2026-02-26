/**
 * NEXUS DASHBOARD — app.js
 * Navigazione, dark mode, impostazioni, sidebar mobile
 */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    // 1. RIFERIMENTI DOM
    // ============================================================
    const html          = document.documentElement;
    const sidebar       = document.getElementById('sidebar');
    const overlay       = document.getElementById('overlay');
    const sidebarToggle = document.getElementById('sidebarToggle');   // pulsante X dentro sidebar
    const topbarMenuBtn = document.getElementById('topbarMenuBtn');   // hamburger topbar (mobile)
    const themeToggle   = document.getElementById('themeToggle');
    const themeIcon     = document.getElementById('themeIcon');
    const topbarTitle   = document.getElementById('topbarTitle');
    const navItems      = document.querySelectorAll('.nav-item');
    const sections      = document.querySelectorAll('.section');
  
    // Impostazioni
    const darkModeToggle = document.getElementById('darkModeToggle');
    const langSelect     = document.getElementById('langSelect');
    const pushToggle     = document.getElementById('pushToggle');
    const emailToggle    = document.getElementById('emailToggle');
    const soundToggle    = document.getElementById('soundToggle');
  
    // ============================================================
    // 2. STATO INIZIALE — legge localStorage se disponibile
    // ============================================================
    const savedTheme = localStorage.getItem('nexus-theme') || 'dark';
    applyTheme(savedTheme);
  
    const savedLang = localStorage.getItem('nexus-lang') || 'it';
    if (langSelect) langSelect.value = savedLang;
  
    // ============================================================
    // 3. NAVIGAZIONE TRA SEZIONI
    // ============================================================
    /**
     * Attiva una sezione in base al data-section del nav-item cliccato.
     * @param {string} sectionId - es. "workspace", "profile", "map", "settings"
     */
    function showSection(sectionId) {
      // Rimuove active da tutti i nav-item
      navItems.forEach(item => item.classList.remove('active'));
  
      // Aggiunge active al nav-item corrispondente
      const activeNav = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
      if (activeNav) {
        activeNav.classList.add('active');
        topbarTitle.textContent = activeNav.querySelector('.nav-label').textContent;
      }
  
      // Nasconde tutte le sezioni e mostra quella richiesta
      sections.forEach(s => s.classList.remove('active'));
      const targetSection = document.getElementById(`section-${sectionId}`);
      if (targetSection) {
        targetSection.classList.add('active');
        // Forza re-trigger dell'animazione
        targetSection.style.animation = 'none';
        void targetSection.offsetWidth; // reflow
        targetSection.style.animation = '';
      }
  
      // Su mobile chiude la sidebar dopo la navigazione
      closeSidebar();
    }
  
    // Listener sui nav-item
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = item.dataset.section;
        if (sectionId) showSection(sectionId);
      });
    });
  
    // ============================================================
    // 4. DARK MODE TOGGLE (topbar)
    // ============================================================
    /**
     * Applica il tema all'elemento <html> e aggiorna icona + toggle settings.
     * @param {'dark'|'light'} theme
     */
    function applyTheme(theme) {
      html.setAttribute('data-theme', theme);
      localStorage.setItem('nexus-theme', theme);
  
      if (theme === 'dark') {
        themeIcon.className = 'ph ph-moon';
        if (darkModeToggle) darkModeToggle.checked = true;
      } else {
        themeIcon.className = 'ph ph-sun';
        if (darkModeToggle) darkModeToggle.checked = false;
      }
    }
  
    // Pulsante icona nella topbar
    themeToggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  
    // Toggle nella sezione Impostazioni (rimane sincronizzato)
    if (darkModeToggle) {
      darkModeToggle.addEventListener('change', () => {
        applyTheme(darkModeToggle.checked ? 'dark' : 'light');
      });
    }
  
    // ============================================================
    // 5. SIDEBAR MOBILE
    // ============================================================
    function openSidebar() {
      sidebar.classList.add('open');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // evita scroll sfondo
    }
  
    function closeSidebar() {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  
    topbarMenuBtn.addEventListener('click', openSidebar);
    sidebarToggle.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);
  
    // Chiude con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSidebar();
    });
  
    // ============================================================
    // 6. IMPOSTAZIONI — LINGUA
    // ============================================================
    if (langSelect) {
      langSelect.addEventListener('change', () => {
        const lang = langSelect.value;
        localStorage.setItem('nexus-lang', lang);
        // Placeholder: qui puoi implementare i18n
        console.log(`[NEXUS] Lingua impostata: ${lang}`);
      });
    }
  
    // ============================================================
    // 7. IMPOSTAZIONI — NOTIFICHE (placeholder)
    // ============================================================
    function saveSetting(key, value) {
      localStorage.setItem(`nexus-${key}`, value);
      console.log(`[NEXUS] Impostazione salvata — ${key}: ${value}`);
    }
  
    [pushToggle, emailToggle, soundToggle].forEach(toggle => {
      if (!toggle) return;
      toggle.addEventListener('change', () => {
        saveSetting(toggle.id, toggle.checked);
      });
    });
  
    // Ripristina impostazioni notifiche da localStorage
    ['pushToggle', 'emailToggle', 'soundToggle'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const saved = localStorage.getItem(`nexus-${id}`);
      if (saved !== null) el.checked = saved === 'true';
    });
  
    // ============================================================
    // 8. PROFILO — salvataggio placeholder
    // ============================================================
    const profileBtn = document.querySelector('.profile-actions .btn--primary');
    if (profileBtn) {
      profileBtn.addEventListener('click', () => {
        // Placeholder: qui collegherai una vera API
        profileBtn.textContent = '✓ Salvato!';
        profileBtn.style.background = 'var(--accent-2)';
        setTimeout(() => {
          profileBtn.textContent = 'Salva modifiche';
          profileBtn.style.background = '';
        }, 2000);
      });
    }
  
    // ============================================================
    // 9. MAPPA — pulsanti Satellite / Mappa (placeholder UI)
    // ============================================================
    const mapBtns = document.querySelectorAll('.map-controls .btn--outline');
    mapBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        mapBtns.forEach(b => b.classList.remove('active-btn'));
        btn.classList.add('active-btn');
        // Placeholder: qui switchi il layer della tua mappa
        console.log(`[NEXUS] Layer mappa: ${btn.textContent.trim()}`);
      });
    });
  
    // ============================================================
    // 10. RESIZE — gestione sidebar su orientamento cambiato
    // ============================================================
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        closeSidebar();
      }
    });
  
    // ============================================================
    // 11. INIT — mostra sezione di default
    // ============================================================
    showSection('workspace');
  
  }); // end DOMContentLoaded