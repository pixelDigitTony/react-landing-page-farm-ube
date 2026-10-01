/** Edit this file to change the site's copy, sample farm records, and UI palette. */
export const SITE = {
  brand: 'ube farm',
  symbols: { forward: '↗', back: '←', close: '×', download: '↓', separator: ' · ' },
  title: 'Ube Farm | From root to story',
  description: 'Discover the people, places, and care behind purple yam. Find a partner farm by its ID or QR code.',
  fonts: { display: 'Cormorant Garamond', body: 'DM Sans' },
  colors: {
    cream: '#F6F3EA', paper: '#FFFEF8', purple: '#542A69', violet: '#A480B8',
    lavender: '#E7DCEA', ink: '#263A2D', muted: '#637064', green: '#35583C',
    leaf: '#527747', lime: '#C2CE9F', soil: '#483727', border: '#D6DBCB',
    white: '#FFFFFF', error: '#A73E35', leafLight: '#E4EACF', leafDark: '#C1D09E',
    vein: '#9CAB7F', pipeLight: '#729578', pipeDark: '#224934', vine: '#70924C',
    soilLight: '#B9AE92', soilMid: '#897A5E', rootSkin: '#594131',
    shadow: '#263A2D', backdrop: '#17271D',
  },
  nav: {
    find: 'Find a farm', story: 'Our story', growing: 'Growing', harvest: 'Harvest',
    partners: 'Partners', leadership: 'Leadership', menu: 'Menu', close: 'Close',
    skip: 'Skip intro', reading: 'Reading view', animated: 'Animated view',
    skipContent: 'Skip to farm lookup', home: 'Go to Ube Farm home',
    menuLabel: 'Explore the plant', waypointLabel: 'Plant story navigation',
  },
  intro: {
    title: 'Every story starts\nbeneath the surface.',
    body: 'Meet the people, places, and care behind purple yam. A farm story that grows with you.',
    footer: 'A story of soil, people, and purple possibility.',
  },
  growth: {
    title: 'Small beginnings.\nExtraordinary growth.',
    body: 'An ube vine reaches upward, one leaf at a time. Our story follows its climb.',
    tag: 'Root to canopy',
  },
  lookup: {
    title: 'Find your farm.', body: 'Every farm has a story. Enter its ID or scan the QR code to discover it.',
    label: 'Farm ID', placeholder: 'Enter farm ID', submit: 'View farm', scan: 'Scan QR',
    example: 'Try sample farm ID 0001', exampleId: '0001', loading: 'Finding your farm…',
    empty: 'Enter the farm ID printed below your QR code.',
    invalid: 'Use the farm ID or a QR code issued by this site.',
    notFound: 'We couldn’t find a farm with that ID. Check the number and try again.',
    failed: 'Your farm couldn’t be opened. Please try again.',
  },
  story: {
    title: 'A story worth\ngrowing together.',
    body: 'Ube Farm brings our company story and partner farms into one place. Discover the people behind the crop and the care that connects them.',
    note: 'Sample company introduction. Final history and mission to be supplied.',
  },
  growing: {
    title: 'Care in every climb.',
    body: 'Follow the crop from planting and vine support to everyday care. Discover the farm’s growing practices in clear, useful language.',
    practices: ['Planting', 'Trellis support', 'Daily care'],
    note: 'Sample educational copy. Confirm practices with the farm.',
  },
  harvest: {
    title: 'Purple at the heart.',
    body: 'From the earth to the harvest, every farm has a process to share. Learn how the crop is gathered, handled, and connected to its buyers.',
    note: 'Sample process story. Final harvest and handling details to be supplied.',
  },
  partners: {
    title: 'Different farms.\nShared roots.',
    note: 'Sample partner catalog. Each leaf opens its matching public farm profile.',
    action: 'View farm', idLabel: 'Farm ID',
  },
  leadership: {
    title: 'Rooted in leadership.', name: 'Sir Marco',
    roles: 'Official roles and company responsibilities to be supplied.',
    body: 'A space for the people and purpose behind the farm.',
    footer: 'The story returns to its roots.',
    action: 'Find a farm',
  },
  scanner: {
    title: 'Scan a farm QR.', body: 'Point your camera at the farm’s QR code.',
    starting: 'Starting your camera…', ready: 'Keep the QR code inside the frame.',
    deniedTitle: 'Camera access is off.',
    deniedBody: 'Allow camera access in your browser, or enter the farm ID instead.',
    unavailableTitle: 'No camera available.',
    unavailableBody: 'You can still find your farm by entering its ID.',
    secureTitle: 'Camera access needs a secure connection.',
    secureBody: 'Open this site over HTTPS, or enter the farm ID instead.',
    errorTitle: 'Your camera couldn’t start.',
    errorBody: 'Close other apps using the camera and try again, or enter the farm ID.',
    invalid: 'This QR code doesn’t match a farm on this site. Try another code or enter the ID.',
    missing: 'This farm ID isn’t in the sample catalog. Try another code or enter the ID.',
    manual: 'Enter ID instead', retry: 'Try camera again', close: 'Close QR scanner',
    preview: 'Live camera preview',
  },
  profile: {
    back: 'Back to farm partners', sample: 'Sample farm', location: 'Location',
    storyTitle: 'The story of this farm.', practicesTitle: 'Growing practices',
    detailsTitle: 'Farm details', idLabel: 'Farm ID', partnerLabel: 'Partner',
    contactTitle: 'Public contact', noContact: 'No public contact supplied for this sample.',
    imageNote: 'Illustrative imagery · sample record', qrTitle: 'Keep this farm close.',
    qrBody: 'Scan this code or use the farm ID to open this same profile.',
    download: 'Download farm QR', qrAlt: 'QR code for farm',
    disclosure: 'This is a sample farm record. Names, locations, imagery, and practices will be replaced with verified farm information.',
    loadingTitle: 'Opening your farm.', loadingBody: 'Finding the story behind your farm ID.',
    missingTitle: 'This farm isn’t\nin our catalog.',
    missingBody: 'The link may be incorrect, or this farm may no longer be available. Search for a farm or choose a partner.',
    failedTitle: 'We couldn’t open this farm.', failedBody: 'Please try again or find another farm.',
    browse: 'Browse partners', retry: 'Try again',
  },
  reading: {
    title: 'From root\nto story.', body: 'The complete farm story, with still artwork and ordinary scrolling.',
    disclosure: 'All records and imagery in this concept are samples. Replace them with verified farm information.',
  },
  accessibility: {
    plant: 'Purple yam vine climbing a green pipe trellis', root: 'Sprouting purple yam with a violet cut end',
    farmImage: 'Illustrative purple yam and climbing vine', dialog: 'Find a farm by scanning a QR code',
  },
  footer: 'Rooted in care. Connected through our farms.',
  farms: [
    { id: '0001', name: 'Sample Farm One', location: 'Sample location A' },
    { id: '0002', name: 'Sample Farm Two', location: 'Sample location B' },
    { id: '0003', name: 'Sample Farm Three', location: 'Sample location C' },
  ],
  farmStory: 'This sample profile shows the information a visitor will discover after entering a farm ID, scanning a QR code, or choosing a partner leaf.',
  farmPractices: 'Planting, vine support, and everyday care. Replace these sample descriptions with the farm’s verified methods.',
} as const

export type WaypointKey = 'lookup' | 'story' | 'growing' | 'harvest' | 'partners' | 'leadership'

export const JOURNEY = [
  { key: 'intro', label: SITE.brand, weight: 0.6 },
  { key: 'growth', label: SITE.growth.tag, weight: 2.6 },
  { key: 'lookup', label: SITE.nav.find, weight: 1.2 },
  { key: 'story', label: SITE.nav.story, weight: 1.2 },
  { key: 'growing', label: SITE.nav.growing, weight: 1.2 },
  { key: 'harvest', label: SITE.nav.harvest, weight: 1.2 },
  { key: 'partners', label: SITE.nav.partners, weight: 1.4 },
  { key: 'leadership', label: SITE.nav.leadership, weight: 1.6 },
] as const

export const ASSETS = { root: '/images/ube-root.webp', plant: '/images/ube-trellis.webp' } as const

export function applyTheme() {
  for (const [name, value] of Object.entries(SITE.colors)) {
    document.documentElement.style.setProperty(`--ube-${name.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}`, value)
  }
  document.documentElement.style.setProperty('--font-display', `"${SITE.fonts.display}", Georgia, serif`)
  document.documentElement.style.setProperty('--font-body', `"${SITE.fonts.body}", system-ui, sans-serif`)
  document.title = SITE.title
  document.querySelector('meta[name="description"]')?.setAttribute('content', SITE.description)
}
