const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');
const navLinks = [...document.querySelectorAll('.main-nav a')];
const sections = [...document.querySelectorAll('.section-anchor')];
const filterButtons = [...document.querySelectorAll('[data-filter]')];
const workCards = [...document.querySelectorAll('[data-category]')];
const heroVideo = document.querySelector('.hero-media video');
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

const setHeaderState = () => {
  header.classList.toggle('is-scrolled', window.scrollY > 18);
};

const setActiveLink = (id) => {
  navLinks.forEach((link) => {
    link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
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
setHeaderState();
setActiveLink('home');
syncHeroMotion();
