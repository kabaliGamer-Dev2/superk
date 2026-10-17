# SuperK — Complete Project Report
**Author:** Kabali Gamer · **Product:** SuperK v1.0.0 (Parul University elearning PDF downloader + official site)
**Live site:** https://superk-official.web.app · **Report date:** 2026-10-17
**Purpose:** single source of truth. Read this before any update — it records what was built, why, and how to redo each operation.

---

## 1. What SuperK Is

A Chrome MV3 extension that lists and bulk-downloads PDFs from the Parul University elearning portal (which removed direct download links after an LMS update), plus an official 7-page website that distributes it and collects feedback.

- Extension works on any `/classrooms/<id>/student` page, for any user (generic design: classroomId parsed from URL, subjects API + tokens from `localStorage edorer.auth.session`).
- Filenames resolve as `{Subject}_{Topic}_{Title}.pdf`; generic faculty titles ("PPT", "Assignment") resolved from cloud slugs, duplicates numbered compactly.
- Download-all produces one ZIP with topic folders; ~150MB cap with automatic per-file fallback.

---

## 2. Extension (`extension/`) — Build History

### 2.1 Investigation (proven live, Playwright + DevTools)
- Login flow, classrooms → subjects → viewer → direct PDF URLs mapped.
- Key API: `GET https://platform-api.edorer.com/api/classrooms/{id}/subjects` with `authorization: Bearer` + `authorizationtoken` headers.
- PDF hosts (`*.digitaloceanspaces.com`) need no auth — proven `200` + `%PDF-1.7`.
- SPA URL never changes (`.../student`); subject detection watches the breadcrumb signature, not the URL.

### 2.2 Files & responsibilities
| File | Role |
|---|---|
| `manifest.json` | MV3, v1.0.0, author Kabali Gamer, homepage `https://superk-official.web.app`, `options_ui → options.html`, host perms for elearning + platform-api + digitaloceanspaces |
| `injected.js` | MAIN-world scan: classroomId, session, subjects fetch, naming resolution, viewer-cache fallback |
| `content.js` | Isolated-world bridge → `chrome.storage.local`; hardened with `bridgeAlive()` guards against invalidated-context errors after extension reloads |
| `popup.html/css/js` | Warm Paper UI: subject chips + auto-lock, skeleton loading, debounced search, progress meter, per-file + ZIP + too-big fallback; bridge version stamp in header (`bridge 2.1.0`); About slide-up sheet (quote, bullets, guide + report-issue buttons) |
| `background.js` | Service worker: per-file downloads (350ms pacing), ZIP routing, `setUninstallURL → /feedback.html?from=uninstall`, base64 data-URL last-resort ZIP path |
| `offscreen.js` + `offscreen.html` | ZIP pipeline in offscreen document (BLOBS reason): size-cap check, fetch loop, JSZip build, save via `chrome.downloads`; base64 fallback where Blob URLs don't exist |
| `options.html` | Offline guide (use steps, troubleshooting, privacy + fair-use summaries); opens via right-click → Options |
| `icons/` | Final Gemini orbit-K kit: `gemini-16/48/128.png` (transparent RGBA), masters in `brand/` |
| `lib/jszip.min.js` | Bundled ZIP library (also used by offscreen doc) |
| `README.md` | Official banner, badges, origin quote, install, file map, legal links |

### 2.3 Bugs fixed (so they are not reintroduced)
1. **Hang loop** — never auto re-scan on `PU_DONE`; busy guard + debounced search + fragment render.
2. **Footer flex-shrink bug** — pinned action bar, verified by harness.
3. **`content.js:17` stale-bridge error** — old tabs running pre-fix code; fixed by invalidated-context guards + explicit "refresh the tab" messaging + bridge version stamp.
4. **`URL.createObjectURL is not a function`** — legacy path for browsers without SW blob URLs; added base64 data-URL fallback in both `background.js` and `offscreen.js` (integrity-verified round-trip).
5. **ZIP moved off SW** — `URL.createObjectURL` failed in service worker; generation now runs in the offscreen document.

### 2.4 Logo history (do not regress)
Orbit K (concept C, has the K) → rejected "copyright button" V4-A attempt → user-supplied `gemini-svg.svg` **locked as final**. Kit in `brand/` (`gemini-master/black/reversed/small.svg`), transparent PNGs in `extension/icons/`, popup header uses reversed mark, site uses `official/assets/logo.svg` + `logo-white.svg`.

### 2.5 Test credentials (live portal)
Redacted in this public copy. Sessions expire (~1h); re-login via `/login` password flow on API 401s.

---

## 3. Website (`official/`) — Build History

Design law: Warm Paper (`#F3F0E7` paper / `#2A2529` ink), Poppins display / Montserrat body / JetBrains Mono meta, 1.5px ink borders, tactile shadows, 99px pills, 24px/2px-stroke round-cap SVG icons only, **no emojis anywhere**.

### 3.1 Pages (7 + shared `tokens.css`, `site.css`)
| Page | Contents |
|---|---|
| `index.html` | Centered hero (eyebrow, H1, lede, download + install CTAs, trust line, meta chips), stats, marquee, origin quote, static feature cards, rename pipeline, dark video preview (YouTube embed, 16:9), how-it-works, developer-mode setup card (numbered checklist + copy-address pill), trust banner, FAQ, feedback teaser band, download finale |
| `story.html` | Origin & mission, exact story copy, quote box, CTAs |
| `installation.html` | 5-step install grid, LMS use steps, troubleshooting FAQ |
| `terms.html` / `privacy.html` / `cookies.html` | Exact spec legal text in tactile doc cards |
| `feedback.html` | Standalone form page (see §3.3): hero, form + roadmap + promise side, success/error modal |

Shared chrome: announce bar, sticky nav (hamburger icon ≤860px, 44px touch target), dark footer with Instagram glyph, `?v=N` cache-busting (current `site.css?v=10` + `site.js?v=1`; favicon `assets/favicon.ico?v=2`, plus a root `favicon.ico` copy so the browser's default probe gets a 200).

### 3.2 Hero iterations (decisions, newest last)
1. Two-column + browser mock → removed (rotation/shadow caused mobile overflow).
2. Full invert card hovers → removed (flash); cards fully static.
3. H1 triple-decoration → single ink chip; `.hl` forced `inline` on mobile (inline-block chip was the 500px overflow bug).
4. Buttons: full-bleed slabs → centered grid, max 300px, 44px floor.
5. Pill claiming "Official LMS Utility" → replaced with "Student-built utility" eyebrow (no university endorsement implied; other "SuperK Official" wordings still exist — scrub on request).
6. Sticky mobile download bar → deleted. `body{overflow-x:clip}` guard added.
7. Index backdrop: dot-grid + top glow (page `<style>`, behind everything).
8. ~~All reveal/fade motion removed~~ — superseded 2026-10-17: scroll-linked fades stay banned, but a one-shot on-entry reveal system was later requested and added (§3.5).

### 3.3 Feedback system (Firestore, zero server)
- 4 SVG pill types (bug/feature/download/praise), conditional 1-tap symptom checks (5th "Other — none of these fit" option added 2026-10-17; ≥1 required for bug/download so reports are classified), auto-fix tip box per symptom, dynamic placeholders per type, star rating.
- **Strict validation (2026-10-17 upgrade):** Full name (2–80, must contain a letter), email (format-checked), and details (10–2000 chars) required; WhatsApp/phone optional (10–13 digits, +91-friendly) and screenshot link optional (full http(s) URL). Invalid fields get red border/tint + inline message (`aria-describedby`), and the form auto-scrolls to + focuses the first invalid control; once flagged, fields re-validate live on input. Mobile inputs render at 16px so iOS never zooms on focus.
- **Context capture:** browser + OS auto-detected ("Chrome 155 · Windows" chip) and attached to every report alongside the extension-version chip (still prefilled by the popup's `?v=` deep link).
- **Anti-spam:** off-screen honeypot field + minimum 2s fill-time (bots get a fake success, nothing is written) + 60s duplicate-message guard via localStorage.
- Submit: spinner button (`aria-busy`), success modal ("Feedback sent successfully.", echoes the reply email) with **"Send another"** (resets + scrolls back to the form) and "Close" buttons; failure modal keeps the mapped human reason + raw code. Deep-link prefill unchanged: `feedback.html?type=&error=&v=`.
- Collection `feedback`; rules: public create-only with field validation (type allowlist, message 10–2000, name 2–80, email format via `matches`, phone/browser/platform/extVersion/screenshot/page size-capped, issues list ≤10, rating 0–5 int); all reads/writes denied (console-only viewing). Rules ship with hosting: `firebase deploy --only hosting,firestore:rules`.
- Roadmap card (Auto Subject Detection live / Custom Folder Naming soon / Split ZIPs planned) + response-promise card with Instagram link.
- Started as homepage section → moved to separate page; homepage keeps a dark teaser band; all navs/footers + extension deep-links point to `feedback.html`.

### 3.4 Media journey
Local 86MB mp4 (poster frame, exact 16:9, excluded from deploys via `firebase.json` ignore — free-tier bandwidth protection) → Google Drive embed (rejected: unreliable) → **YouTube unlisted `fHB4gBzqxI8`** (`youtube.com/embed/…`, full 1080p60 after processing).

### 3.5 Motion system — one-shot scroll reveal (2026-10-17; reverses the earlier removal)
History: the original motion system was deleted because scroll-linked partial opacity (a `view()` timeline + `.rv` observer fade + `rvEnter` cascade + `d1–d5` delays) made elements look broken while scrolling on phones. The user then requested a premium *one-shot* reveal on entry — so the rule is now: **one-shot IntersectionObserver reveals only, never scroll-linked opacity.** Rules that keep it safe (do not regress):
- **Reveal once, keep forever**: elements get `.is-visible` when they enter the viewport (`rootMargin: 0 0 -8% 0`, threshold 0), then are unobserved — scrolling back up changes nothing, no re-animation.
- **Hiding is opt-in via JS**: an inline head snippet adds `.js` to `<html>` only when IntersectionObserver exists; a 2.5s safety timer removes it unless `site.js` sets `data-reveal-ready`. JS disabled/failed → no hiding, all pages render fully static (live-verified).
- **Reusable classes**: `.reveal` (element) and `.stagger` (container; children get 60ms stepped `--rd` delays, capped 360ms). Values: start `opacity:0` + `translateY(28px)`, in 700ms `cubic-bezier(.22,1,.36,1)`, transform+opacity only, no layout shift.
- **First viewport stays static**: heroes, announce bar, nav and footer are never `.reveal`; reveal starts below the fold; one shared observer for the whole page.
- **Reduced motion**: `prefers-reduced-motion: reduce` forces everything fully visible with `transition: none` (live-verified).
- Targets: 37 on index, 16 on installation, 3 on story/feedback, 1 on each legal page. Engine lives in `official/site.js` + `site.css`.
Kept (intentional micro-interactions, not fades): marquee ticker, send-button spinner, button hover/press, FAQ open/close, rename-arrow nudge. No blur by rule.
Still banned: scroll-linked opacity, `.rv`/`rvView`/`rvEnter`/`d1–d5` names, per-page observer scripts — use `.reveal`/`.is-visible` + `site.js` only. (FAQ and `.pipe` are revealed as whole containers so `details[open]` transitions are never clobbered.)

### 3.6 Favicon & embed-params refresh (2026-10-17)
- Favicon was stale (old circled-K from Oct 16, pre-logo-lock) — rebuilt from the locked orbit-K mark: 16/24/32px frames from `brand/gemini-small.svg` (heavy cut), 48px from `brand/gemini-master.svg` (standard cut), PNG-compressed ICO entries like the original file. All pages link `assets/favicon.ico?v=2` (favicon caches are sticky; bump to `?v=3` on the next icon change).
- Index video iframe now uses the exact user-provided YouTube share embed (`?si=…&start=1`, `web-share` in the allow list, `referrerpolicy="strict-origin-when-cross-origin"`), still responsive 16:9 with `loading="lazy"`. Keep the video **Unlisted** — setting it Private breaks embeds.
- Root `official/favicon.ico` added (copy of the same file) so clients that probe `/favicon.ico` directly get a 200 instead of the console 404.

### 3.7 Install section: fake terminal → setup checklist card (2026-10-17)
User callout: the old `.term` block dressed *instructions* in terminal costume (window dots, `$` prompts, mono body text) — mono belongs to code, not explanations. Replaced with a paper "side-load checklist" card built from the site's own vocabulary:
- Numbered ink square badges; step title + one helper line; mono reserved for literal content only — `superk-1.0.0.zip` (now a clickable chip straight to the release ZIP), `Documents/SuperK`, `chrome://extensions`.
- `chrome://` URLs cannot be hyperlinked (browsers block it), so the address renders as an address-bar pill with a **working Copy button**: hover lift / press like `.btn`, "Copied" state (check icon + `aria-live` label, reverts after 1.8s), clipboard API with `execCommand` fallback. ≤480px the button goes icon-only so the full URL stays visible.
- Footer row: "Full walkthrough with screenshots → Installation Guide"; sub-line rewritten ("no store, no account, works in every Chromium browser").
- `.term*` CSS deleted; new `.setup/.omni/.setup-copy` system in `site.css`. Bonus craft pass: themed `::selection` (ink highlight; light override on dark surfaces — announce/marquee/pipe-foot/foot/preview/road/trust badges).
- Cache token now `site.css?v=7`. Live-verified at 393px and 1440px: zero horizontal overflow, copy click → "Copied" → revert, no console errors. Do not regress to terminal styling for this block.

### 3.8 Instagram
`https://www.instagram.com/kabali.gamer/` — hero attr link, follow card, footer glyph, feedback promise card, and the download gate below.

### 3.9 Download gate — T&C + Instagram unlock (2026-10-17)
Every ZIP link site-wide (announce bar, nav, hero, setup-card chip, install/story/finale CTAs) opens a full-screen gate. Built entirely in `official/site.js` — a delegated listener on `a[href*="releases/superk-1.0.0.zip"]`, so there is no per-page markup to maintain.
- Two steps: (1) agree to the T&C/Privacy checkbox, (2) follow `@kabali.gamer` on Instagram (opens the profile in a new tab; the click marks the step done). When both are complete the download button enables and triggers the real ZIP download (temporary anchor + a `passing` guard so the synthetic click doesn't re-open the gate).
- Clicking the locked button nudges focus to the first incomplete step; the lock line swaps "Both steps unlock the download button." → "You're all set — grab the ZIP."
- Persistence: `superk.gate.terms.v1` + `superk.gate.instagram.v1` in localStorage — return visits open pre-completed.
- A11y: `role="dialog"` + `aria-modal`, focus moves to the title on open, Tab/Shift+Tab trap, Escape closes, scroll lock via `html.gate-lock`, focus restored to the triggering link on close.
- Warm Paper styling lives in `site.css` (`.gate*`). `text-align: left` is set on `.gate` deliberately — the index page body is `text-align: center` and the gate must not inherit it.
- Live-verified end-to-end (open → locked → both steps → real download → persistence after reload → Escape + focus trap) at 1440×900 and 393×852.

---

## 4. Firebase (project `superk-official`)

- **Account/CLI:** firebase-tools (v15.33.0 seen), logged in; project created via `projects:create`; web app "SuperK Site", App ID `1:486363490825:web:ad14cf58a120f8b32ae6d8`.
- **Firestore:** Native mode, region `asia-south1` (Mumbai — permanent, do not change); created via console (CLI cannot enable the API without gcloud).
- **Files:** `firebase.json` (public `official/`, mp4 ignored, css/js cache 1h), `.firebaserc` (default project), `firestore.rules` (see §3.3).
- **Deploy:** `firebase deploy --only hosting` (site) / add `,firestore:rules` when rules change. Verify live with `?v=`-busted fetches; test-browser cache lies — always re-check with a fresh query string.
- **Console reads:** `console.firebase.google.com/project/superk-official/firestore` → `feedback` collection. Three builder test docs were submitted during verification (two from the reveal/gate pass + "Aditi Sharma" from the feedback-upgrade pass) — delete them when convenient.

---

## 5. Release ZIP Flow

1. Rebuild: `Compress-Archive -Path extension/* -DestinationPath official/releases/superk-1.0.0.zip -Force` (36 files, manifest v1.0.0, ~76KB).
2. Deploy hosting; verify `GET /releases/superk-1.0.0.zip` → 200 `application/zip`.
3. Student path: any Download button → extract → `chrome://extensions` → Developer mode → Load unpacked → pin → open classroom → Download all. Mirrored on `installation.html`.

---

## 6. Open Items / Standing Offers

1. **"SuperK Official" wording** — nav badge, page titles, extension strings still say Official (meaning your official release). Scrub to affiliation-safe copy on request.
2. **Per-report notifications** (email/Discord on each feedback) — Phase 2 via Trigger Email extension or Cloud Function.
3. **Video** — confirm Unlisted + finished HD processing on YouTube.
4. **Cache discipline** — bump `site.css?v=N` (currently **v10**) and `site.js?v=N` (currently **v1**) on every deploy of those files; favicon token currently `?v=2` (sticky cache — bump on the next icon change); HTML can sit in cache ~1h (ask users to hard-refresh after big launches).
5. **Local dev server** — `python -m http.server 8099` in `official/` (note: sandbox test browsers cannot reach this machine's localhost; verify via direct HTTP or the live URL).

## 7. Key Identifiers (public-safe)

- Site: `https://superk-official.web.app` · Project ID: `superk-official` · Console: `console.firebase.google.com/project/superk-official/overview`
- Firebase web config: apiKey `AIzaSyCd6YhayL6AgnMXGV4s00asli8b1hbI3gw`, authDomain `superk-official.firebaseapp.com`, projectId `superk-official`, storageBucket `superk-official.firebasestorage.app`, messagingSenderId `486363490825`, appId above (browser-public by design; security lives in `firestore.rules`).
- Demo video: YouTube `fHB4gBzqxI8` (unlisted). Instagram: `kabali.gamer`.
