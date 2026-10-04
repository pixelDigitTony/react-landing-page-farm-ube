# Roote Origin — a harvest with a history

Status: proposed implementation plan, 4 October 2026. No application changes are included in this document.

## 1. Recommended direction

Build a photographic, chapter-based story about one illustrative harvest, ending with its working public batch record. Keep the current opening identity and useful lookup. Give scrolling a more consequential role after that opening: establish the farm, enter the plant's environment, descend beneath the soil, reveal the yam, and connect the harvest to the people recorded against its batch.

The memorable moment should be: **“I followed the plant underground, then followed its harvest back to a farm and the people who handled it.”**

This proposal changes the previous compact, three-region natural-flow brief. It introduces distinct scenes and one short pinned cinematic scene. It retains native scrolling, immediate lookup, the photographic visual direction, and the frontend-only scope. The earlier brief remains a record of the implemented version; do not overwrite it until this direction is selected for implementation.

### Why the current animation feels limited

The current `FarmJourney.tsx` moves landscape planes, introduces farm cards, and uncovers a root photograph. Those effects supply depth and reveal content, but the subject changes little. There is no visible progression from growing plant to harvest to public record. The visitor sees attractive sections without experiencing the system's central idea.

Increasing parallax distances alone would leave this gap. The new version needs authored start, intermediate, and end compositions with a clear change in meaning between them.

### What visitors should understand

1. Roote Origin connects farms and produce within a cooperative ecosystem.
2. The produce begins at an identifiable farm.
3. A harvest can be associated with a batch record.
4. That record can summarize farming information, harvest, processor, and intended recipient.
5. A public QR or ID opens that summary.

Primary useful action: **Find origin**. Secondary actions remain farm browsing and meeting the cooperative. The story itself ends with **Open sample batch**, which demonstrates the primary value without requiring a visitor to type.

## 2. Brief, evidence, and boundaries

| Topic | Existing evidence or proposed decision |
|---|---|
| Audience | Consumers, cooperative stakeholders, farms, processors, and prospective brand/distribution partners; public frontend only. |
| Visual identity | User-selected photographic Davao landscape, deep greens, ivory serif typography, green trellis, large leaf, soil, and purple yam. |
| Desired feel | User asks for storytelling comparable to popular scroll-animation pages; Cue is their earlier behavioral reference. Proposed tone: cinematic, grounded, curious, then clear and trustworthy. |
| Story structure | Proposed: distinct chapters connected by one illustrative crop and batch. This is a recommendation, not a claim that the user requested these exact scenes. |
| Energy | Quiet useful opening → growing curiosity → underground peak → clear explanation → calm cooperative ending. |
| Signature move | The revealed yam settles into the visual identity of a sample batch; a root-like line becomes the record's handoff path. It is an editorial transition, not a claim that QR traceability happens automatically. |
| Aesthetic range | Keep the existing photographic brand. Permit more decisive scene changes and larger subject movement in the cinematic scene. |
| Assets | Existing still layers and sample farm imagery provide a starting point. A credible change of camera perspective needs newly authored assets. Blender and Inkscape are available according to the user; verify their local executables during implementation. |

Keep all data fictional and explicitly labeled. Use `0001` and `SAMPLE-UBE-001` as the story's example. Preserve farms `0002` and `0003` in the catalogue. No invented certifications, yield, export volumes, processing completion dates, partners, or biography. The recipient is an intended recipient, not proof of delivery. Keep Sir Marco's roles marked as awaiting confirmation.

No Express service, MongoDB database, authentication, or protected data is implemented here. Member access remains an honest preview of the planned MERN phase.

## 3. Reference principles and page structure

### Reference observation

In the inspected opening of [Cue](https://www.cuewigs.com/), oversized type and a central portrait give way to an isolated portrait and then a wider photographic collage as scrolling advances. Its later page content explains a numbered making process. The useful principle is a change in framing, scale, and information across stages. This inspection covers sampled opening states and page content, not a complete performance or accessibility audit of that site.

Apply the principle to Roote Origin with a farm, crop, soil, and traceability record. Do not borrow Cue's fashion imagery, red palette, exact transitions, or content.

### Proposed page structure: a guided harvest story

- Chapters have their own visual composition and explicit semantic sections.
- One sample farm and batch provide continuity across cuts.
- Pin only the cinematic plant/soil scene initially. A second pin is not part of the baseline.
- Navigation can bypass the narrative at any time.
- Keep forms, links, and detailed records in ordinary document flow.
- Finish with real public actions and farm choices.
- Do not recreate the old eleven-screen continuous camera flight, root-drop opening, or root-shaped leadership board.
- Do not animate every section with the same fade-and-rise treatment.

Four or more motion families are deliberately assigned: layered parallax, image framing/masking, rendered camera progression, subject-to-record transition, and an SVG handoff path. These are different ways to communicate the story, not an effects checklist.

### Fingerprint comparison

Preserve `scrollcraft/FINGERPRINTS.md` unchanged during planning. On delivery, append a new entry only after the result ships.

Compared with the current Roote Origin row: the structure becomes chapter-based; the sequence expands from three regions to six information beats; the close demonstrates the public record before farm/cooperative choices; and the signature becomes harvest-to-record continuity. These four differences are intentional. The existing hero identity and primary navigation are intentionally shared. Compared with the original Ube Farm row, the structure, opening, sequence, navigation, close, and signature change.

## 4. Tools and packages

### Recommended production pipeline

**React + GSAP + semantic HTML/CSS/SVG for the page; Blender-rendered image frames for the single underground scene; Canvas 2D for displaying those frames.**

The site does not need a live 3D engine for an authored camera path. Blender is an asset-production tool in this plan. Its output is served as optimized images. A low-resolution proof must establish that the sequence looks convincing and performs acceptably before committing to full rendering.

| Tool | Status | Assigned responsibility |
|---|---|---|
| React, TypeScript, Vite, React Router, Node 26 | Already in project | Components, routes, loading boundaries, and existing public interactions. Retain current versions. |
| `gsap@3.15.0` + ScrollTrigger | Already installed | Section timelines, scrubbed camera progress, one pin, shared-subject movement, and path progress. |
| `@gsap/react@2.1.2` | Already installed | Scoped setup and cleanup through `useGSAP`. |
| HTML/CSS/SVG | Browser-native | Accessible copy, static layouts, responsive crops, masks, and the process connector. |
| Canvas 2D + ImageBitmap where supported | Browser-native | Draw only the required cinematic frame; keep all controls and text outside the canvas. |
| Blender | User has installed it; verify executable/version | Author one consistent plant/soil/yam scene, camera path, lighting, and desktop/phone renders. Retain the `.blend` source. |
| Sharp | Already installed | Responsive images, frame compression, metadata, alpha checks, and contact sheets. |
| Inkscape | Optional; user has installed it | Clean SVG path/mask editing. It is not required for photographic rendering. |
| Built-in image generation | Optional asset assistance | Clean environment plates and textures when suitable originals are unavailable. Do not generate unrelated animation frames separately. |
| FFmpeg | Project includes an installer package; verify usable binary | Optional storyboard preview video and review exports. Not required by the deployed application. |
| Playwright, Axe, Vitest | Already installed | Visual states, interactions, accessibility, and pure helper tests. |
| ZXing and `qrcode` | Already installed | Preserve existing scanning and QR downloads. |

No additional npm package is required for the baseline. Do not add Lenis, a second animation engine, Three.js, React Three Fiber, or a component framework without a separately demonstrated need. Smooth-scrolling libraries do not create a narrative.

ScrollTrigger supports scroll-linked timelines and pinning; use its existing capabilities and component-scoped React cleanup. See [ScrollTrigger documentation](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) and [GSAP with React](https://gsap.com/resources/React/).

Blender supports rendering an animation to an image sequence. That supports the proposed offline asset workflow; the specific scene quality and rendering time still depend on the authored model and local hardware. See [Blender output documentation](https://docs.blender.org/manual/en/latest/render/output/introduction.html).

## 5. Six-chapter storyboard

Scroll spans below are starting targets, measured in viewport heights, not mandatory page-length quotas. A scene must earn its travel with visible progression or meaningful reading. Content height takes precedence.

| Chapter | What appears and changes | Visitor learns | Motion and approximate desktop extent |
|---|---|---|---|
| 1. Every harvest starts here | Current photographic hero, large leaf lookup, headline, and immediate actions. Far hills and near foliage separate slightly as the hero leaves. | This is a Davao farm ecosystem; lookup works immediately. | Layered depth, normal flow; roughly 1 screen or as needed for content. |
| 2. A place behind the produce | A farm photograph opens from a contained frame into a larger view. Sample Farm 01 and its illustrative location resolve beside it. End with the same trellis/plant composition used to enter the cinematic scene. | The story has an identifiable farm rather than an anonymous crop. | Image framing/masking, normal flow; around 0.9–1.2 screens. |
| 3. Below the surface | Hold one scene beneath the header. Move from the mature vine down toward the soil; expose a cross-section and the yam. Preserve the physical stem/root connection. | The crop exists beneath the visible plant; this is the emotional reveal. | Rendered camera progression; stage about one screen plus 1.2–1.5 screens of pinned travel. |
| 4. A harvest with a history | The yam from the final frame reduces into an image beside a real HTML sample batch card. Show its batch ID, farm, produce, and harvest date. | The harvest is represented by a specific public record. | Subject-to-record composition change, normal flow; around 0.7–1 screen. |
| 5. Follow the handoffs | An ordered record shows farm/growing summary, harvest, processor, and intended recipient. A root-like SVG connector extends through these steps; the complete public QR and a real batch link resolve at the end. | Roote Origin can connect the crop with the people and details associated with its batch. | SVG path progression and stepped emphasis, normal flow; roughly 1.3–1.8 screens. |
| 6. The people behind the roots | A calm cooperative introduction, two featured farms, access to all three farms, and clear origin/cooperative actions. Retain the illustrative-content disclosure and motion toggle. | There are people and more farms to explore; the visitor knows what to do next. | Stable editorial layout with modest image interaction; content-driven, roughly 1–1.5 screens. |

Expect approximately 7–9 desktop viewport heights as a first composition estimate. Do not add blank space to hit that figure. A phone may have more document height because text and cards stack; it should have less scroll delay from pinning.

### Feeling curve and copy direction

| Chapter | Feeling | Proposed copy direction, pending normal editorial refinement |
|---|---|---|
| 1 | Curiosity and control | Keep “Every harvest starts here.” and current supporting copy. |
| 2 | Connection | “A place behind every harvest.” Keep the sample label adjacent to the farm name. |
| 3 | Wonder | “Some stories grow out of sight.” Short copy, clear of the yam and roots. |
| 4 | Understanding | “A harvest with a history.” Batch ID and real fixture fields carry the explanation. |
| 5 | Trust through clarity | “Follow the people behind this batch.” Clearly distinguish sample data and intended recipient. |
| 6 | Confidence to act | Keep “The people behind the roots.” Link to the cooperative and complete farm catalogue. |

Avoid unsupported growing-method claims. This botanical sequence is illustrative, not a farm-specific time-lapse or a scientifically calibrated growing-season simulation.

## 6. The signature scene: exact choreography

### Chapter 3: plant to soil to yam

Create a storyboard at these normalized scene-progress positions before coding final motion:

| Progress | Composition | Copy and continuity |
|---|---|---|
| 0.00 | Mature vine and green pipe establish orientation; visible soil surface below. | Chapter heading is already readable. No blank first frame or loader blocking scroll. |
| 0.15 | Foreground leaf passes the frame edge as the camera begins descending. | Keep the green pipe and stem visible as spatial references. |
| 0.35 | Soil surface approaches the upper third; underground begins occupying the lower view. | Brief explanatory line remains stationary in a reserved safe area. |
| 0.55 | The cutaway exposes fine roots and part of the yam. | Main stem remains aligned to the root crown; avoid a floating cutout. |
| 0.75 | Yam silhouette and purple detail become the focal point; camera decelerates. | This is the largest visual change, not a barely visible mask at the viewport edge. |
| 0.90 | Complete underground composition; match the subject's destination crop for Chapter 4. | Short reading settle with visible content, not an empty hold. |
| 1.00 | Same finished composition flows out naturally. | Incoming harvest heading becomes visible in the next section. |

Use one deterministic timeline. Scrolling backward restores earlier visual states. There is no actual harvest operation simulated, no plant uprooting by a floating camera, and no fabricated rapid growth. If an opening growth shot is later desired, treat it as additional authored footage; it is not necessary for this baseline story.

Starting pin configuration: begin when the stage reaches the sticky header's bottom; stage height is the available viewport below the header; travel is approximately 1.35 times that available height. Use responsive limits and test fast touchpad movement. Scrub catch-up begins around 0.3 seconds. No scroll snapping and no wheel/touch interception.

Chapter 3 needs adequate document space after it, so its final frame can resolve before unpinning. Use normal pin spacing. Do not manually add a second spacer or hide a long frozen first/last frame inside entry and exit travel.

### Chapter 4: yam to batch record

1. Export a matching yam cutout from the exact final scene/camera state.
2. Align it over the final rendered subject before the cinematic canvas leaves view.
3. Use a short occluding soil edge or controlled crossfade to transfer visual ownership. Verify no double yam, pop, halo, or sudden color change.
4. Move and scale the cutout within a decorative overlay into the batch card's reserved image rectangle.
5. Keep the real card and its text in normal layout. Do not transform the card's controls or remove its reading position.
6. Remove the decorative overlay once the destination image is in place. The card link works before, during, and after the transition.

The effect changes composition; it does not morph a photograph into letters or QR modules. Use a stable generated QR only in the completed public-summary area.

### Chapter 5: record handoffs

- Use the shared fixture, not duplicated hardcoded batch information.
- The ordered list is complete and visible in default CSS.
- Extend a decorative SVG stroke alongside the list as each row enters a comfortable reading zone.
- Emphasize the relevant row with border/weight and a small local image or icon treatment; never hide essential fields until a precise scroll percentage.
- Label the date as harvest date. Do not create processor or delivery dates that the sample record does not contain.
- End with the actual QR and `Open sample batch` link. Do not animate QR modules while users may scan them.
- Keep the QR's light quiet zone intact. Decode the displayed/exported result during verification.

## 7. Asset production contract

### Required files

| Asset | Production requirement | Delivery expectation |
|---|---|---|
| Hero landscape and plant layers | Audit current assets first; retain suitable work and real alpha. Reserve leaf-form reading area at each breakpoint. | Desktop and phone responsive WebP, explicit dimensions. |
| Farm transition photograph | Same visual atmosphere as hero; illustrative Farm 01; no generated UI or wording. | Landscape and portrait crop, with focal-point metadata. |
| Plant/soil/yam source scene | One consistent camera space, believable materials, contact points, upper-right warm light, and left/upper copy safe areas. | Editable `.blend`, textures, scene instructions, and attribution/provenance notes. |
| Cinematic frames | Render one deterministic scene; consistent geometry and lighting across frames. Do not create every frame independently with image generation. | Optimized desktop sequence; separately framed lighter phone sequence only if device proof supports it. |
| Posters | Exact renders of the start and completed states. | Small text-free WebP posters available before animation. |
| Yam handoff cutout | Exact final camera/light and subject silhouette. | Alpha-preserving WebP plus retained PNG source and normalized anchor. |
| Root/process path | Purpose-built SVG that can visually continue the scene's direction. | One simple path; decorative and excluded from accessibility reading order. |
| Cooperative imagery | Use supplied real photographs when available. Otherwise use clearly illustrative landscape/details. | Do not invent identifiable cooperative members or Sir Marco's portrait. |

First render only 8–12 low-resolution keyframes for composition review. Then produce a short performance proof with approximately 60–90 desktop frames at around 1280×720. These are starting experiment values, not a demand to ship that exact resolution or count. Assess smoothness, transfer, and texture quality before increasing density.

For a frame pipeline, compressed bytes and decoded memory are separate budgets. One 1280×720 RGBA frame occupies about 3.5 MiB before browser overhead; retaining 90 decoded frames would be roughly 316 MiB. Do not preload and decode the entire sequence indiscriminately.

Retain originals under `design/assets/story/`. Serve only optimized files under `public/images/story/`. Record actual frame dimensions, count, bytes, crop, and safe areas in a typed manifest. Store prompts/provenance alongside source assets. No temporary cache paths in application constants.

### Visual gate before full implementation

Reject the asset set if it contains disconnected roots, matte halos, clipped subjects, a repeated plant in the clean background, texture flicker, implausible scale changes, or a camera path that reveals missing geometry. Check on both light and dark inspection backgrounds. The peak must look stronger than the existing curtain reveal at a comparable viewport size.

If the Blender proof cannot meet the quality/budget gate, stop expanding that pipeline. Use a deliberately authored 2.5D cross-section with a fixed camera and genuine alpha layers, revise the storyboard to that limitation, and document the changed scope. Do not silently substitute a scaled screenshot while claiming a camera descent.

## 8. React implementation architecture

Suggested boundaries; adapt names to the repo rather than introducing an abstract scene framework:

```text
src/components/story/
  OriginStory.tsx             # composition of semantic chapters
  StoryHero.tsx               # immediate headline and stable existing Lookup
  FarmOriginChapter.tsx      # photo framing and sample farm introduction
  UndergroundChapter.tsx     # one pinned stage, poster/canvas, static caption
  HarvestChapter.tsx         # real HTML sample batch card and image target
  BatchJourneyChapter.tsx    # ordered public-record summary and SVG connector
  CooperativeChapter.tsx     # cooperative invitation and featured farms
  FrameSequence.tsx          # bounded frame decoding/drawing, no public text
src/hooks/useOriginStoryMotion.ts
src/lib/storyFrames.ts       # pure frame index / cache helpers where useful
src/constants/site.ts        # existing editing entry point remains obvious
```

Reuse existing `Lookup`, farm cards, header, scanner, QR components, data repository, detail routes, and navigation callbacks. Replace the active landing composition only when the new one passes its gates. Preserve a baseline screenshot set and isolate the new composition during development; a temporary development flag is sufficient.

### Ownership and lifecycle

- One root motion hook creates chapter-scoped timelines in DOM order. Each chapter has its own progress; do not map the whole document to one giant playhead.
- Use `useGSAP` and `gsap.matchMedia()` for lifecycle and breakpoint setup.
- Do not run the legacy ScrollCraft vendor engine alongside GSAP. Retain the skill's planning and verification workflow.
- React state handles discrete UI state only. Do not set React state per animation frame.
- GSAP controls progress and decorative transforms. Canvas draws on frame changes only. CSS must not add transitions to the same properties.
- Keep pin parents free of transforms and inappropriate overflow clipping. Animate a child inside the stage.
- Prepare dimensions and fonts before the first measurement. Refresh after meaningful asset/layout changes and orientation changes; debounce observers and avoid self-triggering refresh loops.
- A mobile keyboard opening is not a reason to destroy/recreate the narrative while someone types.
- On unmount, kill owned timelines, disconnect observers, abort owned fetches, cancel callbacks, close disposable ImageBitmaps, and release canvas/cache references.
- Pause decoding/drawing when the tab is hidden. Stop offscreen work; reconcile to current progress on return.

### Constants

Keep public copy, accessibility text, source data, colors, and animation parameters centrally editable. Existing exports can gain a `story` namespace:

```ts
SITE.story        // chapter headings, captions, labels, accessible descriptions
THEME.story       // surface/scrim tokens, spacing, typography, safe-area values
ASSETS.story      // posters, sequences, dimensions, crops, attachment anchors
MOTION.story      // pin travel, cue windows, scrub, distances, breakpoints
DEMO_DATA         // the single source of truth for farm and batch fields
```

Use stable chapter IDs separate from editable labels. Keep story fixture selection, such as `featuredBatchId`, in configuration. Do not build a fully configurable generic page engine. Each component still owns its semantic structure.

### Routes and focus

- Preserve all current public routes and canonical farm/batch IDs.
- `/#origin` continues to focus the real lookup.
- `/#farms` targets the featured farm directory in the closing region.
- Preserve `/#roots` as an alias for the underground/cooperative story entry; give the revised chapter its own stable ID too.
- `Follow the story` leads to Chapter 2, not an intermediate pinned coordinate.
- Explicit anchor navigation wins over saved Back restoration.
- Save the originating section and local progress/offset before opening detail routes. After returning, restore only after layout and pin measurements settle; prefer the section identity when the viewport changed.
- All transitions use the existing shared navigation path so batch links do not bypass scroll restoration.
- Never use an auto-updating live region for chapter progress. It would repeatedly interrupt assistive-technology users.

## 9. Frame loading and performance

1. Render semantic page content and a complete poster immediately.
2. Load the hero's essential assets first. Delay cinematic requests until the scene approaches, roughly one viewport away as an initial setting.
3. Fetch a small set of keyframes first, including the completed state, then fill nearby frames. Show the nearest available frame if the exact target is unavailable; never blank the canvas.
4. Maintain a bounded decoded-frame cache around the current target, biased toward current direction. Start with about 8–12 desktop frames and a smaller phone budget; tune from measured memory and decode behavior.
5. Bound concurrent fetch/decode work. Discard obsolete completion results after route change or sequence change. Avoid cancelling and refetching frames on every small scroll reversal.
6. Release evicted ImageBitmaps. Compressed response caching is separate from decoded image residency.
7. Draw at the smaller of the useful source resolution and a device-pixel-ratio cap, starting at 1.5 on desktop and 1 on phone. Benchmark rather than rendering at full ultrawide physical resolution automatically.
8. When loading fails or performance is unsuitable, show the exact final poster with complete copy. Record which fallback was tested.

Starting delivery targets: hero imagery at most 2 MB desktop / 1.2 MB phone; deferred desktop sequence around 6–8 MB maximum; phone sequence around 2–3 MB if enabled; farm thumbnails around 180 KB each. These are budgets to test, not measured outcomes. If the sequence cannot meet them while looking good, reduce rendering scope or use the designed static/2.5D path.

Aim for responsive 60 Hz scrolling on the tested desktop, with no sustained freezes. Profile an ordinary laptop and actual mobile hardware when available. Capture frame timing, long tasks, network bytes, and cache behavior. A high frame count does not guarantee smooth motion.

## 10. Responsive and accessible story

### Desktop and ultrawide

- Keep the opening leaf lookup stationary, in a safe layout region outside transformed camera containers.
- Bound art scale by both usable width and height; use designed crops on ultrawide displays. Do not let a single full-page plant scale with width until the form disappears above the header.
- Test 2551px and 3440px widths explicitly because this project already exposed a missed wide-screen lookup case.
- If chapter copy cannot fit below the header at 200% zoom or in a short viewport, use the unpinned layout. Pinning never takes priority over readable content.

### Phone and tablet

- Recompose vertically: headline and main action, then broad leaf lookup. Keep form controls out of canvas and pinning.
- Use a portrait crop for the underground scene; do not squeeze the desktop scene and text into one viewport.
- Baseline phone behavior is an unpinned sequence tied to its visible passage, with the final poster reached while the subject is onscreen. Enable a short sticky treatment only if physical-device testing establishes a clear benefit without trapping scroll.
- Keep the batch history as a vertical ordered list and all farm cards stacked. No horizontal scroll hijack.
- Use stable viewport sizing for stage geometry; keep mobile keyboard and browser-toolbar changes from repeatedly recalculating the whole story.
- On compact/short layouts or enlarged text, replace cinematic pinning with readable static sections.

### Reduced motion and keyboard

- One content DOM for animated and motion-off modes.
- Default CSS is fully readable; enhancement happens only when ready.
- System reduced motion takes precedence; retain the existing stored preference and toggle.
- Reduced motion removes pinning, camera movement, subject transfer, and animated line drawing. Show the complete underground poster and finished batch history.
- Turning motion off mid-scene restores normal layout and preserves the visible chapter as closely as possible without throwing the reader to the top.
- Keep complete headings accessible; any decorative split text is hidden from the accessibility tree.
- Every visible control remains focusable, readable, and actionable independent of scroll progress. Focus must not land in an invisible transformed overlay.
- Check text and controls against their actual composited backgrounds. Keep scan dialogs and menu focus restoration intact.

## 11. Implementation phases and gates

### Phase 1 — storyboard and proof of the story

Deliver a six-chapter contact sheet and a simple scrollable storyboard using existing/proxy assets. Annotate entrance, midpoint, exit, factual content, and action for each chapter. Include a desktop and phone version. Keep the current application available.

Gate: the progression can be explained in one sentence; adjacent chapters do different work; the lookup is immediately usable; the final record clearly connects to the opening farm.

### Phase 2 — prove the signature scene

Author the Blender blockout, 8–12 keyframes, and a small frame-sequence prototype. Test reverse scroll, poster fallback, and the subject handoff to the batch card. Review the rendered sequence visually before producing polished textures/full frames.

Gate: the soil crossing is obvious, the yam stays physically connected, there is no camera/asset pop, and the frame pipeline fits an agreed practical budget. If this fails, adjust the scene before building the rest of the page around it.

### Phase 3 — final artwork and static responsive page

Produce consistent images, render frames, optimize delivery, record the manifest, and build every section in its completed static state. Keep all controls and data real HTML. Verify all eight viewport sizes and 200% zoom before adding other timelines.

Gate: the complete page looks intentional with animation disabled and does not require motion to reveal information.

### Phase 4 — integrate choreography and existing interactions

Wire chapter triggers in order, add the one desktop pin, implement frame caching and the harvest transition, draw the handoff connector, and restore anchors/Back navigation. Keep scanner, member preview, farm catalogue, public batch route, and QR downloads operational.

Gate: slow, fast, reverse, keyboard, and direct-anchor scrolling all reach coherent states without blank intervals or stranded controls.

### Phase 5 — visual, functional, and performance review

Run the checks below. Inspect actual rendered sequences, not only static endpoints or test summaries. Tune spacing, subject scale, text dwell, and transition ownership. Deliver the evidence and document any physical-device checks not performed.

Planning allowance: roughly 12–20 focused working days for one developer comfortable with motion and Blender, plus render/review time. Treat this as an early scope estimate, not a commitment. Asset modeling and art direction are the largest uncertainty; measure Phase 2 before agreeing to a client deadline.

## 12. Acceptance tests that judge the actual experience

### Narrative gate

Show one uninterrupted scroll recording to someone unfamiliar with the project. Ask what the site does, where the example produce came from, what the batch record contains, and what to click next. Log misunderstood points and revise the scene/copy that caused them. Passing code checks alone does not satisfy this gate.

The implementation fails the creative goal if it still looks like the current page with stronger floating backgrounds, if the underground reveal is barely visible, or if the batch record feels unrelated to the crop.

### Visual evidence

- Capture 0%, 20%, 40%, 60%, 80%, and 100% of each animated chapter, plus scene boundaries.
- Watch a slow forward pass, a fast pass, and a reverse pass. Still screenshots cannot establish smooth pacing.
- Inspect the transition between the canvas subject and DOM cutout at full size.
- Test 1440×900, 1920×1080, 2551×1260, 3440×1440, 1086×900, 834×1194, 390×844, and 360×640.
- Check 200% zoom, text enlargement, reduced motion, keyboard opening, orientation change, slow decoding, missing frame, failed poster/layer, and Back restoration after a resize.
- No blank canvas, duplicate subject, jumping soil line, clipped lookup heading, unreadable caption, horizontal overflow, or long frozen travel without a reading purpose.

### Functional and lifecycle evidence

Retain existing useful tests: manual farm/batch lookup, leading zeros, URL validation, unknown IDs, camera denial/cleanup/retry, farm and batch QR decoding, catalogue contents, member preview, and canonical route refresh.

Add tests for frame index boundaries/reversal, stale decode completion after unmount, fallback on failed frames, cache limits, motion-toggle cleanup, and route changes leaving no orphaned pins/timelines. Test observable outcomes rather than simply asserting a transform value or timeline count.

Run Axe and manual keyboard checks on the landing and public detail routes. Verify focus visibility while any nearby scene is mid-transition. Check actual text contrast at intermediate frames.

```powershell
npm.cmd run test
npm.cmd run lint
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 4173
```

Run `npm.cmd run test:browser` in a separate terminal after the preview is ready. Extend the current script to cover the new scene states; retain QR/camera/navigation coverage. Disable native pointer lock and pointer capture in automated contexts as required by this project's ScrollCraft workflow.

Physical iPhone/Android camera, touch scroll, browser toolbar, memory pressure, and keyboard checks must be reported separately from desktop browser emulation.

## 13. Deliverables

1. Updated working frontend with the six-chapter story and preserved public routes.
2. Centralized copy, theme, sample data, scene timing, and asset manifest.
3. Source artwork, `.blend` scene, optimized imagery/frames, and provenance notes.
4. Desktop, phone, and reduced-motion layouts with matching posters.
5. Storyboard, final motion score, updated brief, and an appended fingerprint entry after delivery.
6. Contact sheets and actual scroll recordings, including reverse scrolling and chapter handoffs.
7. Functional/accessibility/performance results with measured transfer/cache figures and explicit device limitations.
8. README instructions for content edits, asset regeneration, preview commands, and sample IDs.

The first implementation milestone should be the storyboard and underground-to-batch proof. That milestone tests the creative idea before spending time on a complete replacement.
