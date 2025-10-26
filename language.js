// js/language.js

let currentLanguage = 'en';

export function initializeLanguageSwitcher() {
  const enBtn = document.getElementById('lang-en');
  const tlBtn = document.getElementById('lang-tl');

  enBtn.addEventListener('click', () => switchLanguage('en'));
  tlBtn.addEventListener('click', () => switchLanguage('tl'));
}

export function switchLanguage(lang) {
  currentLanguage = lang;

  document.getElementById('lang-en').classList.toggle('active', lang === 'en');
  document.getElementById('lang-tl').classList.toggle('active', lang === 'tl');

  document.querySelectorAll('[data-en]').forEach(element => {
    const text = element.getAttribute(`data-${lang}`);
    if (text) element.textContent = text;
  });

  const nameInput = document.getElementById('child-name');
  if (nameInput) {
    nameInput.placeholder = lang === 'en'
      ? "Enter child's name"
      : "Ilagay ang pangalan ng bata";
  }
}
