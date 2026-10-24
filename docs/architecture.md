# Architecture

## One replay, two renderers

`src/domain/match.ts` defines a 105 × 68 metre pitch, twenty-two player identities and six authored ball/player sequences. `evaluateFrame` clamps an absolute timestamp, selects its ball segment, interpolates player positions and evaluates the flight height. Repeated forward/reverse seeks produce the same frame. Match time and the visible sequence metrics derive from this data.

`src/domain/replay.ts` owns the playback clock. Render callbacks receive every animation frame; React subscribers are notified at most every 50 ms, plus explicit actions. A bounded elapsed step avoids a large jump after a scheduling stall. The application pauses on visibility changes and when leaving the replay room.

`src/scene/engine.ts` owns the imperative Three.js scene and OrbitControls. Its dynamically imported module creates the stadium, reusable player geometry and retained overlays. Seats are instanced; texture, geometry and material disposal uses sets to release shared resources once. ResizeObserver updates the camera and drawing buffer. Idle scenes render only when needed. Pixel density is capped at 1.75 on wider stages and 1.25 on compact stages; shadows are disabled on smaller stages.

`src/ui/Stage.tsx` handles renderer lifecycle and context loss. An unavailable WebGL context preserves the complete application with `FlatPitch`, the same frame evaluator rendered as authored SVG. The SVG pitch remains usable for replay, player focus, overlays, saving and export. Camera presets remain part of the saved state for a future WebGL session; the tactical fallback itself is top-down.

## Perspectives and persistence

`src/domain/views.ts` validates moments, times, player identities, camera presets, camera pose bounds and saved text. Snapshot URLs store the scene state and omit private notes. Invalid links recover to a known opening perspective with an explicit message.

`src/storage/views.ts` stores each perspective independently in IndexedDB. Transactions commit a put or delete for one identity without replacing the entire collection. Concurrent inserts from two tabs retain both records. Updating the same record is last-committed-write, not a collaborative merge. BroadcastChannel announces collection changes. Validation failures preserve unreadable records; there is no automatic reset.

`src/storage/useViews.ts` loads and refreshes the collection. The saved-view form reports errors and retains entered text until a successful commit. The user can retry unavailable storage, share a perspective link without saving, or continue exploring.

## Interface

Hash routing keeps direct GitHub Pages links functional. The editorial homepage, journal index, four complete articles, playbook index, three guided studies and project perspective surround the replay explorer, searchable moment library and saved-view collection. The canonical replay path is `/explorer`; earlier `/?moment=...` snapshots continue to open the explorer. Stored records retain their schema and identity.

`src/content/editorial.ts` owns typed story and guide content. A guide's `guideView` produces a validated replay state for each checkpoint. Both its static tactical illustration and its link to the live replay use that same state. Article reading-time estimates derive from paragraph word counts. The journal filters locally by category and text; the header search indexes stories, guides and authored replay descriptions together.

`src/ui/SiteChrome.tsx` provides common navigation, mobile navigation, search and the footer. `src/world.css` owns the light editorial palette, photographic layouts and large display type. The replay room retains its night palette. Native dialogs contain focus and restore the opening control. Focus view contains keyboard navigation and temporarily makes surrounding content inert. The player menu provides a keyboard alternative to raycasting and SVG pointer selection.

The replay starts paused. CSS and camera transitions respect reduced motion. A selected player, transport controls and layer choices remain available in both renderers. PNG export captures only the pitch image, not private notes or application chrome.

## Media and loading

Six optimized, self-hosted WebP photographs total 1,253,008 bytes; their sources and photographer credits are in `docs/photo-credits.md`. The hero loads eagerly with high fetch priority, while secondary editorial images use native lazy loading and explicit dimensions. These real editorial photographs are separate from the fictional replay data.

`StadiumTeaser` waits until its section approaches the viewport before mounting `Stage`. Its camera controls use a local viewing state. Entering the replay room captures that state and the actual orbit pose. Its PNG action uses the same stage export API as the full explorer. It releases its replay subscriptions when unmounted. This is a loading strategy, not a measured Core Web Vitals claim.

## Deployment

GitHub Actions installs from the pinned lockfile, checks strict types, runs unit/database tests, checks formatting, builds, then exercises Chromium, Firefox, Pixel 7 emulation and a dedicated software-WebGL project. The tested `dist` is the Pages artifact. There are no runtime secrets, external APIs or paid services.
