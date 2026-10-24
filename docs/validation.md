# Validation record

Editorial redesign released on 24 October 2026 (Asia/Yerevan).

- Live app: https://rafayelkaramyan.github.io/rafarena/
- Verified and deployed application commit: `4c9ac35c7b617ba493a8081bcaf2025fc168eb4c`.
- Verification and Pages workflow: https://github.com/RafayelKaramyan/rafarena/actions/runs/40125142444

**36 unit/integration tests and all 62 browser cases passed**, with no retries or skipped cases. The Pages deployment completed successfully from that same tested application commit.

## Executed locally

Strict TypeScript, formatting, all **36 unit/integration tests** and the production build passed. The content tests cover story destinations, local photographs and all nine guide checkpoint states, including validation and URL round trips. The original replay, portable-view and IndexedDB integration coverage is retained.

The production build emits a separate Three.js engine chunk. Six optimized, self-hosted WebP photographs total 1,253,008 bytes; their sources are recorded in the [photography credits](photo-credits.md). These are file sizes and loading decisions, not measured field performance.

The managed Chrome preview was visually reviewed at the campaign opening, asymmetric story grid, interactive replay section, journal and guided study. This managed browser does not expose WebGL, so it uses the functional tactical fallback.

## Browser matrix and scope

The suite contains the original 13 replay cases plus seven editorial cases, in Chromium, Firefox and Pixel 7 emulation. Two further Chromium cases exercise the actual Three.js renderer through software WebGL. Tests run against the production build with no retries.

The editorial cases cover:

- Real campaign image loading, the story destination and its replay action.
- Category/text filters, empty results, reset, complete articles, contents focus and direct reload.
- Unified search across stories and guides, empty-state recovery, result navigation, Escape and return focus.
- A selected guide checkpoint carried into the replay at 3,600 ms with player h10, tactical camera and pitch-thirds overlay.
- Earlier `/?moment=...` snapshot compatibility and canonical `/explorer` share URLs.
- Editorial pages at 320px and 768px and usable mobile navigation.
- Representative axe scans of the home, journal, article, guide, About page and search dialog, plus reduced motion.

The retained replay cases cover transport, independent layers/cameras/player choices, library filters, saved-view create/edit/remove and exact time retention, snapshot links without private notes, real PNG bytes, unavailable WebGL, rejected writes, dialog focus, compact layouts and representative accessibility scans.

The dedicated WebGL cases cover the procedural stadium, all four camera presets, playback, a real 3D PNG and WebGL context-loss recovery. The tactical PNG checks assert the PNG signature and exact 1920 × 1200 dimensions. Representative axe scans are automated checks, not accessibility certification.

The passing run executed all 20 application/editorial cases in each of Chromium, Firefox and Pixel 7 emulation, plus both dedicated software-WebGL cases. The 320px and 768px home/guide captures and actual Three.js broadcast and camera captures were downloaded and visually reviewed.

The first redesign run found decorative mobile-menu numbering included in link names, an unlandmarked announcement and an inline author link without a non-color distinction. The journal card uses a second-level heading under the page title, and article contents use a named navigation landmark. The menu numbers are now hidden from the accessibility tree, the announcement has a named region and the author link is underlined. No axe rules were excluded.

## Public deployment review

Opened the public HTTPS app after the successful deployment and verified the new title, campaign photograph, navigation and content.

Before deployment, saved “The pocket before the pass” at 3,600 ms with the Broadcast camera and ball-path overlay in the previous public release. Its complete observation was “Watch Moreau before the pass. Follow the space behind the holding midfielder.” Reloading the same Saved views page after deployment retained the title, complete observation and scene. Opening it restored 3,600 ms, Broadcast and ball path through the new canonical replay URL.

Used the public header search to find “Find the pocket”, opened the guide, selected checkpoint 02 and entered the replay room. It restored 3,600 ms, Top-down, player h10 and all three analysis overlays.

This managed live browser uses the complete tactical fallback because WebGL is unavailable in its environment. Actual Three.js rendering was exercised in the separate passing software-WebGL cases above.

## Retained captures

- [Published editorial homepage](screenshots/editorial-home.webp) — actual public browser viewport.
- [320px campaign homepage](screenshots/editorial-mobile.webp) — passing browser run.
- [320px full guided study](screenshots/playbook-mobile.webp) — passing browser run.
- [768px full guided study](screenshots/playbook-tablet.webp) — passing browser run.

Selected repository captures persist beyond GitHub's seven-day browser-artifact retention. They are actual application captures; the source photographs have separate credits.

## Original replay release

The earlier replay-only release was verified at `8cfc37f192a46b36acf3fe24e35b51edda3a248b`, with **32 unit/integration tests and 41 browser cases** in [workflow 40019227628](https://github.com/RafayelKaramyan/rafarena/actions/runs/40019227628). Its public review verified a saved observation at 9,990 ms after reload, exact restored camera/player/layers, private-note exclusion from the share link and an actual 1,262,168-byte, 1920 × 1200 tactical PNG. The full earlier record remains in [the previous release documentation](https://github.com/RafayelKaramyan/rafarena/blob/4bcad99ea330e5e5106a9fb6cca4de3e79697d97/docs/validation.md).

## Limits

No physical-device GPU session, Safari session, assistive-technology review, field Core Web Vitals, external performance benchmark or full accessibility certification has been performed. Teams, statistics and replay movements are fictional. Browser storage can be cleared or evicted; notes have no cloud backup. The real editorial photographs do not imply that their subjects or visible brands are project partners.
