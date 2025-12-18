
/**
 * lang_toggle_patched_v2.js
 * - Only responsibility: toggle body id + set `window.language` + fire lang:changed
 * - Does NOT call initTy02All/renderAllCharts/etc. (prevents re-creation / re-animation)
 */

(function () {
  'use strict';

  function getStoredBodyId() {
    try { return localStorage.getItem('siteLang'); } catch (_) { return null; }
  }

  function setStoredBodyId(id) {
    try { localStorage.setItem('siteLang', id); } catch (_) {}
  }

  function bodyIdToLang(id) {
    return (id === 'lang_en') ? 'eng' : 'kor';
  }

  function applyInitialLangFromStorage() {
    const stored = getStoredBodyId();
    const id = (stored === 'lang_en' || stored === 'lang_kr') ? stored : (document.body.id || 'lang_kr');
    document.body.id = id;
    window.language = bodyIdToLang(id);

    // Fire once so view_chart_main can sync UI
    requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent('lang:changed', { detail: { language: window.language } }));
    });
  }

  window.addEventListener('load', function () {
    // apply initial language on refresh
    applyInitialLangFromStorage();

    const btn = document.querySelector('.btn_lang');
    if (!btn) return;

    // Prevent double binding
    if (btn.dataset.langBound === '1') return;
    btn.dataset.langBound = '1';

    btn.addEventListener('click', function () {
      const currentId = document.body.id || 'lang_kr';
      const nextId = (currentId === 'lang_kr') ? 'lang_en' : 'lang_kr';

      document.body.id = nextId;
      setStoredBodyId(nextId);

      window.language = bodyIdToLang(nextId);

      requestAnimationFrame(() => {
        window.dispatchEvent(new CustomEvent('lang:changed', { detail: { language: window.language } }));
      });
    });
  });

})();
