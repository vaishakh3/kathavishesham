const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');
const navLinks = [...document.querySelectorAll('.main-nav a')];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);
const filterButtons = [...document.querySelectorAll('[data-filter]')];
const workCards = [...document.querySelectorAll('[data-category]')];
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

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));
    workCards.forEach((card) => {
      const visible = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('is-hidden', !visible);
    });
  });
});

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
