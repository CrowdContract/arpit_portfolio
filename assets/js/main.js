/*=============== MENU ===============*/
const navMenu = document.getElementById('nav-menu');
const navToggle = document.getElementById('nav-toggle');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('show-menu');
    navToggle.classList.toggle('animate-toggle');
  });
}

/*=============== REMOVE MENU ON LINK CLICK ===============*/
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('show-menu');
    if (navToggle) navToggle.classList.remove('animate-toggle');
  });
});/*=============== STICKY HEADER ===============*/
window.addEventListener('scroll', () => {
  const header = document.getElementById('header');
  if (header) header.classList.toggle('bg-header', window.scrollY >= 20);
});

/*=============== ACTIVE NAV LINK ON SCROLL ===============*/
const sections = document.querySelectorAll('section[id]');

function updateActiveLink() {
  const scrollY = window.pageYOffset;
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');
    const link = document.querySelector(`.nav-link[href="#${sectionId}"]`);
    if (link) {
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        link.classList.add('active-link');
      } else {
        link.classList.remove('active-link');
      }
    }
  });
}
window.addEventListener('scroll', updateActiveLink);

/*=============== SERVICES SWIPER ===============*/
const servicesSwiper = document.querySelector('.services-swiper');
if (servicesSwiper) {
  new Swiper('.services-swiper', {
    spaceBetween: 32,
    grabCursor: true,
    pagination: { el: '.swiper-pagination', clickable: true },
    breakpoints: {
      768: { slidesPerView: 2 },
      1208: { slidesPerView: 3 },
    },
  });
}

/*=============== MIXITUP PORTFOLIO FILTER ===============*/
const workContainer = document.querySelector('.work-container');
if (workContainer && typeof mixitup !== 'undefined') {
  const mixer = mixitup('.work-container', {
    selectors: { target: '.mix' },
    animation: { duration: 350, easing: 'ease' },
  });

  document.querySelectorAll('.work-item').forEach(item => {
    item.addEventListener('click', function () {
      document.querySelectorAll('.work-item').forEach(i => i.classList.remove('active-work'));
      this.classList.add('active-work');
    });
  });
}

/*=============== RESUME ACCORDION ===============*/
document.querySelectorAll('.resume-item').forEach(item => {
  const header = item.querySelector('.resume-header');
  const content = item.querySelector('.resume-content');
  const iconEl = item.querySelector('.resume-icon i');

  if (!header || !content || !iconEl) return;

  header.addEventListener('click', () => {
    const isOpen = item.classList.toggle('accordion-open');
    content.style.height = isOpen ? content.scrollHeight + 'px' : '0';
    iconEl.className = isOpen ? 'ri-subtract-line' : 'ri-add-line';

    // Close others
    document.querySelectorAll('.resume-item').forEach(other => {
      if (other !== item && other.classList.contains('accordion-open')) {
        other.classList.remove('accordion-open');
        const otherContent = other.querySelector('.resume-content');
        const otherIcon = other.querySelector('.resume-icon i');
        if (otherContent) otherContent.style.height = '0';
        if (otherIcon) otherIcon.className = 'ri-add-line';
      }
    });
  });
});

/*=============== TESTIMONIALS SWIPER ===============*/
const testimonialSwiper = document.querySelector('.testimonials-swiper');
if (testimonialSwiper) {
  new Swiper('.testimonials-swiper', {
    spaceBetween: 32,
    grabCursor: true,
    pagination: { el: '.swiper-pagination', clickable: true },
    breakpoints: {
      768: { slidesPerView: 2 },
      1208: { slidesPerView: 3 },
    },
  });
}

/*=============== CONTACT FORM — Formspree ===============*/
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;

    const data = new FormData(contactForm);

    try {
      const res = await fetch('https://formspree.io/f/xwpbkdrv', {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        btn.textContent = 'Message Sent ✓';
        btn.style.color = 'var(--first-color)';
        contactForm.reset();
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.color = '';
          btn.disabled = false;
        }, 4000);
      } else {
        const json = await res.json();
        btn.textContent = json.errors ? json.errors[0].message : 'Failed — try email directly';
        btn.style.color = '#e53e3e';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.color = '';
          btn.disabled = false;
        }, 4000);
      }
    } catch (err) {
      btn.textContent = 'Network error — try again';
      btn.style.color = '#e53e3e';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.color = '';
        btn.disabled = false;
      }, 4000);
    }
  });
}

/*=============== STYLE SWITCHER ===============*/
const styleSwitcher = document.getElementById('style-switcher');
const switcherToggle = document.getElementById('switcher-toggle');
const switcherClose = document.getElementById('switcher-close');

if (switcherToggle) switcherToggle.addEventListener('click', () => styleSwitcher.classList.add('show-switcher'));
if (switcherClose) switcherClose.addEventListener('click', () => styleSwitcher.classList.remove('show-switcher'));

/*=============== THEME COLORS ===============*/
document.querySelectorAll('.style-switcher-color').forEach(color => {
  color.addEventListener('click', () => {
    const hue = color.style.getPropertyValue('--hue');
    document.querySelectorAll('.style-switcher-color').forEach(c => c.classList.remove('active-color'));
    color.classList.add('active-color');
    document.documentElement.style.setProperty('--hue', hue);
    localStorage.setItem('portfolio-hue', hue);
  });
});

/*=============== LIGHT/DARK MODE ===============*/
const savedTheme = localStorage.getItem('portfolio-theme') || 'light';
document.body.className = savedTheme;
const themeInput = document.getElementById(savedTheme + '-theme');
if (themeInput) themeInput.checked = true;

document.querySelectorAll('input[name="body-theme"]').forEach(input => {
  input.addEventListener('change', () => {
    document.body.className = input.value;
    localStorage.setItem('portfolio-theme', input.value);
  });
});

// Restore saved hue
const savedHue = localStorage.getItem('portfolio-hue');
if (savedHue) {
  document.documentElement.style.setProperty('--hue', savedHue);
  document.querySelectorAll('.style-switcher-color').forEach(c => {
    c.classList.toggle('active-color', c.style.getPropertyValue('--hue') === savedHue);
  });
}
