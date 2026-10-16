/* offscreen.js — runs inside the offscreen document (a real DOM page), where
   Blob URLs work. Owns the whole ZIP pipeline: size-cap check, fetch loop,
   JSZip build, save via chrome.downloads. Mirrors the old in-SW logic exactly
   (same sanitize, folder layout, duplicate numbering, progress/response shapes)
   so popup.js needs zero changes. */

function sanitize(s) {
  return String(s || "file").replace(/[\\/:*?"<>|#%&{}$!'@+=`~]/g, "").replace(/\s+/g, " ").trim().slice(0, 80) || "file";
}

const ZIP_CAP = 150 * 1024 * 1024; // refuse to buffer more than this into RAM
const FILE_TIMEOUT = 90000; // one slow file must not hang the whole zip

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

chrome.runtime.onMessage.addListener((msg) => {
  if (!msg || msg.type !== "PU_ZIP_START") return;
  void handleZipJob(msg);
});

async function handleZipJob(msg) {
  const jobId = msg.jobId;
  const items = msg.items || [];
  const subject = sanitize(msg.subject || "Subject").slice(0, 60) || "Subject";
  const prog = (phase, doneN, total, ok, fail) =>
    chrome.runtime.sendMessage({ type: "PU_ZIP_PROGRESS", jobId, phase, done: doneN, total, ok, fail }).catch(() => {});
  const finish = (payload) =>
    chrome.runtime.sendMessage(Object.assign({ type: "PU_ZIP_DONE", jobId }, payload)).catch(() => {});
  try {
    if (typeof JSZip === "undefined") {
      finish({ ok: false, reason: "lib", error: "zip library failed to load inside the extension" });
      return;
    }
    // 1. estimate total so a huge subject can't OOM the page
    let total = 0, unknown = 0;
    for (const it of items) {
      const n = await headSize(it.url);
      if (n > 0) total += n; else unknown++;
    }
    if (total > ZIP_CAP) {
      finish({ ok: false, reason: "too-big", total });
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
      finish({ ok: false, reason: denied === fail && fail > 0 ? "expired" : "all-failed", fail, error: lastErr });
      return;
    }
    // 3+4. build + save. Blob URL where available, else base64 data URL
    // (needs no Blob API at all — covers old browsers end to end).
    const canBlob = (typeof URL !== "undefined" && typeof URL.createObjectURL === "function");
    if (!canBlob) {
      try {
        const b64 = await zip.generateAsync({ type: "base64", compression: "STORE" }, (meta) => {
          prog("zip", Math.round(meta.percent), 100, ok, fail);
        });
        await chrome.downloads.download({ url: "data:application/zip;base64," + b64, filename: `Parul/${subject}.zip`, saveAs: false, conflictAction: "uniquify" });
      } catch (e) {
        finish({ ok: false, reason: "save", error: String((e && e.message) || e).slice(0, 160) });
        return;
      }
      prog("done", items.length, items.length, ok, fail);
      finish({ ok: true, zipped: ok, failed: fail });
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
      finish({ ok: false, reason: "generate", error: String((e && e.message) || e).slice(0, 160) });
      return;
    }
    // 4. save one zip (blob URL created HERE in the document, where it exists;
    //    with data-URL fallback for small zips)
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
      finish({ ok: false, reason: "save", error: String((e && e.message) || e).slice(0, 160) });
      return;
    }
    prog("done", items.length, items.length, ok, fail);
    finish({ ok: true, zipped: ok, failed: fail });
  } catch (e) {
    finish({ ok: false, reason: "error", error: String((e && e.message) || e).slice(0, 200) });
  }
}
