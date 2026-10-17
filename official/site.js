/* SuperK official site — shared behavior.
   1) Scroll reveal: one-shot fade-up via IntersectionObserver. Never scroll-linked —
      an element is either hidden (not yet reached) or fully visible (once revealed).
      If JS is disabled the CSS never hides anything; if this file fails to load, the
      inline head script un-hides everything after 2.5s (data-reveal-ready handshake).
   2) Download gate: fullscreen layout (terms + Instagram) before any ZIP download. */
(function () {
  "use strict";

  var docEl = document.documentElement;

  /* ---------- 1. scroll reveal ---------- */
  var reveals = [].slice.call(document.querySelectorAll(".reveal"));
  function showAll() {
    for (var i = 0; i < reveals.length; i++) reveals[i].classList.add("is-visible");
  }
  try {
    if (!("IntersectionObserver" in window) || !reveals.length) {
      showAll();
    } else {
      var io = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            entries[i].target.classList.add("is-visible");
            io.unobserve(entries[i].target);
          }
        }
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0 });
      for (var j = 0; j < reveals.length; j++) io.observe(reveals[j]);
    }
  } catch (err) {
    showAll();
  }
  docEl.setAttribute("data-reveal-ready", "");

  /* ---------- 2. download gate ---------- */
  var ZIP_HREF = "releases/superk-1.0.0.zip";
  var ZIP_NAME = "superk-1.0.0.zip";
  var IG_URL = "https://www.instagram.com/kabali.gamer/";
  var K_TERMS = "superk.gate.terms.v1";
  var K_IG = "superk.gate.instagram.v1";

  function readKey(k) {
    try { return window.localStorage.getItem(k); } catch (e) { return null; }
  }
  function writeKey(k, on) {
    try { if (on) window.localStorage.setItem(k, "1"); else window.localStorage.removeItem(k); } catch (e) {}
  }

  var IC_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 13 4 4L19 7" /></svg>';
  var IC_IG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" /></svg>';
  var IC_DL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11" /><path d="m7 11 5 5 5-5" /><path d="M4 20h16" /></svg>';
  var IC_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12" /><path d="M18 6 6 18" /></svg>';

  var gate = document.createElement("div");
  gate.className = "gate";
  gate.id = "skGate";
  gate.hidden = true;
  gate.setAttribute("role", "dialog");
  gate.setAttribute("aria-modal", "true");
  gate.setAttribute("aria-labelledby", "skGateTitle");
  gate.innerHTML =
    '<div class="gate-top">' +
      '<span class="gate-brand"><img src="assets/logo.svg" alt="" aria-hidden="true" /><b>SuperK</b></span>' +
      '<button class="gate-x" id="skGateX" type="button" aria-label="Close and cancel download">' + IC_X + "</button>" +
    "</div>" +
    '<div class="gate-body">' +
      '<p class="eyebrow">Before you download</p>' +
      '<h2 id="skGateTitle" tabindex="-1">Two quick steps. Then it\u2019s yours.</h2>' +
      '<p class="gate-sub">No account, no email \u2014 just a quick agreement and a follow. Both steps unlock the ZIP button below.</p>' +
      '<div class="gate-step" id="skStepTerms">' +
        '<span class="gate-n" aria-hidden="true"><span class="n-num">1</span><span class="n-ok">' + IC_CHECK + "</span></span>" +
        "<div>" +
          "<h3>Accept the terms</h3>" +
          '<label class="fb-check"><input type="checkbox" id="skGateTerms" /><span>I have read and agree to the <a href="terms.html" target="_blank" rel="noopener">Terms &amp; Conditions</a> and the <a href="privacy.html" target="_blank" rel="noopener">Privacy Policy</a>.</span></label>' +
        "</div>" +
      "</div>" +
      '<div class="gate-step" id="skStepIg">' +
        '<span class="gate-n" aria-hidden="true"><span class="n-num">2</span><span class="n-ok">' + IC_CHECK + "</span></span>" +
        "<div>" +
          '<h3>Follow <span class="gate-handle">@kabali.gamer</span> on Instagram</h3>' +
          '<p class="gate-hint" id="skIgHint">Opens Instagram in a new tab and marks this step done \u2014 follow, then come back for your ZIP.</p>' +
          '<div class="gate-ig-row">' +
            '<a class="btn btn-paper btn-sm gate-follow" id="skGateFollow" href="' + IG_URL + '" target="_blank" rel="noopener">' + IC_IG + "Follow on Instagram</a>" +
            '<span class="gate-done-pill" id="skIgDone">' + IC_CHECK + "Followed</span>" +
          "</div>" +
        "</div>" +
      "</div>" +
      '<button class="btn btn-ink gate-dl" id="skGateDl" type="button" aria-disabled="true">' + IC_DL + "<span>Download " + ZIP_NAME + "</span></button>" +
      '<p class="gate-lock" id="skGateLock" aria-live="polite">Both steps unlock the download button.</p>' +
    "</div>";
  document.body.appendChild(gate);

  var xBtn = gate.querySelector("#skGateX");
  var title = gate.querySelector("#skGateTitle");
  var stepTerms = gate.querySelector("#skStepTerms");
  var stepIg = gate.querySelector("#skStepIg");
  var termsBox = gate.querySelector("#skGateTerms");
  var followBtn = gate.querySelector("#skGateFollow");
  var igHint = gate.querySelector("#skIgHint");
  var dlBtn = gate.querySelector("#skGateDl");
  var lockLine = gate.querySelector("#skGateLock");
  var igHintDone = "Thanks \u2014 you can reopen Instagram from this step anytime.";
  var lastFocus = null;
  var passing = false;

  function unlockedNow() { return termsBox.checked && stepIg.classList.contains("done"); }
  function refresh() {
    stepTerms.classList.toggle("done", termsBox.checked);
    var open = unlockedNow();
    dlBtn.classList.toggle("unlocked", open);
    dlBtn.setAttribute("aria-disabled", open ? "false" : "true");
    lockLine.textContent = open ? "You\u2019re all set \u2014 grab the ZIP." : "Both steps unlock the download button.";
  }
  function openGate() {
    lastFocus = document.activeElement;
    gate.hidden = false;
    docEl.classList.add("gate-lock");
    var nav = document.querySelector(".links.open");
    if (nav) nav.classList.remove("open");
    refresh();
    title.focus();
  }
  function closeGate() {
    gate.hidden = true;
    docEl.classList.remove("gate-lock");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function startDownload() {
    passing = true;
    var a = document.createElement("a");
    a.href = ZIP_HREF;
    a.download = ZIP_NAME;
    document.body.appendChild(a);
    a.click();
    a.remove();
    passing = false;
    closeGate();
  }

  /* restore remembered progress (per browser, localStorage) */
  if (readKey(K_TERMS)) termsBox.checked = true;
  if (readKey(K_IG)) {
    stepIg.classList.add("done");
    igHint.textContent = igHintDone;
  }
  refresh();

  termsBox.addEventListener("change", function () {
    writeKey(K_TERMS, termsBox.checked);
    refresh();
  });
  followBtn.addEventListener("click", function () {
    writeKey(K_IG, true);
    stepIg.classList.add("done");
    igHint.textContent = igHintDone;
    refresh();
  });
  xBtn.addEventListener("click", closeGate);
  dlBtn.addEventListener("click", function () {
    if (!unlockedNow()) {
      if (!termsBox.checked) termsBox.focus();
      else followBtn.focus();
      return;
    }
    startDownload();
  });
  document.addEventListener("click", function (e) {
    if (passing || !e.target || !e.target.closest) return;
    var link = e.target.closest('a[href*="' + ZIP_HREF + '"]');
    if (!link) return;
    e.preventDefault();
    openGate();
  });
  document.addEventListener("keydown", function (e) {
    if (gate.hidden) return;
    if (e.key === "Escape") { closeGate(); return; }
    if (e.key !== "Tab") return;
    var focusables = gate.querySelectorAll("a[href], button:not([disabled]), input:not([disabled])");
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === title)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
})();
