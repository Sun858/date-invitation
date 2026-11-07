/* ==========================================================================
   Main — router / bootstrap
   ========================================================================== */
(function(window){
  'use strict';
  const SM = window.SecretMission;

  document.addEventListener('DOMContentLoaded', () => {
    const urlConfig = SM.parseUrlConfig();
    const config    = urlConfig || SM.cloneConfig(SM.DEFAULT_CONFIG);

    if (window.location.hash === '#creator') {
      SM.Creator.init(config);
    } else {
      SM.Player.init(config);
    }
  });
})(window);