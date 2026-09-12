
const header=document.querySelector('.site-header');
const onScroll=()=>header?.classList.toggle('scrolled',window.scrollY>45);
window.addEventListener('scroll',onScroll,{passive:true});onScroll();

const reveals=document.querySelectorAll('.reveal');
const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}})},{threshold:.08});
reveals.forEach(el=>observer.observe(el));

// Gentle parallax; transform is bounded and never changes document flow.
const parallaxEls=[...document.querySelectorAll('[data-parallax]')];
let ticking=false;
function parallax(){
  const y=window.scrollY;
  parallaxEls.forEach(el=>{const r=el.parentElement.getBoundingClientRect(); if(r.bottom>0&&r.top<innerHeight){const p=Number(el.dataset.parallax)||.1; el.style.transform=`translate3d(0,${(innerHeight/2-(r.top+r.height/2))*p}px,0)`;}});
  ticking=false;
}
window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(parallax);ticking=true}},{passive:true});
parallax();

const hero=document.querySelector('.hero-video'); if(hero) hero.play().catch(()=>{});

// Gallery lightbox with keyboard navigation.
const lightbox=document.getElementById('lightbox');
const lbImg=document.getElementById('lightbox-image');
const lbCaption=document.getElementById('lightbox-caption');
const items=[...document.querySelectorAll('[data-lightbox]')];
let current=0;
function showImage(index){current=(index+items.length)%items.length;const item=items[current];lbImg.src=item.dataset.lightbox;lbImg.alt=item.dataset.alt||'';lbCaption.textContent=`${String(current+1).padStart(2,'0')} / ${item.dataset.alt||'Wedlock Photography'}`;}
function openLightbox(index){showImage(index);lightbox.classList.add('open');lightbox.setAttribute('aria-hidden','false');document.body.classList.add('is-locked');}
function closeLightbox(){lightbox.classList.remove('open');lightbox.setAttribute('aria-hidden','true');document.body.classList.remove('is-locked');lbImg.src='';}
items.forEach((item,i)=>item.addEventListener('click',()=>openLightbox(i)));
document.querySelector('[data-lightbox-close]')?.addEventListener('click',closeLightbox);
document.querySelector('[data-lightbox-prev]')?.addEventListener('click',()=>showImage(current-1));
document.querySelector('[data-lightbox-next]')?.addEventListener('click',()=>showImage(current+1));
lightbox?.addEventListener('click',e=>{if(e.target===lightbox)closeLightbox()});

const filmModal=document.getElementById('film-modal');
const filmVideo=filmModal?.querySelector('video');
document.querySelector('[data-film-open]')?.addEventListener('click',()=>{filmModal.classList.add('open');filmModal.setAttribute('aria-hidden','false');document.body.classList.add('is-locked');filmVideo.currentTime=0;filmVideo.play().catch(()=>{});});
function closeFilm(){filmModal.classList.remove('open');filmModal.setAttribute('aria-hidden','true');document.body.classList.remove('is-locked');filmVideo?.pause();}
document.querySelector('[data-film-close]')?.addEventListener('click',closeFilm);
filmModal?.addEventListener('click',e=>{if(e.target===filmModal)closeFilm()});

document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closeLightbox();closeFilm();}
  if(lightbox?.classList.contains('open')){if(e.key==='ArrowRight')showImage(current+1);if(e.key==='ArrowLeft')showImage(current-1);}
});


// V2.4: scroll-driven single-image story sequence.
const storySteps=[...document.querySelectorAll('.story-step[data-story-image]')];
const storyImages=[...document.querySelectorAll('.story-image')];
const storyProgress=document.querySelector('.story-progress');
if(storySteps.length && storyImages.length){
  const setStory=(index)=>{
    storyImages.forEach((img,i)=>img.classList.toggle('is-active',i===index));
    storySteps.forEach((step,i)=>step.classList.toggle('is-active',i===index));
    if(storyProgress) storyProgress.textContent=`${String(index+1).padStart(2,'0')} / ${String(storySteps.length).padStart(2,'0')}`;
  };
  const storyObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting){setStory(Number(entry.target.dataset.storyImage)||0);}});
  },{root:null,rootMargin:'-38% 0px -38% 0px',threshold:0});
  storySteps.forEach(step=>storyObserver.observe(step));
}

// V2.4: black-and-white editorial chapter — categories change the photograph as the user scrolls.
const bwSteps=[...document.querySelectorAll('.bw-story-step[data-bw-image]')];
const bwImages=[...document.querySelectorAll('.bw-story-image')];
const bwProgress=document.querySelector('.bw-story-progress');
if(bwSteps.length && bwImages.length){
  const setBw=(index)=>{
    bwImages.forEach((img,i)=>img.classList.toggle('is-active',i===index));
    bwSteps.forEach((step,i)=>step.classList.toggle('is-active',i===index));
    if(bwProgress) bwProgress.textContent=`${String(index+1).padStart(2,'0')} / ${String(bwSteps.length).padStart(2,'0')}`;
  };
  const bwObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting){setBw(Number(entry.target.dataset.bwImage)||0);}});
  },{root:null,rootMargin:'-38% 0px -38% 0px',threshold:0});
  bwSteps.forEach(step=>bwObserver.observe(step));
}


// V2.6 — sync What We Create chapters with their full-bleed photographs.
(() => {
  const section = document.querySelector('.services-story');
  if (!section) return;
  const steps = [...section.querySelectorAll('.services-story-step')];
  const images = [...section.querySelectorAll('.services-story-image')];
  const setActive = (index) => {
    steps.forEach((step, i) => step.classList.toggle('is-active', i === index));
    images.forEach((image, i) => image.classList.toggle('is-active', i === index));
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActive(Number(entry.target.dataset.serviceImage || 0));
    });
  }, {root:null, threshold:0.55});
  steps.forEach(step => observer.observe(step));
})();


// V4.1 — robust premium mobile/tablet dropdown navigation.
// Desktop navigation remains untouched. Multiple close paths are intentional for touch reliability.
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

  // The visible MENU label inside the panel also acts as a dedicated close control.
  panel.querySelector('.mobile-nav-panel-top span:last-child')?.addEventListener('click', (event) => {
    event.preventDefault();
    closeMenu();
  });

  panel.querySelectorAll('.mobile-nav a, .mobile-nav-footer a').forEach(link => {
    link.addEventListener('click', () => closeMenu());
  });

  panel.addEventListener('click', (event) => {
    if (event.target === panel) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1100) closeMenu();
  }, {passive:true});

  window.addEventListener('hashchange', closeMenu, {passive:true});
  window.addEventListener('pageshow', closeMenu, {passive:true});
})();
