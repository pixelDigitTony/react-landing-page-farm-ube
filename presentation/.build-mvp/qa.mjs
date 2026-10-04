import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
import sharp from 'sharp'
import JSZip from 'jszip'

const finalFile = process.env.MVP_FINAL_PPTX ?? 'presentation/mvp/roote-origin-client-presentation-new-designs.pptx'
const zip = await JSZip.loadAsync(await fs.readFile(finalFile))
const slideFiles = Object.keys(zip.files).filter(n => /^ppt\/slides\/slide\d+\.xml$/.test(n))
const noteFiles = Object.keys(zip.files).filter(n => /^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(n))
assert.equal(slideFiles.length, 19)
assert.equal(noteFiles.length, 19)
const texts = []
for (const name of [...slideFiles, ...noteFiles]) {
  const xml = await zip.file(name).async('string')
  texts.push([...(xml.matchAll(/<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g))].map(m => m[1]).join(' '))
}
const combined = texts.join('\n').replaceAll('&amp;', '&')
assert(combined.includes('Minimum viable product (MVP)'), 'MVP must be defined')
assert(combined.includes('All names, dates and records below are fictional.'), 'Sample data disclosure missing')
assert(combined.includes('SAMPLE-UBE-001'), 'Sample batch missing')
assert(combined.includes('combine multiple harvests?'), 'Batch workflow decision missing')
assert(combined.includes('subject to the selected design'), 'Timeline qualification missing')
assert(combined.includes('Confirm the chosen redesign before kickoff'), 'Redesign schedule qualification missing')
assert(combined.includes('Testing starts during development in Week 2'), 'Continuous testing missing')
assert(combined.includes('Review rounds are proposed for Weeks 8 and 9'), 'Review rounds must be spread out')
assert(combined.includes('Proposed delivery and support'), 'Support must remain provisional')
assert(!/The user clarified|Source: agreed|includes the agreed inventory/.test(combined), 'Internal or premature approval language remains')
assert(texts[18].includes('Appendix: MERN implementation'), 'MERN must be in the final appendix')
assert(!/(?:\bPHP\b|\bUSD\b|₱|\$|\b220,000\b|\b60,000\b|\bcosting\b|\bsalary\b|\bpayment\b|\bfees?\b)/i.test(combined), 'Financial content leaked into slides or speaker notes')
for (const value of ['Roote Origin', 'From Root to Story', 'Grown Together in Davao', 'Purple to the World', 'MongoDB', 'Express', 'Node.js 26', 'TypeScript', 'Project-based', 'Service contract', 'Direct employment', 'public QR', 'processor']) {
  assert(combined.toLowerCase().includes(value.toLowerCase()), `Missing deck content: ${value}`)
}
for (let i = 1; i <= 10; i++) assert(combined.includes(`Week ${i}`), `Missing week ${i}`)
assert(!Object.keys(zip.files).some(n => /\.(mp4|mov|wmv)$/i.test(n)), 'Old prototype video remains')
assert(!/Existing scroll prototype|Click the embedded video|original mobile opening|opening arch reveals/.test(combined), 'Obsolete design descriptions remain')
const imagePaths = ['01-root-to-story.png', '02-grown-together.png', '03-purple-to-world.png']
const expectedImages = await Promise.all(imagePaths.map(n => fs.readFile(`presentation/design-redesign/${n}`)))
const cover = await fs.readFile('presentation/previews/cover-photo.jpg')
const embedded = await Promise.all(Object.keys(zip.files).filter(n => /^ppt\/media\/.*\.(png|jpe?g)$/i.test(n)).map(n => zip.file(n).async('nodebuffer')))
for (let i = 0; i < expectedImages.length; i++) assert(embedded.some(buf => buf.equals(expectedImages[i])), `New design image missing or altered: ${imagePaths[i]}`)
assert(embedded.every(buf => [cover, ...expectedImages].some(allowed => buf.equals(allowed))), 'An obsolete design preview remains embedded')
const original = await JSZip.loadAsync(await fs.readFile('presentation/mvp/roote-origin-client-presentation-revised.pptx'))
function visibleText(xml) { return [...xml.matchAll(/<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g)].map(m => m[1]).join(' ') }
for (const n of [1, 2, 3, 4, 5, 14, 15, 16, 17, 18, 19]) {
  const name = `ppt/slides/slide${n}.xml`
  assert.equal(visibleText(await zip.file(name).async('string')), visibleText(await original.file(name).async('string')), `Unrelated content changed on slide ${n}`)
}
const review = JSON.parse((await fs.readFile('presentation/.build-mvp/native-review.json', 'utf8')).replace(/^\uFEFF/, ''))
assert.equal(review.slides, 19)
assert.equal(review.overflow.length, 0)
assert.equal(review.outsideCanvas.length, 0)
assert.equal(review.nativeTables.length, 5)
assert.equal(review.nativeMedia.length, 0)
const files = []
for (let i = 1; i <= 19; i++) {
  const file = `presentation/mvp-new-designs-preview/Slide${i}.PNG`
  const metadata = await sharp(file).metadata()
  assert.equal(metadata.width, 1920)
  assert.equal(metadata.height, 1080)
  files.push(file)
}
const tiles = await Promise.all(files.map((file, i) => sharp(file).resize(640, 360).png().toBuffer().then(input => ({ input, left: i % 3 * 650, top: Math.floor(i / 3) * 370 }))))
await sharp({ create: { width: 1940, height: 2580, channels: 3, background: '#D8D0BE' } }).composite(tiles).png().toFile('presentation/mvp-new-designs-preview/contact-sheet.png')
await fs.writeFile('presentation/.build-mvp/content-verification.json', JSON.stringify({
  finalFile: path.resolve(finalFile), slides: 19, speakerNotes: 19,
  costingExcludedFromSlidesAndNotes: true, allThreeDesigns: true, weeklyMilestones: 10,
  nativeTables: 5, newDesignImages: imagePaths, obsoleteDesignMediaRemoved: true, nativeTextOverflow: 0,
  application: 'Opened and rendered with Microsoft PowerPoint',
}, null, 2))
console.log('Deck checked: 19 slides, three exact new images, no obsolete design media, no financial content, and preserved MVP scope/timeline/engagement content.')
