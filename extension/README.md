# SuperK Official v1.0.0 — Created by Kabali Gamer

![v1.0.0](https://img.shields.io/badge/v1.0.0-official) ![Manifest V3](https://img.shields.io/badge/Manifest-V3) ![Parul Elearning](https://img.shields.io/badge/Parul-Elearning) ![Created by Kabali Gamer](https://img.shields.io/badge/Created%20by-Kabali%20Gamer)

List and bulk-download PDFs from any Parul University elearning classroom / subject page — grouped by topic, packed into one ZIP.

> *"A few days ago, our college website was updated, and we lost the option to download our lecture notes and PPTs completely. Whenever exams came around, we couldn't save our study materials offline. I couldn't let students struggle through that. So, I built SuperK. Now, every student can install SuperK and download all their course PDFs with a single click."*
>
> — **Kabali Gamer**, Creator & Lead Developer of SuperK

## Install (30 seconds, no tech skills needed)

1. `chrome://extensions` → turn **Developer mode** ON → **Load unpacked** → select the `extension/` folder.
2. Pin SuperK in your browser toolbar.
3. Open `https://elearning.paruluniversity.ac.in/classrooms/<your-id>/student`, log in if needed.
4. Open a subject → click the SuperK icon → **Download all** (one ZIP) or tick files → **Selected**.

Full walkthrough with screenshots: `official/installation.html`. Origin story: `official/story.html`.

## What it does

- **One-click subject ZIPs** — PPTs, notes, lab manuals, question papers sorted into topic folders (`8. PPTs/`, `6. Assignments/`).
- **Smart filenames** — `Subject_Topic_Title.pdf`; generic "PPT"/"Assignment" titles resolved from cloud slugs, duplicates numbered.
- **Safe by design** — 350ms pacing, ~150MB ZIP cap with automatic per-file fallback, offline options page.
- **100% private** — zero telemetry, zero servers; session tokens never leave your browser.

## Files

- `manifest.json` — MV3 v1.0.0, author metadata, options page registration
- `injected.js` (MAIN world) — classroomId + session read, subjects fetch, viewer-cache fallback
- `content.js` — isolated-world bridge → `chrome.storage.local`
- `popup.html/css/js` — subject-scoped list, search, progress, About modal
- `options.html` — offline guide (right-click icon → Options)
- `background.js` + `offscreen.js` — per-file downloads + ZIP pipeline (offscreen document, base64 fallback)

## Legal

- Terms: `official/terms.html` · Privacy: `official/privacy.html` · Cookies: `official/cookies.html`
- Independent student utility. Not affiliated with Parul University or Edorer. Downloads are for personal, non-commercial study only.
