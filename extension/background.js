/* background.js — MV3 service worker: per-file downloads + one-zip download.
   ZIP generation runs in the offscreen document (offscreen.js), where Blob
   URLs exist; this file only routes PU_DOWNLOAD_ZIP jobs there and relays
   progress. The old in-SW zip is kept as a last-resort fallback for browsers
   where the offscreen API is unavailable. */
importScripts("lib/jszip.min.js");

/* Uninstall feedback: if a student removes SuperK, ask why on the site form. */
try {
  if (chrome.runtime && chrome.runtime.setUninstallURL) {
    chrome.runtime.setUninstallURL("https://superk-official.web.app/feedback.html?from=uninstall");
  }
} catch { /* older Chromium — non-fatal */ }

function sanitize(s) {
  return String(s || "file").replace(/[\\/:*?"<>|#%&{}$!'@+=`~]/g, "").replace(/\s+/g, " ").trim().slice(0, 80) || "file";
}

const ZIP_CAP = 150 * 1024 * 1024; // refuse to buffer more than this into RAM
const FILE_TIMEOUT = 90000; // one slow file must not hang the whole zip
const OFFSCREEN_TIMEOUT = 10 * 60 * 1000; // a whole zip job must finish inside this
const OFFSCREEN_DELIVERY_RETRIES = 8; // offscreen script may still be loading
const OFFSCREEN_DELIVERY_DELAY = 500;

/* ---------- shared fetch helpers (used by the legacy in-SW fallback) ---------- */

async function headSize(url) {
  try {
    const r = await fetch(url, { method: "HEAD" });
    const n = parseInt(r.headers.get("content-length") || "0", 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

async function fetchBuf(url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), FILE_TIMEOUT);
  try {
    const r = await fetch(url, { signal: ctl.signal });
    if (!r.ok) {
      const e = new Error("HTTP " + r.status);
      e.status = r.status;
      throw e;
    }
    return await r.arrayBuffer();
  } finally {
    clearTimeout(t);
  }
}

/* ---------- offscreen zip plumbing ---------- */

let zipSeq = 0;
const pendingZips = new Map(); // jobId -> { resolve }
let currentZipJobId = null;    // track active job so cancel can target it

async function ensureOffscreen() {
  if (!chrome.offscreen || typeof chrome.offscreen.createDocument !== "function") {
    throw new Error("offscreen API unavailable in this browser");
  }
  try {
    if (typeof chrome.offscreen.hasDocument === "function") {
      if (await chrome.offscreen.hasDocument()) return;
    }
  } catch {
    /* hasDocument missing/broken — fall through to createDocument */
  }
  try {
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["BLOBS"],
      justification: "Generate subject ZIP archives in memory"
    });
  } catch (e) {
    const m = String((e && e.message) || e);
    if (!/already|exists|only one|single/i.test(m)) throw e;
    /* document already exists — reuse it */
  }
}

async function deliverZipStart(payload) {
  let lastErr = null;
  for (let i = 0; i < OFFSCREEN_DELIVERY_RETRIES; i++) {
    try {
      await chrome.runtime.sendMessage(payload);
      return;
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, OFFSCREEN_DELIVERY_DELAY));
    }
  }
  throw lastErr || new Error("offscreen unreachable");
}

function runOffscreenZip(jobId, items, subject, knownSizes) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pendingZips.delete(jobId);
      currentZipJobId = null;
      reject(new Error("offscreen zip timed out"));
    }, OFFSCREEN_TIMEOUT);
    pendingZips.set(jobId, {
      resolve: (v) => { clearTimeout(timer); pendingZips.delete(jobId); currentZipJobId = null; resolve(v); }
    });
    deliverZipStart({ type: "PU_ZIP_START", jobId, items, subject, knownSizes }).catch((e) => {
      clearTimeout(timer);
      pendingZips.delete(jobId);
      currentZipJobId = null;
      reject(e);
    });
  });
}

/* Legacy in-service-worker zip: last resort when the offscreen document cannot
   be created. Works even where Blob URLs don't exist (base64 data-URL path). */
async function legacyZipInSW(items, subjectRaw, prog, done) {
  try {
    const canBlob = (typeof URL !== "undefined" && typeof URL.createObjectURL === "function");
    const subject = sanitize(subjectRaw || "Subject").slice(0, 60) || "Subject";
    if (typeof JSZip === "undefined") {
      done({ ok: false, reason: "lib", error: "zip library failed to load inside the extension" });
      return;
    }
    // 1. estimate total so a huge subject can't OOM the worker
    let total = 0, unknown = 0;
    for (const it of items) {
      const n = await headSize(it.url);
      if (n > 0) total += n; else unknown++;
    }
    if (total > ZIP_CAP) {
      done({ ok: false, reason: "too-big", total });
      return;
    }
    // 2. fetch every file (90s cap each, failures counted not thrown)
    const zip = new JSZip();
    let ok = 0, fail = 0, denied = 0;
    let lastErr = "";
    const seen = {};
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      try {
        const buf = await fetchBuf(it.url);
        let name = sanitize(it.display || it.title) + ".pdf";
        if (seen[name]) { seen[name] += 1; name = name.replace(/\.pdf$/, ` ${seen[name]}.pdf`); }
        else seen[name] = 1;
        zip.file(`${sanitize(it.topic)}/${name}`, buf);
        ok++;
      } catch (e) {
        fail++;
        lastErr = String((e && e.message) || e).slice(0, 120);
        if (e && (e.status === 403 || e.status === 404)) denied++;
      }
      prog("fetch", ok + fail, items.length, ok, fail);
    }
    if (!ok) {
      done({ ok: false, reason: denied === fail && fail > 0 ? "expired" : "all-failed", fail, error: lastErr });
      return;
    }
    // 3+4. build + save. Two roads: blob URL where available, else base64
    // straight to a data URL (needs no Blob API at all).
    if (!canBlob) {
      try {
        const b64 = await zip.generateAsync({ type: "base64", compression: "STORE" }, (meta) => {
          prog("zip", Math.round(meta.percent), 100, ok, fail);
        });
        await chrome.downloads.download({ url: "data:application/zip;base64," + b64, filename: `Parul/${subject}.zip`, saveAs: false, conflictAction: "uniquify" });
      } catch (e) {
        done({ ok: false, reason: "save", error: String((e && e.message) || e).slice(0, 160) });
        return;
      }
      prog("done", items.length, items.length, ok, fail);
      done({ ok: true, zipped: ok, failed: fail });
      return;
    }
    // 3. compress
    prog("zip", 0, 1, ok, fail);
    let blob;
    try {
      blob = await zip.generateAsync({ type: "blob", compression: "STORE" }, (meta) => {
        prog("zip", Math.round(meta.percent), 100, ok, fail);
      });
    } catch (e) {
      done({ ok: false, reason: "generate", error: String((e && e.message) || e).slice(0, 160) });
      return;
    }
    // 4. save one zip (blob URL, with data-URL fallback for small zips)
    try {
      const url = URL.createObjectURL(blob);
      try {
        await chrome.downloads.download({ url, filename: `Parul/${subject}.zip`, saveAs: false, conflictAction: "uniquify" });
      } catch (e) {
        if (blob.size < 10 * 1024 * 1024) {
          const buf = await blob.arrayBuffer();
          let bin = "";
          const bytes = new Uint8Array(buf);
          for (let i = 0; i < bytes.length; i += 0x8000) {
            bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
          }
          const dataUrl = "data:application/zip;base64," + btoa(bin);
          await chrome.downloads.download({ url: dataUrl, filename: `Parul/${subject}.zip`, saveAs: false, conflictAction: "uniquify" });
        } else {
          throw e;
        }
      }
      setTimeout(() => URL.revokeObjectURL(url), 60 * 1000);
    } catch (e) {
      done({ ok: false, reason: "save", error: String((e && e.message) || e).slice(0, 160) });
      return;
    }
    prog("done", items.length, items.length, ok, fail);
    done({ ok: true, zipped: ok, failed: fail });
  } catch (e) {
    done({ ok: false, reason: "error", error: String((e && e.message) || e).slice(0, 200) });
  }
}

chrome.runtime.onMessage.addListener((msg, _sender, send) => {
  if (!msg) return;
  // completion posted by the offscreen document — resolve the awaiting router
  if (msg.type === "PU_ZIP_DONE" && msg.jobId && pendingZips.has(msg.jobId)) {
    const entry = pendingZips.get(msg.jobId);
    const { type, jobId, ...rest } = msg;
    void type;
    void jobId;
    entry.resolve(rest);
    return;
  }
  // progress posted by the offscreen document — relay to popup listeners
  // (its broadcast already reaches the popup; re-send as belt-and-braces and
  // to keep the service worker awake for the rest of the job)
  if (msg.type === "PU_ZIP_PROGRESS" && msg.jobId && pendingZips.has(msg.jobId)) {
    chrome.runtime.sendMessage({
      type: "PU_ZIP_PROGRESS", phase: msg.phase, done: msg.done,
      total: msg.total, ok: msg.ok, fail: msg.fail
    }).catch(() => {});
    return;
  }
  // Cancel: forward to the offscreen document with the current job ID
  if (msg.type === "PU_ZIP_CANCEL") {
    if (currentZipJobId) {
      chrome.runtime.sendMessage({ type: "PU_ZIP_CANCEL", jobId: currentZipJobId }).catch(() => {});
    }
    return;
  }
  if (msg.type === "PU_DOWNLOAD_MANY") {
    (async () => {
      const items = msg.items || [];
      let ok = 0, fail = 0;
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const filename = `Parul/${sanitize(it.subject)}_${sanitize(it.topic)}_${sanitize(it.display || it.title)}.pdf`.slice(0, 200);
        try {
          await chrome.downloads.download({ url: it.url, filename, saveAs: false, conflictAction: "uniquify" });
          ok++;
        } catch {
          fail++;
        }
        chrome.runtime.sendMessage({ type: "PU_PROGRESS", done: ok + fail, total: items.length, ok, fail }).catch(() => {});
        // small delay to avoid rate-limit / disk burst
        await new Promise((r) => setTimeout(r, 350));
      }
      send({ ok, fail });
    })();
    return true;
  }
  if (msg.type === "PU_DOWNLOAD_ZIP") {
    (async () => {
      // keep-alive: the job outlives the SW idle timeout otherwise; every
      // relayed progress message also wakes the worker
      const tick = setInterval(() => {
        try { chrome.storage.local.get("pu_scannedAt").catch(() => {}); } catch { /* noop */ }
      }, 20000);
      const done = (v) => { clearInterval(tick); send(v); };
      const items = msg.items || [];
      const prog = (phase, doneN, total, ok, fail) =>
        chrome.runtime.sendMessage({ type: "PU_ZIP_PROGRESS", phase, done: doneN, total, ok, fail }).catch(() => {});
      const jobId = "zip-" + Date.now() + "-" + (++zipSeq);
      try {
        await ensureOffscreen();
      } catch (e) {
        // offscreen unsupported — last-resort legacy path (may itself report "save")
        legacyZipInSW(items, msg.subject, prog, done);
        return;
      }
      currentZipJobId = jobId;
      try {
        const res = await runOffscreenZip(jobId, items, msg.subject, msg.knownSizes);
        done(res);
      } catch (e) {
        // delivery/timeout failure — last-resort legacy path
        legacyZipInSW(items, msg.subject, prog, done);
      }
    })();
    return true;
  }
});
