# Current output recheck — 4 October 2026

Subsequent correction: the user's wider screenshot exposed lookup clipping outside this review's original 1920px maximum. That gap is now fixed and the browser matrix includes 2551px and 3440px widths. See [the wide-screen correction report](../lookup-fix/REPORT.md) for the current result.

Verdict: no new blocking issues found in the exercised prototype. Both previously reported problems remain resolved. The page now delivers the approved natural-scroll direction: visible hero depth, restrained farm entrances, an onscreen soil reveal and a complete closing root composition. Mobile motion is deliberately gentler. This assessment concerns the current frontend prototype; physical-device acceptance remains outstanding.

Fresh verification:

- Full production-preview browser suite passed across 1440×900, 1920×1080, 1086×900, 834×1194, 390×844 and 360×640.
- Intermediate soil coverage is visible, reverse scrolling restores it, the cover clears before page end, and reduced motion immediately exposes the complete roots.
- Actual wheel input reached the final composition on desktop and phone. The heading, yam, footer and cooperative link remained visible; the cooperative link opened its destination on both.
- Member-preview batch navigation and browser Back restored 700px on desktop and 1200px on phone.
- Lookup, public routes, QR downloads and decoding, simulated camera recovery/cleanup, loading and failed-image fallback, route cleanup, dialog focus, native 200% zoom and Axe checks passed. No browser errors were recorded.
- All 39 visible contrast samples passed, including animated root states. Three early link samples were explicitly skipped because the link had not entered the viewport; later visible positions were checked.

Visual inspection covered the current partial and resolved desktop root frames, mobile motion contact sheet, and newly captured wheel-scroll endings. No application source changes were made during this recheck. Unit tests, lint and build were not rerun because this was a rendered-output review; their successful results belong to the preceding implementation pass.

Evidence: `wheel-check.json`, `desktop-wheel-ending.png`, `mobile-wheel-ending.png`, and the refreshed `../verification/report.json`, `../verification/contrast.json` and motion contact sheets.

Remaining acceptance: physical iPhone/Android camera, keyboard, browser chrome and touch behavior. Desktop Chrome simulations do not establish those results.
