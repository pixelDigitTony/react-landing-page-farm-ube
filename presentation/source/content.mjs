// Shared client-facing copy and palettes for mockups, slides and exports.
export const brand = { name: 'ube farm', descriptor: 'DAVAO GROWERS COOPERATIVE', location: 'Davao, Philippines', footer: 'Rooted in Davao. Growing together.', note: 'Design concept. Proposed copy and illustrative imagery.' }
export const common = {
  nav: ['Our cooperative', 'Our farms', 'Our ube'], find: 'Find a farm',
  lookupTitle: 'Every farm has a story.', lookupBody: 'Enter a farm ID or scan its QR code to meet the growers behind the crop.',
  field: 'Farm ID', placeholder: 'Enter farm ID', submit: 'View farm', scan: 'Scan QR',
  farms: [{ name: 'Partner farm one', id: '0001' }, { name: 'Partner farm two', id: '0002' }, { name: 'Partner farm three', id: '0003' }],
  farmNote: 'Sample farm records for the design presentation.',
  contact: 'Connect with the cooperative', contactBody: 'Get to know our growers, our purple yam and the story behind each farm.',
  origin: 'Davao origins', people: 'Cooperative growers', crop: 'Purple yam',
}
export const concepts = [
  { id: '01', slug: 'root-to-story', title: 'From Root to Story', short: 'Botanical & immersive', theme: 'A farm story that grows with you.', status: 'Existing working prototype',
    colors: ['#F6F3EA', '#542A69', '#35583C', '#C2CE9F'],
    audience: 'Visitors, buyers and anyone discovering the farm.', strength: 'The most memorable interactive experience.',
    motion: 'High. One continuous plant journey.', tone: 'Magical, natural, distinctive.',
    hero: 'Every story starts\nbeneath the surface.',
    summary: 'Plant an ube root, follow its vine into the sky, then discover the cooperative and its farms on connected leaves.',
    beats: ['Root drops into the soil', 'Vine grows to the lookup leaf', 'Stories unfold during descent', 'Partners and leadership resolve'],
    consideration: 'More animation to produce and maintain. A reading view supports simpler browsing.',
    notes: 'Working prototype. The recording shows actual browser behavior. Sample copy and roles will need client confirmation.',
  },
  { id: '02', slug: 'grown-together', title: 'Grown Together in Davao', short: 'Warm & people led', theme: 'Good roots. Stronger together.', status: 'New design concept',
    colors: ['#F3EFE4', '#283D30', '#654073', '#D9D1BB'],
    audience: 'Cooperative partners, local communities and buyers.', strength: 'Builds trust through people and place.',
    motion: 'Medium. Layered photos and readable chapters.', tone: 'Honest, welcoming, grounded.',
    hero: 'Good roots.\nStronger together.',
    summary: 'A warm editorial website that introduces the cooperative through its people, Davao setting and shared growing story.',
    beats: ['Meet the cooperative', 'Discover the people and place', 'Follow growing and harvest', 'Find a partner farm'],
    consideration: 'Strongest with original photography of the cooperative and its members.',
    notes: 'Concept preview. The farm photograph is AI-generated illustrative imagery, not actual cooperative members. Motion is proposed.',
  },
  { id: '03', slug: 'purple-to-world', title: 'Purple to the World', short: 'Bold & buyer focused', theme: 'Davao roots. Global possibilities.', status: 'New design concept',
    colors: ['#311542', '#EDE5F1', '#FFFFFF', '#B6CF72'],
    audience: 'Prospective buyers and international partners.', strength: 'Makes the product and farm information easy to discover.',
    motion: 'Medium. Large product moves and clear transitions.', tone: 'Confident, modern, purposeful.',
    hero: 'Davao roots.\nGlobal possibilities.',
    summary: 'A confident purple identity that brings the crop forward, then connects visitors to the people and farm information behind it.',
    beats: ['Purple yam takes center stage', 'Explore the crop and its origins', 'Meet the cooperative growers', 'Open a farm profile'],
    consideration: 'Buyer-specific specifications and contact information need client-supplied content.',
    notes: 'Concept preview. Global reach is a proposed brand direction, not a claim of existing export contracts or certification. Motion is proposed.',
  },
]
export const editorial = {
  body: 'A growing cooperative bringing people, land and purple yam together in Davao.', cta: 'Meet our growers',
  intro: 'Many hands.\nOne shared purpose.', introBody: 'Behind every harvest is a community. Get to know the growers, the care they give the land, and the connections that help the cooperative grow.',
  caption: 'People, place and a shared growing story.',
  processTitle: 'Care that connects\nthe whole journey.',
  process: [{ title: 'In the soil', text: 'The growing story starts with the land and the people who tend it.' }, { title: 'On the vine', text: 'Discover the everyday care behind each farm’s purple yam.' }, { title: 'At the harvest', text: 'Follow the crop from its roots to the next part of its story.' }],
}
export const global = {
  body: 'Purple yam. Cooperative growers. A story that starts in Davao and opens to new possibilities.', cta: 'Discover our ube',
  productTitle: 'Purple at the heart.\nPeople at the roots.', productBody: 'Get to know the crop before you get to know the farm. Clear information connects the purple yam to its origins, growers and growing story.',
  tiles: ['The crop', 'Its origins', 'The growers'],
  peopleTitle: 'A cooperative.\nA shared ambition.', peopleBody: 'Discover the Davao growers working together and the partner farms that bring this story to life.',
}
export const deck = {
  title: 'Three ways to\ntell your story.', subtitle: 'Ube Farm · Davao cooperative', date: 'Client design presentation · 1 October 2026',
  goalTitle: 'One farm story.\nThree distinct directions.',
  goalBody: 'Choose how the cooperative should introduce itself: a memorable experience, a human story, or a confident product presence.',
  shared: ['A clear cooperative introduction', 'Purple yam and growing stories', 'Partner farms with ID / QR lookup', 'Desktop and mobile layouts'],
  motionTitle: 'How the journey unfolds', comparisonTitle: 'Which direction fits the cooperative?',
  recommendation: 'Starting recommendation: Grown Together in Davao',
  recommendationBody: 'Its people and place focus makes the cooperative the center of the story. Purple to the World is a strong alternative when buyer discovery is the priority.',
  choiceTitle: 'Choose a direction.\nShape the details.', choiceBody: 'Select the overall direction first, then confirm the photography, copy and final scroll behavior.',
  prompts: ['Which design feels most like the cooperative?', 'Who should the homepage speak to first?', 'Which details should we carry into the final design?'],
  draftNote: 'Draft identity and content. Confirm cooperative name, member photography, farm records and leadership roles before launch.',
}

export const presentationThemes = {
  editorial: { paper: '#F3EFE4', ink: '#283D30', accent: '#654073', surface: '#FAF7EE', border: '#D9D1BB', onPhoto: '#FFFEF8', photoRgb: '18,34,23', plantSurface: '#E3E7D5', processLine: 'rgba(243,239,228,.35)' },
  global: { paper: '#EDE5F1', ink: '#311542', accent: '#B6CF72', surface: '#FFFFFF', border: '#D7C8DE', muted: '#D7C8DE', headerLine: '#654B70', orbit: '#725D7E' },
  deck: { paper: '#F6F3EA', ink: '#34233E', purple: '#542A69', green: '#35583C', line: '#D8D0BE', muted: '#706B65', white: '#FFFFFF', soft: '#EBE5F0', sage: '#C2CE9F' },
}

export const presentation = {
  sectionLabel: 'LANDING PAGE DESIGN DIRECTIONS',
  footer: 'UBE FARM / DAVAO COOPERATIVE',
  sharedLabel: 'Shared across all three directions',
  prototypeLabel: 'Working prototype',
  conceptLabel: 'Concept preview · proposed motion',
  photoLabel: 'Illustrative concept photo',
  palette: 'Color direction', audience: 'Designed for', strength: 'Why choose it',
  opening: 'Desktop opening', mobile: 'Mobile opening', photoOpening: 'Desktop opening · illustrative photography',
  rootMotionTitle: 'Plant. Grow. Discover.',
  rootVideoCaption: 'Actual prototype recording · play this video in PowerPoint',
  rootVideoPdfCaption: 'The PDF shows a still. The complete package includes the MP4.',
  rootMotionNote: 'The same plant connects the introduction, farm lookup, stories, partner farms and leadership.',
  editorialMotionTitle: 'Let the people lead the story.',
  globalMotionTitle: 'Put purple yam in the spotlight.',
  motionNote: 'Proposed scroll behavior. These previews show composition and content; photography is illustrative.',
  motionDetails: [
    [],
    [
      { scene: 'story', title: 'People & place', body: 'The opening arch reveals the field. Photographs and headlines move on separate planes, then settle for reading.' },
      { scene: 'growing', title: 'A connected growing story', body: 'A thin vine line leads into the soil, vine and harvest chapters. Each chapter arrives with a gentle upward reveal.' },
      { scene: 'lookup', title: 'Meet a partner farm', body: 'Farm cards lift into place. Entering an ID, scanning a QR or choosing a partner opens the same farm profile.' },
    ],
    [
      { scene: 'growing', title: 'The crop comes forward', body: 'The large yam turns slightly as the hero gives way to clear product and origin information.' },
      { scene: 'story', title: 'Roots connect to growers', body: 'Purple and pale sections exchange focus. Grower photography enters as one bold visual panel.' },
      { scene: 'lookup', title: 'From interest to discovery', body: 'The product journey resolves into farm lookup. ID, QR and partner links lead to the same farm profile.' },
    ],
  ],
  rootStepDetails: ['A purple yam drops beside the green trellis.', 'The vine grows upward to the tip-leaf farm search.', 'Scroll down through company, growing and harvest stories.', 'Lower leaves reveal partners; the root becomes the leadership board.'],
  comparison: [
    { audience: 'A memorable introduction', motion: 'High motion · continuous plant journey', benefit: 'A signature experience people can remember.' },
    { audience: 'Trust in people and place', motion: 'Medium motion · editorial chapters', benefit: 'A welcoming face for a growing cooperative.' },
    { audience: 'Product and buyer discovery', motion: 'Medium motion · bold product transitions', benefit: 'A clear path from purple yam to farm information.' },
  ],
  choiceHint: 'Select one overall direction. Useful details from another can still be carried forward.',
  nextLabel: 'Next step', nextBody: 'Confirm the direction, replace draft content with cooperative material, and build the approved scroll behavior.',
  metadata: { author: 'Ube Farm design presentation', subject: 'Three landing page design directions for a Davao cooperative', title: 'Ube Farm — Three Design Directions' },
}

export const delivery = {
  title: 'Ube Farm · Three design directions',
  intro: 'Review the three options, compare desktop and mobile layouts, and choose the direction that best represents the cooperative.',
  powerpoint: 'Open PowerPoint', pdf: 'Open presentation PDF', image: 'Desktop image', mobile: 'Mobile image', conceptPdf: 'Concept PDF', preview: 'Browse concept preview',
  motion: 'See the current prototype in motion',
  motionBody: 'Actual recording of From Root to Story. The two alternative concepts have proposed motion storyboards in the deck.',
  note: 'Draft identity and sample records. The cooperative photograph is AI-generated illustration, not actual client members.',
}
