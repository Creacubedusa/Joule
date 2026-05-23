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
  // Only run on true pointer devices — skip touch/mobile
  if (window.matchMedia('(hover: none)').matches) return;
  if ('ontouchstart' in window) return;

  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;
  let rafId = null;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  }, { passive: true });

  function trackRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    rafId = requestAnimationFrame(trackRing);
  }
  trackRing();

  // Pause animation when tab not visible (perf)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      trackRing();
    }
  });
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

  // Nav is visible by default; hide only when at very top of hero (optional style effect)
  let navVisible = true;

  function showNav() {
    nav.style.transform    = 'translateY(0)';
    nav.style.opacity      = '1';
    nav.style.pointerEvents = 'all';
    navVisible = true;
  }

  function hideNav() {
    nav.style.transform    = 'translateY(-100%)';
    nav.style.opacity      = '0';
    nav.style.pointerEvents = 'none';
    navVisible = false;
  }

  // Always keep nav visible — remove hide behaviour that makes nav disappear at top
  showNav();

  // Optional: add scroll-based class for styling (compact/expanded)
  let lastScrollY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    // Re-show nav if user scrolls back up
    if (y < lastScrollY || y < 80) showNav();
    lastScrollY = y;
  }, { passive: true });

  // Hamburger toggle — CSS transform handles show/hide, we just toggle class
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = drawer.classList.toggle('is-open');
    hamburger.classList.toggle('is-open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    // Lock body scroll when drawer is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  window.closeDrawer = function () {
    drawer.classList.remove('is-open');
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      window.closeDrawer();
    }
  });

  // Close drawer when clicking outside (on the dimmed area behind)
  drawer.addEventListener('click', (e) => {
    // Only close if click is on the drawer backdrop, not a link
    if (e.target === drawer) window.closeDrawer();
  });
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
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'  // trigger slightly before element fully enters
  });

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
    const duration = 1200; // ms
    const steps    = 40;
    const interval = Math.floor(duration / steps);
    const step     = Math.max(1, Math.ceil(target / steps));

    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = prefix + current + suffix;
      if (current >= target) clearInterval(timer);
    }, interval);
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

  // Switch to a given slide index — exposed globally for inline onclick
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

  // Start auto-play only when video section enters viewport
  const videoSection = document.getElementById('videoPlayer');
  const startObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !autoTimer) {
        autoTimer = setInterval(autoAdvance, 5000);
        resetBar();
      } else if (!entry.isIntersecting && autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    });
  }, { threshold: 0.3 });
  if (videoSection) startObserver.observe(videoSection);

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
     // Send email to external form without navigating user (hidden iframe POST)
    (function submitToExternal(email) {
      const externalForm = 'https://785a2402.sibforms.com/serve/MUIFALatetBCxDvqZp9F-8l5suij-DAudn8jTAH1sOjiWLAZwkzVm7nF00hoX5-BAZH1-zeKGPBmBFfDSjoUC3eLfnssvfcPS6ek_C-TilEca2eUJA7dq8VA_TPF1uSdkPL6ywlJenvb_9N99aQtWcD1TE5xk-O333sUts_GDI7T1yiGy2DEqvRF1ywWafJmVb4PRK8ylWrVwE1sZw==';

      // ensure hidden iframe target exists
      let iframe = document.getElementById('sibFormTarget');
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.name = 'sibFormTarget';
        iframe.id = 'sibFormTarget';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
      }

      // build and submit a hidden form targeting the iframe
      const form = document.createElement('form');
      form.action = externalForm;
      form.method = 'POST';
      form.target = 'sibFormTarget';
      form.style.display = 'none';

      const inputEl = document.createElement('input');
      inputEl.type = 'hidden';
      inputEl.name = 'email';
      inputEl.value = email;
      form.appendChild(inputEl);

      document.body.appendChild(form);
      try { form.submit(); } catch (e) { /* fail silently */ }

      // cleanup form node shortly after submitting
      setTimeout(() => {
        if (form.parentNode) form.parentNode.removeChild(form);
      }, 2000);
    })(email);

    // show success message (keep existing behaviour)
    if (success) {
      success.style.display = 'block';
    }
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

// New: Contact modal + form submit via mailto
(function initContact() {
  const openLink = document.getElementById('contactLink');
  const modal    = document.getElementById('contactModal');
  const closeBtn = document.getElementById('contactModalClose');
  const form     = document.getElementById('contactForm');
  const feedback = document.getElementById('contactFeedback');
  if (!openLink || !modal || !form) return;

  function open(e) {
    e.preventDefault();
    modal.classList.add('is-open');
  }
  function close() {
    modal.classList.remove('is-open');
  }

  openLink.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const first = (document.getElementById('contactFirst')?.value || '').trim();
    const last  = (document.getElementById('contactLast')?.value || '').trim();
    const email = (document.getElementById('contactEmail')?.value || '').trim();
    const msg   = (document.getElementById('contactMessage')?.value || '').trim();

    if (!first || !last || !email || !msg) {
      feedback.style.display = 'block';
      feedback.textContent = 'Please fill all fields before sending.';
      setTimeout(() => { feedback.style.display = 'none'; }, 2500);
      return;
    }

    const to = 'oloart@cr34.com';
    const subject = `Website message from ${first} ${last}`;
    const bodyLines = [
      `Name: ${first} ${last}`,
      `Email: ${email}`,
      '',
      'Message:',
      msg
    ];
    const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;

    // open user's mail client
    window.location.href = mailto;

    feedback.style.display = 'block';
    feedback.textContent = 'Your email client should open — if not, copy/paste your message to oloart@cr34.com.';
    setTimeout(() => {
      feedback.style.display = 'none';
      close();
      form.reset();
    }, 1800);
  });
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
        if (typeof window.closeDrawer === 'function') window.closeDrawer();
        // Offset for fixed nav height
        const navHeight = document.getElementById('mainNav')?.offsetHeight || 68;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
})();