# Changelog

All notable changes to **SuperK** are documented in this file.
Format inspired by [Keep a Changelog](https://keepachangelog.com/), versioning follows [Semantic Versioning](https://semver.org/).

## [1.0.0] — October 2026

First public release.

### Added
- **One-click subject ZIP packaging** — every topic (PPTs, assignments, lecture notes, question banks, previous papers, lab manuals) sorted into folders (`8. PPTs/`, `6. Assignments/`, …) and packaged into a single `.zip`.
- **Automatic subject detection** from the open classroom breadcrumb — no subject picking, no configuration.
- **Smart filename resolution** — storage slugs and generic titles ("PPT", "Assignment") are resolved into real unit names, with numbered duplicates.
- **Paced download queue** — 350ms throttle between files, with a ~150 MB memory ceiling for single ZIPs; larger subjects fall back to individual downloads.
- **Instant quick filter** (`Ctrl+K` / `⌘K`) across hundreds of classroom documents.
- In-popup **topic counters**, per-file download, **Select all**, **Clear**, and **Rescan**.
- 100% client-side processing — no telemetry, no analytics, no accounts, no servers of our own.

### Notes
- Desktop Chromium browsers only: Chrome, Brave, Edge, Opera, Arc (Manifest V3).
- Works only with the Parul University elearning portal.
- Side-loadable from the website: <https://superk-official.web.app>
