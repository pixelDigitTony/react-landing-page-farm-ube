# Roote Origin prototype

Photographic React 19 / TypeScript / Vite frontend using Node 26. Native scrolling, scoped GSAP animation, real HTML lookup, static public farm and batch records. The approved image-first design replaces the former growth introduction and worldflight. The old vendor engine remains unchanged and is no longer loaded.

## Run

```powershell
npm.cmd ci
npm.cmd run dev
# Production preview
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 4173
```

For hosting, serve `dist` with an SPA fallback to `index.html`. Camera access requires HTTPS outside localhost. No server, MongoDB database, authentication, or protected member access is implemented.

## Edit the prototype

`src/constants/site.ts` is the content and theme entry point:

- `SITE`: public copy, labels, errors, disclosures, metadata, accessibility text, date locale, download naming and optional hosted public origin.
- `THEME`: UI colors, typography sizes, spacing, scrim opacity/feathering, layout dimensions, control shape and shadow.
- `ASSETS`: responsive image paths, intrinsic dimensions and botanical attachment coordinates.
- `MOTION`: shared responsive breakpoints, transform distances, trigger ranges, durations, easing and interaction scale.
- `DEMO_DATA`: fictional public farms and batches; IDs remain strings.

Photographic colors belong to the images. UI palette changes do not recolor them. Source PNGs and prompts are in `design/assets/origin`; optimized WebP delivery files are in `public/images/origin`. Run `npm.cmd run assets` after changing artwork. Builds prepare assets automatically. `src/lib/scene.ts` applies a uniform scale to the connected plant and aligns the measured soil line with the roots section; it never stretches artwork to the document height. The tablet lookup uses the measured leaf reading rectangle. A clean canopy crop blends into the taller mobile/tablet composition. Far landscape, middle landscape and edge foliage move independently. The irregular alpha soil cover uncovers the roots. A full photographic poster keeps controls usable while layers load or if one fails.

## Demo actions

Use farm IDs `0001`, `0002`, `0003` or batch ID `SAMPLE-UBE-001`. Manual entry and camera decoding share the same resolver. It also accepts canonical root-relative and same-origin farm/batch URLs, preserves leading zeros, rejects external URLs, and reports ambiguous IDs. Case matters.

Farm profiles and batch summaries generate downloadable SVG and PNG QR codes using the current origin, or `SITE.links.publicOrigin` for a hosted demo. The public batch records its source farm, sample growing summary, harvest date, processor and recipient. All data and imagery are illustrative. The member-access dialog explains the future MERN phase and collects no credentials.

The farm directory contains all three records and searches names, locations and produce. Cooperative leadership roles remain awaiting confirmation. Browser Back restores the originating landing position, including the sample batch opened from member preview. Modified clicks on that link retain normal open-in-new-tab behavior. Header anchors use native links and focus the origin input when tracing a batch.

## Motion and verification

System reduced-motion preferences take precedence. A footer/mobile-menu toggle persists the optional motion-off choice for the session, including the previous `ube-reading` preference. It applies to every route, including card and arrow hover effects. Both modes use the same semantic content tree; roots remain fully visible with motion off. Phone actions retain at least 14px text and 44px touch targets; compact lookup actions stack vertically.

The root soil cover lifts toward the surface while the roots enter the viewport. A photographic surface mask and irregular lower edge keep the reveal integrated with the scene. `MOTION.rootReveal` controls its start, desktop/mobile end and final 32px hold. Reverse scrolling restores coverage; motion off exposes the complete roots immediately. Browser verification compares rendered artwork with and without the cover at intermediate positions so an offscreen timeline cannot pass as a visible reveal.

Wide screens need extra hero height to keep the scaled leaf and lookup clear of the header. `sceneHeroMinimum` measures this before aligning the connected plant; `THEME.layout.lookupDesktopTop` controls the minimum form offset. The preferred hero clamp remains the baseline, with extra height reserved only when the leaf needs it. The form is never moved independently away from its leaf.

```powershell
npm.cmd run test
npm.cmd run lint
npm.cmd run build
# Run against the preview above
npm.cmd run test:browser
node scripts/verify-contrast.mjs
```

`TEST_URL` and `CHROME_PATH` optionally override the preview URL and installed Chrome path. Browser checks cover eight viewport sizes through 3440px wide, six sampled positions per animated region, original artwork proportions, complete lookup visibility and leaf placement, phone controls, app-wide motion preferences, mobile dialog focus, scroll-controller cleanup, routes, QR decoding/downloads, camera recovery/cleanup, navigation, static fallback and Axe scans. Native 200% page zoom uses an isolated Chrome QA profile and does not change your browser profile. Evidence is in `scrollcraft/builds/roote-origin/verification`; the brief and delivery report are beside it.

Headless desktop Chrome and simulated video do not establish physical iPhone/Android camera, keyboard, browser-chrome or touch acceptance. Those checks remain pending.
