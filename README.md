# Roote Origin prototype

Photographic React 19 / TypeScript / Vite frontend using Node 26. Six chapters follow one sample harvest: immediate leaf lookup, farm origin, underground crop reveal, harvest record, batch history, and cooperative/farm choices. Native scrolling and one short desktop pin drive the story. All public data is fictional. The old vendor engine and previous three-region landing remain historical source; neither runs on the current landing.

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

Photographic colors belong to the images. UI palette changes do not recolor them. Hero and farm originals are in `design/assets/origin`, and the new yam cutout, render sources and editable Blender scenes are in `design/assets/story`. Optimized images are in `public/images/origin` and `public/images/story`. Run `npm.cmd run assets` after changing ordinary artwork. Builds prepare that artwork automatically. To regenerate the camera sequence, follow `design/assets/story/PRODUCTION.md`, then run `npm.cmd run assets:story`; normal builds use the retained optimized frames and do not require Blender.

`src/components/story/OriginStory.tsx` owns the semantic chapters. `src/hooks/useOriginStoryMotion.ts` owns scoped GSAP choreography. `SoilCurtain.tsx` reveals the completed yam photograph through a center-opening mask over the matching clean soil photograph. The 5 October curtain design replaces the active camera sequence; `FrameSequence.tsx`, frame assets and their older verification scripts remain historical source. No frame-sequence requests run in the current page. Source photography sits on measured depth cards in Blender; this is a photographic 2.5D cutaway, not a fully modeled plant. `src/constants/storyAssets.ts` provides matching final/clean plates and normalized subject bounds. Original PNGs and `.blend` files are not served to visitors.

## Demo actions

Use farm IDs `0001`, `0002`, `0003` or batch ID `SAMPLE-UBE-001`. Manual entry and camera decoding share the same resolver. It also accepts canonical root-relative and same-origin farm/batch URLs, preserves leading zeros, rejects external URLs, and reports ambiguous IDs. Case matters.

Farm profiles and batch summaries generate downloadable SVG and PNG QR codes using the current origin, or `SITE.links.publicOrigin` for a hosted demo. The public batch records its source farm, sample growing summary, harvest date, processor and recipient. All data and imagery are illustrative. The member-access dialog explains the future MERN phase and collects no credentials.

The farm directory contains all three records and searches names, locations and produce. Cooperative leadership roles remain awaiting confirmation. Browser Back restores the originating landing position, including the sample batch opened from member preview. Modified clicks on that link retain normal open-in-new-tab behavior. Header anchors use native links and focus the origin input when tracing a batch.

## Motion and verification

System reduced-motion preferences take precedence. A footer/mobile-menu toggle persists the optional motion-off choice for the session, including the previous `ube-reading` preference. It applies to every route, including card and arrow hover effects. Both modes use the same semantic content tree; roots remain fully visible with motion off. Phone actions retain at least 14px text and 44px touch targets; compact lookup actions stack vertically.

The underground view arrives at the covered soil, then opens from the center with feathered edges as the reader scrolls. The camera remains stationary. The revealed yam holds before its transparent cutout becomes the desktop batch-card subject. Reverse scrolling closes the soil curtain. The next chapter draws a connector alongside the complete origin, harvest, processor and intended-recipient list. All fields come from the same public sample record; scrolling never implies automatic verification or completed delivery.

Desktop uses a pin of 2.4 available viewport heights. `MOTION.story.sceneScore` holds the soil closed for 0–28%, opens it during 28–82%, and holds it open through 100%. `MOTION.story.curtainFeather` controls the fading edge width. Transfer cannot begin before the pin finishes. Phone/tablet use matching portrait plates in ordinary document flow with the same score. Phone captions sit above the image. Short desktop viewports also avoid pinning. The lookup remains outside all transformed scene containers.

```powershell
npm.cmd run test
npm.cmd run lint
npm.cmd run build
# Run against the preview above
npm.cmd run test:browser
node scripts/verify-contrast.mjs
node scripts/verify-handoff.mjs
node scripts/verify-soil-curtain.mjs
node scripts/record-story.mjs
node scripts/review-story-recordings.mjs
```

`TEST_URL` and `CHROME_PATH` optionally override the preview URL and installed Chrome path. Browser checks cover eight viewport sizes through 3440px wide, six sampled positions in each of six story regions, rendered curtain opening/reversal, complete lookup visibility, motion preferences, dialog focus, routes, QR decoding/downloads, camera recovery/cleanup, navigation, fallback and Axe scans. The curtain script additionally verifies closed/open holds, stationary artwork without scrolling, no sequence downloads, failed artwork and rapid resized Back navigation. Native 200% page zoom uses an isolated Chrome QA profile. Evidence, contact sheets and scroll recordings are in `scrollcraft/builds/roote-origin-story/verification`; the brief and delivery report are beside it. The latest curtain direction supersedes the rendered-descent section of `design/SCROLL-STORY-PLAN.md`.

Headless desktop Chrome and simulated video do not establish physical iPhone/Android camera, keyboard, browser-chrome or touch acceptance. Those checks remain pending.

The curtain and transfer use a single contain-fit geometry for the scene, clean plate and cropped yam. The desktop transfer stays in the right column with a uniform scale; copy and fields stay left. Back restoration saves the originating link/input, visible position, viewport width/height and motion/pin mode; font and pin readiness replace fixed timing windows. Review recordings include reading, fast and reverse passes. Current delivery details are in `scrollcraft/builds/roote-origin-story/REPORT-CURTAIN.md`.

The transfer requires decoded clean/overlay/destination artwork. Missing or delayed assets preserve the completed scene and a static batch photograph. Assets finishing midway are used only after reversing to the transfer boundary. Portrait and reduced-motion layouts retain a complete photograph if the cropped yam fails. Back snapshots survive native link navigation; restoration watches the current route's mounted layout and reconciles subsequent size changes until the visitor scrolls. The current curtain verification script covers these image-failure and navigation boundaries.
