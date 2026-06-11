/*=============== ANIMATIONS — FRAMER MOTION-STYLE ===============*/

/*─── TYPING INTRO ─────────────────────────────────────────────────────────*/
(function initTyping() {
  const phrases = [
    'Building AI Products',
    'Building MERN Applications',
    'Building LLM Solutions',
    'a Full-Stack Developer',
    'a CS Student @ IIIT Una',
  ];
  const el = document.getElementById('typing-text');
  if (!el) return;

  let phraseIdx = 0, charIdx = 0, deleting = false;

  function tick() {
    const phrase = phrases[phraseIdx];
    if (!deleting) {
      charIdx++;
      el.textContent = phrase.slice(0, charIdx);
      if (charIdx === phrase.length) {
        deleting = true;
        setTimeout(tick, 1800);
        return;
      }
      setTimeout(tick, 65);
    } else {
      charIdx--;
      el.textContent = phrase.slice(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(tick, 400);
        return;
      }
      setTimeout(tick, 35);
    }
  }
  setTimeout(tick, 800);
})();

/*─── HERO TILT + BLOB ─────────────────────────────────────────────────────*/
(function initHeroTilt() {
  const wrapper = document.getElementById('tilt-wrapper');
  const blob = document.getElementById('profile-blob');
  const img = document.getElementById('profile-img');
  const banner = document.querySelector('.home-banner-col');
  if (!wrapper || !banner) return;

  banner.addEventListener('mousemove', (e) => {
    const rect = wrapper.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    if (img) img.style.transform = `perspective(800px) rotateY(${dx * 4}deg) rotateX(${-dy * 4}deg) scale(1.02)`;
    if (blob) blob.style.transform = `translate(${dx * 20}px, ${dy * 20}px)`;
  });

  banner.addEventListener('mouseleave', () => {
    if (img) img.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)';
    if (blob) blob.style.transform = 'translate(0,0)';
  });
})();

/*─── STAGGER SELECTORS ────────────────────────────────────────────────────*/
const STAGGER_SELECTORS = [
  '.github-stats .github-stat-card',
  '.github-pinned-grid .github-repo-card',
  '.faq-chips .faq-chip',
  '.principles-grid .principle-item',
  '.arch-pipeline .arch-node',
];

function applyStagger() {
  STAGGER_SELECTORS.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.style.transitionDelay = `${i * 80}ms`;
    });
  });
}

/*─── MAIN INTERSECTION OBSERVER ───────────────────────────────────────────*/
function initMotion() {
  applyStagger();

  const motionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('motion-visible');
          motionObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('[data-motion]').forEach(el => motionObserver.observe(el));

  // Home stats count-up
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.home-data-no').forEach(el => {
            const raw = el.textContent.trim();
            const hasPlus = raw.includes('+');
            const target = parseInt(raw);
            if (isNaN(target)) return;
            let current = 0;
            const step = Math.max(1, Math.ceil(target / 30));
            const timer = setInterval(() => {
              current = Math.min(current + step, target);
              el.textContent = current + (hasPlus ? '+' : '');
              if (current >= target) clearInterval(timer);
            }, 40);
          });
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  const homeBanner = document.querySelector('.home-banner');
  if (homeBanner) counterObserver.observe(homeBanner);

  // Case study metric counters
  const csMetricObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.metric-num[data-target]').forEach(el => {
            const target = parseInt(el.dataset.target);
            if (isNaN(target)) return;
            let current = 0;
            const step = Math.ceil(target / 40);
            const timer = setInterval(() => {
              current = Math.min(current + step, target);
              el.textContent = current;
              if (current >= target) clearInterval(timer);
            }, 30);
          });
          csMetricObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );
  document.querySelectorAll('.cs-metrics').forEach(el => csMetricObserver.observe(el));

  // Journey timeline progressive reveal
  const journeyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('motion-visible');
          }, i * 120);
        }
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll('.journey-item').forEach(el => {
    journeyObserver.observe(el);
  });
}

// Expose for dynamic content
window._animateCounter = function (el, target) {
  if (isNaN(target) || target === 0) return;
  let current = 0;
  const step = Math.max(1, Math.ceil(target / 40));
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current;
    if (current >= target) clearInterval(timer);
  }, 30);
};

window.refreshMotion = function () {
  applyStagger();
  document.querySelectorAll('[data-motion]:not(.motion-visible)').forEach(el => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('motion-visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    obs.observe(el);
  });
};

/*─── SKILL GALAXY POSITIONING ─────────────────────────────────────────────*/
(function positionGalaxyNodes() {
  function getRadii() {
    const galaxy = document.getElementById('skill-galaxy');
    if (!galaxy) return { '1': 90, '2': 155, '3': 225 };
    const size = galaxy.offsetWidth;
    // Scale radii proportionally to actual galaxy size (base = 560px)
    const scale = size / 560;
    return {
      '1': Math.round(90  * scale),
      '2': Math.round(155 * scale),
      '3': Math.round(225 * scale),
    };
  }

  function place() {
    const galaxy = document.getElementById('skill-galaxy');
    if (!galaxy) return;
    const nodes = galaxy.querySelectorAll('.galaxy-node');
    const radii = getRadii();
    const cx = galaxy.offsetWidth  / 2;
    const cy = galaxy.offsetHeight / 2;

    nodes.forEach(node => {
      const style = node.getAttribute('style') || '';
      const orbitMatch = style.match(/--orbit:\s*(\d)/);
      const angleMatch = style.match(/--angle:\s*([\d.]+)deg/);
      if (!orbitMatch || !angleMatch) return;

      const r   = radii[orbitMatch[1]];
      const rad = (parseFloat(angleMatch[1]) * Math.PI) / 180;
      const nw  = node.offsetWidth  || 56;
      const nh  = node.offsetHeight || 56;

      node.style.position = 'absolute';
      node.style.left     = (cx + r * Math.cos(rad) - nw / 2) + 'px';
      node.style.top      = (cy + r * Math.sin(rad) - nh / 2) + 'px';
      node.style.transform = 'none';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(place, 100));
  } else {
    setTimeout(place, 100);
  }
  window.addEventListener('resize', place);
})();

/*─── SKILL GALAXY TOOLTIP — hover + tap ───────────────────────────────────*/
(function initGalaxyTooltip() {
  const tooltip   = document.getElementById('skill-tooltip');
  const ttName    = document.getElementById('tt-name');
  const ttExp     = document.getElementById('tt-exp');
  const ttProjects= document.getElementById('tt-projects');
  const ttUsed    = document.getElementById('tt-used');
  if (!tooltip) return;

  let activeNode = null;

  function showTooltip(node) {
    ttName.textContent     = node.dataset.skill    || '—';
    ttExp.textContent      = node.dataset.exp      || '—';
    ttProjects.textContent = (node.dataset.projects || '—') + ' projects';
    ttUsed.textContent     = node.dataset.used     || '—';
    tooltip.classList.add('visible');
    activeNode = node;
  }

  function hideTooltip() {
    tooltip.classList.remove('visible');
    activeNode = null;
  }

  const isTouchDevice = () => window.matchMedia('(hover: none)').matches;

  document.querySelectorAll('.galaxy-node').forEach(node => {
    // Desktop: hover
    node.addEventListener('mouseenter', () => { if (!isTouchDevice()) showTooltip(node); });
    node.addEventListener('mouseleave', () => { if (!isTouchDevice()) hideTooltip(); });

    // Mobile: tap toggle
    node.addEventListener('click', (e) => {
      e.stopPropagation();
      if (activeNode === node) {
        hideTooltip();
      } else {
        showTooltip(node);
      }
    });
  });

  // Tap anywhere else to close
  document.addEventListener('click', (e) => {
    if (activeNode && !activeNode.contains(e.target)) {
      hideTooltip();
    }
  });
})();

/*─── SCROLL PROGRESS (journey line) ───────────────────────────────────────*/
(function initScrollProgress() {
  const timeline = document.querySelector('.journey-timeline');
  if (!timeline) return;
  const items = timeline.querySelectorAll('.journey-item');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('motion-visible');
      }
    });
  }, { threshold: 0.2, rootMargin: '-10% 0px' });

  items.forEach(item => obs.observe(item));
})();

/*─── INIT ──────────────────────────────────────────────────────────────────*/
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMotion);
} else {
  initMotion();
}
