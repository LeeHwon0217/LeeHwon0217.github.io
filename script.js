const root = document.documentElement;
const themeButton = document.querySelector('.theme-button');
const searchInput = document.querySelector('#search');
const cards = [...document.querySelectorAll('.post-card')];
const studyLanes = [...document.querySelectorAll('[data-study-lane]')];
const emptyState = document.querySelector('.empty-state');

const savedTheme = localStorage.getItem('study-blog-theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
  root.dataset.theme = 'dark';
}

function updateThemeLabel() {
  const isDark = root.dataset.theme === 'dark';
  themeButton.setAttribute('aria-label', isDark ? '밝은 화면으로 전환' : '어두운 화면으로 전환');
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
document.querySelector('#year').textContent = new Date().getFullYear();
updateThemeLabel();
