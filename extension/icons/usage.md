# SuperK logo — usage

Mark: **Orbit K** — monoline K inside a super-orbit ring.
Colors: Charcoal `#2A2529` on Pale Ivory `#F3F0E7` (or any light ground).

## Files (`extension/icons/`)
| File | Use |
|---|---|
| `superk-final.svg` | Master (charcoal on transparent) |
| `superk-color.svg` | Same as master, wired as canonical color |
| `superk-black.svg` | One-colour black (print, fax, single-ink) |
| `superk-white.svg` | Reversed (dark grounds, footer bar) |
| `superk-small.svg` | Small-size cut — heavier ring/K, use as source under 32px |
| `superk-16/48/128.png` | Transparent PNGs, exact px, wired in `manifest.json` |
| `favicon.ico` | Browser-tab icon (from 48px) |
| `preview.html` | Render rig used to mint the PNGs (headless screenshots) |

## Rules
- Clear space: height of the ring stroke on all sides. Minimum: 16px digital.
- Approved grounds: transparent, Pale Ivory, white, Charcoal (use `superk-white.svg`).
- Never: gradients, shadows, rotation, recoloring outside the palette, placing
  charcoal version on dark grounds, redrawing the K with another typeface.
- Wordmark (popup header, docs): **Poppins 800**, "SuperK". Never set the wordmark
  in another family next to the mark.

## Honesty notes
- No trademark search done — run one before store publication.
- PNGs are headless-browser screenshots of the vector masters (no SVG renderer
  on this machine), verified exact-size + RGBA. Eyeball the 16px toolbar icon
  once before release.
