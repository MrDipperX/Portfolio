// assets/js/i18n.js (drop-in)
let CURRENT_TRANSLATIONS = {};

async function setLanguage(lang) {
  localStorage.setItem('lang', lang);

  const resp = await fetch(`assets/lang/${lang}.json`, { cache: 'no-store' });
  const translations = await resp.json(); // ← читаем в переменную

  CURRENT_TRANSLATIONS = translations;

  // Глобально доступно для других скриптов (детали портфолио и т.п.)
  window.i18n = { lang, translations };
  window.CURRENT_TRANSLATIONS = translations;

  // Сообщаем, что переводы готовы
  document.dispatchEvent(new CustomEvent('i18n:ready', { detail: { lang } }));

  applyTranslations(translations);
  initTypedIfNeeded(); // если хочешь перезапускать Typed.js при смене языка
}

function applyTranslations(translations) {
  // Тексты: data-i18n="key"
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key && translations[key] != null) el.textContent = translations[key];
  });

  // Атрибуты: data-i18n-attr="attr:key" (напр. data-typed-items:hero_roles)
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    const spec = el.getAttribute('data-i18n-attr');
    if (!spec || !spec.includes(':')) return;
    const [attr, key] = spec.split(':');
    if (attr && key && translations[key] != null) el.setAttribute(attr, translations[key]);
  });

  // Возраст: <span id="age" data-birthdate="YYYY-MM-DD"></span>
  const ageEl = document.querySelector('#age[data-birthdate]');
  if (ageEl) {
    const bd = ageEl.getAttribute('data-birthdate');
    if (bd) {
      const today = new Date();
      const birth = new Date(bd);
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      ageEl.textContent = String(age);
    }
  }
}

// Безопасная инициализация/переинициализация Typed.js
function initTypedIfNeeded() {
  const el = document.querySelector('.typed');
  if (!el || typeof Typed === 'undefined') return;

  const itemsStr = el.getAttribute('data-typed-items') || '';
  const items = itemsStr.split(',').map(s => s.trim()).filter(Boolean);
  if (!items.length) return;

  if (window._typedInstance && typeof window._typedInstance.destroy === 'function') {
    window._typedInstance.destroy();
  }

  window._typedInstance = new Typed('.typed', {
    strings: items,
    typeSpeed: 100,
    backSpeed: 50,
    backDelay: 1500,
    loop: true
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const lang = localStorage.getItem('lang') || 'en';
  await setLanguage(lang);
});