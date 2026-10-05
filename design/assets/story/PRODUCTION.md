# Story artwork and regeneration

Existing photographic originals live in `../origin`. The new transparent cutout was created with the built-in image-generation tool using `../origin/master.png` as its edit target. Retained original: `yam-roots.png`.

Prompt: Extract only the complete underground yam cluster and attached fine roots from the lower right. Preserve the original view, purple cut end, rough brown skin, roots and warm upper-right lighting. Remove surrounding soil, hills, trellis above the root crown, leaves and backdrop. Genuine transparency, clean fine edges, generous margins, no text or UI.

The scene is a 2.5D photographic cutaway. Source photos are emission-textured cards at separate depths. The camera descends, the cover withdraws, and irregular soil geometry masks the landscape join. The vine foot and generated root crown share a measured contact point. It does not simulate growth or represent a verified specimen.

`scripts/render-story.py` is the reproducible scene definition. Blender 5.2.2 LTS was used. `harvest-story.blend` and `harvest-story-phone.blend` retain the editable scenes and local texture references. Keep this directory and the referenced original artwork together.

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --python scripts/render-story.py -- --proof
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --python scripts/render-story.py
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --python scripts/render-story.py -- --phone
node scripts/prepare-story.mjs
```

Original renders are 1280×720 desktop and 720×960 portrait. Delivery is 60 frames at 1280×720 desktop and 40 frames at 480×640 phone/tablet. Encoded sequence totals are 7,897,632 / 2,689,918 bytes. The portrait camera centers its final view at x=2.05 with scale=7.4; the image is displayed at its 3:4 ratio so the root silhouette stays inside the frame. Desktop artwork is bounded to 1920px and displayed proportionally at 16:9; its complete composition is retained. Sharp encodes original renders at quality 68, without upscaling. The desktop and portrait handoff images come from the exact final scene, rendered with only the yam/root card visible and transparent film enabled.

Runtime does not decode every frame. It maintains at most 8 desktop / 6 phone ImageBitmaps and three concurrent requests. Compressed responses may remain in the browser cache; this differs from decoded image memory. Original PNGs and `.blend` files never enter `public` or `dist`.

`manifest.json` summarizes delivery totals. `src/constants/storyAssets.ts` is the generated typed manifest shared by runtime and verification; it also contains exact frame filenames, measured alpha bounds and attachment coordinates. Do not edit it independently. `clean-desktop.png` / `clean-phone.png` preserve the final camera and environment with the yam hidden. Cropped alpha subject exports match those bounds. The renderer exports both clean plates and cutouts when regenerated. UI text and colors remain in `src/constants/site.ts`, separate from photographic color.

The correction pass uses a single contain-fit geometry for the scene, clean plate and cropped yam. The desktop transfer stays in the right column and uses a uniform scale; copy and fields stay left. Candidate-window failure selects the completed poster even with older cached frames, and reverse scrolling restores valid cached artwork. Back restoration saves the originating link/input, its visible position, viewport width/height and motion/pin mode; font and pin readiness replace fixed timing windows. Review recordings include separate reading, fast and complete reverse passes.
