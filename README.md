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
- `THEME`: UI colors, display/body fonts, scrim opacity, header dimensions, control shape and shadow.
- `ASSETS`: responsive image paths, intrinsic dimensions and botanical attachment coordinates.
- `MOTION`: responsive breakpoints, transform distances, durations and interaction scale.
- `DEMO_DATA`: fictional public farms and batches; IDs remain strings.

Photographic colors belong to the images. UI palette changes do not recolor them. Source PNGs and prompts are in `design/assets/origin`; optimized WebP delivery files are in `public/images/origin`. Run `npm.cmd run assets` after changing artwork. Builds prepare assets automatically. A connected transparent botanical layer preserves the vine/leaf relationship; landscape and edge foliage move independently. A full photographic poster keeps controls usable while layers load or if one fails.

## Demo actions

Use farm IDs `0001`, `0002`, `0003` or batch ID `SAMPLE-UBE-001`. Manual entry and camera decoding share the same resolver. It also accepts canonical root-relative and same-origin farm/batch URLs, preserves leading zeros, rejects external URLs, and reports ambiguous IDs. Case matters.

Farm profiles and batch summaries generate downloadable SVG and PNG QR codes using the current origin, or `SITE.links.publicOrigin` for a hosted demo. The public batch records its source farm, sample growing summary, harvest date, processor and recipient. All data and imagery are illustrative. The member-access dialog explains the future MERN phase and collects no credentials.

The farm directory contains all three records and searches names, locations and produce. Cooperative leadership roles remain awaiting confirmation. Browser Back restores the originating landing position. Header anchors use native links and focus the origin input when tracing a batch.

## Motion and verification

System reduced-motion preferences take precedence. A footer/mobile-menu toggle persists the optional motion-off choice for the session, including the previous `ube-reading` preference. Both modes use the same semantic content tree; roots remain fully visible with motion off.

```powershell
npm.cmd run test
npm.cmd run lint
npm.cmd run build
# Run against the preview above
npm.cmd run test:browser
node scripts/verify-contrast.mjs
```

`TEST_URL` and `CHROME_PATH` optionally override the preview URL and installed Chrome path. Browser checks cover six viewport sizes, six sampled positions per animated region, motion preferences, routes, QR decoding/downloads, camera recovery/cleanup, navigation, static fallback and Axe scans. Evidence is in `scrollcraft/builds/roote-origin/verification`; the brief and delivery report are beside it.

Headless desktop Chrome and simulated video do not establish physical iPhone/Android camera, keyboard, browser-chrome or touch acceptance. Those checks remain pending.
