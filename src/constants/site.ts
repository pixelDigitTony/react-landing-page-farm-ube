/** All public copy, colors, records, assets and motion are edited here. */
export const THEME = {
  colors: { canvas: '#102F26', header: '#12372D', surface: '#173E32', surfaceDeep: '#0B211B', text: '#F5F0E5', textMuted: '#C2CCC0', buttonFill: '#F3ECDD', buttonText: '#15362B', border: '#8FA393', focus: '#D6E6AA', soil: '#251D17', ube: '#78518F', error: '#FFC1B7' },
  fonts: { display: 'Cormorant Garamond', body: 'DM Sans' },
  opacity: { heroScrim: .88, heroReading: .76, leafScrim: .86, rootsReading: .88, footerScrim: .85, cardSurface: .94, border: .55, secondary: .4, input: .85, farmsStart: .92, farmsEnd: .65, roots: .85, phoneRoots: .9, phoneHeroStart: .9, phoneHeroEnd: .4, phoneLeaf: .84, backdrop: .78, qrBorder: .4, divider: .3, placeholder: .8, disabled: .7 },
  space: { xs: 4, s: 8, sm: 12, m: 16, ml: 20, l: 24, xl: 28, xxl: 32, xxxl: 36, section: 40, touch: 44, large: 48, larger: 52, huge: 64, hero: 76, sectionEnd: 80, gutter: 88, wide: 96, foliage: 110 },
  typography: { brand: '28px', brandNarrow: '23px', brandTablet: '24px', brandPhone: '20px', brandCompact: '18px', body: '16px', control: '14px', small: '12px', input: '16px', hero: 'clamp(88px, 10vw, 128px)', heroNarrow: '100px', heroTablet: 'clamp(72px, 10vw, 94px)', heroPhone: 'clamp(48px, 13vw, 58px)', heroCompact: '48px', heroBody: 'clamp(18px, 1.85vw, 21px)', phoneBody: '17px', section: 'clamp(44px, 4.9vw, 68px)', sectionPhone: '39px', roots: 'clamp(54px, 5.7vw, 80px)', rootsPhone: '44px', lookup: 'clamp(30px, 3vw, 42px)', lookupPhone: '36px', detail: 'clamp(58px, 7vw, 96px)', detailPhone: '54px', subheading: '38px', qr: '34px', dialog: '40px', dialogPhone: '34px', card: '18px', cardPhone: '16px', lead: '20px', leadPhone: '18px', arrow: '21px', lineBody: 1.65, lineHeading: 1.05, lineHero: .94, linePhoneHero: .99, lineFeedback: 1.55, tracking: '-.035em', brandTracking: '.24em', phoneBrandTracking: '.17em', eyebrowTracking: '.22em' },
  layout: { desktopHeader: 68, mobileHeader: 60, gutterMax: 88, radius: 4, gutter: '5.2vw', phoneGutter: 20, compactGutter: 16, heroHeight: 'clamp(600px, 55.4vw, 900px)', heroTablet: 950, heroPhone: 900, heroTop: 'clamp(135px, 14vw, 230px)', tabletTop: 100, phoneTop: 76, heroBottom: 70, rootsMin: 400, phoneRootsMin: 530, lookupMax: 420, lookupDesktopTop: 200, lookupReserve: 88, lookupPhoneGap: 36, lookupPhoneBottom: 40, lookupPadding: 18, controlHeight: 52, inputHeight: 48, focusWidth: 3, focusOffset: 5, borderWidth: 1, thumbAspect: 1.85, detailMax: 1320, qrWidth: 340, tabletQrWidth: 300, dialogWidth: 620, detailImageHeight: 360, phoneImageHeight: 250, sceneFade: 110, foliageWidth: 'clamp(450px, 65vw, 1000px)', foliageTop: 120 },
  gradient: { heroHold: '50%', leafHold: '75%', readingHold: '75%', farmsHold: '90%', farmsFade: '85%', rootsFade: '45%', rootsFeather: '48px', soilOpaqueStart: '40%', footerFeather: '15px' },
  shadow: '0 12px 40px rgb(5 20 14 / 0.18)',
} as const
export const MOTION = {
  desktop: 1024, phone: 768, compact: 375, narrowDesktop: 1190,
  landscape: 48, middle: 24, foreground: -36, mobileLandscape: 16, mobileMiddle: 8, mobileForeground: -20,
  cardRise: 14, mobileCardRise: 8, entrance: .5, stagger: .07, scrub: .35,
  cardScale: 1.025, arrowTravel: 4, hover: .3, ui: .18, arrow: .2, cssEase: 'ease', ease: 'none', entranceEase: 'power2.out',
  rootReveal: { startViewport: .9, endViewport: .95, mobileEndViewport: .28, endHold: 32 },
  trigger: { heroStart: 'top top', heroEnd: 'bottom top', cardsStart: 'top 85%' },
} as const
const image = (name: string, width: number, height: number) => ({ src: `/images/origin/${name}-1600.webp`, small: `/images/origin/${name}-800.webp`, width, height, smallWidth: Math.min(800, width), largeWidth: Math.min(name.startsWith('farm-') ? 800 : 1600, width) })
export const ASSETS = {
  landscape: image('landscape', 1086, 1448), canopy: image('canopy', 1086, 1080), master: image('master', 1086, 1448), plant: image('plant', 1086, 1448), foreground: image('foreground', 1086, 1448), soil: image('soil', 1672, 941), soilLip: image('soil-lip', 2043, 770), farmOne: image('farm-one-v2', 1672, 941), farmTwo: image('farm-two-v2', 1672, 941),
  soilRevealMask: '/images/origin/soil-reveal-mask.svg',
  anchors: { soilLine: .746, rootCrownX: .82, lookup: { x: .65, y: .155, width: .265, height: .205 }, alignment: { desktopLookup: .78, tabletLookup: .69, phoneCrown: .91 }, depth: { farEnd: .4, middleStart: .32, middleEnd: .73, depthFeather: .08 } },
} as const
export const SITE = {
  brand: 'ROOTE ORIGIN', title: 'Roote Origin | Every harvest starts here',
  description: 'Discover the farms and people behind your ube. Explore sample farms and trace a sample batch from growing to processing.',
  symbols: { forward: '→', back: '←', close: '×', menu: '☰', separator: ' · ' },
  links: { publicOrigin: '' }, format: { locale: 'en-PH', qrPrefix: 'roote-origin' },
  nav: { farms: 'Our farms', story: 'Our story', trace: 'Trace a batch', member: 'Member login', menu: 'Menu', close: 'Close menu', home: 'Roote Origin home', label: 'Main navigation', skip: 'Skip to content' },
  hero: { location: 'DAVAO, PHILIPPINES', title: 'Every harvest\nstarts here.', body: 'Discover the farms and people behind your ube.', explore: 'Explore our farms', story: 'Follow the story' },
  lookup: { title: 'Find your origin', body: 'Enter a farm or batch ID, or scan its QR code.', label: 'Farm or batch ID', placeholder: 'Enter ID here…', submit: 'Find origin', scan: 'Scan QR', loading: 'Finding…', example: 'Sample IDs: 0001 or SAMPLE-UBE-001', empty: 'Enter the farm or batch ID printed beside your QR code.', invalid: 'Use a farm or batch ID, or a QR URL issued by this site.', notFound: 'That ID is not in this sample catalogue. Check the ID and try again.', ambiguous: 'This ID matches a farm and a batch. Use its full QR link to choose the correct record.', failed: 'The record could not be opened. Please try again.' },
  farms: { title: 'Meet the farms on our vine', sample: 'Sample farm records', action: 'View farm', all: 'View all farms', directory: 'Our farms', directoryBody: 'Explore the farms and produce in this illustrative cooperative catalogue.', search: 'Search farms', placeholder: 'Search by farm, location or produce', empty: 'No farms match your search.', clear: 'Clear search', count: 'farms', featured: ['0001', '0002'] },
  roots: { title: 'The people\nbehind the roots', action: 'Meet the cooperative' },
  profile: { back: 'Back to farms', sample: 'Sample farm record', disclosure: 'Illustrative imagery and sample records. Farm names, locations and growing practices await verified cooperative information.', story: 'The story of this farm', practices: 'Growing practices', produce: 'Produce', batches: 'Public sample batches', noBatches: 'No public sample batches are linked to this farm yet.', location: 'Location', id: 'Farm ID', imageNote: 'Illustrative farm photograph', missingTitle: 'Farm not found', missingBody: 'This farm is not in the sample catalogue. Find another origin or browse our farms.', loading: 'Opening the farm…', failed: 'The farm could not be opened.', retry: 'Try again' },
  batch: { title: 'The origin of your ube', sample: 'Sample public batch summary', disclosure: 'This fictional example demonstrates the public summary a consumer could open from a batch QR. It does not certify authenticity or export eligibility.', id: 'Batch ID', produce: 'Produce', farm: 'Source farm', growing: 'Growing summary', harvest: 'Harvest date', processor: 'Processed by', recipient: 'Intended brand or distributor', journey: 'From farm to recipient', missingTitle: 'Batch not found', missingBody: 'This batch is not in the public sample catalogue. Check its ID or try the sample below.', action: 'View batch', sampleId: 'SAMPLE-UBE-001', stages: ['Growing', 'Harvest', 'Processing', 'Recipient'] },
  qr: { farmTitle: 'Keep this farm close', batchTitle: 'Keep this origin close', farmBody: 'This farm QR opens the same public farm profile.', batchBody: 'This batch QR opens this specific public batch summary.', svg: 'Download SVG', png: 'Download PNG', alt: 'QR code for', failed: 'QR artwork could not be generated. Try again.', retry: 'Generate QR again' },
  scanner: { title: 'Scan an origin QR', body: 'Point your camera at a farm or batch QR code.', starting: 'Starting your camera…', ready: 'Keep the QR code inside the frame.', deniedTitle: 'Camera access is off', deniedBody: 'Allow camera access in your browser, or enter the ID instead.', unavailableTitle: 'No camera available', unavailableBody: 'You can still find an origin by entering its ID.', secureTitle: 'Camera access needs HTTPS', secureBody: 'Open this site over a secure connection, or enter the ID instead.', errorTitle: 'Your camera could not start', errorBody: 'Close other apps using the camera and try again, or enter the ID.', invalid: 'This QR is not a farm or batch link issued by this site.', missing: 'This origin is not in the public sample catalogue.', manual: 'Enter ID instead', retry: 'Try camera again', close: 'Close QR scanner', preview: 'Live camera preview' },
  member: { title: 'Member access preview', body: 'This prototype uses static sample data. The planned Roote Origin member portal will connect the people responsible for each produce batch.', roles: ['Administrators', 'Growers and farm teams', 'Processors', 'Brand owners and distributors'], note: 'Sign-in, record management and permissions are part of the future MERN backend phase.', action: 'Explore a sample public batch', close: 'Close member preview' },
  cooperative: { title: 'Good roots. Shared purpose.', intro: 'Roote Origin brings farm discovery and recorded produce origins into one cooperative story.', sample: 'Sample cooperative introduction. Final history, membership and roles await confirmation.', ecosystemTitle: 'Connected through the harvest', ecosystemBody: 'Growers record how produce is raised and harvested. Processors connect that harvest to their work. Brand owners and distributors carry the story onward. Consumers discover the approved public summary through a batch QR.', leadershipTitle: 'The people behind the cooperative', name: 'Sir Marco', role: 'Official roles and responsibilities to be supplied.', action: 'Explore our farms' },
  common: { back: 'Back to the farm story', browse: 'Browse farms', sample: 'Illustrative imagery and sample records.', unknownTitle: 'This page is not here', unknownBody: 'Find a farm or batch, or return to the farm story.', home: 'Return home' },
  footer: { disclosure: 'Design concept. Illustrative imagery and sample records.', line: 'Rooted in care. Connected through our farms.', reduce: 'Reduce motion', enable: 'Enable motion', system: 'Reduced motion is enabled by your device' },
  accessibility: { leaf: 'Leaf emblem', menu: 'Mobile navigation', main: 'Farm story', roots: 'Purple yam roots beneath the soil' },
} as const
export const DEMO_DATA = {
  farms: [
    { id: '0001', name: 'Sample Farm 01', location: 'Sample growing site A, Davao', image: ASSETS.farmOne, imageAlt: 'Illustrative hillside farm with tropical foliage and cultivated rows', produce: ['Ube'], story: 'A sample hillside farm introduces the people and place behind the crop. This record is ready for the cooperative’s verified farm story.', practices: 'Sample practices: planting purple yam, providing trellis support and observing everyday crop care.' },
    { id: '0002', name: 'Sample Farm 02', location: 'Sample growing site B, Davao', image: ASSETS.farmTwo, imageAlt: 'Illustrative ube growing area with palms and a small farm shelter', produce: ['Ube'], story: 'This sample farm shows how another grower can share their location, produce and cultivation story in the same public catalogue.', practices: 'Sample practices: supported vine growth, field observation and careful harvesting. Confirm the actual methods with the grower.' },
    { id: '0003', name: 'Sample Farm 03', location: 'Sample growing site C, Davao', image: ASSETS.farmOne, imageAlt: 'Illustrative tropical cultivated hillside used for a sample farm', produce: ['Ube'], story: 'A third illustrative member record demonstrates that the catalogue extends beyond the two featured farms.', practices: 'Sample practices: planting, trellis care and recorded harvest dates. Verified information will replace this description.' },
  ],
  batches: [{ id: 'SAMPLE-UBE-001', farmId: '0001', produce: 'Ube', harvestDate: '2026-10-01', growingSummary: 'Sample growing summary: trellis-supported ube with everyday field care.', processor: 'Sample Processor B', recipient: 'Sample Brand C' }],
} as const
export function applyTheme() {
  const style = document.documentElement.style
  for (const [key, value] of Object.entries(THEME.colors)) style.setProperty(`--color-${key.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}`, value)
  for (const [key, value] of Object.entries(THEME.opacity)) style.setProperty(`--opacity-${key.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}`, String(value))
  for (const [key, value] of Object.entries(THEME.space)) style.setProperty(`--space-${key}`, `${value}px`)
  for (const [key, value] of Object.entries(THEME.typography)) style.setProperty(`--type-${key.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}`, String(value))
  for (const [key, value] of Object.entries(THEME.layout)) style.setProperty(`--layout-${key.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}`, typeof value === 'number' && !['thumbAspect'].includes(key) ? `${value}px` : String(value))
  for (const [key, value] of Object.entries(THEME.gradient)) style.setProperty(`--gradient-${key.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}`, value)
  style.setProperty('--font-display', `"${THEME.fonts.display}", Georgia, serif`)
  style.setProperty('--font-body', `"${THEME.fonts.body}", sans-serif`)
  style.setProperty('--header-height', `${THEME.layout.desktopHeader}px`)
  style.setProperty('--mobile-header-height', `${THEME.layout.mobileHeader}px`)
  style.setProperty('--gutter-max', `${THEME.layout.gutterMax}px`)
  style.setProperty('--radius', `${THEME.layout.radius}px`)
  style.setProperty('--shadow', THEME.shadow)
  style.setProperty('--hover-scale', String(MOTION.cardScale))
  style.setProperty('--arrow-travel', `${MOTION.arrowTravel}px`)
  style.setProperty('--motion-hover', `${MOTION.hover}s`)
  style.setProperty('--motion-ui', `${MOTION.ui}s`)
  style.setProperty('--motion-arrow', `${MOTION.arrow}s`)
  style.setProperty('--motion-ease', MOTION.cssEase)
  for (const [key, value] of Object.entries(ASSETS.anchors.depth)) style.setProperty(`--${key.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}`, `${value * 100}%`)
  document.title = SITE.title
  document.querySelector('meta[name="description"]')?.setAttribute('content', SITE.description)
}
export type Layout = 'desktop' | 'tablet' | 'phone' | 'compact'
export function layoutForWidth(width: number): Layout { return width >= MOTION.desktop ? 'desktop' : width >= MOTION.phone ? 'tablet' : width >= MOTION.compact ? 'phone' : 'compact' }
