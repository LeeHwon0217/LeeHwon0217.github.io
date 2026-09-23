const root = document.documentElement;
const themeButton = document.querySelector('.theme-button');
const searchInput = document.querySelector('#search');
const cards = [...document.querySelectorAll('.post-card')];
const studyLanes = [...document.querySelectorAll('[data-study-lane]')];
const emptyState = document.querySelector('.empty-state');
const progressBar = document.querySelector('.reading-progress span');
const navLinks = [...document.querySelectorAll('.main-nav a')];
const themeMeta = document.querySelector('meta[name="theme-color"]');

const savedTheme = localStorage.getItem('study-blog-theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
  root.dataset.theme = 'dark';
}

function updateThemeLabel() {
  const isDark = root.dataset.theme === 'dark';
  themeButton.setAttribute('aria-label', isDark ? '밝은 화면으로 전환' : '어두운 화면으로 전환');
  themeMeta.setAttribute('content', isDark ? '#121b18' : '#f4f1e9');
}

themeButton.addEventListener('click', () => {
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = nextTheme;
  localStorage.setItem('study-blog-theme', nextTheme);
  updateThemeLabel();
});

function filterPosts() {
  const query = searchInput.value.trim().toLocaleLowerCase('ko');
  let visibleCount = 0;

  cards.forEach((card) => {
    const matchesSearch = !query || card.dataset.search.toLocaleLowerCase('ko').includes(query) || card.textContent.toLocaleLowerCase('ko').includes(query);
    card.hidden = !matchesSearch;
    if (matchesSearch) visibleCount += 1;
  });

  studyLanes.forEach((lane) => {
    lane.hidden = !lane.querySelector('.post-card:not([hidden])');
  });

  emptyState.hidden = visibleCount > 0;
}

searchInput.addEventListener('input', filterPosts);

function updateScrollUI() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
  progressBar.style.width = `${Math.min(progress, 100)}%`;

  const anchors = ['top', 'notes', 'about'];
  let currentId = 'top';

  anchors.forEach((id) => {
    const section = document.getElementById(id);
    if (section && section.getBoundingClientRect().top <= 180) currentId = id;
  });

  navLinks.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
  });
}

window.addEventListener('scroll', updateScrollUI, { passive: true });
document.querySelector('#year').textContent = new Date().getFullYear();
updateThemeLabel();
updateScrollUI();
