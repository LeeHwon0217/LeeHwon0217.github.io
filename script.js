const root = document.documentElement;
const themeButton = document.querySelector('.theme-button');
const searchInput = document.querySelector('#search');
const filters = [...document.querySelectorAll('.filter')];
const cards = [...document.querySelectorAll('.post-card')];
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

let activeFilter = 'all';

function filterPosts() {
  const query = searchInput.value.trim().toLocaleLowerCase('ko');
  let visibleCount = 0;

  cards.forEach((card) => {
    const matchesCategory = activeFilter === 'all' || card.dataset.category === activeFilter;
    const matchesSearch = !query || card.dataset.search.toLocaleLowerCase('ko').includes(query) || card.textContent.toLocaleLowerCase('ko').includes(query);
    const isVisible = matchesCategory && matchesSearch;
    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  emptyState.hidden = visibleCount > 0;
}

filters.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filters.forEach((filter) => filter.classList.toggle('active', filter === button));
    filterPosts();
  });
});

searchInput.addEventListener('input', filterPosts);
document.querySelector('#year').textContent = new Date().getFullYear();
updateThemeLabel();
