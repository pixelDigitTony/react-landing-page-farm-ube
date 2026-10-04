# Wide-screen lookup placement correction

The user screenshot exposed a layout gap beyond the earlier 1920px test range. At 2551px wide, the photographic scene scaled with width while the hero remained capped at 900px. Aligning the enlarged plant to the soil consequently put the lookup above the hero: its heading appeared at approximately 3px in the viewport, behind the 68px header.

The hero now reserves extra height only when the scaled leaf needs it. `sceneHeroMinimum` calculates the minimum using the form height, farm-section height and shared scene anchors, then the complete plant is aligned to the soil. The form remains inside the leaf; it is not positioned independently from the artwork. `THEME.layout.lookupDesktopTop` centralizes the 200px minimum offset within the hero.

At 2551px wide the complete lookup begins at approximately 268px and its heading at 276px. At 3440px wide it remains at the same readable offset. The existing 1440px and 1920px hero heights are unchanged. Tablet and phone retain their separate compositions.

Verification:

- 35 unit tests, lint and the production build passed.
- The expanded browser suite passed at eight sizes, including 2551×1260 and 3440×1440. It now asserts that the entire lookup clears the header and stays inside the attached leaf reading rectangle.
- Root reveal, reduced motion, routes, QR flows, member-preview Back restoration, native 200% zoom and Axe checks passed in that suite.
- All 39 visible contrast samples passed across desktop, tablet and phone.
- Live resizing through panoramic desktop, ultrawide, standard desktop, tablet and phone, then back to ultrawide preserved form placement. Manual lookup opened farm 0001 at the user's `http://localhost:5173` address.

The local dev server also encountered an actual Windows EBUSY failure while watching a temporary Chrome QA profile. Vite now ignores `.local` directories, matching the existing Git exclusion. Opening the QA browser profile while the restarted development server was running confirmed that the server remained available. The production preview on port 4173 remains available too.

Evidence: `before-2551.png`, `after-2551.png`, `after-3440.png`, `geometry.json`, `resize-check.json`, and the refreshed `../verification/ultrawide-opening.png`, `panoramic-opening.png` and `report.json`.

Physical-device acceptance remains pending.
