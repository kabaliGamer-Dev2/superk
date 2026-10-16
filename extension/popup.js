/* popup.js — SuperK: subject-scoped list grouped by topic + bulk download */
const $ = (id) => document.getElementById(id);
let ALL = [];
let sel = new Set();
let ACTIVE = null;
let CURRENT = null;
let CUR_ROOM = "";
let searchTimer = 0;

function key(i) { return i.url; }

function subjects() {
  const out = [];
  for (const i of ALL) if (!out.includes(i.subject)) out.push(i.subject);
  return out;
}

function activeItems() {
  return ACTIVE ? ALL.filter((i) => i.subject === ACTIVE) : [];
}

function renderChips() {
  const bar = $("subjects");
  bar.innerHTML = "";
  for (const s of subjects()) {
    const n = ALL.filter((i) => i.subject === s).length;
    const b = document.createElement("button");
    b.className = "subj" + (s === ACTIVE ? " on" : "");
    b.title = s;
    const nm = document.createElement("span");
    nm.className = "sn";
    nm.textContent = s;
    const ct = document.createElement("span");
    ct.className = "sc";
    ct.textContent = String(n);
    b.append(nm, ct);
    b.onclick = () => {
      ACTIVE = s;
      sel = new Set(activeItems().map(key));
      setStatus(`Subject: <b>${ACTIVE}</b> — naming <b>Subject_Topic_Title.pdf</b>`);
      renderChips();
      render($("q").value);
    };
    bar.appendChild(b);
  }
}

function render(filter = "") {
  const list = $("list");
  list.innerHTML = "";
  const q = filter.trim().toLowerCase();
  const scoped = activeItems()
    .slice()
    .sort((a, b) => (a.tOrder - b.tOrder) || (a.cOrder - b.cOrder));
  const items = scoped.filter((i) =>
    !q || `${i.topic} ${i.title} ${i.display || ""}`.toLowerCase().includes(q)
  );
  $("count").textContent = String(scoped.length);
  if (!scoped.length) {
    list.innerHTML = `<div class="empty">No PDFs in this subject yet.<br/>Open a subject topic page, then <b>Rescan</b>.</div>`;
    updateFoot();
    return;
  }
  if (!items.length) {
    list.innerHTML = `<div class="empty">No PDFs match this filter.</div>`;
    updateFoot();
    return;
  }
  const groups = new Map();
  for (const it of items) {
    const g = it.topic || "Files";
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(it);
  }
  const frag = document.createDocumentFragment();
  for (const [topic, arr] of groups) {
    const gd = document.createElement("div");
    gd.className = "group";
    gd.innerHTML = `
      <div class="ghead">
        <span class="dot"></span>
        <span class="t"><span class="s"></span><span class="p"></span></span>
        <span class="n"></span><span class="chev">▾</span>
      </div>
      <div class="items"></div>`;
    const sEl = gd.querySelector(".s");
    sEl.textContent = topic;
    sEl.title = topic;
    gd.querySelector(".p").textContent = `${arr.length} file${arr.length > 1 ? "s" : ""}`;
    gd.querySelector(".n").textContent = `${arr.length} pdf`;
    const box = gd.querySelector(".items");
    for (const it of arr) {
      const row = document.createElement("div");
      row.className = "item";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = sel.has(key(it));
      cb.onchange = () => { cb.checked ? sel.add(key(it)) : sel.delete(key(it)); updateFoot(); };
      row.onclick = (e) => {
        if (e.target.closest(".dl")) return;
        cb.checked = !cb.checked;
        cb.checked ? sel.add(key(it)) : sel.delete(key(it));
        updateFoot();
      };
      const meta = document.createElement("div");
      meta.className = "meta";
      const ti = document.createElement("div");
      ti.className = "ti";
      ti.textContent = it.display || it.title;
      ti.title = it.display || it.title;
      const to = document.createElement("div");
      to.className = "to";
      to.textContent = it.topic;
      meta.append(ti, to);
      const dl = document.createElement("button");
      dl.className = "dl";
      dl.textContent = "Download";
      dl.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        chrome.runtime.sendMessage({ type: "PU_DOWNLOAD_MANY", items: [it] });
      };
      row.append(cb, meta, dl);
      box.appendChild(row);
    }
    gd.querySelector(".ghead").onclick = () => {
      box.style.display = box.style.display === "none" ? "" : "none";
    };
    frag.appendChild(gd);
  }
  list.appendChild(frag);
  updateFoot();
}

function updateFoot() {
  $("selCount").textContent = String(sel.size);
  $("downloadSel").disabled = sel.size === 0;
  $("downloadAll").disabled = activeItems().length === 0;
}

function setStatus(html) { $("status").innerHTML = html; }

function skeleton() {
  const list = $("list");
  list.innerHTML = "";
  for (let g = 0; g < 3; g++) {
    const d = document.createElement("div");
    d.className = "group skel";
    d.innerHTML = `<div class="skl w40"></div><div class="skl"></div><div class="skl w70"></div><div class="skl"></div>`;
    list.appendChild(d);
  }
  $("subjects").innerHTML = "";
  $("count").textContent = "…";
  $("downloadSel").disabled = true;
  $("downloadAll").disabled = true;
}

function showProgress(done, total, ok, fail) {
  $("progress").classList.remove("hidden");
  $("progressLabel").classList.remove("hidden");
  $("bar").style.width = total ? `${Math.round((done / total) * 100)}%` : "0";
  $("progressLabel").textContent = `Downloading ${done}/${total} — ok ${ok} fail ${fail}`;
  if (done >= total) setTimeout(() => { $("progress").classList.add("hidden"); }, 1200);
}

async function activeTab() {
  const [t] = await chrome.tabs.query({ active: true, currentWindow: true });
  return t;
}

function applyState(v) {
  ALL = v.pu_items;
  CURRENT = v.pu_current || null;
  CUR_ROOM = v.pu_classroomId || "";
  const subs = subjects();
  const locked = !!(CURRENT && subs.includes(CURRENT));
  ACTIVE = locked ? CURRENT : subs[0] || null;
  $("subjects").style.display = locked ? "none" : "";
  sel = new Set(activeItems().map(key));
  $("classLine").textContent = "classroom: " + (v.pu_classroomId || "current view") + " · bridge " + (v.pu_bridge || "?");
  setStatus(v.fallback
    ? `Viewer-cache list (${ALL.length}). For the full subject, open its topic page.`
    : locked
      ? `Subject: <b>${ACTIVE}</b> — ${activeItems().length} PDFs below, in order`
      : `No subject open in the page — pick one below:`);
  renderChips();
  render($("q").value);
}

async function load() {
  const t = await activeTab();
  const url = t?.url || "";
  const okPage = /elearning\.paruluniversity\.ac\.in\/classrooms\//.test(url);
  if (!okPage) {
    setStatus(`Open a <b>/classrooms/…/student</b> page, then open SuperK.`);
    return;
  }
  setStatus(`Scanning subject…`);
  skeleton();
  CUR_ROOM = "";
  let rescanOk = false;
  try {
    await chrome.tabs.sendMessage(t.id, { type: "PU_RESCAN" });
    rescanOk = true;
  } catch { /* dead bridge (tab needs refresh) — handled below */ }
  let lastV = null;
  for (let i = 0; i < 8; i++) {
    const v = await chrome.storage.local.get(["pu_bridge", "pu_v", "pu_items", "pu_classroomId", "pu_current", "pu_fallback", "pu_noAuth", "pu_error"]);
    if (v.pu_items && v.pu_items.length) {
      if (!v.pu_v) {
        $("list").innerHTML = `<div class="empty">Page bridge is outdated.<br/>Refresh this classroom tab once, then reopen SuperK.</div>`;
        setStatus(`Extension reloaded but the tab runs old code — <b>refresh the tab</b>.`);
        return;
      }
      lastV = v;
      // Prefer a scan that actually saw the open subject: early scans can race
      // the SPA transition (breadcrumb still on root). Keep polling briefly.
      if (v.pu_current) { applyState(v); return; }
    }
    await new Promise((r) => setTimeout(r, 600));
  }
  if (lastV) { applyState(lastV); return; }
  if (!rescanOk) {
    $("list").innerHTML = `<div class="empty">SuperK can't reach this tab.<br/>Refresh the classroom tab once, then reopen SuperK.</div>`;
    setStatus(`No live bridge in this tab (extension was reloaded) — <b>refresh the tab</b>.`);
    return;
  }
  $("list").innerHTML = `<div class="empty">No PDFs yet. Open a subject → PPT / Notes / Previous papers, then <b>Rescan</b>.</div>`;
  setStatus(`Nothing found. Open a subject topic page, then <b>Rescan</b>.`);
}

$("q").oninput = (e) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => render(e.target.value), 160);
};
$("rescan").onclick = load;
$("selectAll").onclick = () => { sel = new Set(activeItems().map(key)); render($("q").value); };
$("clear").onclick = () => { sel.clear(); render($("q").value); };
$("downloadAll").onclick = () => {
  const items = activeItems();
  showProgress(0, items.length, 0, 0);
  chrome.runtime.sendMessage({ type: "PU_DOWNLOAD_ZIP", items, subject: ACTIVE }, (r) => {
    if (r && r.ok) {
      showProgress(items.length, items.length, r.zipped || items.length, r.failed || 0);
    } else if (r && r.reason === "too-big") {
      const mb = Math.round((r.total || 0) / 1024 / 1024);
      setStatus(`Subject is ~<b>${mb}MB</b> — too big for one zip, downloading files individually…`);
      chrome.runtime.sendMessage({ type: "PU_DOWNLOAD_MANY", items }, (r2) => {
        if (r2) showProgress(items.length, items.length, r2.ok, r2.fail);
      });
    } else if (r && r.reason === "expired") {
      setStatus(`File links expired (server 403/404). <b>Rescan</b> for fresh links, then retry.`);
    } else if (r && r.reason === "all-failed") {
      setStatus(`Every file failed (${r.error || "fetch error"}). Check connection, then <b>Rescan</b>.`);
    } else {
      setStatus(`Zip failed (${(r && r.reason) || "error"}${r && r.error ? ": " + r.error : ""}). Try single downloads or Rescan.`);
    }
  });
};
$("downloadSel").onclick = () => {
  const items = ALL.filter((i) => sel.has(key(i)));
  showProgress(0, items.length, 0, 0);
  chrome.runtime.sendMessage({ type: "PU_DOWNLOAD_MANY", items }, (r) => {
    if (r) showProgress(items.length, items.length, r.ok, r.fail);
  });
};

chrome.runtime.onMessage.addListener((m) => {
  if (m && m.type === "PU_PROGRESS") showProgress(m.done, m.total, m.ok, m.fail);
  if (m && m.type === "PU_ZIP_PROGRESS") {
    showProgress(m.done, m.total, m.ok, m.fail);
    const lbl = m.phase === "zip" ? "Zipping" : m.phase === "done" ? "Saved zip" : "Fetching";
    $("progressLabel").textContent = `${lbl} ${m.done}/${m.total} — ok ${m.ok} fail ${m.fail}`;
  }
  // NOTE: never auto re-scan here — load() sends RESCAN which produces PU_DONE,
  // and re-scanning on PU_DONE is an infinite fetch/render loop that hangs the tab.
  if (m && m.type === "PU_DONE") refreshFromStorage();
});

async function refreshFromStorage() {
  const v = await chrome.storage.local.get(["pu_bridge", "pu_v", "pu_items", "pu_classroomId", "pu_current", "pu_fallback"]);
  if (!v.pu_items || !v.pu_items.length) return;
  if ((v.pu_classroomId || "") !== CUR_ROOM) return;
  if (!v.pu_v) {
    setStatus(`Extension reloaded but the tab runs old code — <b>refresh the tab</b>.`);
    return;
  }
  ALL = v.pu_items;
  CURRENT = v.pu_current || null;
  applyState(v);
}

/* Opens the official site from the popup (plain target=_blank links don't work here). */
async function openSite(url) {
  try {
    if (chrome.tabs && chrome.tabs.create) await chrome.tabs.create({ url });
    else window.open(url, "_blank");
  } catch { window.open(url, "_blank"); }
}

/* About modal (spec 3.2): info button opens a slide-up sheet; Esc/backdrop closes. */
(function about() {
  const modal = $("aboutModal");
  if (!modal) return;
  const open = () => modal.classList.remove("hidden");
  const close = () => modal.classList.add("hidden");
  $("openAbout").onclick = open;
  $("closeAbout").onclick = close;
  $("closeAbout2").onclick = close;
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  $("openGuide").onclick = async () => {
    openSite("https://superk-official.web.app/");
  };
  $("reportIssue").onclick = async () => {
    openSite("https://superk-official.web.app/feedback.html");
  };
})();

load();
