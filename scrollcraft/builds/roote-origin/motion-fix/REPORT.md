# Root reveal and member navigation corrections

Implemented and verified on 4 October 2026 against the production preview at http://127.0.0.1:4173/.

## Root discovery

The soil now lifts upward within the underground section rather than tracking the bottom of the viewport. A fixed photographic alpha mask preserves the uneven soil surface; a small SVG mask softens and varies the moving lower edge. The soil actually conceals part of the yam while onscreen, then clears it. The timeline settles at least 32px before maximum scroll. No pinning, extra scroll spacer or wheel interception was added. Text and the cooperative link remain stationary; reduced motion exposes the complete roots immediately.

All reveal thresholds and the final hold are editable in `MOTION.rootReveal` in `src/constants/site.ts`. Mask paths are in `ASSETS`. The existing connected plant geometry is retained.

The regression test compares artwork with the cover present and hidden at the same settled scroll position. It excludes text antialiasing and negligible compositor rounding. Peak meaningful coverage was 7.36% of the viewport on desktop, 8.42% on wide desktop, 6.10% at reference width, 4.56% on tablet, 3.46% on phone and 2.62% on compact phone. Coverage is zero at the final sampled frame. These percentages establish visible contribution; they are not aesthetic scores. Contact sheets were inspected at intermediate positions and the ending.

## Member-preview batch return

The sample batch link now uses the shared origin navigation callback to save the landing snapshot. It retains its real URL and normal modified-click behavior. Responsive restoration records the nearest relevant landing section as its return target.

Verified: desktop scroll 700 → member preview → sample batch → Back → 700. Phone scroll 1200 → mobile menu → member preview → sample batch → Back → 1200.

Chrome's automated `Locator.click()` can first scroll a sticky header toward its original document position. The regression uses direct pointer clicks on the measured visible header target, and asserts that opening the dialog itself preserves position. A preliminary failure caused by that automation behavior is retained as `mobile-member-back-locator-failure.json`; it does not represent the corrected pointer flow. No speculative layout-restoration change was made after direct pointer testing confirmed the existing restoration works.

## Verification

- Production build and lint passed under Node 26.9.0; all 31 unit tests passed.
- Full browser suite passed at 1440×900, 1920×1080, 1086×900, 834×1194, 390×844 and 360×640.
- New assertions cover visible partial soil coverage, reverse scrolling, completion before the last 20px, immediate reduced-motion reveal, and desktop/mobile member-preview Back restoration.
- Existing lookup, routes, QR downloads/decoding, camera simulation and cleanup, loading/failure fallback, repeated route cleanup, dialog focus, Axe and native 200% zoom checks passed. No browser errors were recorded.
- All 39 visible composited contrast samples passed, including animated root states. Three link samples were offscreen at the chosen early scroll position and explicitly skipped; they were tested at later visible positions.

Fresh evidence: `../verification/report.json`, `../verification/contrast.json`, all six `../verification/*-motion-sheet.png` files, plus this directory's four root contact sheets and `motion-impact.json`. The earlier failed visual evidence remains in `../recheck`.

Physical iPhone/Android camera and keyboard acceptance remains pending. Presentation and proposal artifacts were not revised.
