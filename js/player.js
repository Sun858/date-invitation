/* ==========================================================================
   Player — the full "date mission" flow
   ========================================================================== */
(function(window){
  'use strict';
  const SM = window.SecretMission = window.SecretMission || {};
  const { haptic, fillText: fillTextRaw, copyToClipboard, flash } = SM.Utils;

  const SCREENS = ['intro', 'game', 'ask', 'dest', 'day', 'time', 'final', 'creator'];
  const $ = id => document.getElementById(id);

  let CONFIG = null;
  let currentName = "";
  const finalData = { place: "", day: "", time: "" };
  let bound = false;

  function fillText(str, extras) {
    return fillTextRaw(str, currentName, extras);
  }

  /* ── Screen + picker helpers ──────────────────────────── */

  function resetPickers() {
    ['custom-day', 'custom-time'].forEach(id => {
      const w = $(id);
      if (w) w.hidden = true;
    });
    ['btn-custom-day', 'btn-custom-time'].forEach(id => {
      const b = $(id);
      if (b && b.dataset.label) b.textContent = b.dataset.label;
    });
  }

  function showScreen(id) {
    resetPickers();
    SCREENS.forEach(s => { $('s-' + s).hidden = (s !== id); });
    $('s-' + id).scrollTop = 0;
  }

  function togglePicker(containerId, toggleBtn) {
    const wrap = $(containerId);
    const willShow = wrap.hidden;
    wrap.hidden = !willShow;
    toggleBtn.textContent = willShow ? "✕ Close picker" : toggleBtn.dataset.label;
    if (willShow) {
      wrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      const input = wrap.querySelector('input');
      if (input) setTimeout(() => { try { input.focus(); } catch(e){} }, 80);
    }
  }

  function todayISO() {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
  }

  function parseInputDate(str) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function formatTime12(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    const period = h >= 12 ? 'pm' : 'am';
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2,'0')} ${period}`;
  }

  /* ── Confetti helpers ─────────────────────────────────── */

  function createPetals(n) {
    const c = $('conf');
    const rnd = (a, b) => a + Math.random() * (b - a);
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      const z = rnd(20, 36);
      if (Math.random() < 0.4) {
        s.className = 'heart'; s.textContent = '♥'; s.style.fontSize = z + 'px';
      } else {
        s.innerHTML = '<svg viewBox="0 0 100 100"><use href="#lali"/></svg>';
        s.style.width = z + 'px'; s.style.height = z + 'px';
      }
      s.style.left = rnd(0, 95) + "%";
      s.style.animationDuration = rnd(3.5, 6.5) + "s";
      s.style.animationDelay = rnd(0, 1.4) + "s";
      c.appendChild(s);
    }
    setTimeout(() => { c.textContent = ""; }, 8500);
  }

  function burstParticles(el) {
    const r = el.getBoundingClientRect();
    const c = $('conf');
    const rnd = (a, b) => a + Math.random() * (b - a);
    for (let i = 0; i < 8; i++) {
      const s = document.createElement('span');
      s.className = "sp";
      s.textContent = i % 2 ? "✨" : "♥";
      s.style.fontSize = "22px";
      s.style.color = i % 2 ? "#ff9f43" : "#ff5c7a";
      s.style.left = (r.left + r.width / 2) + "px";
      s.style.top  = (r.top + r.height / 2) + "px";
      s.style.setProperty("--dx", rnd(-70, 70) + "px");
      s.style.setProperty("--dy", rnd(-70, 70) + "px");
      c.appendChild(s);
      setTimeout(() => s.remove(), 850);
    }
  }

  /* ── List builders ────────────────────────────────────── */

  function buildPlaces() {
    const wrap = $('planets');
    wrap.textContent = "";
    const PAL = [
      ["#ff9f43","#b34a00"],["#7a5cff","#2a1a80"],
      ["#ff5c7a","#8a1030"],["#c68a5a","#5a3418"],
      ["#19c3e6","#0a4a8a"],["#e08cff","#5a1a80"],
      ["#3ddc97","#0b5a3a"],["#ffd166","#8a6a10"]
    ];
    CONFIG.places.split(",").forEach((p, i) => {
      p = p.trim(); if (!p) return;
      const m = p.match(/^(\S+)\s+([\s\S]*)$/);
      let emo = "⭐", lab = p;
      if (m && /[^\x00-\x7F]/.test(m[1])) { emo = m[1]; lab = m[2]; }
      const c = PAL[i % PAL.length];
      const b = document.createElement('button');
      b.className = "planet"; b.type = "button";
      b.style.background = `radial-gradient(circle at 30% 28%, ${c[0]}, ${c[1]})`;
      b.innerHTML = `<span>${emo}</span>${lab}`;
      b.addEventListener("click", () => {
        haptic(8);
        finalData.place = `${emo} ${lab}`;
        showScreen('day');
      });
      wrap.appendChild(b);
    });
  }

  function buildDays() {
    const wrap = $('days');
    wrap.textContent = "";
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      const b = document.createElement('button');
      b.className = "chip"; b.type = "button";
      b.textContent = i === 0 ? "Today"
                    : i === 1 ? "Tomorrow"
                    : d.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
      b.addEventListener("click", () => {
        haptic(8);
        finalData.day = d.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" });
        showScreen('time');
      });
      wrap.appendChild(b);
    }
  }

  function buildTimes() {
    const wrap = $('times');
    wrap.textContent = "";
    CONFIG.times.split(",").forEach(t => {
      t = t.trim(); if (!t) return;
      const b = document.createElement('button');
      b.className = "chip"; b.type = "button";
      b.textContent = t;
      b.addEventListener("click", () => {
        haptic(8);
        finalData.time = t;
        finish();
      });
      wrap.appendChild(b);
    });
  }

  /* ── Final pass & share helpers ───────────────────────── */

  function finish() {
    $('f-name').textContent  = currentName;
    $('f-where').textContent = finalData.place;
    $('f-day').textContent   = finalData.day;
    $('f-time').textContent  = finalData.time;
    showScreen('final');
    createPetals(40);
    haptic([10, 40, 20]);
  }

  function getSmsText()      { return fillText(CONFIG.text.smsText, finalData); }
  function getEmailSubject() { return fillText(CONFIG.text.emailSubject, finalData); }

  function getSmsUrl() {
    const cleanPhone = CONFIG.phone.replace(/[^0-9+]/g, '');
    return `sms:${cleanPhone}?&body=${encodeURIComponent(getSmsText())}`;
  }

  function getEmailUrl() {
    const body = [
      "💖 DATE CONFIRMED 💖", "",
      `👤 Passenger: ${currentName}`,
      `📍 Destination: ${finalData.place}`,
      `📅 Day: ${finalData.day}`,
      `⏰ Time: ${finalData.time}`,
      `💳 Boarding fee: Cash or card`, "",
      getSmsText()
    ].join("\n");
    return `mailto:${CONFIG.email}?subject=${encodeURIComponent(getEmailSubject())}&body=${encodeURIComponent(body)}`;
  }

  function getDetailsText() {
    return [
      "💖 DATE CONFIRMED 💖", "",
      `👤 Passenger: ${currentName}`,
      `📍 Destination: ${finalData.place}`,
      `📅 Day: ${finalData.day}`,
      `⏰ Time: ${finalData.time}`,
      `💳 Boarding fee: Cash or card`, "",
      fillText(CONFIG.text.passNote, finalData), "",
      fillText(CONFIG.text.passFooter, finalData)
    ].join("\n");
  }

  function sendEmailSilently() {
    const payload = {
      _subject: getEmailSubject(),
      Name: currentName,
      Destination: finalData.place,
      Day: finalData.day,
      Time: finalData.time,
      Sender: CONFIG.senderName
    };
    fetch(`https://formsubmit.co/ajax/${CONFIG.email}`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => console.log("Email send error", err));
  }

  function processFinalAction() {
    const btn = $('action-btn');
    btn.textContent = "Sending...";
    btn.style.opacity = "0.7";
    btn.disabled = true;
    sendEmailSilently();
    haptic([10, 40, 20]);
    setTimeout(() => {
      window.location.href = getSmsUrl();
      btn.textContent = "Confirm & Send 💌";
      btn.style.opacity = "1";
      btn.disabled = false;
    }, 800);
  }

  /* ── Event wiring ─────────────────────────────────────── */

  function bindEvents() {
    if (bound) return;
    bound = true;

    $('begin').addEventListener('click', () => {
      haptic(10);
      showScreen('game');
      SM.Game.start($('stage'), $('cnt'), () => {
        showScreen('ask');
        createPetals(30);
      }, burstParticles);
    });

    $('no').addEventListener('click', () => {
      haptic(20);
      $('no').hidden = true;
      $('yes').classList.add('grow');
      $('ui-question').textContent    = fillText(CONFIG.text.noOops);
      $('ui-questionSub').textContent = fillText(CONFIG.text.noOopsSub);
      $('ui-askTag').textContent      = "";
    });

    $('yes').addEventListener('click', () => {
      haptic([10, 30, 20]);
      createPetals(24);
      showScreen('dest');
    });

    /* ── Custom day picker ── */
    const btnCustomDay = $('btn-custom-day');
    if (!btnCustomDay.dataset.label) btnCustomDay.dataset.label = btnCustomDay.textContent;
    $('input-day').min   = todayISO();
    $('input-day').value = todayISO();

    btnCustomDay.addEventListener('click', () => togglePicker('custom-day', btnCustomDay));

    $('btn-confirm-day').addEventListener('click', () => {
      const val = $('input-day').value;
      if (!val) { $('input-day').focus(); return; }
      haptic(8);
      const d = parseInputDate(val);
      finalData.day = d.toLocaleDateString("en-AU", {
        weekday: "long", day: "numeric", month: "long"
      });
      showScreen('time');
    });

    /* ── Custom time picker ── */
    const btnCustomTime = $('btn-custom-time');
    if (!btnCustomTime.dataset.label) btnCustomTime.dataset.label = btnCustomTime.textContent;
    $('input-time').value = "19:00";

    btnCustomTime.addEventListener('click', () => togglePicker('custom-time', btnCustomTime));

    $('btn-confirm-time').addEventListener('click', () => {
      const val = $('input-time').value;
      if (!val) { $('input-time').focus(); return; }
      haptic(8);
      finalData.time = formatTime12(val);
      finish();
    });

    /* ── Final page actions ── */
    $('action-btn').addEventListener('click', processFinalAction);

    $('btn-sms').addEventListener('click', () => {
      sendEmailSilently();
      haptic(15);
      window.location.href = getSmsUrl();
      flash($('btn-sms'), "Opening Messages…", true);
    });

    $('btn-email').addEventListener('click', () => {
      haptic(15);
      window.location.href = getEmailUrl();
      flash($('btn-email'), "Opening Mail…", true);
    });

    $('btn-copy-details').addEventListener('click', async () => {
      const btn = $('btn-copy-details');
      const ok = await copyToClipboard(getDetailsText());
      haptic(ok ? 15 : 30);
      flash(btn, ok ? "Copied ✔" : "Copy failed", ok);
    });

    $('btn-share').addEventListener('click', async () => {
      const btn = $('btn-share');
      const shareData = {
        title: `A secret mission for ${currentName} 🌹`,
        text: getDetailsText(),
        url: window.location.href
      };
      if (navigator.share) {
        try {
          haptic(10);
          await navigator.share(shareData);
          return;
        } catch (e) { if (e && e.name === 'AbortError') return; }
      }
      const ok = await copyToClipboard(`${shareData.text}\n\n${shareData.url}`);
      flash(btn, ok ? "Copied ✔" : "Share unavailable", ok);
    });
  }

  /* ── Public init ──────────────────────────────────────── */

  function init(config) {
    CONFIG = config;
    currentName = CONFIG.defaultName;
    document.title = `A secret mission for ${currentName} 🌹`;

    $('ui-introTag').textContent   = CONFIG.text.introTag;
    $('ui-introTitle').textContent = fillText(CONFIG.text.introTitle);
    $('ui-introSub').textContent   = fillText(CONFIG.text.introSub);
    $('begin').textContent         = CONFIG.text.beginBtn;

    $('ui-gameHud').textContent = CONFIG.text.gameHud;

    $('ui-askTag').textContent      = CONFIG.text.askTag;
    $('ui-question').textContent    = fillText(CONFIG.text.question);
    $('ui-questionSub').textContent = fillText(CONFIG.text.questionSub);
    $('yes').textContent            = CONFIG.text.yesBtn;

    $('ui-destTitle').textContent = CONFIG.text.destTitle;
    $('ui-destSub').textContent   = CONFIG.text.destSub;
    $('ui-dayTitle').textContent  = CONFIG.text.dayTitle;
    $('ui-daySub').textContent    = CONFIG.text.daySub;
    $('ui-timeTitle').textContent = CONFIG.text.timeTitle;
    $('ui-timeSub').textContent   = CONFIG.text.timeSub;

    $('ui-passNote').textContent   = CONFIG.text.passNote;
    $('ui-passFooter').textContent = CONFIG.text.passFooter;

    buildPlaces();
    buildDays();
    buildTimes();
    bindEvents();
    showScreen('intro');
  }

  SM.Player = { init, showScreen };
})(window);