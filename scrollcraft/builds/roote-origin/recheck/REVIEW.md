# Roote Origin — implementation recheck

Historical review: both findings below were subsequently corrected. See [the correction report](../motion-fix/REPORT.md) and the refreshed browser evidence for the current implementation. The original failed frames are retained here.

Date: 4 October 2026. Audited the freshly built application at http://127.0.0.1:4173/ against the approved photographic, natural-scroll plan. Application source was not changed during this review.

## Verdict

Mostly compliant, but not complete. The photographic composition, public demo flows, responsive layouts, editable configuration and basic scroll motion are present. The intended signature moment—visibly uncovering the yam beneath the soil—is not convincingly delivered. The earlier conclusion that the root reveal was complete was too strong: its timeline and end state work, but its visible contribution does not.

## Findings

### P1 — Root reveal happens largely outside the viewport

Location: `src/components/FarmJourney.tsx:64`, with the curtain styling in `src/App.css:75–77`.

The cover moves down while native scrolling brings the section up. Its top remains near the viewport bottom, and its opaque soil begins even farther down. On a 1440 × 900 viewport, the six sampled curtain top positions were approximately 810, 828, 846, 864, 882 and 900 pixels. The upper silhouette is transparent, so the cover never meaningfully conceals the visible yam.

Independent screenshots compared the same settled scroll position with the curtain present and hidden. Text was masked equally in both frames to exclude compositor-induced font antialiasing changes; a difference of at least 5 in any RGB channel counted as a changed pixel. Across all six root samples, desktop, 390px phone and 360px phone showed zero meaningful changed artwork pixels. Tablet showed 0.50% and 0.10% in its first two samples, then zero. These measurements support the visual inspection; they are not design quality scores.

The scene currently arrives through ordinary page scrolling, with attractive roots already visible. Hero parallax, card entrances and hover responses work, but the root discovery does not provide the planned emotional peak.

Recommended correction: arrange a short covered → partly uncovered → uncovered phase while the soil and yam are actually onscreen. Preserve native scrolling, stationary readable controls, the complete ending and reduced-motion behavior. Add acceptance checks for visible occlusion at entry and midpoint, not only an offstage cover at the end.

Evidence: `motion-impact.json`, `desktop-roots-sheet.png`, `mobile-roots-sheet.png`, `compact-roots-sheet.png`, `tablet-roots-sheet.png` and `audit-motion.mjs` in this directory.

### P2 — Member preview batch navigation loses the landing position

Location: `src/App.tsx:40`.

Reproduction: scroll the landing page to 700px, open Member login, choose the sample public batch, then use browser Back. The landing page returns to 0px. The dialog link bypasses the shared navigation callback that records the landing snapshot. Normal farm-card Back restoration passes.

Recommended correction: preserve the landing snapshot for the member-preview link through the same navigation path, and cover this entry point in the browser test.

Evidence: `member-back.json` records before = 700 and after = 0.

## Plan coverage

| Area | Assessment |
| --- | --- |
| Image-first hero, leaf lookup, farms and underground closing composition | Implemented; responsive scene geometry and readable controls are present |
| Native scrolling and hero depth | Implemented; independent hero layers visibly affect the rendered frame |
| Card entrances and hover/focus response | Implemented |
| Signature soil/root reveal | Needs correction described above |
| Static farm/batch lookup, catalogue, profiles, cooperative and member preview | Working in the exercised browser flows |
| QR downloads and scanner lifecycle | Passed browser checks, including decoding from simulated video and track cleanup |
| Central copy, theme, data and motion configuration | Present |
| Reduced motion, loading/failure fallbacks, route cleanup and 200% zoom | Passed exercised checks |
| Browser Back restoration | Passes ordinary card flow; member-preview batch exception remains |

The original root-drop/growth introduction is intentionally absent: the latest approved plan explicitly replaced it with the immediate photographic opening.

## Fresh verification

- 31 unit tests passed.
- Lint and production build passed under Node 26.9.0.
- Full browser script passed at six viewport sizes, including reduced motion, native Chrome 200% zoom, route refresh, lookup states, QR decoding/downloads, camera simulation, lifecycle cleanup and decorative-asset failure.
- Browser suite reported no browser errors; automated Axe checks passed for the exercised states.
- All 24 rendered contrast samples passed their configured thresholds across desktop, tablet and phone.
- Additional independent motion comparison and member-preview Back checks exposed the two findings above despite the main suite passing.

The existing root test verifies completion, not whether the reveal was visible beforehand. Passing it does not establish the intended scroll experience. Physical iPhone/Android camera and keyboard testing remains pending; desktop browser simulations do not replace it.

The preview is running on port 4173. See `../verification/report.json` for the broader browser evidence.
