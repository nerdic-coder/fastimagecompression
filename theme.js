(function () {
  const STORAGE_KEY = 'fic-theme';
  const root = document.documentElement;

  function getSystemPrefersDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function applyTheme(theme) {
    root.classList.remove('theme-light', 'theme-dark');
    if (theme === 'dark') {
      root.classList.add('theme-dark');
    } else if (theme === 'light') {
      root.classList.add('theme-light');
    } else {
      root.classList.add(getSystemPrefersDark() ? 'theme-dark' : 'theme-light');
    }
  }

  function getSavedTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'system';
    } catch {
      return 'system';
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore storage errors
    }
  }

  function nextTheme(current) {
    if (current === 'system') return 'dark';
    if (current === 'dark') return 'light';
    return 'system';
  }

  function labelForTheme(theme) {
    if (theme === 'dark') return 'Theme: Dark';
    if (theme === 'light') return 'Theme: Light';
    return 'Theme: System';
  }

  function addThemeToggle() {
    const nav = document.querySelector('.nav');
    if (!nav || nav.querySelector('.theme-toggle')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle';

    let current = getSavedTheme();
    btn.textContent = labelForTheme(current);
    btn.setAttribute('aria-label', 'Toggle theme');

    btn.addEventListener('click', function () {
      current = nextTheme(current);
      saveTheme(current);
      applyTheme(current);
      btn.textContent = labelForTheme(current);
    });

    nav.appendChild(btn);
  }

  function init() {
    const saved = getSavedTheme();
    applyTheme(saved);
    addThemeToggle();

    if (window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', function () {
        if (getSavedTheme() === 'system') {
          applyTheme('system');
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
