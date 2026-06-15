/*=============== PHASE 3 — Premium UX ===============*/
(function () {
  'use strict';

  /* =========================================================
     1. TIDAL WAVE SPLASH  — physics ocean simulation
     SEQUENCE:
       0.0s  calm dark screen, water line at bottom
       0.4s  swell starts building from bottom
       1.3s  wave crest forms, foam sprays
       1.9s  CRASH — fills entire screen top to bottom
       2.0s  logo letters slam in one-by-one
       2.7s  tagline fades up
       3.1s  tide RECEDES — pulls back down, revealing portfolio
       4.2s  splash fades out + removed
  ========================================================= */
  (function initSplash() {
    var splash  = document.getElementById('splash');
    var canvas  = document.getElementById('splash-canvas');
    if (!splash || !canvas) return;

    var letters = splash.querySelectorAll('.splash-letter');
    var tagline = splash.querySelector('.splash-tagline');

    document.body.style.overflow = 'hidden';

    var ctx = canvas.getContext('2d');
    var W, H;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    /* easing */
    function easeIn3(t)    { return t * t * t; }
    function easeOut3(t)   { return 1 - Math.pow(1 - t, 3); }
    function easeInOut(t)  { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3) / 2; }
    function clamp(v,a,b)  { return v < a ? a : v > b ? b : v; }

    /* foam particles */
    var particles = [];
    function spawnFoam(n) {
      for (var i = 0; i < n; i++) {
        particles.push({
          x: Math.random() * W,
          y: H * 0.2 + Math.random() * H * 0.35,
          vx: (Math.random() - 0.5) * 7,
          vy: -(Math.random() * 10 + 5),
          r:  Math.random() * 4 + 1.5,
          life: 1
        });
      }
    }

    function tickParticles() {
      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += 0.28;
        p.vx *= 0.97;
        p.life -= 0.02;
        if (p.life <= 0) particles.splice(i, 1);
      }
    }

    function drawParticles() {
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'hsla(165,85%,88%,' + (p.life * 0.75) + ')';
        ctx.fill();
      }
    }

    /* water surface offset at pixel x, given time t */
    function surf(x, t, amp, phaseOff) {
      var n = x / W;
      return (
        Math.sin(n * Math.PI * 2.2 + t * 2.4 + (phaseOff || 0)) * amp +
        Math.sin(n * Math.PI * 5.1 + t * 4.8) * amp * 0.18 +
        Math.sin(n * Math.PI * 9.7 + t * 8.2) * amp * 0.07
      );
    }

    /* draw a wave fill below a given baseline y */
    function drawWaveFill(baseY, amp, t, phaseOff, color) {
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (var x = 0; x <= W; x += 3) {
        ctx.lineTo(x, baseY + surf(x, t, amp, phaseOff));
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    }

    /* TIMELINE (ms) */
    var T = {
      swellStart:  300,
      swellPeak:   1500,
      crash:       1900,
      holdEnd:     2700,
      recedeEnd:   3900,
      fadeEnd:     4300
    };

    var logoShown    = false;
    var taglineShown = false;
    var foamSpawned  = false;
    var startMs      = null;
    var rafId;

    function frame(ts) {
      if (!startMs) startMs = ts;
      var el = ts - startMs;   /* elapsed ms */
      var t  = el / 1000;      /* elapsed seconds */

      ctx.clearRect(0, 0, W, H);

      /* bg */
      ctx.fillStyle = 'hsl(165,22%,5%)';
      ctx.fillRect(0, 0, W, H);

      /* ── PHASE 1: swell rises from bottom ── */
      if (el < T.swellPeak) {
        var pr = clamp((el - T.swellStart) / (T.swellPeak - T.swellStart), 0, 1);
        pr = easeInOut(pr);

        var amp    = H * 0.12 * pr;
        /* baseY: starts at H (bottom), rises to ~25% from top */
        var baseY  = H - H * 0.08 - H * 0.68 * easeIn3(pr);

        /* 3 depth layers */
        drawWaveFill(baseY + 22, amp * 0.7, t, 2.1, 'hsla(165,50%,14%,0.92)');
        drawWaveFill(baseY + 10, amp * 0.85, t, 1.1, 'hsla(165,55%,20%,0.90)');
        drawWaveFill(baseY,      amp,         t, 0,   'hsla(165,62%,28%,0.95)');

        /* crest foam line */
        if (pr > 0.55) {
          var fa = (pr - 0.55) / 0.45;
          ctx.beginPath();
          ctx.moveTo(0, baseY + surf(0, t, amp, 0));
          for (var x2 = 3; x2 <= W; x2 += 3) {
            ctx.lineTo(x2, baseY + surf(x2, t, amp, 0));
          }
          ctx.lineWidth   = 2.5 + fa * 3.5;
          ctx.strokeStyle = 'hsla(165,85%,88%,' + (fa * 0.65) + ')';
          ctx.stroke();
        }

        /* spawn foam before crash */
        if (pr > 0.88 && !foamSpawned) {
          foamSpawned = true;
          spawnFoam(70);
        }
      }

      /* ── PHASE 2: crash — screen floods from bottom UP ── */
      else if (el < T.holdEnd) {
        var cp = clamp((el - T.swellPeak) / (T.crash - T.swellPeak), 0, 1);
        cp = easeOut3(cp);

        /* the fill top climbs from 25% to 0 */
        var fillTop = H * 0.25 * (1 - cp);

        ctx.fillStyle = 'hsl(165,52%,18%)';
        ctx.fillRect(0, fillTop, W, H);

        /* lighter layer */
        ctx.fillStyle = 'hsla(165,60%,26%,0.75)';
        ctx.fillRect(0, fillTop + 40, W, H);

        /* sheen at waterline */
        var g = ctx.createLinearGradient(0, fillTop - 5, 0, fillTop + 90);
        g.addColorStop(0, 'hsla(165,90%,70%,0.55)');
        g.addColorStop(1, 'hsla(165,65%,38%,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, fillTop - 5, W, 95);

        /* turbulent surface during crash */
        if (cp < 0.6) {
          var ta = H * 0.035 * (1 - cp / 0.6);
          ctx.beginPath();
          ctx.moveTo(0, fillTop + surf(0, t * 3.5, ta, 0));
          for (var x3 = 3; x3 <= W; x3 += 3) {
            ctx.lineTo(x3, fillTop + surf(x3, t * 3.5, ta, 0));
          }
          ctx.lineWidth   = 3;
          ctx.strokeStyle = 'hsla(165,80%,75%,0.4)';
          ctx.stroke();
        }

        /* full-screen hold after crash */
        if (el > T.crash) {
          ctx.fillStyle = 'hsl(165,52%,18%)';
          ctx.fillRect(0, 0, W, H);

          /* depth gradient overlay */
          var dg = ctx.createLinearGradient(0, 0, 0, H);
          dg.addColorStop(0, 'hsla(165,70%,35%,0.35)');
          dg.addColorStop(1, 'hsla(165,40%,10%,0.55)');
          ctx.fillStyle = dg;
          ctx.fillRect(0, 0, W, H);

          /* caustic shimmer */
          ctx.globalAlpha = 0.07;
          for (var si = 0; si < 6; si++) {
            var sx = (Math.sin(t * 0.7 + si * 1.1) * 0.5 + 0.5) * W;
            var sy = (Math.cos(t * 0.9 + si * 0.8) * 0.5 + 0.5) * H;
            var sr = 80 + Math.sin(t + si) * 30;
            var sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
            sg.addColorStop(0, 'hsla(165,90%,80%,1)');
            sg.addColorStop(1, 'hsla(165,90%,80%,0)');
            ctx.fillStyle = sg;
            ctx.fillRect(0, 0, W, H);
          }
          ctx.globalAlpha = 1;
        }

        /* logo on crash */
        if (!logoShown && cp > 0.2) {
          logoShown = true;
          for (var li = 0; li < letters.length; li++) {
            (function(l, idx) {
              setTimeout(function() { l.classList.add('visible'); }, idx * 75);
            })(letters[li], li);
          }
        }
        if (!taglineShown && el > T.crash + 600) {
          taglineShown = true;
          if (tagline) tagline.classList.add('visible');
        }
      }

      /* ── PHASE 3: tide recedes — water drains downward ── */
      else if (el < T.recedeEnd) {
        var rp = clamp((el - T.holdEnd) / (T.recedeEnd - T.holdEnd), 0, 1);
        /* natural tide feel: slow start, accelerates, tapers */
        var eRp = Math.pow(rp, 1.8);

        var waterTop = H * eRp;

        if (waterTop < H) {
          /* main fill */
          ctx.fillStyle = 'hsl(165,52%,18%)';
          ctx.fillRect(0, waterTop, W, H - waterTop);

          ctx.fillStyle = 'hsla(165,60%,26%,0.7)';
          ctx.fillRect(0, waterTop + 35, W, H - waterTop - 35);

          /* receding surface wave */
          var recAmp = H * 0.05 * Math.sin(rp * Math.PI);
          ctx.beginPath();
          ctx.moveTo(0, waterTop + surf(0, t * 1.8, recAmp, 1.8));
          for (var x4 = 3; x4 <= W; x4 += 3) {
            ctx.lineTo(x4, waterTop + surf(x4, t * 1.8, recAmp, 1.8));
          }
          ctx.lineTo(W, waterTop);
          ctx.lineTo(W, waterTop - 25);
          ctx.lineTo(0, waterTop - 25);
          ctx.closePath();
          ctx.fillStyle = 'hsla(165,70%,45%,0.28)';
          ctx.fill();

          /* foam trail at waterline */
          ctx.beginPath();
          ctx.moveTo(0, waterTop + surf(0, t * 2.2, recAmp, 0));
          for (var x5 = 3; x5 <= W; x5 += 3) {
            ctx.lineTo(x5, waterTop + surf(x5, t * 2.2, recAmp, 0));
          }
          ctx.lineWidth   = 2;
          ctx.strokeStyle = 'hsla(165,80%,88%,' + ((1 - rp) * 0.5) + ')';
          ctx.stroke();
        }
      }

      tickParticles();
      drawParticles();

      if (el >= T.fadeEnd) {
        cancelAnimationFrame(rafId);
        splash.style.transition = 'opacity 0.55s ease';
        splash.style.opacity    = '0';
        document.body.style.overflow = '';
        setTimeout(function() {
          if (splash.parentNode) splash.parentNode.removeChild(splash);
        }, 600);
        return;
      }
      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);
  })();


  /* =========================================================
     2. HEXAGON CURSOR WITH FADING CHAIN TRAIL
  ========================================================= */
  (function initCursor() {
    if (window.matchMedia('(hover: none)').matches) return;

    var canvas = document.createElement('canvas');
    canvas.id = 'cursor-canvas';
    // z-index must be below header (1000) and style-switcher (2000)
    // pointer-events:none ensures it NEVER blocks clicks
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:999;';
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    var mx = -200, my = -200;
    var isHover = false, isClick = false;
    var trail = [];
    var TRAIL_MAX = 12;
    var frameCount = 0;

    document.addEventListener('mousemove', function(e) { mx = e.clientX; my = e.clientY; });
    var SEL = 'a,button,.btn,.card,.flip-card,.galaxy-node,.faq-chip,.nav-link';
    document.addEventListener('mouseover', function(e) { if (e.target.closest(SEL)) isHover = true; });
    document.addEventListener('mouseout',  function(e) { if (e.target.closest(SEL)) isHover = false; });
    document.addEventListener('mousedown', function() { isClick = true; });
    document.addEventListener('mouseup',   function() { isClick = false; });

    function drawHex(x, y, size, alpha, rot, fill, hov) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.beginPath();
      for (var i = 0; i < 6; i++) {
        var a = (Math.PI / 3) * i;
        var px = size * Math.cos(a), py = size * Math.sin(a);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      var l = hov ? 65 : 45;
      if (fill) {
        ctx.fillStyle = 'hsla(165,75%,' + l + '%,' + alpha + ')';
        ctx.fill();
      } else {
        ctx.lineWidth   = hov ? 2 : 1.5;
        ctx.strokeStyle = 'hsla(165,65%,' + l + '%,' + alpha + ')';
        ctx.stroke();
      }
      ctx.restore();
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frameCount++;

      if (frameCount % 3 === 0) {
        trail.push({ x: mx, y: my, size: isHover ? 18 : 11, age: 0, rot: Math.random() * Math.PI });
        if (trail.length > TRAIL_MAX) trail.shift();
      }

      for (var i = 0; i < trail.length; i++) {
        trail[i].age++;
        var ratio = i / trail.length;
        drawHex(trail[i].x, trail[i].y, trail[i].size * (0.35 + ratio * 0.65), ratio * 0.45, trail[i].rot + trail[i].age * 0.018, false, isHover);
      }

      var hs = isClick ? 9 : (isHover ? 20 : 13);
      drawHex(mx, my, hs + 6, 0.32, frameCount * 0.026, false, isHover);
      drawHex(mx, my, hs * 0.38, 0.9, frameCount * 0.026, true, isHover);

      requestAnimationFrame(animate);
    }
    animate();

    // Hide cursor visually — use opacity trick, NOT cursor:none on interactive elements
    var s = document.createElement('style');
    s.textContent = [
      '@media (hover:hover){',
      '  body { cursor: none !important; }',
      '  a, button, input, textarea, select, label,',
      '  [tabindex], [role="button"],',
      '  .nav-settings, .nav-toggle, .nav-link, .nav-logo,',
      '  .style-switcher, .style-switcher-color, .style-switcher-close,',
      '  .style-switcher-input, .style-switcher-label,',
      '  .faq-chip, .galaxy-node, .flip-card, .work-item,',
      '  .chatbot-toggle, .github-bell-btn, .btn, .link,',
      '  .card, .social-link, .resume-header, .contact-card {',
      '    cursor: none !important;',
      '  }',
      '}'
    ].join('');
    document.head.appendChild(s);
  })();


  /* =========================================================
     3. SCROLL PROGRESS BAR
  ========================================================= */
  (function initScrollBar() {
    var bar = document.getElementById('scroll-progress');
    if (!bar) return;
    function update() {
      var h = document.documentElement;
      var pct = (h.scrollTop || document.body.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
      bar.style.width = pct + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
  })();


  /* =========================================================
     4. PROCEDURAL NOISE TEXTURE OVERLAY
  ========================================================= */
  (function initNoise() {
    var c = document.createElement('canvas');
    c.width = 200; c.height = 200;
    var ctx2 = c.getContext('2d');
    var img = ctx2.createImageData(200, 200);
    for (var i = 0; i < img.data.length; i += 4) {
      var v = Math.random() * 255 | 0;
      img.data[i] = img.data[i+1] = img.data[i+2] = v;
      img.data[i+3] = 12;
    }
    ctx2.putImageData(img, 0, 0);
    var el = document.createElement('div');
    el.id = 'noise-overlay';
    el.style.cssText = 'position:fixed;inset:0;z-index:9998;pointer-events:none;background-image:url(' + c.toDataURL() + ');background-repeat:repeat;opacity:0.42;mix-blend-mode:overlay;';
    document.body.appendChild(el);
  })();


  /* =========================================================
     5. 3D FLIP CARDS — touch tap support
  ========================================================= */
  (function initFlipCards() {
    if (!window.matchMedia('(hover: none)').matches) return;
    document.querySelectorAll('.flip-card').forEach(function(card) {
      card.addEventListener('click', function() { card.classList.toggle('flipped'); });
    });
  })();


  /* =========================================================
     6. SCROLL STAGGER for cards
  ========================================================= */
  (function initScrollStagger() {
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry, i) {
        if (entry.isIntersecting) {
          setTimeout(function() {
            entry.target.style.opacity   = '1';
            entry.target.style.transform = 'translateY(0)';
          }, i * 60);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.flip-card,.github-repo-card,.github-stat-card').forEach(function(el) {
      el.style.opacity   = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      obs.observe(el);
    });
  })();

})();
