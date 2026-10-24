# Code walkthrough

## Trace a story into a replay

Start in `src/content/editorial.ts`. Each story has a route, credited photograph, readable sections and an authored moment to explore. `Journal` filters the collection; `Article` renders the full story and its in-page contents. The replay action calls `encodeView`, which creates the canonical `/explorer` snapshot URL without a private note.

Follow a playbook checkpoint next. `guideView` combines the guide's moment, timestamp, camera, selected player and overlays into one state. The tactical diagram and “Open this frame in 3D” action consume that same state. This keeps a content page connected to working application behavior rather than a decorative diagram.

## Explain the visual and loading decisions

The main site uses an original image-led football editorial direction: a campaign opening, asymmetric photo stories, an interactive replay section, guided studies and complete articles. A common header, mobile menu, unified search and footer connect the pages. The replay room's separate night palette helps distinguish focused exploration from reading.

Photography is bundled locally with credits. Secondary photos load lazily; the homepage stadium mounts near the viewport, then the renderer imports its Three.js engine. `world.css` contains the editorial layouts, responsive behavior and reduced-motion rules. The project has no runtime stock-photo API, analytics service or account dependency.

## Start with a football moment

Open `src/domain/match.ts` and find `between-the-lines`. Its ball keys have absolute millisecond positions; its player runs specify a starting and finishing point. Change a key and both renderers and the thumbnails consume that same change. Explain why `evaluateFrame` accepts time directly: a seek, reload or slower device must not change the underlying sequence.

The scenarios illustrate football ideas rather than reproduce real tracking data. The pass into the pocket draws a holding midfielder; the forward run attacks space behind the line. Other sequences demonstrate width, transition, pressing, a delayed corner run and an overlap. The positioning is authored and simplified, not an offside or physics engine.

## Trace play and seek

Follow `Replay.play`, `tick` and `seek` in `src/domain/replay.ts`. The stage subscribes to frame callbacks, while the React timeline reads a slower external-store snapshot. The selected speed scales elapsed time. Looping retains overshoot; disabling it stops at the exact end. Visibility and route changes pause playback deliberately.

## Follow a camera change

`Explorer` changes the selected preset. `StadiumEngine.setView` updates a target position and look target; `render` interpolates them and requests further frames while the camera is moving. In free-orbit mode OrbitControls owns the angle, and `getPose` captures its real position and target for a snapshot. Resource cleanup removes listeners, observers, controls and shared GPU resources.

## Trace a saved perspective

The save action reads the current time and orbit pose, then opens `ViewForm`. Validation checks the whole record before IndexedDB writes it. The form closes only after success. Reopen a saved perspective and its URL restores the exact timestamp, selected player, layers and camera. Notes remain browser-local and are never inserted into a shared URL.

## Discuss the tradeoffs

- The complete SVG path keeps a usable experience on browsers without WebGL, while the 3D engine loads separately.
- Per-record IndexedDB transactions prevent independent new views from overwriting each other. Concurrent edits to the same existing note still use last-committed-write behavior.
- Instanced seats, reused geometry, capped pixel density and demand rendering control rendering cost; they are not a measured performance guarantee.
- A PNG is a single rendered frame. A snapshot link stores parameters for an authored scene. Neither is a video or real match recording.
- The public project needs no backend or paid service. Authentication, cloud notes, external match tracking and physical-device benchmarks are outside this release.
