/* ================================================================
   JOULE — Main JavaScript
   Author: OLO Art Studio
   Modules:
     1. Custom Cursor
     2. Theme Toggle
     3. Mobile Navigation
     4. Scroll Reveal
     5. Hero Counter Animation
     6. Video Player
     7. Lightbox
     8. Waitlist Form
     9. Privacy Modal
     10. Smooth Scroll
================================================================ */

'use strict';

/* ── 1. CUSTOM CURSOR ─────────────────────────────────────────── */
(function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  function trackRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(trackRing);
  }
  trackRing();
})();


/* ── 2. THEME TOGGLE ──────────────────────────────────────────── */
(function initTheme() {
  const html       = document.documentElement;
  const toggle     = document.getElementById('themeToggle');
  const label      = document.getElementById('themeLabel');
  if (!toggle || !label) return;

  let isDark = true;

  function applyTheme(dark) {
    isDark = dark;
    html.setAttribute('data-theme', dark ? 'dark' : 'light');
    label.textContent = dark ? 'Dark' : 'Light';
    try { localStorage.setItem('joule-theme', dark ? 'dark' : 'light'); } catch (e) {}
  }

  // Restore saved preference
  try {
    if (localStorage.getItem('joule-theme') === 'light') applyTheme(false);
  } catch (e) {}

  toggle.addEventListener('click', () => applyTheme(!isDark));
})();


/* ── 3. MOBILE NAVIGATION ─────────────────────────────────────── */
(function initNav() {
  const hamburger = document.getElementById('hamburger');
  const drawer    = document.getElementById('drawer');
  const nav       = document.getElementById('mainNav');
  if (!hamburger || !drawer || !nav) return;

  // Hide nav on load, show on scroll or tap
  let navVisible = false;

  function showNav() {
    nav.style.transform   = 'translateY(0)';
    nav.style.opacity     = '1';
    nav.style.pointerEvents = 'all';
    navVisible = true;
  }

  function hideNav() {
    nav.style.transform   = 'translateY(-100%)';
    nav.style.opacity     = '0';
    nav.style.pointerEvents = 'none';
    navVisible = false;
  }

  // Show nav when user scrolls down past hero
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      showNav();
    } else {
      hideNav();
    }
  });

  // Show nav on any tap/click anywhere on screen (mobile)
  document.addEventListener('touchstart', () => {
    showNav();
  }, { once: false, passive: true });

  // Hamburger toggle for drawer
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('is-open');
    drawer.classList.toggle('is-open');
  });

  window.closeDrawer = function () {
    hamburger.classList.remove('is-open');
    drawer.classList.remove('is-open');
  };
})();


/* ── 4. SCROLL REVEAL ─────────────────────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  els.forEach((el) => observer.observe(el));
})();


/* ── 5. HERO COUNTER ANIMATION ────────────────────────────────── */
(function initCounters() {
  const statsBar = document.querySelector('.hero__stats');
  if (!statsBar) return;

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    let current  = 0;
    const step   = Math.max(1, Math.ceil(target / 40));

    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = prefix + current + suffix;
      if (current >= target) clearInterval(timer);
    }, 28);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('[data-target]').forEach(animateCounter);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  observer.observe(statsBar);
})();


/* ── 6. VIDEO PLAYER ──────────────────────────────────────────── */
(function initVideo() {
  const slides   = document.querySelectorAll('.video-slide');
  const tabs     = document.querySelectorAll('.video-tab');
  const bar      = document.getElementById('videoBar');
  const playBtn  = document.getElementById('videoPlayBtn');
  const playLbl  = document.querySelector('.video-play-label');
  const note     = document.getElementById('videoNote');
  const tsEl     = document.getElementById('videoTs');
  if (!slides.length) return;

  let current   = 0;
  let autoTimer = null;
  let seconds   = 0;

  // Switch to a given slide index
  window.videoSwitch = function (idx, btn) {
    slides[current].classList.remove('is-active');
    tabs[current].classList.remove('is-active');
    current = idx;
    slides[current].classList.add('is-active');
    tabs[current].classList.add('is-active');
    resetBar();
  };

  function resetBar() {
    if (!bar) return;
    bar.style.transition = 'none';
    bar.style.width = '0%';
    setTimeout(() => {
      bar.style.transition = 'width 4.8s linear';
      bar.style.width = '100%';
    }, 50);
  }

  function autoAdvance() {
    window.videoSwitch((current + 1) % slides.length);
  }

  // Start auto-play
  autoTimer = setInterval(autoAdvance, 5000);
  resetBar();

  // Play button — stop auto, show "coming soon"
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      clearInterval(autoTimer);
      playBtn.style.display = 'none';
      if (playLbl) playLbl.style.display = 'none';
      if (note)    note.style.display    = 'block';
    });
  }

  // Timestamp counter
  setInterval(() => {
    seconds++;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (tsEl) {
      tsEl.textContent = [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
    }
  }, 1000);
})();


/* ── 7. LIGHTBOX ──────────────────────────────────────────────── */
(function initLightbox() {
  const lb     = document.getElementById('lightbox');
  const lbImg  = document.getElementById('lightboxImg');
  const lbClose = document.getElementById('lightboxClose');
  if (!lb || !lbImg) return;

  function openLightbox(src) {
    lbImg.src = src;
    lb.classList.add('is-open');
  }

  function closeLightbox() {
    lb.classList.remove('is-open');
  }

  // Gallery items
  document.querySelectorAll('.gallery__item').forEach((item) => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img) openLightbox(img.src);
    });
  });

  // Step card images
  document.querySelectorAll('.step-card__img').forEach((img) => {
    img.addEventListener('click', () => openLightbox(img.src));
  });

  // Spec portraits
  document.querySelectorAll('.spec-portrait').forEach((card) => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      if (img) openLightbox(img.src);
    });
  });

  // Close handlers
  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
})();


/* ── 8. WAITLIST FORM ─────────────────────────────────────────── */
(function initWaitlist() {
  const btn     = document.getElementById('waitlistBtn');
  const input   = document.getElementById('waitlistEmail');
  const note    = document.getElementById('waitlistNote');
  const success = document.getElementById('waitlistSuccess');
  if (!btn || !input) return;

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const email = input.value.trim();

    if (!email || !email.includes('@') || !email.includes('.')) {
      input.style.borderColor = '#e84040';
      input.placeholder = 'Please enter a valid email';
      setTimeout(() => {
        input.style.borderColor = '';
        input.placeholder = 'Your email address';
      }, 1400);
      return;
    }

    // Hide form, show success
    input.parentElement.style.display = 'none';
    if (note)    note.style.display    = 'none';
    if (success) success.style.display = 'block';

    try { localStorage.setItem('joule-waitlist', email); } catch (err) {}
  });
})();


/* ── 9. PRIVACY MODAL ─────────────────────────────────────────── */
(function initPrivacy() {
  const modal     = document.getElementById('privacyModal');
  const openLink  = document.getElementById('privacyLink');
  const closeBtn  = document.getElementById('modalClose');
  if (!modal) return;

  function openModal(e)  { e.preventDefault(); modal.classList.add('is-open'); }
  function closeModal()  { modal.classList.remove('is-open'); }

  if (openLink)  openLink.addEventListener('click', openModal);
  if (closeBtn)  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
})();


/* ── 10. SMOOTH SCROLL ────────────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        if (window.closeDrawer) window.closeDrawer();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
})();
