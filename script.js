const root = document.documentElement;
const themeButton = document.querySelector('.theme-button');
const searchInput = document.querySelector('#search');
const cards = [...document.querySelectorAll('.post-card')];
const studyLanes = [...document.querySelectorAll('[data-study-lane]')];
const emptyState = document.querySelector('.empty-state');
const progressBar = document.querySelector('.reading-progress span');
const navLinks = [...document.querySelectorAll('.main-nav a')];
const header = document.querySelector('.site-header');
const clock = document.querySelector('.system-time');
const cursorGlow = document.querySelector('.cursor-glow');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (localStorage.getItem('study-blog-neon') === 'hot') root.dataset.neon = 'hot';

function updateNeonLabel() {
  const isHot = root.dataset.neon === 'hot';
  themeButton.setAttribute('aria-label', isHot ? '시안 네온으로 전환' : '마젠타 네온으로 전환');
}

themeButton.addEventListener('click', () => {
  const nextMode = root.dataset.neon === 'hot' ? 'cyan' : 'hot';
  root.dataset.neon = nextMode;
  localStorage.setItem('study-blog-neon', nextMode);
  updateNeonLabel();
});

function filterPosts() {
  const query = searchInput.value.trim().toLocaleLowerCase('ko');
  let visibleCount = 0;

  cards.forEach((card) => {
    const haystack = `${card.dataset.search} ${card.textContent}`.toLocaleLowerCase('ko');
    const matchesSearch = !query || haystack.includes(query);
    card.hidden = !matchesSearch;
    if (matchesSearch) visibleCount += 1;
  });

  studyLanes.forEach((lane) => {
    lane.hidden = !lane.querySelector('.post-card:not([hidden])');
  });
  emptyState.hidden = visibleCount > 0;
}

searchInput.addEventListener('input', filterPosts);
document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    searchInput.focus();
    searchInput.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
  }
  if (event.key === 'Escape' && document.activeElement === searchInput) {
    searchInput.value = '';
    filterPosts();
    searchInput.blur();
  }
});

function updateScrollUI() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
  progressBar.style.width = `${Math.min(progress, 100)}%`;
  header.classList.toggle('scrolled', window.scrollY > 40);

  const anchors = ['top', 'notes', 'about'];
  let currentId = 'top';
  anchors.forEach((id) => {
    const section = document.getElementById(id);
    if (section && section.getBoundingClientRect().top <= 180) currentId = id;
  });
  navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`));
}

window.addEventListener('scroll', updateScrollUI, { passive: true });

function updateClock() {
  clock.textContent = new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).format(new Date());
}
updateClock();
setInterval(updateClock, 1000);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 80}ms`;
  revealObserver.observe(element);
});

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const element = entry.target;
    const target = Number(element.dataset.count);
    const start = performance.now();
    const duration = reducedMotion ? 1 : 900;
    function tick(now) {
      const ratio = Math.min((now - start) / duration, 1);
      element.textContent = String(Math.round(target * (1 - Math.pow(1 - ratio, 3)))).padStart(2, '0');
      if (ratio < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    countObserver.unobserve(element);
  });
}, { threshold: 0.7 });
document.querySelectorAll('[data-count]').forEach((counter) => countObserver.observe(counter));

if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener('pointermove', (event) => {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  }, { passive: true });

  document.querySelectorAll('.tilt-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const rotateX = ((event.clientY - rect.top) / rect.height - 0.5) * -7;
      const rotateY = ((event.clientX - rect.left) / rect.width - 0.5) * 7;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });

  document.querySelectorAll('.magnetic').forEach((element) => {
    element.addEventListener('pointermove', (event) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.12;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.12;
      element.style.transform = `translate(${x}px, ${y}px)`;
    });
    element.addEventListener('pointerleave', () => { element.style.transform = ''; });
  });
}

function createParticleField() {
  const canvas = document.querySelector('#particle-field');
  const context = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let particles = [];

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = document.documentElement.clientWidth;
    height = window.innerHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.min(75, Math.floor(width / 18));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      radius: Math.random() * 1.4 + 0.35,
    }));
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    const color = getComputedStyle(root).getPropertyValue('--cyan-rgb').trim();
    particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      if (particle.x < 0 || particle.x > width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > height) particle.vy *= -1;
      context.beginPath();
      context.fillStyle = `rgb(${color} / .5)`;
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();
      for (let next = index + 1; next < particles.length; next += 1) {
        const peer = particles[next];
        const distance = Math.hypot(particle.x - peer.x, particle.y - peer.y);
        if (distance < 115) {
          context.beginPath();
          context.strokeStyle = `rgb(${color} / ${0.1 * (1 - distance / 115)})`;
          context.lineWidth = 0.6;
          context.moveTo(particle.x, particle.y);
          context.lineTo(peer.x, peer.y);
          context.stroke();
        }
      }
    });
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
}

if (!reducedMotion) createParticleField();
document.querySelector('#year').textContent = new Date().getFullYear();
updateNeonLabel();
updateScrollUI();
