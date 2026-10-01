# Ube Farm. From root to story.

React, TypeScript, React Router and Vite, running on Node 26. The implementation uses the user-supplied Figma component and motion exports, with Cue as a behavior reference, and the scroll-craft engine unchanged.

## Run locally

```powershell
npm ci
npm run dev
```

The development server prints its URL. Production output is generated with `npm run build` and can be viewed with `npm run preview`. Deploy the `dist` directory with an SPA fallback to `index.html`, so direct `/farms/:farmId` links work. Camera scanning requires HTTPS outside localhost.

## Edit content and colors

Edit **`src/constants/site.ts`**. This file contains every heading, body, label, accessibility description, validation message, placeholder, sample farm record, display font name, and UI palette. Colors become CSS custom properties through `applyTheme()`; CSS contains no fixed UI palette values. Generated farm QR codes and the favicon also use this palette. `npm run assets` regenerates them; development and build run this automatically.

`JOURNEY` in the same file controls stage labels and scroll weights. `src/lib/journey.ts` contains the root drop, growth, camera ascent/descent, and root-board timing. If weights change, adjust these choreography thresholds to match the desired narrative.

The photographic cutouts retain their natural colors. To change the illustrations themselves, replace the originals in `design/assets` and run `npm run assets`. They are separate from all editable text and vector leaves.

## Farm data and QR behavior

The sample catalog uses IDs `0001`, `0002`, and `0003`. All names, locations, growing practices, imagery, and leadership role copy are clearly labeled as samples or awaiting supplied information. No backend, database, credentials, or invented farm statistics are included.

`src/data/farms.ts` reads only the static catalog in the constants file. It makes no API requests. Keep leading zeroes in IDs. Manual entry and the scanner accept a printed ID or a same-origin `/farms/:farmId` URL. External URLs, malformed paths, and unknown farms receive recovery messages.

Profiles generate a QR code containing the current site's canonical farm URL, and offer an SVG download. Static ID codes in `public/qr` are a scanner-compatible fallback and test fixtures. The scanner is loaded only after its button is pressed. It uses a rear camera where available, releases tracks on close/navigation/success, and offers manual entry when the camera cannot be used.

## Motion and accessibility

The native scroll journey follows one plant: root drop, dramatic ascent, tip lookup, story, growing care, harvest, partner leaves, and a root that grows into Sir Marco's leadership board. Waypoint buttons and Skip intro allow direct access. Browser Back restores the previous leaf position. Focused lookup controls remain reachable when the viewport shrinks for a keyboard.

Reduced motion automatically uses an ordinary reading page with all content and still artwork. Visitors can also choose Reading view; that preference persists for the current session. Hidden scenes are inert, the QR scanner uses a native modal dialog, and copy is real selectable HTML.

## Verification

```powershell
npm test
npm run lint
npm run build
# Start a local server first, then:
npm run test:browser
```

The browser script uses installed Chrome headlessly. Set `TEST_URL` to test a preview server; set `CHROME_PATH` if Chrome is elsewhere. It disables native pointer lock/capture, checks desktop, 390px mobile and 360px compact compositions, reduced motion, keyboard resizing, ID validation, profile routes, partner links, Back, QR download contents, camera error recovery, delayed camera cleanup, and real ZXing decoding with a simulated stream.

Screenshots, contact sheets, and the browser report live in `scrollcraft/builds/ube-farm/verification`. Physical phone camera, browser chrome, touch scrolling, and real mobile keyboard behavior still need device acceptance. The current revision uses the supplied foundations, motion notes, component exports, and tight transparent botanical assets. See `design/REIMPLEMENTATION.md` for the shared-camera and attachment contract.
