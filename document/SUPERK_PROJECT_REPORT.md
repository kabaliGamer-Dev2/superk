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
| `index.html` | Centered hero (eyebrow, H1, lede, download + install CTAs, GitHub button + MIT chip, trust line, meta chips, non-affiliation note), stats, marquee, origin quote, static feature cards, rename pipeline, dark video preview (YouTube privacy-enhanced embed, 16:9), how-it-works, safety & requirements cards (SHA-256 verify / limits / update & remove), developer-mode setup card (numbered checklist + copy-address pill), trust banner, 9-item FAQ, feedback teaser band, download finale (responsible-use + faculty contact lines), once-per-browser UPI tip card + floating "Buy a coffee" button and nav menu entry (see §3.10) |
| `story.html` | Origin & mission, exact story copy, quote box, CTAs |
| `installation.html` | 5-step install grid, LMS use steps, troubleshooting FAQ |
| `terms.html` / `privacy.html` / `cookies.html` | Full legal pack in tactile doc cards — 17-section Terms (incl. takedown + governing law: India; §15 voluntary-tips clause), 14-section Privacy (incl. live feedback-data disclosure now covering the submitted page URL, 6-month retention), Cookie Statement (Google Fonts / privacy-enhanced YouTube / Firebase); root `LICENSE` = MIT (linked from Terms §7) |
| `feedback.html` | Standalone form page (see §3.3): hero, form + roadmap + promise side, success/error modal |

Shared chrome: announce bar, sticky nav (hamburger icon ≤860px, 44px touch target), dark footer with Instagram glyph, `?v=N` cache-busting (current `site.css?v=10` + `site.js?v=1`; favicon `assets/favicon.ico?v=2`, plus a root `favicon.ico` copy so the browser's default probe gets a 200).

### 3.2 Hero iterations (decisions, newest last)
1. Two-column + browser mock → removed (rotation/shadow caused mobile overflow).
2. Full invert card hovers → removed (flash); cards fully static.
3. H1 triple-decoration → single ink chip; `.hl` forced `inline` on mobile (inline-block chip was the 500px overflow bug).
4. Buttons: full-bleed slabs → centered grid, max 300px, 44px floor.
5. Pill claiming "Official LMS Utility" → replaced with "Student-built utility" eyebrow (no university endorsement implied. 2026-10-17 page-1 review: index nav badge is now plain `v1.0.0`, hero carries a non-affiliation note, and the FAQ answers independence outright; the six inner pages still show "v1.0.0 Official" badges and `story.html` has an "Official Release" heading — queued for their own page-by-page passes).
6. Sticky mobile download bar → deleted. `body{overflow-x:clip}` guard added.
7. Index backdrop: dot-grid + top glow (page `<style>`, behind everything).
8. ~~All reveal/fade motion removed~~ — superseded 2026-10-17: scroll-linked fades stay banned, but a one-shot on-entry reveal system was later requested and added (§3.5).

### 3.3 Feedback system (Firestore, zero server)
- 5 SVG pill types — Bug Report, Feature Request, Download Error, Question, General Praise (grid 2×2 + full-width last). **No type is preselected** and nothing type-specific shows until one is picked: the choice reveals that type's 1-tap issue list (bug/feature/download — each ends with "Other (explain in Details)"; question/praise show none), a per-type auto-fix tip (e.g. signed-out session, oversized ZIP), the matching placeholder, and clears any "type" error.
- **Strict validation:** Full name (2–80, must contain a letter), email (format-checked; stored lowercased), details (max 2000, minimum **20** chars — praise minimum **10**); WhatsApp/phone optional (10–13 digits, +91-friendly), screenshot link optional (**https:// only**, inline hint). Invalid fields get red border/tint + inline message (`aria-describedby`); the form focuses the first invalid control and shows an error summary ("Please fix N fields.", `role="alert"`); fields re-validate live once flagged. Details has a `0 / 2000` counter (`aria-hidden`), auto-resizes, and uses `enterkeyhint` next/next/done. Mobile inputs render at 16px so iOS never zooms on focus.
- **Consent (round 3):** required checkbox ("I agree that SuperK stores my name, email and this report…", links Privacy) — client blocks with "Please tick to agree before sending." and the Firestore rule independently requires `consent == true`.
- **Context capture:** browser + OS auto-detected ("Chrome 155 · Windows" chip) and attached to every report alongside the extension-version chip (still prefilled by the popup's `?v=` deep link).
- **Anti-spam (layered):** off-screen honeypot + min 2s fill-time (bots get a fake success, nothing written, no "Send another"); submitting <3s after load/reset gets a gentle "Please review your report once more, then press Send." (one more click sends); 60s duplicate-message guard stores a **content hash only** (`superk.fb.last` — never the text) and the **rate limit is 3 reports / 24h** (`superk.fb.rate`, timestamps only); offline check runs before a doomed write.
- Submit: spinner button (`aria-busy`); success modal shows the Firestore **reference ID + Copy button**, echoes the reply email, offers "Send another" (resets + scrolls to form) and "Close"; failure modal keeps the mapped human reason + raw code. Database/CDN blocked (adblock, offline) → warning banner above the form at load + "The form can't reach the database right now…" on submit, plus a `<noscript>` line for JS-off visitors. Deep-link prefill unchanged: `feedback.html?type=&error=&v=`.
- **A11y:** real radio groups (arrow-key navigable), star radios + "Clear rating" that refocuses the first star, live regions on errors, modal focus trap + `inert` background + `html.gate-lock` scroll lock + focus restore, skip-to-content link, `aria-expanded`/`aria-controls` mobile menu.
- Collection `feedback`; rules: public create-only with field validation (type allowlist incl. `question`, message 10–2000, name 2–80, email format via `matches`, **`consent == true`**, phone/browser/platform/extVersion/screenshot/page size-capped, issues list ≤10, rating 0–5 int); all reads/writes denied (console-only viewing). Round-3 rules deployed in **two phases** — soft immediately (cached older forms keep working), strict `consent == true` ~1h later via a delayed job (verification note in §6); normally: `firebase deploy --only hosting,firestore:rules`.
- Roadmap card (Auto Subject Detection live / Custom Folder Naming soon / Split ZIPs planned) + response-promise card with Instagram link.
- Started as homepage section → moved to separate page; homepage keeps a dark teaser band; all navs/footers + extension deep-links point to `feedback.html`.

### 3.4 Media journey
Local 86MB mp4 (poster frame, exact 16:9, excluded from deploys via `firebase.json` ignore — free-tier bandwidth protection) → Google Drive embed (rejected: unreliable) → **YouTube unlisted `fHB4gBzqxI8`** (embedded via `youtube-nocookie.com` privacy-enhanced mode with `loading="lazy"`, full 1080p60 after processing).

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

### 3.10 Tips + page-by-page review (index, Rounds 1–2) (2026-10-17)
Voluntary tips + a per-page review pass (friend's brief). Index went first; inner pages get their own passes when reviewed.
- **Tip card (one-time, index only):** auto-shows once per browser after a successful ZIP download (`superk.coffee.shown`); footer "Support SuperK", nav "Buy a coffee" and the floating button reopen it any time **without** marking it seen; `?tip=1` force-shows after 600ms for testing and also never marks. UPI only by user choice (`9347007497@ybl`, deep link `upi://pay…`; QR at `assets/upi-qr.png`, 660×660) — deliberately no Buy-Me-a-Coffee page. `role="region"` + aria-label; Esc and the X close it; z-index 80 (under the gate's 150); capped to `calc(100vh - 32px)` and scrolls internally. Desktop shows QR + "Scan the QR with any UPI app."; touch devices (`hover: none, pointer: coarse`) instead show a Pay button + "Opens your UPI app.". Copy keeps the promise: free stays free, tips never gate access.
- **Floating "Buy a coffee" button:** fixed bottom-right pill (SVG cup + label; ≤600px → 48px icon-only circle) in Warm Paper ink style with tactile hover; `aria-controls="coffee"` + synced `aria-expanded`; hides while the card is open. Matching `#navCoffee` entry in the nav menu (closes the mobile menu, opens the card, `preventDefault`s the `#support` fallback hash).
- **Review fixes applied (live):** copy softened ("Free Forever" → "Free to use"; "official" scrubbed from index wording); new "What Chrome asks for — and why" permissions section built from the real manifest (storage / downloads / scripting / activeTab + elearning.paruluniversity.ac.in, platform-api.edorer.com, \\*.digitaloceanspaces.com; links Privacy); real popup screenshot figure (`assets/popup-preview.png`, 392×600, rendered ≤320px wide); FAQ "What if it stops working?"; startup/removal + SmartScreen-warning notes with the hash-verify pointer; scope sentence; roadmap + changelog links (feedback teaser / update card). Hero `.ctas` widened to 780px → Download/Install/GitHub sit in one row at ≥1024 (needed 770px). Dead CSS removed (`.steps::before`, `.compare`, `.vs`); `.final wrap` class fixed; YouTube `autoplay` dropped from the iframe allow list.
- **Cross-page amendments:** Privacy §7 honest tips line; Cookies statement now lists the localStorage keys (`superk.coffee.shown`, `superk.fb.last`, gate flags); feedback.html roadmap anchor `id="roadmap"`; Terms §15 voluntary-donation clause already present.
- **Repo housekeeping:** `CHANGELOG.md`, `SECURITY.md`, `THIRD-PARTY-NOTICES.md` (JSZip 3.10.1 MIT + pako), MIT `LICENSE` at root.
- **Live-verified (Playwright at 1440/1280/1024/393/360):** single CTA row at all desktop widths; auto tip marks once + never returns after reload; forced opens (button/nav/footer/`?tip=1`) never mark; Esc + X close; FAB lifecycle + aria sync; mobile menu entry works; zero horizontal overflow; 0 console errors; popup image loads; release SHA-256 matches the page.
- **User-side follow-ups:** scan-test the QR with a real UPI app; confirm the Pay-button variant on a real phone; (optional) capture a ZIP-result screenshot to add beside the popup preview; consider a non-number UPI ID and ask a CA about tip income/tax.

### 3.11 Feedback page-by-page review — Round 3 (2026-10-17)
Friend's 14-item brief + test list, shipped same day and verified live with Playwright (393×852 / 360×800 / 1440×900):
- **Copy & meta:** wording pass across the page, canonical + OG tags, footer shows GitHub + MIT badges, GitHub Issues link beside an honest known-issues list (ZIPs >150MB fall back to file-by-file downloads · no dark mode yet · Auto Subject Detection needs an open topic page).
- **Approved P3 extras:** `beforeunload` unsaved-work warning (fired for real during QA when navigating away from a dirty form), textarea auto-resize, `enterkeyhint` chain; draft autosave was considered and declined.
- **QA (all live-verified):** empty submit → "Please fix 5 fields." + focus on the type group; per-field validation matrix with exact error strings; per-type lists/tips/placeholders incl. "Other" last; consent gate; fast-submit prompt → second press sends; success modal (reference ID + Copy, lowercased email, hash-only localStorage); dedupe, rate-limit, offline and gstatic-blocked paths all wrote nothing; keyboard-only pass (skip link, radio/star arrows, clear-rating, menu open/outside/Escape); 360px zero horizontal overflow; 0 console errors.
- One QA find fixed same day: "Clear rating" dropped focus to `<body>` (the button hides itself) → now refocuses the first star radio; hosting redeployed.
- Test data: the QA run wrote one report ("QA Automated Test — delete me") — deleted via `firebase-tools firestore:delete`; older builder docs still await console cleanup (§4).

### 3.12 Full-site review — Priority A (2026-10-17)
Friend's full-site brief, Priority A shipped and live-verified. **Note: item A4 (feedback page "still the old version") was stale** — round 3 had already shipped every listed P1 item; only `expireAt`/TTL was genuinely new.
- **A1 tip card vs gate:** the card used to auto-show 2.5s after *any* `.zip` click — which fired behind the gate and burned the once-only flag even when the visitor cancelled. `site.js` now dispatches `superk:download` inside `startDownload()` and index listens for that event instead. Verified: real download → card shows once; gate closed without downloading → no card, flag untouched.
- **A2 cache:** `site.js` and `site.css` both changed, so every page moved to **`site.js?v=3` / `site.css?v=12`** (bumped twice during the pass — always re-bump on deploy).
- **A3 story page:** de-fanged end-to-end — "From Prototype to **Public** Release", no "reverse-engineering"/`PdfViewer-*.js`/"API endpoints"/"official extension", download-disappeared line rewritten with the honest "I don't know why the portal changed" sentence, quote box made identical to index, non-affiliation line under the byline, neutral meta description.
- **A4 retention:** every report now carries `expireAt = created + 180 days`; rules require it, bound it to ≤181 days, and enforce a `hasOnly` field allowlist. Verified live both ways — a write *without* `expireAt` is rejected `permission-denied`, the real form still succeeds. **TTL policy still needs one manual click** (Console → Firestore → TTL, field `expireAt`); the CLI/gcloud route wasn't available, so auto-deletion is not yet armed — see §6.
- **A5 legal consistency:** Privacy §3 now lists `scripting` so it matches index + manifest exactly; §1 reworded to "the **extension** does not collect" + pointer to §7; §9 children age aligned to **under 18** (India DPDP) and the consent checkbox now carries the "I am 18 or older, or my parent/guardian agrees" clause; Firebase Hosting server logs disclosed in Privacy §7 + Cookies; Terms gained **§8 Download gate** and **§17 Support and Tips** (tips paragraph extracted from General, everything renumbered 1–19 sequentially); "Last updated" added to Terms/Privacy/Cookies; gate key → `superk.gate.terms.v2` (so everyone re-accepts) and Cookies updated to match.
- **A6 `.steps::before`:** the dashed connector was "dead CSS" but is real — it's hidden only ≤900px. Restored in **both** index and installation media queries. Verified: `display:none` at 360/390, `block` at 1440.
- **A7 installation page:** the STEP counter bug was two `.install` containers (`counter-reset` per container → card 5 showed "STEP 1"); now one `.install-5` grid with all five steps in one row. Folder wording corrected after inspecting the ZIP — it is **flat**, `manifest.json` at the root, no `extension/` folder, so steps now say "the folder containing `manifest.json`". Browser list unified to Chrome/Brave/Edge/Opera/Vivaldi/Arc with each one's URL (Arc = `chrome://extensions`), and index's JSON-LD/FAQ/requirements updated to match. Troubleshooting grew 2 → 8 items; new "Update and remove" section. Since the page has **no screenshots**, index's "Full walkthrough with screenshots" was changed to "per-browser URLs & troubleshooting" rather than shipping a false promise.
- **A7b gate honesty:** Instagram is now genuinely optional (accepting the Terms alone unlocks the ZIP); the un-verifiable "Followed" pill became "Done"; heading/subtitle/badges rewritten (title "One quick agreement", optional step badged `?`); JSON-LD `downloadUrl` now points at the install page (the ZIP stays directly reachable and the gate is never described as protection); the page behind the gate gets `inert` + `aria-hidden` while open, cleared on close.
- **B1 folded in:** `v1.0.0 Official` nav badge removed from all six pages (required for the brief's own "search the file" test).

---

## 4. Firebase (project `superk-official`)

- **Account/CLI:** firebase-tools (v15.33.0 seen), logged in; project created via `projects:create`; web app "SuperK Site", App ID `1:486363490825:web:ad14cf58a120f8b32ae6d8`.
- **Firestore:** Native mode, region `asia-south1` (Mumbai — permanent, do not change); created via console (CLI cannot enable the API without gcloud).
- **Files:** `firebase.json` (public `official/`, mp4 ignored, css/js cache 1h), `.firebaserc` (default project), `firestore.rules` (see §3.3).
- **Deploy:** `firebase deploy --only hosting` (site) / add `,firestore:rules` when rules change. Verify live with `?v=`-busted fetches; test-browser cache lies — always re-check with a fresh query string. Round-3 rules went in two phases (soft → strict ~1h later, see §3.3).
- **Console reads:** `console.firebase.google.com/project/superk-official/firestore` → `feedback` collection. Builder/QA test docs submitted during verification — two from the reveal/gate pass + "Aditi Sharma" (feedback pass) + possibly one extra Round-3 QA report — delete when convenient (client rules deny delete; console only). The confirmed Round-3 QA doc (ref `UxEnqkGmvxwSaXNMwsEO`) was already removed via `firebase-tools firestore:delete`.

---

## 5. Release ZIP Flow

1. Rebuild: `Compress-Archive -Path extension/* -DestinationPath official/releases/superk-1.0.0.zip -Force` (36 files, manifest v1.0.0, ~76KB).
2. Deploy hosting; verify `GET /releases/superk-1.0.0.zip` → 200 `application/zip`.
3. Student path: any Download button → extract → `chrome://extensions` → Developer mode → Load unpacked → pin → open classroom → Download all. Mirrored on `installation.html`.

---

## 6. Open Items / Standing Offers

1. **"SuperK Official" wording — DONE.** index + all six inner pages scrubbed: nav badge is now plain `v1.0.0`, story heading is "From Prototype to Public Release", and every official-tool/reverse-engineering claim is gone (§3.12). The extension's internal strings (manifest `description`, `setUninstallURL`) keep the word "Official" meaning "official release" — that is internal packaging text, not a user-facing affiliation claim.
2. **Per-report notifications** (email/Discord on each feedback) — Phase 2 via Trigger Email extension or Cloud Function.
3. **Video** — confirm Unlisted + finished HD processing on YouTube.
4. **Cache discipline** — bump `site.css?v=N` (currently **v12**) and `site.js?v=N` (currently **v3**) on every deploy of those files; favicon token currently `?v=2` (sticky cache — bump on the next icon change); HTML can sit in cache ~1h (ask users to hard-refresh after big launches).
5. **Local dev server** — `python -m http.server 8099` in `official/` (note: sandbox test browsers cannot reach this machine's localhost; verify via direct HTTP or the live URL).
6. **Firestore test-doc cleanup** — delete the remaining builder/QA reports in the console (§4); reads are console-only.
7. **Firestore TTL policy (one manual step)** — reports carry `expireAt` (created + 180 days) and the rules enforce it, but the **TTL policy itself is not armed yet**: `gcloud` is not installed on this machine and the CLI has no TTL command, so it must be enabled in the console (Firestore → ⚙ Indexes/TTL → create TTL on field `expireAt`). Until then, `expireAt` is stored but nothing auto-deletes — Privacy §7 currently claims automatic 6-month deletion, so do this before it matters.
8. **Narrow the DigitalOcean host permission (C2)** — manifest uses `https://*.digitaloceanspaces.com/*`, which covers every DigitalOcean customer's bucket. The real bucket can't be derived from the code (PDF URLs are scraped from live page resources), so this needs one capture of an actual download URL, then a targeted host + a ZIP rebuild.
9. **UPI ID is a phone number (C1)** — `9347007497@ybl` is printed in public HTML/JS, so bots can scrape it. Decision needed: separate UPI ID, or accept the risk.
10. **Priority B/C/D of the full-site brief** — not started (shared nav/footer, menu logic into site.js, skip link + `<main id=main>` on all pages, mobile Download link, canonical/OG + sitemap `<lastmod>` on all pages, `.grain` z-index over dialogs, tip-FAB decision, asset cleanup, print styles, 404 + security.txt + security headers, GitHub Release + SHA256SUMS, issue templates).
11. **Legal review** — the brief's own advice: the terms/disclaimers reduce but do not remove the risk that the university removed downloads deliberately. Strongest protection is a written "no objection" from the department, plus quick takedown handling. Not legal advice — consider the institution's legal-aid cell or a lawyer.
12. **Age wording** — Privacy/Terms/consent now align to under 18 per India's DPDP Act; a lawyer should confirm the final wording.

## 7. Key Identifiers (public-safe)

- Site: `https://superk-official.web.app` · Project ID: `superk-official` · Console: `console.firebase.google.com/project/superk-official/overview`
- Firebase web config: apiKey `AIzaSyCd6YhayL6AgnMXGV4s00asli8b1hbI3gw`, authDomain `superk-official.firebaseapp.com`, projectId `superk-official`, storageBucket `superk-official.firebasestorage.app`, messagingSenderId `486363490825`, appId above (browser-public by design; security lives in `firestore.rules`).
- Demo video: YouTube `fHB4gBzqxI8` (unlisted). Instagram: `kabali.gamer`.
