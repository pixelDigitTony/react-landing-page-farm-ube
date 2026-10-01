# Connected plant revision

Reference: user-supplied Figma exports in Downloads/Ube Farm · From Root to Story. The export includes foundations, components, motion notes, and transparent botanical assets, rather than full-page screen exports. Use these exports directly; no further Figma connector access is needed.

The user also supplied https://www.cuewigs.com/ for behavior and feel. Inspected its rendered scroll states: dramatic changes of image scale, expressive oversized type, varied composition, and generous reading intervals. Preserve the farm's own cream, purple, green, botanical artwork, and continuous plant story. Do not reproduce Cue's visual identity.

Frontend only. Farm records remain static. Existing ID, QR, partner, profile, Back, and reduced-motion behavior stays usable. All user-facing copy and palette values stay in src/constants/site.ts.

## Physical layer contract

- Daylight and atmospheric silhouettes move more slowly than the plant camera.
- A single camera contains the root, green pipe, growing vine, branch attachment points, leaf surfaces, and root board.
- Root contact and foreground soil use the same base coordinate. The soil overlaps the root after its drop.
- Vine growth proceeds from the base upwards. Leaves open around their petioles as growth reaches them.
- The ascent is the largest, longest visual change. It pulls back for scale, then moves into the tip leaf.
- Story text is semantic HTML on actual connected leaves. Different descent beats use type reveal, sequential practice pods, harvest imagery, and a partner fan.
- The closing board expands around the original root's contact anchor. It holds with Sir Marco's supplied name and clearly pending roles, plus the farm lookup action.
- Phone composition has its own spacing, type sizing, foliage scale, and vertically arranged partner leaves. Reading/reduced-motion view removes the camera track.

This revises the existing build's implementation; it is not a new fingerprint entry or a change to the approved journey.
