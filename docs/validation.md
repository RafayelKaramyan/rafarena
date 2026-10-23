# Validation record

Released on 24 October 2026 (Asia/Yerevan).

- Live app: https://rafayelkaramyan.github.io/rafarena/
- Verified application commit: `8cfc37f192a46b36acf3fe24e35b51edda3a248b`.
- Passing verification and Pages deployment: https://github.com/RafayelKaramyan/rafarena/actions/runs/40019227628
- **32 unit/integration tests and 41 browser cases passed**, with no retries or skipped cases.

## Executed locally

- Pinned dependency installation completed.
- Strict TypeScript passed.
- 32 replay, portable-view and IndexedDB integration tests passed. They cover absolute seeks, ball keys, field bounds, clock/loop behavior, URL validation, private-note exclusion, durable records, concurrent inserts and unreadable-record retention.
- The production build passed, including the final rendering and interface refinements.
- Managed Chrome preview opened and its tactical fallback was visually inspected. This browser does not expose WebGL.
- Created “The pocket before the pass” with an observation, navigated to Saved views, reloaded, and visually verified the same view and note.
- Corrected identifier generation for the HTTP preview, where `crypto.randomUUID` is unavailable. HTTPS and a non-secure-context fallback now produce valid record identities.

## Executed browser coverage

The application suite passed all 13 cases in Chromium, Firefox and Pixel 7 emulation, for 39 cases. It covers navigation/reload, transport, layer/camera/player choices, library filters, saved-view creation/edit/removal and time retention, snapshot links, actual PNG bytes, unavailable WebGL, rejected writes, modal focus, reduced motion, compact layouts and representative axe scans. The scans cover the explorer, moment library, empty saved collection and save dialog. They are automated representative checks, not accessibility certification.

A separate Chromium project passed both software-WebGL cases. It exercised the actual Three.js stadium, all four camera presets, deliberate playback, a real 3D PNG download and WebGL context-loss recovery. The 3D download passed PNG-signature, width and byte-length assertions. The tactical PNG passed signature and exact 1920 × 1200 assertions in all three application profiles.

The 1440px 3D captures and 320px/768px layout captures were downloaded from that passing run and visually reviewed. The review included the broadcast and top-down views, complete mobile page flow, player selection, transport and the filmstrip. Mobile stadium framing keeps the field within the narrow viewport.

The runner is pinned to Ubuntu 24.04 because Playwright 1.56.1 did not support the newer `ubuntu-latest` runner image. An earlier browser run exposed the mobile save button's missing accessible name and insufficient contrast on preset numbers; both were corrected before the passing release.

## Published app verification

Opened the public HTTPS demo after the successful Pages deployment. This managed browser does not expose WebGL, so its live review exercised the complete tactical fallback; actual 3D rendering was verified separately by the software-WebGL project above.

- Sought to 9,990 ms with the native range keyboard controls, selected Top-down, Player runs and #10 L. Moreau, and saved “The space after the release” with an observation.
- Navigated to Saved views and reloaded. The title, complete observation, camera and timestamp remained available. Reopening the perspective restored the 9,990 ms state, selected player and layers.
- Opened the share dialog. Its URL contained moment, time, camera, layers and player, and excluded the private title and observation.
- Downloaded a real tactical PNG from the public app. The downloaded file was 1,262,168 bytes, had a PNG signature and decoded to 1920 × 1200 pixels.

## Retained captures

- [Three.js broadcast view](screenshots/explorer-3d.webp)
- [Three.js top-down view](screenshots/top-down-3d.webp)
- [320px full-page view](screenshots/explorer-mobile.webp)
- [Saved observation after public reload](screenshots/live-saved-view.webp)

The screenshots are actual application captures. The 3D and mobile images come from the passing browser run; the saved-view image comes from the public app. Browser artifacts are retained by GitHub for seven days; these selected captures remain in the repository.

## Limits

No physical-device GPU session, Safari session, assistive-technology review, field Core Web Vitals, external performance benchmark or full accessibility certification has been performed. The replay movements and football data are fictional. Browser storage is local and may be cleared or evicted. Notes are not a cloud backup.
