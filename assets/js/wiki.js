/* ════════════════════════════════════════
   SCRATCH XML INJECTOR — Wiki JS
   Shared across all pages
════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Scroll progress bar ── */
  const bar = document.getElementById('scroll-bar');
  if (bar) {
    window.addEventListener('scroll', () => {
      const s = document.documentElement;
      const pct = (s.scrollTop / (s.scrollHeight - s.clientHeight)) * 100;
      bar.style.width = pct + '%';
    }, { passive: true });
  }

  /* ── Active sidebar link (scroll spy) ── */
  const sections = Array.from(document.querySelectorAll('section[id], .doc-section[id]'));
  const sideLinks = Array.from(document.querySelectorAll('.sidebar-link'));
  const tocLinks  = Array.from(document.querySelectorAll('.toc-link'));

  function updateActiveLink(id) {
    sideLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href')?.includes('#' + id) ||
        a.getAttribute('href')?.endsWith(window.location.pathname.split('/').pop() + '') && !a.getAttribute('href').includes('#'));
    });
    tocLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + id);
    });
  }

  if (sections.length > 0) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) updateActiveLink(e.target.id); });
    }, { rootMargin: '-20% 0px -60% 0px' });
    sections.forEach(s => io.observe(s));
  }

  /* ── Mark current page in sidebar ── */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  sideLinks.forEach(a => {
    const href = (a.getAttribute('href') || '').split('/').pop().split('#')[0];
    if (href === currentPath) a.classList.add('active');
  });

  /* ── Copy buttons ── */
  document.addEventListener('click', (e) => {
    if (!e.target.matches('.copy-btn')) return;
    const btn = e.target;
    const pre = btn.closest('.code-block')?.querySelector('pre code') ||
                btn.nextElementSibling?.querySelector('code') ||
                btn.parentElement?.querySelector('pre code');
    if (!pre) return;
    navigator.clipboard.writeText(pre.innerText).then(() => {
      const orig = btn.textContent;
      btn.textContent = '✓ Copied';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 1800);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = pre.innerText;
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      btn.textContent = '✓ Done';
      setTimeout(() => { btn.textContent = 'Copy'; }, 1800);
    });
  });

  /* ── Quick-start tabs (landing page) ── */
  document.querySelectorAll('.qs-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const group = tab.closest('.qs-wrap');
      group.querySelectorAll('.qs-tab').forEach(t => t.classList.remove('active'));
      group.querySelectorAll('.qs-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = group.querySelector('#' + tab.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  /* ── Mobile sidebar toggle (injected automatically) ── */
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const sidebar   = document.querySelector('.sidebar');
  if (mobileBtn && sidebar) {
    mobileBtn.addEventListener('click', () => {
      sidebar.style.display = sidebar.style.display === 'block' ? '' : 'block';
    });
  }

  /* ── Smooth anchor offset for fixed header ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
