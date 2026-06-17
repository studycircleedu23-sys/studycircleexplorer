/* ============================================================
   STUDY CIRCLE EXPLORER — script.js
   ============================================================ */

'use strict';

/* ── Utility ── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   1. HEADER — sticky + scroll class
   ============================================================ */
(function initHeader() {
  const header = $('#header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
    updateBackToTop();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ============================================================
   2. HAMBURGER — mobile nav
   ============================================================ */
(function initHamburger() {
  const btn   = $('#hamburger');
  const links = $('#nav-links');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close on link click
  $$('.nav-link', links).forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && links.classList.contains('open')) {
      links.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      btn.focus();
    }
  });
})();

/* ============================================================
   3. SCROLL ANIMATIONS — IntersectionObserver
   ============================================================ */
(function initScrollAnimations() {
  const items = $$('[data-animate]');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const delay = parseInt(el.dataset.delay || '0', 10);
      setTimeout(() => el.classList.add('in-view'), delay);
      observer.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => observer.observe(el));
})();

/* ============================================================
   4. COUNTER ANIMATION — hero stats
   ============================================================ */
(function initCounters() {
  const counters = $$('[data-target]');
  if (!counters.length) return;

  function animateCount(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const fps      = 60;
    const steps    = Math.round(duration / (1000 / fps));
    let   current  = 0;
    const increment = target / steps;

    const tick = () => {
      current += increment;
      if (current < target) {
        el.textContent = Math.floor(current).toLocaleString();
        requestAnimationFrame(tick);
      } else {
        el.textContent = target.toLocaleString();
      }
    };
    requestAnimationFrame(tick);
  }

  const statsSection = $('.hero-stats');
  if (!statsSection) return;

  let done = false;
  const observer = new IntersectionObserver(entries => {
    if (done || !entries[0].isIntersecting) return;
    done = true;
    counters.forEach(el => animateCount(el));
    observer.disconnect();
  }, { threshold: 0.4 });

  observer.observe(statsSection);
})();

/* ============================================================
   5. BACK TO TOP
   ============================================================ */
function updateBackToTop() {
  const btn = $('#backToTop');
  if (!btn) return;
  btn.classList.toggle('visible', window.scrollY > 400);
}

(function initBackToTop() {
  const btn = $('#backToTop');
  if (!btn) return;
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ============================================================
   6. NEWSLETTER SUBSCRIBE
   ============================================================ */
function handleSubscribe() {
  const input = $('#email-input');
  const msg   = $('#subscribe-msg');
  const btn   = $('#subscribe-btn');
  if (!input || !msg) return;

  const email = input.value.trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    input.style.borderColor = '#ef4444';
    input.focus();
    setTimeout(() => { input.style.borderColor = ''; }, 2000);
    return;
  }

  // Success state
  btn.disabled    = true;
  btn.textContent = 'Subscribed! ✅';
  input.value     = '';
  msg.hidden      = false;
  msg.style.display = 'inline-block';

  // Reset after 5 s
  setTimeout(() => {
    btn.disabled    = false;
    btn.textContent = 'Subscribe 🚀';
    msg.hidden      = true;
  }, 5000);
}

/* make available globally for onclick in HTML */
window.handleSubscribe = handleSubscribe;

/* also handle Enter key in email field */
(function initEmailEnter() {
  const input = $('#email-input');
  if (!input) return;
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleSubscribe();
  });
})();

/* ============================================================
   7. DYNAMIC STARS — canvas starfield in hero
   ============================================================ */
(function initStarfield() {
  const hero = $('.hero');
  if (!hero) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:0;';
  hero.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let   stars = [];
  let   raf;

  function resize() {
    canvas.width  = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
    buildStars();
  }

  function buildStars() {
    stars = Array.from({ length: 180 }, () => ({
      x:       Math.random() * canvas.width,
      y:       Math.random() * canvas.height,
      r:       Math.random() * 1.4 + 0.2,
      alpha:   Math.random(),
      speed:   Math.random() * 0.008 + 0.002,
      dir:     Math.random() > 0.5 ? 1 : -1,
      color:   Math.random() > 0.85
                 ? (Math.random() > 0.5 ? '#f5a623' : '#a78bfa')
                 : '#ffffff',
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.alpha += s.speed * s.dir;
      if (s.alpha >= 1 || s.alpha <= 0) s.dir *= -1;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, s.alpha));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.fill();
      ctx.restore();
    });
    raf = requestAnimationFrame(draw);
  }

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.remove();
    return;
  }

  resize();
  draw();

  const ro = new ResizeObserver(resize);
  ro.observe(hero);
})();

/* ============================================================
   8. SMOOTH SCROLL — for anchor links
   ============================================================ */
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id     = link.getAttribute('href');
      if (id === '#') return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();

      // Account for fixed header + ticker height
      const headerH = 64 + 36; // header + ticker
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ============================================================
   9. TOPIC CARDS — ripple on click
   ============================================================ */
(function initTopicRipple() {
  $$('.topic-card').forEach(card => {
    card.addEventListener('click', e => {
      const rect   = card.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size   = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        position:absolute;
        width:${size}px;height:${size}px;
        border-radius:50%;
        background:rgba(139,92,246,0.18);
        top:${e.clientY - rect.top - size / 2}px;
        left:${e.clientX - rect.left - size / 2}px;
        transform:scale(0);
        animation:ripple .55s ease-out forwards;
        pointer-events:none;
      `;
      card.style.position = 'relative';
      card.style.overflow  = 'hidden';
      card.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Inject ripple keyframes once
  if (!$('#ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = '@keyframes ripple{to{transform:scale(2.5);opacity:0}}';
    document.head.appendChild(style);
  }
})();

/* ============================================================
   10. PLAY BUTTON — video card
   ============================================================ */
(function initPlayBtn() {
  const btn = $('.play-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    btn.textContent = '⏸';
    btn.style.background = 'rgba(139,92,246,0.4)';
    setTimeout(() => {
      btn.textContent = '▶';
      btn.style.background = '';
    }, 2000);
  });
  btn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
  });
})();

/* ============================================================
   11. ACTIVE NAV LINK on scroll
   ============================================================ */
(function initActiveNav() {
  const sections = $$('section[id], footer[id]');
  const links    = $$('.nav-link');
  if (!sections.length || !links.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      links.forEach(l => {
        const href = l.getAttribute('href');
        l.style.color = (href === `#${id}`) ? 'var(--gold)' : '';
      });
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

  sections.forEach(s => observer.observe(s));
})();

/* ============================================================
   12. RESOURCE CARD — hover glow tint
   ============================================================ */
(function initCardGlow() {
  $$('.resource-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
      const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
      card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(139,92,246,0.06) 0%, var(--bg-card) 60%)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.background = '';
    });
  });
})();
