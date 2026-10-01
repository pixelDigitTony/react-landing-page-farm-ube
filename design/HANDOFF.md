# Ube Farm Figma handoff

Figma: https://www.figma.com/design/t7XYmJBRGZ0sQ1E78Wcl6B

Created from the agreed From Root to Story plan using the Figma create-new-file, generate-design, use-figma, and generate-library skills. The file fits the Starter account's three-page limit.

## Design inventory

- Foundations: temporary identity, color variables with semantic aliases, spacing and radius variables, Cormorant Garamond and DM Sans text styles, button/input state variants, reusable partner links, botanical source assets, motion score, layer contract, and intermediate growth frames.
- Desktop: eight 1440px scroll-story scenes, three sample public farm profiles, QR scanner, camera permission recovery, and filled/empty/unknown-ID lookup states.
- Mobile: eight 390px story scenes, three farm profiles, scanner/denied/no-camera states, waypoint menu, unknown-ID and missing-route recovery, loading state, 360px compact and keyboard-open lookup, and a complete reading view.

## Verified

- Desktop and mobile storyboard composition screenshots were reviewed.
- Artwork is separate from editable headings, body copy, SVG leaves/trellis, and component instances.
- Generated PNG corner transparency was checked. Originals remain intact; project copies are in design/assets.

## Unfinished due to Figma Starter MCP tool limit

The account tool-call limit blocked further editing and final verification. The design is ready to inspect, but the following work remains:

1. Place an opaque cream header contrast plane above artwork in desktop scenes. Bring brand/nav/actions above it; split the monolithic navigation text into separate links.
2. In the mobile tip-leaf scene, move the trellis farther right and narrow it so it does not cross the lookup heading.
3. Resize the reading-view frame to remove excess bottom space. The content container height was 2634px when created.
4. Complete prototype connections. Two committed top-level test frames exist: Intro 12:54 and Growth 12:75. They are not connected. Attempts to create and wire prototype frames in one transaction were rejected; failed transactions left no prototype section or other duplicate frames. Commit all top-level destination frames before setting reactions, and validate whether navigation then succeeds.
5. Review final foundations, profiles, scanner and error-state screenshots; repeat screenshots only after a relevant fix.

All exact Figma node IDs and state records are in figma-state.json. No application implementation has been started.

## Botanical imagery

Generated using the built-in image_gen tool, with genuine transparency requested. Art is illustrative, not documentary farm photography.

Plant prompt: A tall realistic Dioscorea alata vine wrapped around one slender green-painted pipe trellis, from textured yam and soil roots to a tender tip leaf, six alternating heart-shaped leaves, photographic botanical texture, warm upper-left morning light, complete silhouette, transparent margins, no labels or interface.

Root prompt: One rough brown Dioscorea alata root ball with fine roots and a two-leaf green sprout, a small cut end revealing violet flesh, isolated horizontally, warm upper-left light, tactile photographic detail, complete silhouette, transparent background, no labels or interface.
