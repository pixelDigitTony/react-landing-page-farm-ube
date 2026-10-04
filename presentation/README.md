# Ube Farm client presentation

Three landing page directions for the Davao cooperative:

1. **From Root to Story** — the existing working botanical scroll prototype.
2. **Grown Together in Davao** — a warm editorial concept focused on people and place.
3. **Purple to the World** — a bold concept focused on the crop and buyer discovery.

## Presenting

Open `ube-farm-client-presentation.pptx` in PowerPoint and start the slide show. The deck has 10 slides, editable presentation text and shapes, and speaker notes. Slide 4 contains the actual prototype's embedded scroll recording; click the video to play it. Website mockups are high-resolution screenshots.

Use `ube-farm-client-presentation.pdf` for a consistent static copy. PDFs do not play video; use `media/01-root-to-story-scroll.mp4` separately. Each design also has a two-page PDF in `pdfs/`.

Open `index.html` for an offline gallery with direct links to the deck, PDFs, desktop/mobile images and recording. The two `mockups/` HTML files can be browsed offline. They show visual concepts with navigation anchors; the ID and QR controls are design previews.

## Included images

- Three presentation boards and a side-by-side comparison image.
- Desktop and mobile opening views for all three designs.
- Full-page desktop/mobile images for both new concepts.
- Scroll-state images and an assembled journey storyboard for the existing prototype.
- All 10 slides as 1920 × 1080 PNG files in `slides/`.

## Content and imagery

The brand descriptor, copy, farm records and leadership roles are drafts to confirm with the cooperative. The deck makes no numerical demand, sales, export, certification or contract claims.

The farm photograph is AI-generated illustrative concept imagery, not actual cooperative members. Replace it with original cooperative photography in the approved design. A prompt summary and the source image are included in `resources/`. Generated with the built-in `image_gen` tool; no external asset provider was used.

The first design is a working prototype. Motion in the two new designs is proposed and described in the storyboards. All three preserve the same intended farm profile access through farm ID, QR scanning and partner links.

## Editing and regenerating

Edit deck text and shapes directly in PowerPoint. In the project, presentation copy and palettes are centralized in `presentation/source/content.mjs`; the existing application's copy and colors remain in `src/constants/site.ts`.

For source regeneration, keep the Vite server running on `127.0.0.1:4173`, then run these scripts from the project root in order:

```powershell
node presentation/source/mockups.mjs
node presentation/source/capture.mjs
node presentation/source/prepare-assets.mjs
node presentation/source/build-deck.mjs
& presentation/source/export-powerpoint.ps1
node presentation/source/package.mjs
```

The PDF and slide-image export uses installed Microsoft PowerPoint. Rebuilding replaces generated artifacts, including manual edits to the generated PowerPoint, so save a separate copy for manual revisions.

## Verification

The deck opened and exported through installed PowerPoint. All 10 slides were visually reviewed; PowerPoint reported no text-height overflow. Desktop and mobile screenshots were checked for horizontal overflow. The movie is H.264 MP4 and is embedded in the main deck. PDF page counts and package contents are checked in the generation report.
