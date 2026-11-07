/* ==========================================================================
   Config — defaults + URL (de)serialisation
   ========================================================================== */
(function(window){
  'use strict';
  const SM = window.SecretMission = window.SecretMission || {};

  SM.DEFAULT_CONFIG = {
    phone: "+61450029991",
    email: "sanjaysapkota000@gmail.com",
    defaultName: "Beautiful",
    senderName: "Your Secret Admirer",
    places: "🍝 Fancy dinner, 🎬 Movie night, 🌅 Sunset picnic, ☕ Cosy café, 🔭 Stargazing, ✨ Surprise me",
    times: "12:00 pm, 1:00 pm, 2:00 pm, 4:00 pm, 5:30 pm, 6:30 pm, 7:00 pm, 8:00 pm, 9:00 pm",
    text: {
      introTag: "A little secret, just for you",
      introTitle: "{name}, the universe has been conspiring 🌙",
      introSub: "I made you something. But first — a tiny mission, if you'll indulge me.",
      beginBtn: "Begin the mission 🌹",
      gameHud: "Catch five butterflies to unlock your surprise 🦋",
      askTag: "Surprise unlocked 🌹",
      question: "{name}, would you do me the honour of a date? 🥺",
      questionSub: "I promise good conversation, questionable dance moves, and a very sincere smile.",
      yesBtn: "Yes, absolutely 💖",
      noOops: "Oops — the No button ran away 🏃💨",
      noOopsSub: "Only Yes works now. Must be fate 😌",
      destTitle: "Where shall we escape to? 🚀",
      destSub: "Pick our little adventure, captain.",
      dayTitle: "Which day suits you best? 📅",
      daySub: "Choose a day — I'll move mountains to keep it free.",
      timeTitle: "What time works for you? ⏰",
      timeSub: "I'll be there early, with flowers. Promise.",
      passNote: "Dress code: whatever makes you feel wonderful. Bring cash or card for the date — I built you an entire mission, so it's only fair you look after me now 🥹",
      passFooter: "Even a Paris Peacock butterfly would stop mid-flight just to look at you. Counting down the days. 😘",
      smsText: "I said YES! 💖 It's {name}. Our date: {place}, {day} at {time}. I'll bring my card and my best smile. 😘",
      emailSubject: "Date confirmed 💖 {name}"
    }
  };

  SM.cloneConfig = function(config) {
    return JSON.parse(JSON.stringify(config || SM.DEFAULT_CONFIG));
  };

  SM.parseUrlConfig = function() {
    const encoded = new URLSearchParams(window.location.search).get('d');
    if (!encoded) return null;
    try {
      const decoded = decodeURIComponent(escape(atob(encoded)));
      return JSON.parse(decoded);
    } catch (e) {
      console.error("Could not parse custom data — using defaults.");
      return null;
    }
  };

  SM.encodeConfig = function(config) {
    const json = JSON.stringify(config);
    return btoa(unescape(encodeURIComponent(json)));
  };
})(window);