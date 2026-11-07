/* ==========================================================================
   Utils — small shared helpers
   ========================================================================== */
(function(window){
  'use strict';
  const SM = window.SecretMission = window.SecretMission || {};

  function haptic(pattern) {
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) {}
  }

  function fillText(str, name, extras) {
    extras = extras || {};
    return String(str).replace(/\{(\w+)\}/g, (match, key) => {
      if (key === 'name') return name;
      if (extras[key] !== undefined) return extras[key];
      return match;
    });
  }

  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) { /* fall through to textarea fallback */ }

    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    ta.style.left = '-1000px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, ta.value.length);

    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }

  function flash(btn, msg, ok, duration) {
    if (btn.dataset.original === undefined) btn.dataset.original = btn.textContent;
    btn.textContent = msg;
    btn.classList.toggle('ok', !!ok);
    btn.disabled = true;
    clearTimeout(btn._flashTimer);
    btn._flashTimer = setTimeout(() => {
      btn.textContent = btn.dataset.original;
      btn.classList.remove('ok');
      btn.disabled = false;
    }, duration || 2200);
  }

  SM.Utils = { haptic, fillText, copyToClipboard, flash };
})(window);