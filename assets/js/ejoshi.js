/* ============================================================
   Ejoshi — v8 site script
   - Mobile nav toggle
   - Language toggle (paired EN ⇄ CN files)
   - Email form placeholder handler
   ============================================================ */

(function () {
  'use strict';

  // ── Mobile nav ──────────────────────────────────────────────
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  if (nav && toggle) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', nav.classList.contains('is-open'));
    });
  }

  // ── Language toggle ─────────────────────────────────────────
  // Convention: EN files are `something.html`, CN siblings are `something_cn.html`.
  // Special case: home is index.html / index_cn.html.
  const langToggle = document.querySelector('.lang-toggle');
  if (langToggle) {
    langToggle.addEventListener('click', function () {
      const path = window.location.pathname;
      const file = path.split('/').pop() || 'index.html';
      let target;
      if (file.endsWith('_cn.html')) {
        target = file.replace('_cn.html', '.html');
      } else if (file === 'index.html' || file === '') {
        target = 'index_cn.html';
      } else if (file.endsWith('.html')) {
        target = file.replace('.html', '_cn.html');
      } else {
        target = 'index_cn.html';
      }
      const base = path.replace(/[^/]*$/, '');
      window.location.href = base + target;
    });
  }

  // ── Email form ──────────────────────────────────────────────
  // Until Beehiiv ID lands, capture intent and show a friendly state.
  // To wire up: replace the form `action` attribute with the Beehiiv embed URL
  // (Settings → Publication → Email forms in the Beehiiv dashboard).
  document.querySelectorAll('form.email-form').forEach(function (form) {
    if (form.dataset.live === 'true') return; // a wired form opts out
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]').value.trim();
      if (!email) return;
      const msg = form.dataset.successMsg || 'Thanks. You are on the list.';
      const note = document.createElement('p');
      note.className = 'email-microcopy';
      note.style.color = 'var(--gold)';
      note.textContent = msg;
      form.replaceWith(note);
    });
  });
})();
