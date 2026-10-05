# Historical delivery: photographic frame sequence

The soil animation in this report was superseded on 5 October 2026 by the user's center-opening curtain direction. See [REPORT-CURTAIN.md](REPORT-CURTAIN.md) for the current implementation and evidence. Frame-cache and frame-lag results below apply only to the earlier sequence.

Implemented the approved audit corrections on 4 October 2026. Production preview: http://127.0.0.1:4173/. React/TypeScript frontend on Node 26.9.0, using fictional public records.

## Corrections delivered

Scene, posters and clean plate use proportional contain-fit geometry, bounded to 1920px on desktop. The cropped transparent yam uses the same geometry and one uniform scale. Browser checks align starting/destination bounds within 2 CSS pixels. The harvest heading, explanation, fields and action stay left; the yam occupies the right column. Handoff phases are a 0–12% hold, 12–90% move and 90–100% stable destination. The matching clean Blender plate preserves the environment as its section naturally leaves the viewport. Reverse restores the same exclusive subject ownership. Early full-scene fading, independent horizontal/vertical stretch and compensating batch-text panels were removed.

The frame player distinguishes requested/rendered indices, loading state, relevant pending/failed candidates and sequence/completed-poster presentation. Exhausted current candidates select the completed poster even with old cached frames. Reverse restores valid cached artwork even when the bitmap is unchanged. Evicted/stale bitmaps are closed, and hidden/offscreen suspension and unmount cancellation remain.

The latest feedback pass also gates transfer on successful decoding of the clean plate, overlay and destination. Pending/failed artwork keeps the completed scene and a static destination; a failed cutout leaves a completed photograph rather than a broken-image box, including portrait and reduced motion. Artwork finishing midway cannot insert a moving subject; reverse to the boundary permits the next passage to animate. Rapid Back now observes the current route's mounted scene and section sizes, reconciles layout changes until user scrolling takes ownership, and retains semantic snapshots across native link/history navigation. Hero layer loading no longer rebuilds the pinned story.

Per the user's latest screenshot feedback, the desktop pin now travels 2.4 available viewport heights: arrival 0–12%, descent to covered soil 12–38%, covered-soil hold 38–50%, reveal 50–85%, completed-reveal hold 85–100%. The transfer's measured start cannot precede pin completion. The soil/reveal holds are scroll-driven and reversible, without timed automatic advancement. Motion-off remains complete and immediately readable.

Back stores the originating link/input/section, viewport-relative position, scroll, width, height and motion/pin mode. Unchanged geometry restores the saved scroll; changed geometry brings the originating control beneath the header. Font readiness and refreshed pin measurements replace fixed reconciliation timers. Explicit anchors and subsequent user scrolling retain priority. Mid-pin motion changes preserve the visible chapter after refresh.

Shared layout attributes control desktop/tablet/phone CSS. Story trigger ranges, phases, easing, scene limits, scrims and key layout dimensions live in `src/constants/site.ts`; unused story tokens were removed. `src/constants/storyAssets.ts` is generated from originals and shared by runtime/verification. It contains exact frame filenames/counts, dimensions, byte totals, normalized alpha bounds and attachment coordinates.

## Story and tools

The six approved chapters remain: immediate lookup → sample farm → underground discovery → harvest record → recorded handoffs/QR → cooperative and farms. Guided chapters preserve utility navigation. Device families remain parallax, expanding farm photograph, camera descent with a short desktop pin, subject transfer, SVG connector and stable close. The underground reveal remains the peak; historical fingerprint rows are retained because this corrects the same design.

Blender 5.2.2 LTS exported the exact-camera clean plates from retained editable scenes. This is photographic **2.5D**, using textured depth cards. Relative texture paths were verified; the reproducible renderer now exports the clean plates and keeps references relative. Sharp encodes original PNGs and measures alpha bounds. GSAP/ScrollTrigger/useGSAP owns scoped motion; Canvas/ImageBitmap owns bounded loading/disposal. Playwright/Vitest/Axe check real outcomes. FFmpeg creates recording review sheets. No new animation library or image generation was required.

## Final production verification

- 30 unit tests passed, including proportional geometry. Lint passed without warnings. Production build passed.
- Full regression passed at 1440×900, 1920×1080, 2551×1260, 3440×1440, 1086×900, 834×1194, 390×844 and 360×640. Six samples per region verify camera progression/reversal, bounded caches, lookup clearance, complete content and motion preferences. `verification/report.json` records 290 observations and zero browser errors.
- Correction checks capture 48 handoff states. Desktop assertions cover start/end bounds within 2px, uniform subject proportions, exclusive overlay/destination ownership and no batch-text overlap. Narrow layouts preserve portrait/stable presentation. All eight contact sheets and intermediate states were visually inspected.
- Early frames loading followed by frames 12 onward failing correctly displays the completed poster with the old cache retained; reverse restores cached sequence frames. Complete failure, an isolated missing frame and delayed unmount disposal also pass. All three delayed bitmaps were closed.
- Back checks pass after height-only changes, width changes, crossing the minimum pin-height threshold and changing motion preference on a detail page. Explicit lookup navigation, delayed fonts, focused lookup, short landscape and mid-scene motion changes are covered.
- Lookup, public routes/direct refresh, catalogue/recovery, member dialog/focus, QR SVG/PNG decoding and scanner recovery/cleanup pass. ZXing camera tests use simulated video streams.
- Native Chrome 200% zoom passes reflow, overflow, lookup, menu/dialog focus and completed roots.
- Nine full-regression Axe scans and two intermediate handoff scans report zero violations. Latest composited contrast: 95 visible samples pass; 64 outside-reading-area samples are excluded. Automated results supplement visual review.
- `verification/corrections.json` measures requested/rendered frame lag, frame-change intervals, pending requests, cache size and long tasks during the active reveal, separately from intentional reading holds. Latest maximum observed lag: four desktop frames / one portrait frame; maximum frame-change intervals: 113.8ms / 151.6ms; no observed long tasks. These include loading/quantization and are development observations, not a hardware certification. Cache maxima remain eight/six, with up to three relevant pending requests.
- Fresh desktop/phone reading-paced, fast and full reverse recordings are retained. Reading passes include covered-soil and completed-reveal pauses on desktop. Reverse covers the complete underground-to-record transition. Exact durations are in `verification/recordings.json`.
- `verification/feedback/results.json` adds clean/cutout failure at five forward/reverse positions each, portrait/reduced cutout fallback, delayed decoding without a mid-transfer pop followed by reverse recovery, 12 rapid Back cases without a settling sleep, and eight soil/reveal/departure checkpoints. Changed height, width, motion, cold route loading and delayed hero artwork are included. All pass with zero page errors. Subsequent position checks detect late rewinds rather than accepting a briefly correct restoration.

## Visual review and limits

Intended curve: curiosity/control → connection → wonder → understanding → clarity/trust → confidence. The corrected compositions preserve usable lookup, an identifiable farm, connected underground discovery, unobstructed crop-to-record association, readable history and complete closing choices. Reverse restores the same crop without duplication. The ending stays visible. This is implementation review; unfamiliar-reader comprehension review remains pending.

Review caught a collapsed mobile frame width and a mid-motion refresh jump during this pass. Both were repaired and the final production checks rerun. Wide layouts retain the full composition and soil surroundings; desktop detail uses the original 1280px renders rather than enlarging the former 960px delivery files.

Desktop: 60 frames, 1280×720, WebP quality 68, exactly 7,897,632 bytes. Portrait: 40 frames, 480×640, 2,689,918 bytes. Residency: eight desktop / six portrait bitmaps and three concurrent requests. This is approximately 29.5MB / 7.4MB of decoded RGBA frames; Canvas, DOM images and compressed browser caching are additional allocations. Original PNGs and Blender files stay outside public delivery. Opening image totals include below-fold preload/lazy loads; exact observed resources are in `verification/report.json`.

Physical iPhone/Android camera, keyboard, touch, browser-toolbar and low-memory checks remain pending, as do ordinary-laptop profiling and independent comprehension review. The prototype contains no authentication, protected portal, API or database. Presentation and proposal files were not changed.

## Reproduce

Edit public copy/colors/data/runtime motion in `src/constants/site.ts`. Camera/asset-production changes require Blender regeneration, then `npm.cmd run assets:story`. Run tests, lint, build and the browser/contrast/lifecycle/correction/handoff scripts against the production preview. Record with `scripts/record-story.mjs`, then inspect FFmpeg sheets from `scripts/review-story-recordings.mjs`. README and `design/assets/story/PRODUCTION.md` document the retained sources and workflow. `verification/final-build.json` identifies the tested production bundle and hashes the final evidence reports.
