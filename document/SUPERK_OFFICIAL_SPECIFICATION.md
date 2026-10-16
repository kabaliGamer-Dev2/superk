# SuperK: Official Website & Extension Master Specification
**Document Version:** 1.0.0 (Official Release Specification)  
**Author / Creator:** Kabali Gamer  
**Project:** SuperK (Parul University Elearning PDF Downloader)  
**Target Repository:** `S-Extension-829/document/`

---

## Executive Overview

This master specification document provides the exact blueprints, text copy, layout structures, legal policies, visual design system, and extension-level enhancements required to launch **SuperK** as an official, production-ready product with its full companion web ecosystem.

---

# SECTION 1: Brand Identity & Design System

To ensure seamless brand continuity between the extension popup and the official multi-page website, all web pages must strictly follow the **"Warm Paper"** aesthetic established in SuperK v0.2.0.

### 1.1 Color Palette

| Token Name | Hex Code | Visual Role | Usage |
|---|---|---|---|
| `--paper` | `#F3F0E7` | Pale Ivory | Page background, primary canvas, neutral buttons |
| `--card` | `#FBF9F3` | Soft Warm White | Content containers, feature boxes, modal backgrounds |
| `--paper2` | `#E9E3D1` | Muted Sand | Group headers, accordion bars, secondary badges |
| `--line` | `#D9D1BC` | Firm Border | Solid 1.5px element outlines and dividers |
| `--line-soft` | `#E4DDC9` | Soft Border | Subtle list item separators and card borders |
| `--ink` | `#2A2529` | Deep Charcoal | Primary headings, button backgrounds, high-contrast text |
| `--ink2` | `#544D52` | Muted Charcoal | Subheadings, body copy, breadcrumb labels |
| `--mut` | `#877D82` | Medium Grey | Metadata, dates, tertiary captions |
| `--faint` | `#ABA19F` | Pale Grey | Input placeholders, disabled icons |
| `--acc-ink` | `#F3F0E7` | Contrast Text | Inverted white-ivory text on Charcoal buttons/badges |

### 1.2 Typography Hierarchy

Include via Google Fonts:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Montserrat:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
```

- **Display / Headings (`--display`):** `"Poppins", system-ui, sans-serif`
  - Hero Titles: 44px – 56px (Weight: 800, letter-spacing: -0.03em)
  - Section Headings: 28px – 34px (Weight: 700)
  - Card Titles: 18px – 22px (Weight: 600)
- **Body & UI (`--body`):** `"Montserrat", system-ui, -apple-system, sans-serif`
  - Body Paragraphs: 14px – 16px (Weight: 400 / 500, line-height: 1.6)
  - Navigation & Buttons: 13px – 14px (Weight: 600 / 700)
- **Mono / Technical Badges (`--mono`):** `"JetBrains Mono", ui-monospace, monospace`
  - Eyebrows, Code, File Names, Keyboard Shortcuts (`⌘K`), Version Tags: 11px – 13px (Weight: 600)

### 1.3 Key UI Motifs
- **Brutalist-Soft Borders:** 1.5px solid `#2A2529` outlines with `3px 3px 0 rgba(42, 37, 41, 0.9)` tactile drop-shadows on buttons, cards, and inputs.
- **Micro-pill Tags:** Rounded `border-radius: 99px` badges with monospace uppercase labels.
- **Official Mark:** The SuperK "Orbit K" logo (`superk-final.svg` / `superk-white.svg`).

---

# SECTION 2: Official Website Architecture (Multi-Page Blueprint)

The official website consists of **6 dedicated pages**. Below is the exact content, structure, and text required for each page.

```
official-website/
├── index.html          # 1. Main Landing Page & Feature Showcase
├── story.html          # 2. The Creator Story & Mission (Kabali Gamer)
├── installation.html   # 3. Step-by-Step Installation & Setup Guide
├── terms.html          # 4. Terms of Service & Academic Disclaimer
├── privacy.html        # 5. Privacy Policy & Zero-Data Guarantee
└── cookies.html        # 6. Cookies & Local Storage Statement
```

---

## Page 1: Main Landing Page (`index.html`)

### Purpose
The primary homepage designed to convert Parul University students and faculty into active users, showcasing features, giving immediate download links, and presenting the developer attribution.

### Layout & Sections

#### 1. Global Navigation Bar
- **Left:** SuperK Logo (Orbit K mark) + Wordmark **SuperK** (Poppins 800) + Badge: `v1.0.0 Official`.
- **Center Links:** `Features` | `Story` | `Installation Guide` | `Terms` | `Privacy`.
- **Right:** Button: `[ Download Extension ]` (direct link to latest `.zip` release).

#### 2. Hero Section
- **Eyebrow:** `OFFICIAL BROWSER UTILITY · BUILT FOR PARUL UNIVERSITY STUDENTS`
- **Main Headline (H1):**
  > **Grab every lecture PDF.<br>Beautifully. Instantly. In one click.**
- **Subheadline (Paragraph):**
  > "When our university LMS was updated and stripped away all direct PDF download links, SuperK was engineered to solve it. One-click batch downloads, clean unit-based filenames, and instant topic ZIP archives."
- **Action CTAs:**
  - Primary Button (Charcoal Ink): `Download SuperK (v1.0.0 ZIP)` with download icon.
  - Secondary Button (Paper): `View Installation Guide (30 Seconds)` with arrow icon.
- **Creator Attribution Banner (Right below CTAs):**
  - Text: `Handcrafted with ❤️ by Kabali Gamer · 100% Free & Open for all Students`

#### 3. Featured Quote Callout (The Origin Story Preview)
Rendered in a high-impact quotation box with a charcoal border and tactile shadow:
> *"A few days ago, our college website was updated, and we lost the option to download our lecture notes and PPTs completely. Whenever exams came around, we couldn't save our study materials offline. I couldn't let students struggle through that. So, I built SuperK. Now, every student can install SuperK and download all their course PDFs with a single click."*
> 
> — **Kabali Gamer**, Creator & Lead Developer of SuperK

#### 4. The 6 Core Features Grid (3x2 Cards)
1. **One-Click Subject ZIP Packaging**
   - *Description:* Why download 30 files one-by-one? SuperK groups all PPTs, Lecture Notes, Lab Manuals, and Question Papers into topic folders (`8. PPTs/`, `6. Assignments/`) and generates an organized `.zip` file instantly.
2. **Smart Automatic Filename Resolution**
   - *Description:* Faculty frequently title every document generically as "PPT" or "Assignment". SuperK automatically inspects the cloud storage slug, detects the real unit name (e.g. `Unit 1 - Graph Theory`), and numbers duplicates neatly.
3. **Paced & Safe Downloads**
   - *Description:* Never trigger browser crashes or cloud rate-limits. SuperK uses an intelligent 350ms throttle queue that guarantees smooth, reliable disk writes.
4. **Zero Account Setup**
   - *Description:* No secondary logins or new accounts. SuperK runs securely in your browser and automatically detects your active classroom session.
5. **100% Private & Client-Side**
   - *Description:* Zero telemetry. Zero analytics. No remote servers. Your authentication tokens and PDF requests never leave your own machine.
6. **Built-in Quick Filter (`⌘K` / `Ctrl+K`)**
   - *Description:* Instant debounced search. Type any unit, topic, or document title to filter through hundreds of classroom documents in milliseconds.

#### 5. Interactive UI Preview Section
- Shows a high-fidelity mock or screenshot of the SuperK extension popup (`extension-test-popup.png`) with annotations pointing to the search bar, topic counters, and download buttons.

#### 6. "How It Works" in 3 Simple Steps
- **Step 1:** Open your Parul University classroom page (`elearning.paruluniversity.ac.in/classrooms/.../student`).
- **Step 2:** Click the SuperK icon in your browser extensions toolbar.
- **Step 3:** Click **"Download All"** to get the entire subject in a neat ZIP, or choose specific files and click **"Selected"**.

#### 7. Official Footer
- **Left:** SuperK logo, copyright `© 2026 SuperK. Created by Kabali Gamer.`
- **Center:** Quick links (`Home`, `Installation Guide`, `Terms & Conditions`, `Privacy Policy`, `Cookie Statement`).
- **Right:** Educational disclaimer line: *"Independent student utility developed for Parul University students. Not affiliated with Parul University or Edorer."*

---

## Page 2: The Creator Story & Mission (`story.html`)

### Purpose
Tells the human story behind the extension, explaining why Kabali Gamer created SuperK, the technical journey, and the dedication to student accessibility.

### Exact Text & Content
- **Page Title:** The Story Behind SuperK
- **Eyebrow:** `ORIGIN & MISSION`
- **Headline (H1):** Why SuperK Was Created
- **Author Byline:** By **Kabali Gamer** · Student Developer & Creator
- **Story Body:**
  > **The Day the Downloads Disappeared**  
  > In October 2026, students across Parul University logged into the elearning portal to prepare for upcoming examinations and assignments. Following a recent LMS platform update, every single direct PDF download link had vanished. 
  > 
  > Lecture presentations, handwritten faculty notes, laboratory manuals, and previous years' question papers were locked inside an embedded viewer (`PdfViewer-*.js`). Students could only read files page-by-page inside the browser tab. Offline study during commute, printing notes, and revising without an internet connection suddenly became impossible.
  >
  > **The Decision to Build a Solution**  
  > Rather than waiting weeks for official fixes, I decided to take action. As a student developer, I knew that the underlying documents were still accessible via authorized API endpoints and cloud buckets. 
  > 
  > I set out to create an extension that would be:
  > 1. Completely effortless for any student to use, regardless of technical background.
  > 2. Fully compliant with browser privacy standards—never collecting user passwords or data.
  > 3. Capable of downloading not just single files, but entire subjects packaged cleanly into ZIP archives.
  >
  > **From Prototype to Official Release**  
  > After reverse-engineering the classroom API tokens and writing custom filename normalization heuristics to fix messy faculty filenames, **SuperK** was born. 
  > 
  > What started as a script to help my classmates is now an official extension available to every student in our university. SuperK is free, open, and dedicated to every student striving for academic excellence.
  > 
  > — **Kabali Gamer**

---

## Page 3: Step-by-Step Installation Guide (`installation.html`)

### Purpose
Provides foolproof instructions with screenshots and troubleshooting for installing SuperK on all Chromium-based browsers (Chrome, Brave, Edge, Opera, Arc).

### Exact Content Structure
- **Page Title:** Installation & Setup Guide
- **Supported Browsers:** Google Chrome, Brave Browser, Microsoft Edge, Opera, Vivaldi, Arc.
- **Section 1: Quick Install via Unpacked Extension (Developer Mode)**
  1. **Download:** Click the `Download SuperK.zip` button from the homepage and unzip the folder to a safe place on your computer (e.g. `Documents/SuperK`).
  2. **Open Extensions Page:**
     - Chrome: Go to `chrome://extensions`
     - Brave: Go to `brave://extensions`
     - Edge: Go to `edge://extensions`
  3. **Enable Developer Mode:** Toggle the **"Developer mode"** switch located at the top-right corner of the page.
  4. **Load Extension:** Click the **"Load unpacked"** button in the top-left corner. Select the unzipped `extension` folder.
  5. **Pin Extension:** Click the puzzle icon in your browser toolbar and click the Pin icon next to **SuperK**.
- **Section 2: How to Use on Parul University LMS**
  - Step 1: Open `https://elearning.paruluniversity.ac.in` and log in with your university credentials.
  - Step 2: Navigate to any enrolled course: `/classrooms/<id>/student`.
  - Step 3: Click the **SuperK** icon in your toolbar.
  - Step 4: All course PDFs will load immediately. Click **Download all** or select individual files!
- **Section 3: Common Troubleshooting (FAQ)**
  - *Q: The popup says "Page bridge is outdated — refresh tab"?*  
    *A:* This happens if you reloaded the extension while the LMS tab was already open. Simply press `F5` / Refresh on your LMS tab and reopen SuperK.
  - *Q: What if a subject has over 150MB of PDFs?*  
    *A:* SuperK has an automatic memory safeguard. If a subject exceeds 150MB, it will automatically switch from a single ZIP file to rapid sequential individual downloads to prevent browser memory crashes.

---

## Page 4: Terms & Conditions (`terms.html`)

### Purpose
Legally protects the developer (Kabali Gamer), sets expectations of academic fair use, disclaims university affiliation, and establishes compliance.

### Exact Legal Text

```markdown
# Terms and Conditions of Use

**Effective Date:** October 17, 2026  
**Product:** SuperK Browser Extension & Official Web Services  
**Author & Developer:** Kabali Gamer

### 1. Acceptance of Terms
By downloading, installing, or using the SuperK browser extension or accessing this website, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, do not install or use the software.

### 2. Purpose and Permitted Use
SuperK is an independent student-developed productivity utility designed solely for enrolled students and instructors of Parul University. The software facilitates authorized, personal offline academic study by allowing users to download educational materials (such as lecture presentations, lecture notes, syllabus briefs, past examination papers, and laboratory guides) that the user is already authorized to access through their university-issued login credentials.

You agree that you will use SuperK solely for personal, non-commercial, educational study purposes.

### 3. Intellectual Property of Course Materials
SuperK does not host, store, mirror, or own any academic content, documents, or course files. All PDFs, lecture notes, assignments, and curriculum materials downloaded via this tool remain the sole intellectual property of their respective authors, faculty members, and Parul University. Users are strictly prohibited from redistributing, commercializing, or publicly broadcasting downloaded academic materials without permission from the copyright owners.

### 4. Non-Affiliation and Disclaimer
SuperK and its developer, Kabali Gamer, are completely independent entities. SuperK is **not** officially affiliated with, endorsed by, sponsored by, or maintained by Parul University or Edorer (platform-api.edorer.com). The names "Parul University" and "Edorer" are used strictly for nominative identification of software compatibility.

### 5. "As Is" Warranty & Limitation of Liability
SuperK is provided "as is" and "as available", without warranty of any kind, express or implied. In no event shall the developer, Kabali Gamer, be held liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use this extension, including but not limited to academic disciplinary actions, platform access interruptions, or data loss.

### 6. Modifications to Service
The developer reserves the right to modify, update, or discontinue SuperK at any time without prior notice to adapt to changes in the university's learning portal architecture.
```

---

## Page 5: Privacy Policy (`privacy.html`)

### Purpose
Provides an unequivocal statement of user privacy, data security, and zero-telemetry operations, essential for Chrome Web Store approval and student trust.

### Exact Policy Text

```markdown
# Privacy Policy

**Effective Date:** October 17, 2026  
**Product:** SuperK (Created by Kabali Gamer)

### 1. Our Commitment to Your Privacy
SuperK was built by a student, for students. We believe privacy is a fundamental right. SuperK operates under a strict **Zero-Data Collection Policy**. We do not collect, store, transmit, track, or sell any personal data, usage metrics, or browsing activities.

### 2. What Information SuperK Accesses & Why
To function, SuperK requires specific browser permissions. Here is transparently how each permission is used:
- **Active Tab (`activeTab`):** Used solely when you click the extension popup to verify that you are currently viewing an authorized Parul University classroom page (`elearning.paruluniversity.ac.in`).
- **Storage (`storage`):** Used entirely locally on your device (`chrome.storage.local`) to cache the list of discovered PDF titles and download progress during your active session. No data is synchronized across external servers.
- **Downloads (`downloads`):** Used solely to save the requested PDF or ZIP files to your browser's local `Downloads/Parul/` folder.
- **Host Permissions:**
  - `elearning.paruluniversity.ac.in`: Required to bridge the active classroom view and breadcrumbs.
  - `platform-api.edorer.com`: Required to read the subject syllabus JSON using your existing, locally-authenticated session token.
  - `*.digitaloceanspaces.com`: Required to download the authorized PDF file buffers from the university's cloud storage.

### 3. Authentication & Credential Security
SuperK **never** sees or stores your password. When you log in to the university portal, your browser creates a local authentication session token in your browser's `localStorage`. SuperK merely passes this existing local token in memory to fetch your enrolled subjects list. Your credentials are never transmitted anywhere other than the official university API.

### 4. Third-Party Analytics and Telemetry
SuperK contains:
- ❌ **No Google Analytics or trackers**
- ❌ **No user fingerprinting**
- ❌ **No ad networks**
- ❌ **No remote logging servers**

All network communication takes place directly and exclusively between your browser and the official university LMS infrastructure.

### 5. Contact
If you have any questions or security disclosures regarding this policy, please reach out to the developer, **Kabali Gamer**, via the official project repository.
```

---

## Page 6: Cookie & Storage Policy (`cookies.html`)

### Purpose
Explains how browser cookies, `localStorage`, and `chrome.storage.local` interact with the extension and the official website.

### Exact Text & Content
- **Page Title:** Cookie & Storage Policy
- **1. Website Cookies:** The official SuperK landing website uses **zero tracking cookies**, no marketing cookies, and no third-party analytic trackers.
- **2. Browser Storage in Extension:**
  - `chrome.storage.local`: SuperK saves temporary session keys (`pu_items`, `pu_current`, `pu_classroomId`) exclusively in your browser's isolated local storage so the popup renders instantly without re-fetching data every second.
  - `localStorage` Interaction: SuperK reads the university's existing authentication session (`edorer.auth.session`) in read-only mode to authenticate API requests on your behalf. SuperK never writes to or modifies your portal storage.
- **3. How to Clear Stored Data:** You can clear cached data at any time by right-clicking SuperK in your extensions toolbar and choosing "Remove from Chrome", or clicking "Rescan" inside the popup.

---

# SECTION 3: Required Changes Inside the Extension Itself

To make the extension look and function as an official product, the following additions must be made inside the `extension/` folder:

### 3.1 `extension/manifest.json`
Update manifest metadata to official status:
- `"version": "1.0.0"`
- `"author": "Kabali Gamer"`
- `"homepage_url": "https://kabali-gamer.github.io/superk"` (or designated official web page)
- Add `"options_ui"` pointing to `options.html` (`"open_in_tab": true`)
- Official description: `"SuperK Official — Created by Kabali Gamer. Seamlessly list and bulk-download PDFs from Parul University elearning classrooms."`

### 3.2 In-Popup "About & Official Information" Modal (`extension/popup.html`)
1. **Masthead Attribution Badge:**
   - Under the title `"Grab every PDF, beautifully."`, add an eyebrow tag:
     `<div class="author-tag">Created by <b>Kabali Gamer</b></div>`
2. **Masthead Info Button:**
   - Add an SVG info icon button (`#openAbout`) in the masthead row next to the PDF counter.
3. **In-Popup Slide-up Modal (`#aboutModal`):**
   - Contains:
     - SuperK vector logo + `SuperK Official v1.0.0`
     - Quotation from Kabali Gamer on why the extension was made.
     - Quick bullet points: Features, Privacy Guarantee, Terms of Use.
     - Buttons: `[ Open Full Official Web Guide ]` and `[ Close ]`.

### 3.3 Dedicated In-Extension Guide / Options Page (`extension/options.html`)
Provides an offline-accessible version of the official documentation, complete user guide, Terms of Service, Privacy Policy, and creator attribution. Accessible via right-click on the extension icon -> **"Options"**.

### 3.4 Official README (`extension/README.md`)
Restructured to feature:
- Official SuperK banner and badge list (`v1.0.0`, `Manifest V3`, `Parul Elearning`, `Created by Kabali Gamer`).
- The Origin Story quotation.
- Clear installation instructions for non-technical students.
- Links to `terms.html` and `privacy.html`.

---

# SECTION 4: Summary Table of Deliverables

| Deliverable | Target File Location | Core Purpose |
|---|---|---|
| **Specification Document** | `document/SUPERK_OFFICIAL_SPECIFICATION.md` | Complete reference guide for all web pages and extension features |
| **Main Landing Page** | `official/index.html` | Official homepage, hero, features, download buttons, creator quote |
| **Creator Story Page** | `official/story.html` | Full backstory of Kabali Gamer and the college website update |
| **Installation Guide** | `official/installation.html` | Step-by-step browser setup guide with troubleshooting |
| **Terms & Conditions** | `official/terms.html` | Academic fair use terms, disclaimer, and non-affiliation |
| **Privacy Policy** | `official/privacy.html` | Zero-telemetry policy, permissions explanation |
| **Cookies Policy** | `official/cookies.html` | Transparent local storage and session explanation |
| **Extension Options UI** | `extension/options.html` | In-extension full settings, manual, and legal pages |
| **Extension Popup Polish** | `extension/popup.html/css/js` | "Created by Kabali Gamer" tag, Info modal, and versioning |
| **Manifest Upgrade** | `extension/manifest.json` | v1.0.0, author metadata, options page registration |
