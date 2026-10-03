# Photographic asset provenance

Visual authority: `presentation/design-redesign/01-root-to-story.png`, the user's saved 1086 × 1448 design. Built-in imagegen was used; no Figma/API key or third-party generation service was required. These are illustrative photographs, not verified farm images.

Shared direction: photographic tropical ube farm inspired by Davao, warm late-afternoon light from the upper right, forest greens, natural purple yam, imperfect soil, visible leaf veins and believable green pipe trellis. Match the supplied composition. No text, interface, logos, checkerboards, plastic surfaces, illustration or glow.

1. `master.png`: edit the supplied reference into a text-free full scene. Remove navigation, headings, form, buttons, borders and embedded cards, reconstructing the photograph beneath. Preserve hills on the left, green pipe near the right third, large heart-shaped leaf, ground surface near the lower quarter and exposed purple yam on the lower right. This also serves as the complete fallback composition.
2. `landscape.png`: edit the master, removing all above-ground foreground trellis, vines and attached leaves. Rebuild hills and cultivated greenery at the exact same canvas/perspective. Preserve soil and roots below. The underground plate is integrated into this background to prevent independently drifting roots.
3. `plant.png`: extract the entire connected above-ground pipe, winding vine and attached leaves, including the lookup leaf, from the master. Preserve original full-canvas placement and genuine transparent alpha. Remove landscape, sky, soil and underground content. The leaf stays in the same connected group as its stem.
4. `foreground.png`: extract only the soft lower-left foreground foliage from the master on genuine alpha, preserving full-canvas placement. Do not include the trellis, roots or background.
5. `farm-one.png`: create a separate wide 16:9 above-ground cultivated tropical hillside with neat green crop rows, palms and distant mountains in warm light. No exposed yam, roots, cross-section, foreground trellis, labels or interface.
6. `farm-two.png`: create a distinct wide 16:9 above-ground growing area with broad crop leaves, palms, mountains and a small farm shelter. Same lighting. No exposed roots, cross-section, yam or interface.
7. `soil.png`: create an opaque photographic texture of irregular dark brown cultivated soil in natural warm light. No crop, yam, text or interface. Used for the moving soil cover.

The first farm variants included unwanted underground subjects and were rejected. Approved crops use versioned delivery names `farm-one-v2` and `farm-two-v2`. Originals remain PNGs here. Sharp only resizes/encodes delivery WebP and assembles QA contact sheets.

Alpha gate: plant alpha spans 0–255; foreground spans 0–254. Both were inspected at full resolution and within the assembled scene. Root crown and leaf placement retain the shared master coordinate system. No flattened UI screenshot is used as a clickable page.
