# Soil curtain delivery — 5 October 2026

The recheck found that the previous “covered soil” hold mainly showed the vine above ground. Camera descent and soil removal were baked together, so adjusting timing alone did not create a stationary covered-soil view.

The user's latest direction is implemented: “soil should open like a curtain but fading from between when scrolling.” The section now starts at the close-up camera with the ube covered. A soft center-opening mask spreads toward both sides and reveals the yam beneath. The environment stays still; it does not fade away as one image. Reverse scrolling closes the same opening. Scrolling owns progress, so a stationary reader sees a stationary scene after the brief scrub smoothing settles.

Desktop retains a 2.4-viewport pin: soil closed from 0–28%, curtain opening from 28–82%, complete reveal held from 82–100%. Only then can the scene depart and the yam transfer to the batch record. Phone/tablet and short desktop viewports retain the approved natural-flow composition; reduced motion shows the complete yam immediately.

## Implementation

`SoilCurtain.tsx` uses the existing matching completed photograph and clean Blender soil plate. A CSS mask provides the feathered center opening; the scoped GSAP timeline supplies progress. `MOTION.story.sceneScore` controls holds and reveal, and `MOTION.story.curtainFeather` controls softness. All copy, colors, assets and sample data remain centralized.

The active page no longer requests or decodes the old 60/40-frame sequences. Their originals, renderer, player and frame-specific verification scripts remain historical source. The new scene remains photographic 2.5D, not a modeled botanical simulation. Blender/Sharp assets were reused; no new generation, animation engine or backend was added.

Existing transfer asset gating, static artwork fallback, semantic Back restoration and public demo flows remain. The camera scan feature is separate from the removed photographic frame playback.

## Verification

- Production build, lint and 30 existing unit tests pass.
- `verification/curtain/results.json`: 48 curtain checkpoints at eight viewport sizes, including 3440px wide and a short 650px desktop. Closed/open holds, pinned position, no overflow, stationary pixels without scrolling, complete reverse closure, reduced motion and zero legacy frame requests pass.
- Missing clean/cutout artwork leaves a usable public batch action and prevents a broken moving overlay. Eight rapid Back cases with width/height/motion changes pass without a pre-navigation settling sleep.
- Desktop and phone curtain contact sheets were visually inspected. These confirm covered soil at entry and a soft center opening, instead of the earlier above-ground pause.
- Full browser regression passes across eight viewport sizes, including lookup, catalogue, public routes, member preview, QR decoding/downloads, simulated scanner recovery, Back navigation, 200% zoom and reduced motion. Nine main Axe scans and two handoff Axe scans report no violations. All 95 visible contrast samples pass; 64 offscreen samples are excluded.
- The handoff review captures 48 states across eight viewport sizes. Fresh desktop/phone reading, fast and reverse recordings are retained; reading passes last approximately 66 and 52 seconds. Forward/reverse review sheets were visually inspected. `verification/final-build.json` matches the running production preview and identifies the current reports. Physical iPhone/Android checks and independent reader review remain pending.

## Reproduce

Run `npm.cmd run test`, `npm.cmd run lint`, `npm.cmd run build`, and serve the production preview on port 4173. Run `npm.cmd run test:browser`, `node scripts/verify-soil-curtain.mjs`, `node scripts/verify-handoff.mjs`, and `node scripts/verify-contrast.mjs`. Record with `scripts/record-story.mjs`, inspect `scripts/review-story-recordings.mjs` output, then stamp the matching production build with `scripts/stamp-story-evidence.mjs`.
