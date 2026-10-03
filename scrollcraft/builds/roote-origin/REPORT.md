# Roote Origin delivery

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

Desktop depth is at most 48px for the landscape and 36px for foreground foliage, with 14px card entrances. Tablet and phone use 16px/20px and 8px entrances. Botanical attachments stay in one alpha group; the underground plate stays in the same background coordinate system. The lookup never follows a transform. No wheel/touch interception, snap scrolling or long pins.

## Artwork and implementation choices

Generated a text-free photographic master, clean landscape/underground plate, transparent connected plant and edge foliage, two farm photographs, and soil texture. Sources, retained prompts, intrinsic dimensions and delivery manifest are in `design/assets/origin`. The lookup leaf remains part of the connected plant; roots remain part of the landscape plate, avoiding independent anatomy that could drift. Phone/tablet use responsive composition and crop rules rather than a duplicate content tree. Static fallback retains the same scene if required layers fail.

All copy, colors, records, image references and motion settings are centralized in `src/constants/site.ts`. React Router preserves farm URLs and adds the catalogue, batch summary and cooperative. ID lookup and scanner use the same validated static repository. Member access is explicitly a preview with no credential fields.

Responsive scene files plus farm thumbnails total about 1.02MB using small variants; large variants total about 1.64MB. The actual desktop initial image set uses the 800px soil cover and thumbnails, approximately 1.32MB. Farm thumbnails are 112–115KB. The PNG originals are outside public delivery. Camera decoding and detail routes load separate bundles on demand.

## Verification and feel review

Production build, lint and 25 unit tests passed. Installed Chrome exercised 1440×900, 1920×1080, 1086×900, 834×1194, 390×844 and 360×640. Contact sheets sample six hero and six root positions per size. Full-page evidence uses reduced motion so every section remains visible in one capture. No horizontal overflow or unfinished root reveal was observed.

Browser checks cover manual lookup, cancelled stale lookup, invalid/external IDs, unknown records, farm/batch routes, catalogue search, QR SVG/PNG downloads decoded back to their URLs, direct refresh, anchor focus, member preview, Back restoration, repeated route changes, stored/system motion preference, camera errors/retry/manual fallback, delayed permission cleanup, and real ZXing decoding using simulated farm and batch video. Failed/slow layer checks preserve semantic content and useful controls. Native pointer lock/capture are disabled in automation.

Axe scans passed for desktop/mobile landing, farm, batch, cooperative and member dialog. Separate screenshot-based contrast checks sample the brightest pixels behind actual text lines. All sixteen sampled desktop/mobile text targets meet 4.5:1 for normal text or 3:1 for large text. This is sampled evidence, not a claim that automated tools establish complete accessibility.

Visual feel review: landscape → useful finder → grower photographs → underground reveal → held cooperative close. The root reveal is the principal visual change and the end remains visible. Review found a tablet breakpoint without an active timeline, focus returning to the scanner after manual fallback, hard shading edges and insufficient photographic text contrast. Those were corrected with a tablet motion branch, deferred input focus, softer local scrims and stronger shading where required. The tablet lookup was moved into the large leaf's safe area.

Evidence: `verification/report.json`, `verification/contrast.json`, viewport opening/closing/full screenshots, and six motion contact sheets. README documents sample IDs, editing and preview commands.

## Remaining acceptance

Physical iPhone/Android camera permissions, native keyboard, browser chrome, and touch behavior remain untested. Headless Chrome uses simulated video. The half-width viewport check represents enlarged browser content; true device/browser 200% zoom remains manual acceptance. Photographs and all public records are illustrative. Brand identity, leadership roles, farm information and actual batch records await the cooperative. Authentication, Express/MongoDB, member permissions and publication workflows remain the separate MERN phase.
