# Third-Party Notices

SuperK's extension bundles the following third-party software. These notices are kept to satisfy the licenses of those projects.

## JSZip v3.10.1

- Homepage: <http://stuartk.com/jszip>
- Copyright (c) 2009-2016 Stuart Knightley
- Dual licensed under the **MIT License** or **GPLv3** — SuperK uses it under the **MIT License**.
- Full license text: <https://github.com/Stuk/jszip/blob/main/LICENSE.markdown>

JSZip itself incorporates **pako** (<https://github.com/nodeca/pako>), used under the MIT License.

---

## Website (`official/`)

### qrcode-generator v1.4.4

- Homepage: <http://www.d-project.com/>
- Copyright (c) 2009 Kazuhiko Arase
- Licensed under the **MIT License**
- Source: <https://github.com/kazuhikoarase/qrcode-generator>
- Vendored at `official/assets/qrcode.min.js`

Used only by `coffee.html` to generate the UPI QR code for the amount a visitor
selects. It is bundled locally rather than loaded from a CDN, so the donation
page makes no third-party requests and no payment page depends on an external
host staying up. Not shipped in the extension.

---

All other code in this repository is original work by **Kabali Gamer** and is licensed under the MIT License — see [LICENSE](LICENSE).
