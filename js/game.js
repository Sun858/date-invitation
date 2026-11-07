/* ==========================================================================
   Game — butterfly catch mini-game
   Fast from the very first second, with a subtle ramp-up per catch.
   ========================================================================== */
(function(window){
  'use strict';
  const SM = window.SecretMission = window.SecretMission || {};
  const { haptic } = SM.Utils;

  const FLY_START = 900;   // starting ms per glide
  const FLY_FLOOR = 980;   // fastest ms per glide
  const FLY_STEP  = 450;    // how much faster per catch
  const TOTAL     = 5;

  let flyTimer  = null;
  let flyDelay  = FLY_START;
  let caught    = 0;
  let stageEl   = null;
  let counterEl = null;
  let onComplete = null;
  let onBurst    = null;

  function applyFlySpeed(ms) {
    document.documentElement.style.setProperty('--fly-speed', (ms / 1000) + 's');
  }

  function start(stage, counter, completeCb, burstCb) {
    stageEl    = stage;
    counterEl  = counter;
    onComplete = completeCb;
    onBurst    = burstCb;

    stageEl.textContent = "";
    caught = 0;
    counterEl.textContent = "0 / " + TOTAL;
    clearTimeout(flyTimer);

    flyDelay = FLY_START;
    applyFlySpeed(flyDelay);

    const rnd = (a, b) => a + Math.random() * (b - a);
    const reposition = (b) => {
      b.style.left = rnd(2, 72) + "%";
      b.style.top  = rnd(4, 80) + "%";
    };

    for (let i = 0; i < TOTAL; i++) {
      const b = document.createElement('button');
      b.className = "bfly";
      b.type = "button";
      b.innerHTML = '<svg viewBox="0 0 120 90"><use href="#bf"/></svg>';
      reposition(b);
      stageEl.appendChild(b);

      let done = false;
      const hit = (e) => {
        if (done) return;
        done = true;
        if (e && e.preventDefault) e.preventDefault();
        b.classList.add("caught");
        if (onBurst) onBurst(b);
        haptic(12);
        caught++;
        counterEl.textContent = caught + " / " + TOTAL;

        flyDelay = Math.max(FLY_FLOOR, FLY_START - caught * FLY_STEP);
        applyFlySpeed(flyDelay);

        setTimeout(() => b.remove(), 320);

        if (caught >= TOTAL) {
          clearTimeout(flyTimer);
          haptic([10, 40, 20]);
          setTimeout(() => { if (onComplete) onComplete(); }, 650);
        }
      };
      b.addEventListener("pointerdown", hit);
      b.addEventListener("click", hit);
    }

    // Self-scheduling tick so the interval always tracks the ramp-up speed
    const tick = () => {
      const flies = stageEl.querySelectorAll(".bfly:not(.caught)");
      flies.forEach(reposition);
      flyTimer = setTimeout(tick, flyDelay);
    };
    tick();
  }

  function stop() {
    clearTimeout(flyTimer);
    flyTimer = null;
  }

  SM.Game = { start, stop };
})(window);