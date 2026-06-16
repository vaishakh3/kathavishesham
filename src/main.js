const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');
const navLinks = [...document.querySelectorAll('.main-nav a')];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);
let filterButtons = [...document.querySelectorAll('[data-filter]')];
let workCards = [...document.querySelectorAll('[data-category]')];
const heroVideo = document.querySelector('[data-hero-video]');
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let clickedNavTarget = null;
let clickedNavTimer;

const setHeaderState = () => {
  header.classList.toggle('is-scrolled', window.scrollY > 18);
};

const setActiveLink = (id) => {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${id}`;
    link.classList.toggle('is-active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
};

const getCurrentSectionId = () => {
  if (window.scrollY < 80) return 'home';

  const marker = 96;
  return sections.reduce(
    (closest, section) => {
      const distance = Math.abs(section.getBoundingClientRect().top - marker);
      return distance < closest.distance ? { id: section.id, distance } : closest;
    },
    { id: 'home', distance: Infinity }
  ).id;
};

const closeMenu = () => {
  nav.classList.remove('is-open');
  menuToggle.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open menu');
};

menuToggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('is-open');
  menuToggle.classList.toggle('is-open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    const targetId = link.getAttribute('href')?.slice(1);
    if (targetId) {
      clickedNavTarget = targetId;
      clearTimeout(clickedNavTimer);
      clickedNavTimer = setTimeout(() => {
        clickedNavTarget = null;
      }, 1400);
      setActiveLink(targetId);
    }
    closeMenu();
  });
});

const bindFilters = () => {
  filterButtons = [...document.querySelectorAll('[data-filter]')];
  workCards = [...document.querySelectorAll('[data-category]')];

  filterButtons.forEach((button) => {
    button.onclick = () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));
      workCards.forEach((card) => {
        const visible = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('is-hidden', !visible);
      });
    };
  });
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const iconPaths = {
  film: '<rect x="4" y="5" width="16" height="13" rx="2"></rect><path d="M8 5v13M16 5v13M4 9h16M4 14h16"></path><path d="M18.5 4.5 20 3M5.5 4.5 4 3"></path>',
  clapper: '<path d="M4 7h16v12H4z"></path><path d="M4 7l3-4h10l3 4"></path><path d="M9 11.5v3l3-1.5-3-1.5Z"></path><path d="M6.5 7l2-4M12 7l2-4"></path>',
  pen: '<path d="M4 20l4.4-1 9.9-9.9a2 2 0 0 0-2.8-2.8L5.6 16.2 4 20Z"></path><path d="m14.5 7.3 2.2 2.2"></path><path d="M18.5 4.5 19.4 2M20.6 7.2 23 6.4"></path>',
  trident: '<path d="M12 3v18"></path><path d="M7 7c0 3 2 5 5 5s5-2 5-5"></path><path d="M7 7 5 5M17 7l2-2M12 3l-2 3h4l-2-3Z"></path><path d="M9 18h6"></path>',
  rings: '<circle cx="9" cy="12" r="4.5"></circle><circle cx="15" cy="12" r="4.5"></circle><path d="M12 8.4 14 5h-4l2 3.4Z"></path>',
  megaphone: '<path d="M4 14v-4l10-4v12L4 14Z"></path><path d="M14 9.5h3.5a2.5 2.5 0 0 1 0 5H14"></path><path d="M7 15.2 8.2 20h3.2L10 16"></path>',
  gem: '<path d="M12 3 4.5 10.5 12 21l7.5-10.5L12 3Z"></path><path d="M8 10.5h8M12 3v18"></path><path d="M18 4.5h2M19 3.5v2"></path>',
};

const renderPortfolio = (works = []) => {
  const grid = document.querySelector('[data-portfolio-grid]');
  if (!grid || !works.length) return;

  grid.innerHTML = works.map((work) => `
    <a
      class="work-card"
      data-category="${escapeHtml(work.category || 'all')}"
      href="${escapeHtml(work.url)}"
      target="_blank"
      rel="noreferrer"
    >
      <img src="${escapeHtml(work.image)}" width="319" height="496" alt="${escapeHtml(work.alt || work.title)}" loading="lazy" decoding="async" />
      <span class="work-tint ${escapeHtml(work.category || '')}"></span>
      <span class="play-button" aria-hidden="true"></span>
      <span class="work-copy">
        <small>${escapeHtml(work.views || 'Featured reel')}</small>
        <strong>${escapeHtml(work.title)}</strong>
        <em>Watch on Instagram <span aria-hidden="true">↗</span></em>
      </span>
    </a>
  `).join('');

  bindFilters();
};

const renderServices = (services = []) => {
  const grid = document.querySelector('.service-grid');
  if (!grid || !services.length) return;

  grid.innerHTML = services.map((service) => `
    <article class="service-card">
      <span class="line-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">${iconPaths[service.icon] || iconPaths.film}</svg>
      </span>
      <h3>${escapeHtml(service.title)}</h3>
      <p>${escapeHtml(service.description)}</p>
    </article>
  `).join('');
};

const renderPricing = (pricing = []) => {
  const grid = document.querySelector('.pricing-grid');
  if (!grid || !pricing.length) return;

  grid.innerHTML = pricing.map((item) => `
    <article class="price-card${item.featured ? ' price-featured' : ''}">
      <small>${escapeHtml(item.duration)}</small>
      <h3>${escapeHtml(item.title)}</h3>
      <strong>${escapeHtml(item.price)}</strong>
    </article>
  `).join('');
};

const hydrateContent = async () => {
  try {
    const response = await fetch('/api/content');
    if (!response.ok) return;
    const data = await response.json();
    if (!data?.content) return;
    renderPortfolio(data.content.works);
    renderServices(data.content.services);
    renderPricing(data.content.pricing);
  } catch {
    // The hardcoded markup remains as the resilient fallback.
  }
};

bindFilters();


const syncHeroMotion = () => {
  if (!heroVideo) return;

  heroVideo.muted = true;
  heroVideo.defaultMuted = true;
  heroVideo.playsInline = true;
  heroVideo.controls = false;
  heroVideo.removeAttribute('controls');

  if (motionQuery.matches) {
    heroVideo.pause();
    heroVideo.removeAttribute('autoplay');
  } else {
    heroVideo.setAttribute('autoplay', '');
    heroVideo.play().catch(() => {});
  }
};

window.addEventListener('scroll', () => {
  setHeaderState();
  if (clickedNavTarget) {
    setActiveLink(clickedNavTarget);
    return;
  }
  setActiveLink(getCurrentSectionId());
}, { passive: true });
if (motionQuery.addEventListener) {
  motionQuery.addEventListener('change', syncHeroMotion);
} else if (motionQuery.addListener) {
  motionQuery.addListener(syncHeroMotion);
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) syncHeroMotion();
});

window.addEventListener('pageshow', syncHeroMotion);
window.addEventListener('pointerdown', syncHeroMotion, { once: true, passive: true });
window.addEventListener('touchstart', syncHeroMotion, { once: true, passive: true });
setHeaderState();
setActiveLink('home');
syncHeroMotion();
hydrateContent();
