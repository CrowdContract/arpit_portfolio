/*=============== PHASE 3 — Premium UX: Splash · Cursor · Noise · Scroll Bar ===============*/
(function () {
  'use strict';

  /* ── 1. PREMIUM SPLASH SCREEN ─────────────────────────────────────────
     Sequence: logo letters drop in → tagline fades → bar fills → panels
     slide apart (top/bottom curtain reveal).
  ─────────────────────────────────────────────────────────────────────── */
  (function initSplash() {
    const splash    = document.getElementById('splash');
    const letters   = splash ? splash.querySelectorAll('.splash-letter') : [];
    const tagline   = splash ? splash.querySelector('.splash-tagline')   : null;
    const barFill   = splash ? splash.querySelector('.splash-bar-fill')  : null;
    const overlayT  = splash ? splash.querySelector('.splash-overlay-top') : null;
    const overlayB  = splash ? splash.querySelector('.splash-overlay-bot') : null;
    const body      = document.body;

    if (!splash) return;

    // Prevent scroll during splash
    body.style.overflow = 'hidden';

    // Stagger letter drop-in
    letters.forEach((l, i) => {
      setTimeout(() => l.classList.add('visible'), 200 + i * 90);
    });

    // Tagline fade
    setTimeout(() => { if (tagline) tagline.classList.add('visible'); }, 800);

    // Progress bar fills over 1.2s
    setTimeout(() => { if (barFill) barFill.style.width = '100%'; }, 900);

    // Curtain reveal — top slides up, bottom slides down
    setTimeout(() => {
      if (overlayT) overlayT.classList.add('slide-out');
      if (overlayB) overlayB.classList.add('slide-out');
    }, 2200);

    // Remove splash from DOM
    setTimeout(() => {
      splash.style.opacity = '0';
      body.style.overflow  = '';
      setTimeout(() => splash.remove(), 500);
    }, 2700);
  })();


  /* ── 2. MAGNETIC CUSTOM CURSOR ────────────────────────────────────────
     Dot follows instantly. Ring lags behind with lerp.
     Magnetic pull on interactive elements.
  ─────────────────────────────────────────────────────────────────────── */
  (function initCursor() {
    // Skip on touch devices
    if (window.matchMedia('(hover: none)').matches) return;

    const dot  = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    let mx = -100, my = -100;   // mouse
    let rx = -100, ry = -100;   // ring (lerped)
    let magnetTarget = null;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
    });

    // Magnetic targets
    const MAGNETIC = 'a, button, .btn, .card, .galaxy-node, .faq-chip, .nav-link, .flip-card';

    document.addEventListener('mouseover', e => {
      const el = e.target.closest(MAGNETIC);
      if (el) {
        magnetTarget = el;
        dot.classList.add('cursor-hover');
        ring.classList.add('cursor-hover');
      }
    });
    document.addEventListener('mouseout', e => {
      const el = e.target.closest(MAGNETIC);
      if (el) {
        magnetTarget = null;
        dot.classList.remove('cursor-hover');
        ring.classList.remove('cursor-hover');
      }
    });

    document.addEventListener('mousedown', () => {
      dot.classList.add('cursor-click');
      ring.classList.add('cursor-click');
    });
    document.addEventListener('mouseup', () => {
      dot.classList.remove('cursor-click');
      ring.classList.remove('cursor-click');
    });

    function lerp(a, b, t) { return a + (b - a) * t; }

    function animateCursor() {
      // Dot follows immediately
      dot.style.transform  = `translate(${mx - 4}px, ${my - 4}px)`;

      // Magnetic effect — ring warps toward target center
      let tx = mx, ty = my;
      if (magnetTarget) {
        const r  = magnetTarget.getBoundingClientRect();
        const cx = r.left + r.width  / 2;
        const cy = r.top  + r.height / 2;
        const dx = mx - cx;
        const dy = my - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const pull = Math.max(0, 1 - dist / 80);
        tx = mx - dx * pull * 0.35;
        ty = my - dy * pull * 0.35;
      }

      rx = lerp(rx, tx, 0.12);
      ry = lerp(ry, ty, 0.12);
      ring.style.transform = `translate(${rx - 16}px, ${ry - 16}px)`;

      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Show cursor
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  })();


  /* ── 3. SCROLL PROGRESS BAR ──────────────────────────────────────────── */
  (function initScrollBar() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;

    function update() {
      const h   = document.documentElement;
      const pct = (h.scrollTop || document.body.scrollTop) /
                  (h.scrollHeight - h.clientHeight) * 100;
      bar.style.width = pct + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  })();


  /* ── 4. NOISE TEXTURE OVERLAY ────────────────────────────────────────── */
  (function initNoise() {
    // Generate a 200×200 noise canvas and tile it as body background
    const c  = document.createElement('canvas');
    c.width  = 200;
    c.height = 200;
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(200, 200);

    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255 | 0;
      img.data[i]     = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 12;   // very faint — 5% opacity
    }
    ctx.putImageData(img, 0, 0);

    const url = c.toDataURL();
    const el  = document.createElement('div');
    el.id = 'noise-overlay';
    el.style.cssText = `
      position:fixed; inset:0; z-index:9998;
      pointer-events:none;
      background-image:url(${url});
      background-repeat:repeat;
      opacity:0.45;
      mix-blend-mode:overlay;
    `;
    document.body.appendChild(el);
  })();


  /* ── 5. 3D FLIP CARD — TOUCH SUPPORT ─────────────────────────────────── */
  (function initFlipCards() {
    // On touch devices, tap to flip instead of hover
    if (!window.matchMedia('(hover: none)').matches) return;

    document.querySelectorAll('.flip-card').forEach(card => {
      card.addEventListener('click', () => {
        card.classList.toggle('flipped');
      });
    });
  })();


  /* ── 6. SCROLL-TRIGGERED STAGGER for cards ───────────────────────────── */
  (function initScrollStagger() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity   = '1';
            entry.target.style.transform = 'translateY(0)';
          }, i * 60);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.flip-card, .github-repo-card, .github-stat-card').forEach(el => {
      el.style.opacity   = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      obs.observe(el);
    });
  })();

})();
