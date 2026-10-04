# Roote Origin delivery

Latest correction, 4 October 2026: the independent recheck found that the downward soil curtain contributed almost no visible reveal and the member-preview batch link omitted the landing snapshot. Both are now corrected. The soil lifts upward with irregular boundaries and a held final view; the member link uses the common navigation callback. See [the correction report](motion-fix/REPORT.md) for fresh visual comparisons, desktop/mobile Back results and the expanded regression checks.

Implemented the user-approved image-first photographic redesign at http://127.0.0.1:4173/. The supplied design remains the visual authority. The presentation and costing proposal were not revised.

## Composition and motion

Natural-flow botanical feature, with a stable header and leaf lookup, photographic farm previews, and an underground yam reveal. The signature is following the vine through the soil to the people behind the crop. Three document sections replace the previous eleven-screen fixed journey. The old engine is not loaded and its vendor files are unchanged.

The continuous worldflight grammar would delay useful lookup; film, gallery, editorial, argument, typography and cut-based grammars do not serve this connected photographic plant. The new composition differs from the earlier registry entry in all six fingerprint dimensions; plant subject and public QR behavior are intentionally retained.

| Beat | Intended feeling | Device | Resolved state |
|---|---|---|---|
| Landscape | Curiosity | Background depth, immediate serif headline | Copy and form available on load |
| Lookup | Control | Stationary real form on the attached leaf | Farm or batch public destination |
| Farms | Connection | One-time small rise, restrained photo hover | Two featured farms; full catalogue available |
| Soil | Wonder | Scroll-driven soil cover uncovers the purple yam | Complete roots before page end |
| Cooperative | Trust | Quiet heading and useful destination | Root composition holds through the footer |

Desktop/tablet depth is at most 48px for the far landscape, 24px for the middle landscape and 36px for foreground foliage, with 14px card entrances. Phone uses 16px/8px/20px and 8px entrances. Hero-edge foliage moves during the hero instead of appearing only at the roots. Botanical attachments stay in one alpha group; the underground plate stays in the same background coordinate system. The lookup never follows a transform. No wheel/touch interception, snap scrolling or long pins.

## Artwork and implementation choices

Generated a text-free photographic master, clean landscape/underground plate, transparent connected plant and edge foliage, two farm photographs, and soil texture. Sources, retained prompts, intrinsic dimensions and delivery manifest are in `design/assets/origin`. The lookup leaf remains part of the connected plant; roots remain part of the landscape plate, avoiding independent anatomy that could drift. Phone/tablet use a uniform scene transform, a clean canopy extension and a feathered join rather than stretching artwork or duplicating the content tree. The tablet lookup is constrained to the measured leaf safe rectangle; the roots section aligns with the photographic soil line. Static fallback retains the same scene if required layers fail.

All copy, colors, records, image references and motion settings are centralized in `src/constants/site.ts`. React Router preserves farm URLs and adds the catalogue, batch summary and cooperative. ID lookup and scanner use the same validated static repository. Member access is explicitly a preview with no credential fields.

Measured initial image requests, including prefetched farm thumbnails and the new canopy/soil lip, total approximately 1.73MB on desktop and 1.10MB on a phone (decimal MB). Both are within the 2MB desktop / 1.2MB phone targets. Responsive source descriptors match the encoded widths. Farm thumbnails are 112–115KB. The PNG originals are outside public delivery. Camera decoding and detail routes load separate bundles on demand.

## Verification and feel review

Production build, lint and 31 unit tests passed. New geometry tests constrain uniform artwork proportions, soil alignment and tablet reading-area placement. Installed Chrome exercised 1440×900, 1920×1080, 1086×900, 834×1194, 390×844 and 360×640. Contact sheets sample six hero and six root positions per size. Full-page evidence uses reduced motion so every section remains visible in one capture. No horizontal overflow or unfinished root reveal was observed.

Browser checks cover manual lookup, cancelled stale lookup, invalid/external IDs, unknown records, farm/batch routes, catalogue search, QR SVG/PNG downloads decoded back to their URLs, direct refresh, anchor focus, member preview, Back restoration, repeated route changes, stored/system motion preference across every route, mobile member-dialog focus restoration, minimum phone control sizing, camera errors/retry/manual fallback, delayed permission cleanup, and real ZXing decoding using simulated farm and batch video. Failed/slow layer checks preserve semantic content and useful controls. Native pointer lock/capture are disabled in automation.

Axe scans passed for desktop/mobile landing, farm, batch, cooperative, member dialog and the member dialog at native 200% Chrome page zoom. Separate screenshot-based contrast checks sample the brightest pixels behind actual text lines. All twenty-four sampled desktop/tablet/mobile text targets meet 4.5:1 for normal text or 3:1 for large text. This is sampled evidence, not a claim that automated tools establish complete accessibility.

Visual feel review: landscape → useful finder → grower photographs → underground reveal → held cooperative close. The root reveal is the principal visual change and the end remains visible. Review found a tablet breakpoint without an active timeline, focus returning to the scanner after manual fallback, hard shading edges and insufficient photographic text contrast. Those were corrected with a tablet motion branch, deferred input focus, softer local scrims and stronger shading where required. The follow-up review corrected six remaining gaps: tablet stretching/lookup placement, route-wide motion preference, mobile member focus, incomplete central tokens, missing middle/hero-foreground depth and irregular soil reveal, and undersized compact-phone labels. Follow-up screenshots also exposed bright photographic text backgrounds and hard scrim edges; wider feathered local scrims preserve contrast without rectangular panels.

Evidence: `verification/report.json`, `verification/contrast.json`, viewport opening/closing/full screenshots, six motion contact sheets, soil alpha QA and native 200% browser-zoom screenshots. An isolated Chrome profile sets native page zoom to 200%; measured 1440px browser width produces 712px CSS content width, devicePixelRatio 2 and visualViewport scale 1, distinguishing page zoom from pinch zoom. Keyboard lookup, menu/dialog focus, root completion and overflow checks pass at that zoom. README documents sample IDs, editing and preview commands.

## Remaining acceptance

Physical iPhone/Android camera permissions, native keyboard, browser chrome, and touch behavior remain untested. Headless Chrome uses simulated video. Actual native Chrome 200% page zoom was exercised separately from the earlier half-width viewport simulation. Photographs and all public records are illustrative. Brand identity, leadership roles, farm information and actual batch records await the cooperative. Authentication, Express/MongoDB, member permissions and publication workflows remain the separate MERN phase.
