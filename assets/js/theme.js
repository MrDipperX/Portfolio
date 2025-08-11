(function() {
    const STORAGE_KEY = 'theme';
    const root = document.documentElement;
  
    function applyTheme(theme, persist=true) {
      if (theme === 'dark') {
        root.setAttribute('data-theme', 'dark');
      } else if (theme === 'light') {
        root.setAttribute('data-theme', 'light');
      } else {
        root.removeAttribute('data-theme'); // auto: следуем системе
      }
      if (persist) localStorage.setItem(STORAGE_KEY, theme);
      const btn = document.getElementById('theme-toggle');
      if (btn) {
        const current = getCurrentTheme();
        btn.setAttribute('aria-pressed', current === 'dark' ? 'true' : 'false');
        btn.setAttribute('aria-label', current === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      }
    }
  
    function getStoredTheme() {
      try { return localStorage.getItem(STORAGE_KEY) || null; } catch (_) { return null; }
    }
    function systemPrefersDark() {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    function getCurrentTheme() {
      const stored = getStoredTheme();
      if (stored === 'dark' || stored === 'light') return stored;
      return systemPrefersDark() ? 'dark' : 'light';
    }
  
    // Инициализация
    const initial = getStoredTheme();
    if (initial === 'dark' || initial === 'light') {
      applyTheme(initial, false);
    } else {
      applyTheme('auto', false); // нет выбора — следуем системе
    }
  
    // Реагируем на смену системной темы, если пользователь не выбирал явно
    if (window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', () => {
        if (!getStoredTheme()) applyTheme('auto', false);
      });
    }
  
    // Кнопка: auto → dark → light → auto …
    window.toggleTheme = function() {
      const current = getStoredTheme() || 'auto';
      if (current === 'auto') {
        applyTheme(systemPrefersDark() ? 'light' : 'dark');
      } else if (current === 'dark') {
        applyTheme('light');
      } else if (current === 'light') {
        try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
        applyTheme('auto', false);
      }
    };
  })();