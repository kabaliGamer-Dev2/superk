# SuperK — Created by Kabali Gamer

One-click PDF + ZIP downloads for Parul University elearning classrooms, plus its official website.

**Live site:** https://superk-official.web.app · **Feedback:** https://superk-official.web.app/feedback.html

## What it does

After the LMS update removed direct download links, SuperK gives them back:

- Lists every PDF in the open subject, grouped by topic, in syllabus order
- Resolves generic faculty titles ("PPT", "Assignment") into real unit names with duplicate numbering
- Packs whole subjects into one ZIP with topic folders (150MB cap, automatic per-file fallback past it)
- 100% client-side — zero telemetry, session tokens never leave the browser

## Install (30 seconds)

1. Download [`official/releases/superk-1.0.0.zip`](official/releases/superk-1.0.0.zip) and extract it
2. `chrome://extensions` → Developer mode ON → **Load unpacked** → pick the `extension/` folder
3. Open any `elearning.paruluniversity.ac.in/classrooms/…/student` page → click the SuperK icon → **Download all**

Full guide with troubleshooting: [`official/installation.html`](https://superk-official.web.app/installation.html)

## Repo map

| Path | Purpose |
|---|---|
| `extension/` | MV3 extension (popup, bridge, ZIP pipeline, options page) |
| `official/` | 7-page static site (deployed to Firebase Hosting) |
| `brand/` | Final logo kit (SVG masters + transparent PNGs) |
| `document/` | Spec + full project report |
| `firebase.json` / `firestore.rules` | Hosting + database rules for `superk-official` |

## Deploy the site

```powershell
firebase deploy --only hosting            # site
firebase deploy --only hosting,firestore:rules   # site + rules
```

## Legal

Independent student utility by **Kabali Gamer**. Not affiliated with Parul University or Edorer. Downloads are for personal, non-commercial study only — course materials remain their authors' property. Full text: [Terms](https://superk-official.web.app/terms.html) · [Privacy](https://superk-official.web.app/privacy.html) · [Cookies](https://superk-official.web.app/cookies.html).

## License

MIT — see [`LICENSE`](LICENSE). The license covers the source code only.
