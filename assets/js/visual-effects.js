/*=============== VISUAL EFFECTS — Shader Gradient + Lottie + Rive ===============*/

/* ─── 1. SHADER GRADIENT HERO BACKGROUND ─────────────────────────────────
   A subtle animated mesh gradient rendered on a canvas behind the hero.
   Pure WebGL — no external lib, ~2KB. Adapts to the CSS --hue variable.
─────────────────────────────────────────────────────────────────────────── */
(function initShaderGradient() {
  const canvas = document.getElementById('hero-gradient');
  if (!canvas) return;

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    canvas.style.display = 'none';
    return;
  }

  // Vertex shader — full-screen quad
  const vert = `
    attribute vec2 a_pos;
    void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
  `;

  // Fragment shader — animated mesh gradient in the portfolio's green palette
  const frag = `
    precision mediump float;
    uniform float u_time;
    uniform vec2  u_res;

    vec3 palette(float t) {
      // Teal/green palette matching --first-color hsl(165,60%,40%)
      vec3 a = vec3(0.18, 0.55, 0.48);
      vec3 b = vec3(0.10, 0.20, 0.18);
      vec3 c = vec3(0.25, 0.50, 0.42);
      vec3 d = vec3(0.00, 0.15, 0.12);
      return a + b * cos(6.28318 * (c * t + d));
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      uv = uv * 2.0 - 1.0;
      uv.x *= u_res.x / u_res.y;

      float t = u_time * 0.18;

      // 3 moving blobs
      float d1 = length(uv - vec2(sin(t * 0.7) * 0.6,  cos(t * 0.5) * 0.4));
      float d2 = length(uv - vec2(cos(t * 0.4) * 0.5, -sin(t * 0.6) * 0.5));
      float d3 = length(uv - vec2(sin(t * 0.9) * 0.3,  sin(t * 0.8) * 0.6));

      float v = 1.0 / (d1 + 0.5) + 0.8 / (d2 + 0.6) + 0.6 / (d3 + 0.7);
      vec3 col = palette(v * 0.4 + t * 0.05);

      // Keep it very subtle — almost invisible, just a shimmer
      col = mix(vec3(0.88, 0.95, 0.93), col, 0.18);

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function makeShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, makeShader(gl.VERTEX_SHADER, vert));
  gl.attachShader(prog, makeShader(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  // Full-screen quad
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRes  = gl.getUniformLocation(prog, 'u_res');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  // Dark mode — invert colours
  function isDark() { return document.body.classList.contains('dark'); }

  let start = null;
  function frame(ts) {
    if (!start) start = ts;
    const t = (ts - start) / 1000;

    // Swap palette for dark mode
    const fragSrc = isDark()
      ? frag.replace('vec3(0.88, 0.95, 0.93)', 'vec3(0.06, 0.09, 0.08)')
            .replace('0.18)', '0.22)')
      : frag;

    gl.uniform1f(uTime, t);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();


/* ─── 2. LOTTIE SERVICE CARD ICONS ───────────────────────────────────────
   Uses free Lottie JSON files from LottieFiles CDN.
   Each plays on hover, pauses otherwise.
─────────────────────────────────────────────────────────────────────────── */
(function initLottieIcons() {
  if (typeof lottie === 'undefined') return;

  const icons = [
    {
      id: 'lottie-mern',
      // Coding / browser animation
      url: 'https://assets2.lottiefiles.com/packages/lf20_w51pcehl.json',
    },
    {
      id: 'lottie-ai',
      // Robot / AI brain animation
      url: 'https://assets9.lottiefiles.com/packages/lf20_fcfjwiyb.json',
    },
    {
      id: 'lottie-deploy',
      // Rocket launch animation
      url: 'https://assets3.lottiefiles.com/packages/lf20_jzBSMn.json',
    },
    {
      id: 'lottie-dsa',
      // Algorithm / graph animation
      url: 'https://assets5.lottiefiles.com/packages/lf20_uu0x8lqv.json',
    },
    {
      id: 'lottie-cloud',
      // Cloud upload animation
      url: 'https://assets4.lottiefiles.com/packages/lf20_xyadoh9h.json',
    },
  ];

  icons.forEach(({ id, url }) => {
    const el = document.getElementById(id);
    if (!el) return;

    const anim = lottie.loadAnimation({
      container: el,
      renderer: 'svg',
      loop: true,
      autoplay: false,
      path: url,
    });

    // Play on hover of the parent card
    const card = el.closest('.card');
    if (card) {
      card.addEventListener('mouseenter', () => anim.play());
      card.addEventListener('mouseleave', () => { anim.stop(); });
    }

    // Also play when scrolled into view
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          anim.play();
          setTimeout(() => anim.stop(), 2000);
        }
      });
    }, { threshold: 0.5 });
    obs.observe(el);
  });
})();


/* Rive removed — using clean icon with CSS pulse animation instead */


/* ─── 4. ANIMATED CSS IMPROVEMENTS ──────────────────────────────────────
   - Card shimmer effect on load
   - Floating particles in hero
   - Smooth scroll reveal for section titles
─────────────────────────────────────────────────────────────────────────── */

// Floating particles in hero background
(function initParticles() {
  const home = document.querySelector('.home');
  if (!home) return;

  const count = window.innerWidth < 768 ? 8 : 18;

  for (let i = 0; i < count; i++) {
    const dot = document.createElement('div');
    dot.className = 'hero-particle';
    const size = Math.random() * 6 + 3;
    const x    = Math.random() * 100;
    const dur  = Math.random() * 12 + 8;
    const del  = Math.random() * 8;
    const opacity = Math.random() * 0.25 + 0.05;

    dot.style.cssText = `
      width:${size}px;
      height:${size}px;
      left:${x}%;
      bottom:-10px;
      animation-duration:${dur}s;
      animation-delay:${del}s;
      opacity:${opacity};
    `;
    home.appendChild(dot);
  }
})();

// Section title letter-by-letter reveal
(function initTitleReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('title-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.section-title').forEach(t => obs.observe(t));
})();
