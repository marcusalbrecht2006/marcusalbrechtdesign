/* Progressive enhancement only: project pages, email links, and PDF downloads
   remain usable without JavaScript. No analytics or third-party scripts. */
(() => {
  'use strict';
  const nav = document.querySelector('.site-nav');
  const toggle = document.querySelector('.menu-toggle');
  const toast = document.querySelector('.toast');
  let toastTimer;
  const closeMenu = () => {
    if (!nav || !toggle) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
  };
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        toggle.focus();
      }
    });
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.site-header')) closeMenu();
    });
    window.matchMedia('(min-width: 641px)').addEventListener('change', closeMenu);
  }
  const announce = (message) => {
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('visible');
    toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 3200);
  };
  const fallbackCopy = (text) => {
    const input = document.createElement('textarea');
    input.value = text;
    input.setAttribute('readonly', '');
    input.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;';
    document.body.appendChild(input);
    input.select();
    let success = false;
    try { success = document.execCommand('copy'); } catch (_) { /* use visible address */ }
    input.remove();
    return success;
  };
  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-copy-email]');
    if (!button) return;
    const email = button.getAttribute('data-copy-email');
    let copied = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(email);
        copied = true;
      }
    } catch (_) { /* local file or browser permission: try safe fallback */ }
    if (!copied) copied = fallbackCopy(email);
    announce(copied ? 'Email address copied.' : 'Please select and copy: ' + email);
    button.focus({ preventScroll: true });
  });
  const dialog = document.querySelector('.lightbox');
  let trigger = null;
  if (dialog) {
    const photo = dialog.querySelector('img');
    const caption = dialog.querySelector('figcaption');
    const closer = dialog.querySelector('.lightbox-close');
    document.addEventListener('click', (event) => {
      const button = event.target.closest('[data-lightbox-src]');
      if (!button) return;
      const src = button.getAttribute('data-lightbox-src');
      if (!src) return;
      if (typeof dialog.showModal !== 'function') {
        window.open(src, '_blank', 'noopener');
        return;
      }
      trigger = button;
      photo.src = src;
      photo.alt = button.querySelector('img')?.alt || 'Project detail';
      caption.textContent = button.getAttribute('data-lightbox-caption') || '';
      document.body.classList.add('modal-open');
      dialog.showModal();
      closer.focus();
    });
    const closeDialog = () => { if (dialog.open) dialog.close(); };
    closer.addEventListener('click', closeDialog);
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) closeDialog();
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    });
  }
})();
