/* ==========================================================================
   Creator — dashboard for generating shareable link
   ========================================================================== */
(function(window){
  'use strict';
  const SM = window.SecretMission = window.SecretMission || {};
  const $ = id => document.getElementById(id);

  let bound = false;

  function bindEvents() {
    if (bound) return;
    bound = true;

    $('btn-generate').addEventListener('click', () => {
      const config = SM.cloneConfig(SM.DEFAULT_CONFIG);

      config.defaultName = $('ed-name').value || "Beautiful";
      config.senderName  = $('ed-sender').value || "Secret Admirer";
      config.phone       = $('ed-phone').value || SM.DEFAULT_CONFIG.phone;
      config.email       = $('ed-email').value || SM.DEFAULT_CONFIG.email;

      config.text.introTitle = $('ed-title').value    || SM.DEFAULT_CONFIG.text.introTitle;
      config.text.question   = $('ed-question').value || SM.DEFAULT_CONFIG.text.question;
      config.text.passNote   = $('ed-warning').value  || SM.DEFAULT_CONFIG.text.passNote;

      const encoded = SM.encodeConfig(config);
      const baseUrl = window.location.href.split('?')[0].split('#')[0];
      const finalUrl = `${baseUrl}?d=${encoded}`;

      $('output-link').textContent = finalUrl;
      $('btn-copy').style.display = 'inline-block';
      $('btn-copy').textContent = "Copy Link to Clipboard";
    });

    $('btn-copy').addEventListener('click', () => {
      const text = $('output-link').textContent;
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
        $('btn-copy').textContent = "Copied! ✔";
        setTimeout(() => { $('btn-copy').textContent = "Copy Link to Clipboard"; }, 2000);
      });
    });
  }

  function init(defaults) {
    $('ed-name').value     = defaults.defaultName;
    $('ed-sender').value   = defaults.senderName;
    $('ed-phone').value    = defaults.phone;
    $('ed-email').value    = defaults.email;
    $('ed-title').value    = defaults.text.introTitle;
    $('ed-question').value = defaults.text.question;
    $('ed-warning').value  = defaults.text.passNote;

    bindEvents();
    SM.Player.showScreen('creator');
  }

  SM.Creator = { init };
})(window);