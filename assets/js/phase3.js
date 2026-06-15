/*=============== PHASE 3 — Premium UX: Splash · Cursor · Noise · Scroll Bar ===============*/
(function () {
  'use strict';

  /* ── 1. TIDAL WAVE SPLASH SCREEN ─────────────────────────────────────
     Canvas draws 3 layered sine waves that sweep left→right across the
     screen, then reverse back right→left to wipe away, revealing the
     portfolio. Letters drop in while waves are rolling.
  ─────────────────────────────────────────────────────────────────────── */
  (function initSplash() {
    const splash  = document.getElementById('splash');
    const canvas  = document.getElementById('splash-canvas');
    const letters = splash ? splash.querySelectorAll('.splash-letter')  : [];
    const tagline = splash ? splash.querySelector('.splash-tagline')    : null;
    const body    = document.body;
    if (!splash || !canvas) return;

    body.style.overflow = 'hidden';

    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Wave config
    const WAVES = [
      { color: 'hsla(165,55%,28%,0.95)', amp: 0.09, freq: 1.6, speed: 0.8,  phase: 0 },
      { color: 'hsla(165,60%,22%,0.88)', amp: 0.07, freq: 2.1, speed: 1.1,  phase: 1.2 },
      { color: 'hsla(165,45%,14%,0.96)', amp: 0.06, freq: 1.3, speed: 0.65, phase: 2.5 },
    ];

    // Animation state
    // Stage 0: waves roll IN from left (fill screen, t: 0 → 1.4s)
    // Stage 1: hold + show logo (t: 1.4s → 2.4s)
    // Stage 2: waves roll OUT to right (t: 2.4s → 3.8s)
    // Stage 3: fade out splash (t: 3.8s)
    let startTime = null;
    const T_IN    = 1400;
    const T_HOLD  = 2300;
    const T_OUT   = 3700;
    const T_DONE  = 4100;

    let lettersShown = false;
    let taglineShown = false;
    let rafId;

    function easeInOut(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    function drawWaves(elapsed) {
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = 'hsl(165,22%,5%)';
      ctx.fillRect(0, 0, W, H);

      let progress; // 0 = fully right (hidden), 1 = fully left (covering screen)

      if (elapsed < T_IN) {
        // Rolling in: right edge of fill sweeps from right to left
        progress = easeInOut(elapsed / T_IN);
      } else if (elapsed < T_HOLD) {
        progress = 1;
      } else if (elapsed < T_OUT) {
        // Rolling out: fill retracts to right
        progress = 1 - easeInOut((elapsed - T_HOLD) / (T_OUT - T_HOLD));
      } else {
        progress = 0;
      }

      // Draw each wave layer
      WAVES.forEach((w, i) => {
        const t     = elapsed / 1000;
        const ampPx = H * w.amp;

        // Leading edge x position (right to left on in, left to right on out)
        // progress 0 = wave at x=W (off right), progress 1 = wave at x=0 (fully covering)
        const leadX = W * (1 - progress) - ampPx;

        ctx.beginPath();
        ctx.moveTo(leadX, H);

        // Draw the wavy leading edge
        for (let y = H; y >= 0; y -= 3) {
          const wave = Math.sin(y * w.freq * 0.015 + t * w.speed + w.phase) * ampPx;
          ctx.lineTo(leadX + wave, y);
        }

        ctx.lineTo(W, 0);
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fillStyle = w.color;
        ctx.fill();
      });

      // Show letters once wave covers 40%
      if (progress > 0.4 && !lettersShown) {
        lettersShown = true;
        letters.forEach((l, i) => {
          setTimeout(() => l.classList.add('visible'), i * 80);
        });
      }
      if (progress > 0.65 && !taglineShown) {
        taglineShown = true;
        if (tagline) tagline.classList.add('visible');
      }
    }

    function frame(ts) {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;

      drawWaves(elapsed);

      if (elapsed >= T_DONE) {
        cancelAnimationFrame(rafId);
        splash.style.opacity = '0';
        body.style.overflow  = '';
        setTimeout(() => splash.remove(), 650);
        return;
      }
      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);
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
