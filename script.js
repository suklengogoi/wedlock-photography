/* Wedlock Photography — site behaviour.
   Vanilla JS, no dependencies. Each block is independent and exits early if
   its elements are absent. */


/* --- Header state --------------------------------------------------------- */
const header = document.querySelector('.site-header');
const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 45);
window.addEventListener('scroll', onScroll, {passive: true});
onScroll();


/* --- Gentle parallax ------------------------------------------------------ */
/* The transform is bounded and never changes document flow. Skipped entirely
   when the visitor prefers reduced motion. */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const parallaxEls = [...document.querySelectorAll('[data-parallax]')];
let ticking = false;

function parallax(){
  if (reduceMotion.matches) return;
  parallaxEls.forEach(el => {
    const r = el.parentElement.getBoundingClientRect();
    if (r.bottom > 0 && r.top < innerHeight) {
      const p = Number(el.dataset.parallax) || .1;
      el.style.transform = `translate3d(0,${(innerHeight / 2 - (r.top + r.height / 2)) * p}px,0)`;
    }
  });
  ticking = false;
}

if (parallaxEls.length) {
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(parallax); ticking = true; }
  }, {passive: true});
  parallax();
}


/* --- Hero video ----------------------------------------------------------- */
const heroVideo = document.querySelector('.hero-video');
if (heroVideo) heroVideo.play().catch(() => {});


/* --- Lightbox ------------------------------------------------------------- */
/* Opens on any element carrying data-lightbox (currently the five Selected
   Stories photographs). data-lightbox holds the image path, data-alt the
   caption text. Prev/next cycle through the same set. */
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lightbox-image');
const lbCaption = document.getElementById('lightbox-caption');
const lbClose = document.querySelector('[data-lightbox-close]');
const lbItems = [...document.querySelectorAll('[data-lightbox]')];
let lbCurrent = 0;
let lbReturnFocus = null;

function showImage(index){
  if (!lbItems.length) return;
  lbCurrent = (index + lbItems.length) % lbItems.length;
  const item = lbItems[lbCurrent];
  const label = item.dataset.alt || 'Wedlock Photography';
  lbImg.src = item.dataset.lightbox;
  lbImg.alt = label;
  lbCaption.textContent = `${String(lbCurrent + 1).padStart(2, '0')} / ${label}`;
}

function openLightbox(index){
  if (!lightbox) return;
  lbReturnFocus = document.activeElement;
  showImage(index);
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('is-locked');
  lbClose?.focus();
}

function closeLightbox(){
  if (!lightbox || !lightbox.classList.contains('open')) return;
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('is-locked');
  lbImg.removeAttribute('src');
  lbReturnFocus?.focus();
  lbReturnFocus = null;
}

lbItems.forEach((item, i) => {
  item.addEventListener('click', () => openLightbox(i));
  item.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
  });
});

lbClose?.addEventListener('click', closeLightbox);
document.querySelector('[data-lightbox-prev]')?.addEventListener('click', () => showImage(lbCurrent - 1));
document.querySelector('[data-lightbox-next]')?.addEventListener('click', () => showImage(lbCurrent + 1));
lightbox?.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });


/* --- Film modal ----------------------------------------------------------- */
const filmModal = document.getElementById('film-modal');
const filmVideo = filmModal?.querySelector('video');

document.querySelector('[data-film-open]')?.addEventListener('click', () => {
  if (!filmModal) return;
  filmModal.classList.add('open');
  filmModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('is-locked');
  if (filmVideo) { filmVideo.currentTime = 0; filmVideo.play().catch(() => {}); }
});

function closeFilm(){
  if (!filmModal || !filmModal.classList.contains('open')) return;
  filmModal.classList.remove('open');
  filmModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('is-locked');
  filmVideo?.pause();
}

document.querySelector('[data-film-close]')?.addEventListener('click', closeFilm);
filmModal?.addEventListener('click', e => { if (e.target === filmModal) closeFilm(); });


/* --- Overlay keyboard control --------------------------------------------- */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeLightbox(); closeFilm(); }
  if (lightbox?.classList.contains('open')) {
    if (e.key === 'ArrowRight') showImage(lbCurrent + 1);
    if (e.key === 'ArrowLeft') showImage(lbCurrent - 1);
  }
});


/* --- Selected Stories: scroll-driven single-image sequence ----------------- */
const storySteps = [...document.querySelectorAll('.story-step[data-story-image]')];
const storyImages = [...document.querySelectorAll('.story-image')];
const storyProgress = document.querySelector('.story-progress');

if (storySteps.length && storyImages.length) {
  const setStory = (index) => {
    storyImages.forEach((img, i) => {
      const active = i === index;
      img.classList.toggle('is-active', active);
      // Only the visible photograph is reachable by keyboard.
      img.tabIndex = active ? 0 : -1;
    });
    storySteps.forEach((step, i) => step.classList.toggle('is-active', i === index));
    if (storyProgress) {
      storyProgress.textContent = `${String(index + 1).padStart(2, '0')} / ${String(storySteps.length).padStart(2, '0')}`;
    }
  };

  storyImages.forEach((img, i) => { img.tabIndex = img.classList.contains('is-active') ? 0 : -1; });

  const storyObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setStory(Number(entry.target.dataset.storyImage) || 0);
    });
  }, {root: null, rootMargin: '-38% 0px -38% 0px', threshold: 0});

  storySteps.forEach(step => storyObserver.observe(step));
}


/* --- In Another Light: categories change the photograph on scroll ---------- */
const bwSteps = [...document.querySelectorAll('.bw-story-step[data-bw-image]')];
const bwImages = [...document.querySelectorAll('.bw-story-image')];
const bwProgress = document.querySelector('.bw-story-progress');

if (bwSteps.length && bwImages.length) {
  const setBw = (index) => {
    bwImages.forEach((img, i) => img.classList.toggle('is-active', i === index));
    bwSteps.forEach((step, i) => step.classList.toggle('is-active', i === index));
    if (bwProgress) {
      bwProgress.textContent = `${String(index + 1).padStart(2, '0')} / ${String(bwSteps.length).padStart(2, '0')}`;
    }
  };

  const bwObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setBw(Number(entry.target.dataset.bwImage) || 0);
    });
  }, {root: null, rootMargin: '-38% 0px -38% 0px', threshold: 0});

  bwSteps.forEach(step => bwObserver.observe(step));
}


/* --- Mobile / tablet navigation ------------------------------------------- */
(() => {
  const trigger = document.querySelector('.mobile-menu-trigger');
  const panel = document.getElementById('mobile-nav-panel');
  if (!trigger || !panel) return;

  const setMenu = (open) => {
    trigger.setAttribute('aria-expanded', String(open));
    panel.setAttribute('aria-hidden', String(!open));
    panel.classList.toggle('is-open', open);
    document.body.classList.toggle('mobile-nav-open', open);
  };

  const closeMenu = () => setMenu(false);
  const toggleMenu = () => setMenu(trigger.getAttribute('aria-expanded') !== 'true');

  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleMenu();
  });

  panel.querySelectorAll('.mobile-nav a, .mobile-nav-footer a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  panel.addEventListener('click', (event) => {
    if (event.target === panel) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1100) closeMenu();
  }, {passive: true});

  window.addEventListener('hashchange', closeMenu, {passive: true});
})();
