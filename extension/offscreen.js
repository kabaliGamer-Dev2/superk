/* offscreen.js — runs inside the offscreen document (a real DOM page).
   High-performance ZIP pipeline:
   - O(1) cached size resolution + Promise.all parallel HEAD estimation
   - 5-worker concurrent fetch pool (up to 5x wall-clock speedup)
   - AbortController cancellation for instant stop on cancel
   - Zero-compression (STORE) for near-instant archiving
   - Sanitized paths & O(1) duplicate name resolution
*/

function sanitize(s) {
  return String(s || "file").replace(/[\\/:*?"<>|#%&{}$!'@+=`~]/g, "").replace(/\s+/g, " ").trim().slice(0, 80) || "file";
}

const ZIP_CAP = 150 * 1024 * 1024; // 150MB safety limit
const FILE_TIMEOUT = 90000;
const CONCURRENT_FETCHES = 5; // Optimal HTTP pool size for Chromium

async function headSize(url, signal) {
  try {
    const r = await fetch(url, { method: "HEAD", signal });
    const n = parseInt(r.headers.get("content-length") || "0", 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

async function fetchBuf(url, signal) {
  const ctl = new AbortController();
  const onParentAbort = () => ctl.abort();
  if (signal) {
    if (signal.aborted) throw new Error("cancelled");
    signal.addEventListener("abort", onParentAbort, { once: true });
  }
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
    if (signal) signal.removeEventListener("abort", onParentAbort);
  }
}

const activeJobControllers = new Map(); // jobId -> AbortController
const cancelledJobs = new Set();

chrome.runtime.onMessage.addListener((msg) => {
  if (!msg) return;
  if (msg.type === "PU_ZIP_START") {
    void handleZipJob(msg);
  }
  if (msg.type === "PU_ZIP_CANCEL" && msg.jobId) {
    cancelledJobs.add(msg.jobId);
    const ctl = activeJobControllers.get(msg.jobId);
    if (ctl) {
      try { ctl.abort(); } catch { /* ignore */ }
    }
  }
});

async function handleZipJob(msg) {
  const jobId = msg.jobId;
  const items = msg.items || [];
  const knownSizes = msg.knownSizes || {};
  const subject = sanitize(msg.subject || "Subject").slice(0, 60) || "Subject";

  const jobController = new AbortController();
  activeJobControllers.set(jobId, jobController);
  const jobSignal = jobController.signal;

  const prog = (phase, doneN, total, ok, fail) =>
    chrome.runtime.sendMessage({ type: "PU_ZIP_PROGRESS", jobId, phase, done: doneN, total, ok, fail }).catch(() => {});

  const cleanup = () => {
    activeJobControllers.delete(jobId);
    cancelledJobs.delete(jobId);
  };

  const finish = (payload) => {
    cleanup();
    chrome.runtime.sendMessage(Object.assign({ type: "PU_ZIP_DONE", jobId }, payload)).catch(() => {});
  };

  try {
    if (typeof JSZip === "undefined") {
      finish({ ok: false, reason: "lib", error: "zip library failed to load inside the extension" });
      return;
    }

    if (cancelledJobs.has(jobId) || jobSignal.aborted) {
      finish({ ok: false, reason: "cancelled" });
      return;
    }

    // 1. FAST SIZE ESTIMATION (O(1) lookup where known, parallel HEAD for missing)
    let estimatedTotal = 0;
    const missingItems = [];

    for (const it of items) {
      const cached = knownSizes[it.url];
      if (typeof cached === "number" && cached > 0) {
        estimatedTotal += cached;
      } else {
        missingItems.push(it);
      }
    }

    if (missingItems.length > 0) {
      // Parallelize HEAD requests in batches to avoid overwhelming the server
      const headBatchSize = 10;
      for (let i = 0; i < missingItems.length; i += headBatchSize) {
        if (cancelledJobs.has(jobId) || jobSignal.aborted) {
          finish({ ok: false, reason: "cancelled" });
          return;
        }
        const batch = missingItems.slice(i, i + headBatchSize);
        const sizes = await Promise.all(batch.map((it) => headSize(it.url, jobSignal)));
        for (const s of sizes) {
          if (s > 0) estimatedTotal += s;
        }
      }
    }

    if (estimatedTotal > ZIP_CAP) {
      finish({ ok: false, reason: "too-big", total: estimatedTotal });
      return;
    }

    // 2. CONCURRENT FETCH POOL (5 parallel workers with O(1) queue cursor)
    const zip = new JSZip();
    let ok = 0, fail = 0, denied = 0;
    let lastErr = "";
    const seen = new Map(); // O(1) collision resolution
    let cursor = 0;

    prog("fetch", 0, items.length, 0, 0);

    async function worker() {
      while (cursor < items.length) {
        if (cancelledJobs.has(jobId) || jobSignal.aborted) return;
        const idx = cursor++;
        const it = items[idx];

        try {
          const buf = await fetchBuf(it.url, jobSignal);
          let name = sanitize(it.display || it.title) + ".pdf";
          const count = (seen.get(name) || 0) + 1;
          seen.set(name, count);
          if (count > 1) {
            name = name.replace(/\.pdf$/, ` ${count}.pdf`);
          }
          zip.file(`${sanitize(it.topic)}/${name}`, buf);
          ok++;
        } catch (e) {
          if (cancelledJobs.has(jobId) || jobSignal.aborted) return;
          fail++;
          lastErr = String((e && e.message) || e).slice(0, 120);
          if (e && (e.status === 403 || e.status === 404)) denied++;
        }

        prog("fetch", ok + fail, items.length, ok, fail);
      }
    }

    const workerPool = [];
    const poolSize = Math.min(CONCURRENT_FETCHES, items.length);
    for (let w = 0; w < poolSize; w++) {
      workerPool.push(worker());
    }

    await Promise.all(workerPool);

    if (cancelledJobs.has(jobId) || jobSignal.aborted) {
      finish({ ok: false, reason: "cancelled" });
      return;
    }

    if (!ok) {
      finish({ ok: false, reason: denied === fail && fail > 0 ? "expired" : "all-failed", fail, error: lastErr });
      return;
    }

    // 3. GENERATE ZIP (STORE mode = 0 compression CPU overhead)
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

    if (cancelledJobs.has(jobId) || jobSignal.aborted) {
      finish({ ok: false, reason: "cancelled" });
      return;
    }

    // 4. SAVE VIA CHROME.DOWNLOADS
    try {
      const url = URL.createObjectURL(blob);
      try {
        await chrome.downloads.download({
          url,
          filename: `Parul/${subject}.zip`,
          saveAs: false,
          conflictAction: "uniquify"
        });
      } catch (e) {
        if (blob.size < 10 * 1024 * 1024) {
          const buf = await blob.arrayBuffer();
          let bin = "";
          const bytes = new Uint8Array(buf);
          for (let i = 0; i < bytes.length; i += 0x8000) {
            bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
          }
          const dataUrl = "data:application/zip;base64," + btoa(bin);
          await chrome.downloads.download({
            url: dataUrl,
            filename: `Parul/${subject}.zip`,
            saveAs: false,
            conflictAction: "uniquify"
          });
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

