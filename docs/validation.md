# Validation record

Status: implementation and local checks completed; browser matrix and public deployment are pending.

## Executed locally

- Pinned dependency installation completed.
- Strict TypeScript passed.
- 32 replay, portable-view and IndexedDB integration tests passed. They cover absolute seeks, ball keys, field bounds, clock/loop behavior, URL validation, private-note exclusion, durable records, concurrent inserts and unreadable-record retention.
- The production build passed, including the final rendering and interface refinements.
- Managed Chrome preview opened and its tactical fallback was visually inspected. This browser does not expose WebGL.
- Created “The pocket before the pass” with an observation, navigated to Saved views, reloaded, and visually verified the same view and note.
- Corrected identifier generation for the HTTP preview, where `crypto.randomUUID` is unavailable. HTTPS and a non-secure-context fallback now produce valid record identities.

## Prepared browser coverage

The application suite covers navigation/reload, transport, layer/camera/player choices, library filters, saved-view creation/edit/removal and time retention, snapshot links, actual PNG bytes, unavailable WebGL, rejected writes, modal focus, reduced motion, compact layouts and representative axe scans. It is configured for Chromium, Firefox and Pixel 7 emulation.

A separate Chromium project uses software WebGL to verify the actual Three.js stadium, camera controls, playback and WebGL context-loss recovery. Passing these cases must be confirmed from the workflow logs; configured coverage is not a passed result.

## Limits

No physical-device GPU session, Safari session, assistive-technology review, field Core Web Vitals, external performance benchmark or full accessibility certification has been performed. The replay movements and football data are fictional. Browser storage is local and may be cleared or evicted. Notes are not a cloud backup.
