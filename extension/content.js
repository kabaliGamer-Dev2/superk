/* content.js — isolated world bridge: injects injected.js, relays results to storage */
(function () {
  const MSG = "PU_PDFS";
  if (window.__puBridge) return;
  window.__puBridge = true;

  function bridgeAlive() {
    try {
      return typeof chrome !== "undefined" && !!chrome.runtime && !!chrome.runtime.id;
    } catch {
      return false;
    }
  }

  let injected = false;
  try {
    if (bridgeAlive()) {
      const s = document.createElement("script");
      s.src = chrome.runtime.getURL("injected.js");
      s.onload = () => s.remove();
      (document.head || document.documentElement).appendChild(s);
      injected = true;
    }
  } catch { /* dead on arrival — popup will flag the stale tab */ }

  window.addEventListener("message", (ev) => {
    try {
      if (!injected || !bridgeAlive()) return;
      if (ev.source !== window) return;
    const d = ev.data;
    if (!d || d.type !== MSG) return;
    if (d.status === "done") {
      try {
        chrome.storage.local.set({
          pu_bridge: "2.1.0",
          pu_v: d.v || null,
          pu_classroomId: d.classroomId || null,
          pu_current: d.currentSubject || null,
          pu_items: d.items || [],
          pu_fallback: !!d.fallback,
          pu_noAuth: !!d.noAuth,
          pu_error: d.error || null,
          pu_scannedAt: Date.now()
        }).catch(() => {});
      } catch { /* invalidated context — popup will flag the stale tab */ }
      try {
        chrome.runtime.sendMessage({ type: "PU_DONE", count: (d.items || []).length }).catch(() => {});
      } catch { /* noop */ }
      }
    } catch { /* dead bridge mid-flight — popup flags the stale tab */ }
  });

  if (bridgeAlive()) {
  chrome.runtime.onMessage.addListener((msg, _s, send) => {
    try {
    if (msg && msg.type === "PU_RESCAN") {
      window.postMessage({ type: "PU_SCAN" }, "*");
      send({ ok: true });
      return true;
    }
    if (msg && msg.type === "PU_GET") {
      chrome.storage.local.get(
        ["pu_v", "pu_items", "pu_classroomId", "pu_current", "pu_fallback", "pu_noAuth", "pu_error", "pu_scannedAt"],
        (v) => { try { send(v); } catch { /* noop */ } }
      );
      return true;
    }
    } catch { /* invalidated mid-call — popup flags the stale tab */ }
  });
  }
})();
