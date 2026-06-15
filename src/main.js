const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');
const navLinks = [...document.querySelectorAll('.main-nav a')];
const sections = [...document.querySelectorAll('.section-anchor')];
const filterButtons = [...document.querySelectorAll('[data-filter]')];
const workCards = [...document.querySelectorAll('[data-category]')];
const heroVideo = document.querySelector('[data-hero-video]');
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

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
  link.addEventListener('click', closeMenu);
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

const activeObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    setActiveLink(window.scrollY < 80 ? 'home' : visible.target.id);
  },
  {
    rootMargin: '-25% 0px -58% 0px',
    threshold: [0.15, 0.3, 0.55]
  }
);

sections.forEach((section) => activeObserver.observe(section));
window.addEventListener('scroll', () => {
  setHeaderState();
  if (window.scrollY < 80) setActiveLink('home');
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
