import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { Presentation, PresentationFile } from '@oai/artifact-tool'
import { mvpDeck as D } from '../source/mvp-content.mjs'

const workspaceDir = path.resolve('.')
const buildDir = path.resolve('presentation/.build-mvp')
const previewDir = path.resolve('presentation/mvp-preview')
await fs.mkdir(buildDir, { recursive: true })
await fs.mkdir(previewDir, { recursive: true })
const p = Presentation.create({ slideSize: { width: 1280, height: 720 } })
const T = D.themes
let serial = 0
const noteSource = D.sourceNote

function text(s, value, x, y, w, h, size = 22, options = {}) {
  const obj = s.shapes.add({ geometry: 'textbox', name: options.name ?? `text-${++serial}`, position: { left: x, top: y, width: w, height: h }, fill: 'none', line: { fill: 'none', width: 0 } })
  obj.text = value
  obj.text.style = { typeface: options.display ? 'Georgia' : 'Arial', fontSize: size, color: options.color ?? T.ink, bold: options.bold ?? false, alignment: options.align ?? 'left', verticalAlignment: 'top', autoFit: 'none', wrap: 'square', insets: { left: 0, right: 0, top: 0, bottom: 0 } }
  return obj
}
function rule(s, x, y, w, color = T.line) {
  s.shapes.add({ geometry: 'line', name: `divider-${++serial}`, position: { left: x, top: y, width: w, height: 0 }, fill: 'none', line: { style: 'solid', fill: color, width: 1 } })
}
async function image(s, file, x, y, w, h, alt, fit = 'contain', crop) {
  const bytes = new Uint8Array(await fs.readFile(file))
  s.images.add({ blob: bytes, contentType: file.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg', position: { left: x, top: y, width: w, height: h }, fit, alt, ...(crop ? { crop } : {}) })
}
function slide(title, lead = '', dark = false) {
  const s = p.slides.add()
  const n = p.slides.items.length
  s.background.fill = dark ? T.purple : T.paper
  if (title) text(s, title, 64, 52, 1152, 82, 44, { display: true, color: dark ? T.paper : T.purple, name: 'slide-title' })
  if (lead) text(s, lead, 64, 150, 1125, 80, 23, { color: dark ? T.paper : T.muted, name: 'slide-subtitle' })
  text(s, D.footer, 64, 687, 750, 17, 12, { color: dark ? T.sage : T.muted, name: 'footer' })
  text(s, String(n).padStart(2, '0'), 1166, 683, 50, 22, 15, { color: dark ? T.sage : T.muted, align: 'right', name: 'slide-number' })
  return s
}
function notes(s, value) { s.speakerNotes.textFrame.setText(`${value}\n\n${noteSource}`) }
function table(s, values, x, y, w, h, widths, size = 21, rowHeights = []) {
  const t = s.tables.add({ rows: values.length, columns: values[0].length, left: x, top: y, width: w, height: h, columnWidths: widths, values })
  t.styleOptions = { headerRow: false, bandedRows: false, firstColumn: false }
  t.borders.assign({ style: 'solid', fill: T.line, width: 0.7 })
  const all = t.cells.block({ row: 0, column: 0, rowCount: values.length, columnCount: values[0].length })
  all.assign({ fill: T.paper, textStyle: { typeface: 'Arial', fontSize: size, color: T.ink }, margins: { top: 10, bottom: 10, left: 14, right: 14 }, anchor: 'top' })
  for (let r = 0; r < values.length; r++) {
    if (rowHeights[r]) t.rows[r].height = rowHeights[r]
    for (let c = 0; c < values[0].length; c++) {
      const cell = t.getCell(r, c)
      cell.text.style = { typeface: 'Arial', fontSize: size, bold: r === 0, color: r === 0 ? T.white : c === 0 ? T.green : T.ink, verticalAlignment: 'top', autoFit: 'none', wrap: 'square' }
      cell.fill = r === 0 ? T.green : T.paper
    }
  }
  return t
}
function flatGroups(s, groups, x = 64, y = 256, gap = 86, width = 1112) {
  groups.forEach((item, i) => {
    const top = y + i * gap
    text(s, item.title, x, top, 340, 56, 26, { display: true, color: T.purple })
    text(s, item.body, x + 375, top + 2, width - 375, 67, 22)
    if (i < groups.length - 1) rule(s, x, top + gap - 15, width)
  })
}
// 01. Cover
{
  const s = slide('')
  await image(s, 'presentation/previews/cover-photo.jpg', 760, 0, 520, 720, 'AI-generated illustrative cooperative photo from the earlier design presentation', 'cover')
  text(s, D.title, 64, 108, 630, 200, 66, { display: true, color: T.purple, name: 'cover-title' })
  text(s, D.subtitle, 64, 351, 620, 70, 28, { color: T.green })
  text(s, 'Ube Farm Cooperative\nDavao, Philippines', 64, 460, 620, 76, 24)
  text(s, D.date, 64, 574, 620, 52, 19, { color: T.muted })
  text(s, 'Illustrative concept photo', 784, 671, 430, 23, 15, { color: T.white })
  notes(s, 'Discuss the Roote Origin MVP, choose one of the three public design directions, and confirm the intended working arrangement. The photograph is AI-generated illustrative imagery from the earlier concept deck, not actual cooperative members. Replace draft branding and photography with approved client material.')
}
// 02. Shared MVP
{
  const C = D.overview, s = slide(C.title, C.lead)
  flatGroups(s, C.groups, 64, 252, 88)
  text(s, C.note, 64, 642, 1130, 29, 20, { color: T.green, bold: true })
  notes(s, 'The current public prototype supplies the visual foundation. The MVP builds a new backend. Only one chosen public design is implemented. Ordinary data entry happens in the protected dashboard.')
}
// 03. Batch history
{
  const C = D.batch, s = slide(C.title, C.lead)
  table(s, [C.headers, C.values], 64, 252, 1152, 275, [288, 288, 288, 288], 21, [55, 220])
  text(s, C.note, 64, 568, 1130, 70, 22, { color: T.green })
  notes(s, C.notes)
}
// 04. Participant permissions
{
  const C = D.roles, s = slide(C.title, C.lead)
  table(s, C.values, 64, 230, 1152, 414, [247, 385, 520], 20, [49, 73, 73, 73, 73, 73])
  text(s, C.note, 64, 655, 1130, 25, 18, { color: T.green })
  notes(s, 'Read access follows approved batch assignments. Enforce restrictions in the API as well as the interface. Consumers require no member account. Growers, processors, brand owners and distributors use the protected member portal.')
}
// 05. The same fictional batch in member and public views
{
  const C = D.qr, s = slide(C.title, C.lead)
  text(s, C.memberTitle, 64, 254, 540, 55, 31, { display: true, color: T.purple })
  text(s, C.memberBody, 64, 327, 536, 180, 23)
  text(s, C.publicTitle, 686, 254, 530, 55, 31, { display: true, color: T.purple })
  text(s, C.publicBody, 686, 327, 530, 180, 23)
  rule(s, 64, 526, 1152)
  text(s, C.controls, 64, 548, 1130, 63, 21, { color: T.muted })
  text(s, C.note, 64, 620, 1140, 51, 22, { color: T.green, bold: true })
  notes(s, C.privateNote)
}
// 06-11. New concept images, each followed by a larger opening detail.
async function overview(c, index) {
  const F = D.designMvp[index], s = slide('')
  text(s, c.title, 64, 66, 650, 116, 44, { display: true, color: T.purple, name: 'slide-title' })
  text(s, F.fit, 64, 205, 650, 110, 25, { color: T.muted })
  await image(s, F.image, 764, 55, 452, 452 * 4 / 3, `${c.title}: complete new desktop concept`)
  text(s, 'Discovery', 64, 340, 650, 37, 26, { color: T.green, bold: true })
  text(s, F.detail, 64, 390, 650, 86, 23)
  text(s, 'Proposed scroll behavior', 64, 498, 650, 40, 26, { color: T.green, bold: true })
  text(s, F.motion, 64, 550, 650, 85, 22)
  text(s, F.status, 64, 640, 650, 39, 15, { color: T.muted })
  notes(s, `New visual direction: ${c.title}. ${F.fit}\n${F.detail}\n${F.motion}\nThe complete desktop image is a static concept generated with the built-in image tool. Photography and records are illustrative. Mobile layouts, animation and system integration are proposed. Image source: ${F.image}. Generation brief: presentation/design-redesign/prompts.md.`)
}
async function detail(c, index) {
  const F = D.designMvp[index], s = slide(F.detailTitle, F.detailLead)
  const scale = Math.min(800 / 1086, 414 / F.heroEnd)
  const width = 1086 * scale, height = F.heroEnd * scale
  await image(s, F.image, 64 + (800 - width) / 2, 230, width, height, `${c.title}: enlarged opening from the same concept image`, 'cover', { left: 0, top: 0, right: 0, bottom: 1 - F.heroEnd / 1448 })
  F.beats.forEach((item, i) => {
    const y = 241 + i * 126
    text(s, item.title, 910, y, 306, 43, 23, { color: T.purple, bold: true })
    text(s, item.body, 910, y + 46, 306, 78, 20)
  })
  text(s, F.status, 64, 655, 1152, 25, 17, { color: T.muted })
  notes(s, `${F.motion}\n${F.beats.map(item => `${item.title}: ${item.body}`).join('\n')}\nThe image is an enlarged native PowerPoint crop of the new static desktop concept. The complete image appears on the preceding slide. Motion is proposed and reduced-motion visitors will have a complete reading view. Image source: ${F.image}. Generation brief: presentation/design-redesign/prompts.md.`)
}
for (let i = 0; i < D.designMvp.length; i++) {
  await overview(D.concepts[i], i)
  await detail(D.concepts[i], i)
}
// 12. Design comparison
{
  const C = D.comparison, s = slide(C.title, C.lead)
  table(s, C.values, 64, 252, 1152, 343, [280, 360, 512], 22, [55, 96, 96, 96])
  text(s, C.note, 64, 618, 1130, 55, 21, { color: T.green })
  notes(s, 'The three new visual directions share the proposed system features. The client chooses one. From Root to Story emphasizes an immersive vine journey and visible lookup. Grown Together emphasizes growers and a farm catalogue. Purple to the World emphasizes produce and approved batch summaries. Confirm redesign, motion and mobile work before finalizing the schedule. All images are static concepts. No direction assumes export contracts or certification.')
}
// 13-14. Proposed weekly timeline, with testing during development
for (let part = 0; part < 2; part++) {
  const C = D.timeline, s = slide(part === 0 ? C.title1 : C.title2, C.lead)
  const weeks = D.weeks.slice(part * 5, part * 5 + 5)
  const values = [C.headers, ...weeks.map(w => [w.week, w.title, w.detail])]
  table(s, values, 64, 230, 1152, 409, [115, 315, 722], 21, [49, 72, 72, 72, 72, 72])
  text(s, part === 0 ? C.note1 : C.note2, 64, 652, 1130, 25, 18, { color: T.green })
  notes(s, C.notes)
}
// 15. Proposed launch support and boundaries
{
  const C = D.handover, s = slide(C.title, C.lead)
  text(s, 'Proposed delivery items', 64, 262, 555, 52, 31, { display: true, color: T.purple })
  C.included.forEach((value, i) => text(s, value, 64, 338 + i * 50, 552, 46, 22))
  text(s, 'Pilot scope to confirm', 695, 262, 521, 52, 31, { display: true, color: T.purple })
  C.boundaries.forEach((value, i) => text(s, value, 695, 338 + i * 66, 521, 61, 22))
  rule(s, 64, 608, 1152)
  text(s, C.note, 64, 635, 1144, 47, 21, { color: T.green })
  notes(s, C.notes)
}
// 16. Acceptance
{
  const C = D.readiness, s = slide(C.title, C.lead)
  text(s, 'Acceptance checks', 64, 262, 555, 52, 31, { display: true, color: T.purple })
  C.acceptance.forEach((value, i) => text(s, value, 64, 338 + i * 52, 552, 47, 22))
  text(s, 'Client inputs', 695, 262, 521, 52, 31, { display: true, color: T.purple })
  C.inputs.forEach((value, i) => text(s, value, 695, 338 + i * 66, 521, 61, 22))
  rule(s, 64, 608, 1152)
  text(s, C.note, 64, 635, 1144, 47, 19, { color: T.green })
  notes(s, C.notes)
}
// 17. Working arrangement
{
  const C = D.engagement, s = slide(C.title)
  text(s, C.question, 64, 170, 1120, 132, 35, { color: T.green })
  C.options.forEach((option, i) => {
    const x = 64 + i * 400
    text(s, option.title, x, 348, 352, 60, 31, { display: true, color: T.purple })
    text(s, option.body, x, 426, 352, 100, 23)
    rule(s, x, 537, 352)
    text(s, option.question, x, 564, 352, 84, 20, { color: T.green })
  })
  notes(s, `${C.notes}\n${C.note}`)
}
// 18. Decisions, followed by optional technical detail
{
  const C = D.decisions, s = slide(C.title, '', true)
  C.items.forEach((item, i) => {
    const x = 64 + (i % 2) * 604, y = 237 + Math.floor(i / 2) * 178
    text(s, item.title, x, y, 548, 50, 31, { display: true, color: T.paper })
    text(s, item.body, x, y + 71, 535, 86, 24, { color: T.paper })
  })
  text(s, C.note, 64, 634, 1118, 42, 20, { color: T.sage })
  notes(s, 'Confirm whether processors combine harvests and who supplies and approves batch records. Record the preferred design, proposed working arrangement, available weekly time and review contact. Reassess scope and delivery dates against those decisions before kickoff.')
}
// 19. Technical appendix
{
  const C = D.technology, s = slide(C.title, C.lead)
  flatGroups(s, C.groups, 64, 265, 113)
  rule(s, 64, 601, 1152)
  text(s, C.note, 64, 625, 1130, 55, 21, { color: T.green })
  notes(s, C.notes)
}

if (p.slides.items.length !== D.slideCount) throw new Error('Unexpected slide count')
const snapshot = await p.inspect({ kind: 'slide,textbox,table,notes', maxChars: 150000 })
await fs.writeFile(path.join(buildDir, 'snapshot.ndjson'), snapshot.ndjson)
for (let i = 0; i < p.slides.items.length; i++) {
  const layout = await p.slides.items[i].export({ format: 'layout' })
  await fs.writeFile(path.join(buildDir, `slide-${i + 1}.layout.json`), await layout.text())
}
const candidatePath = path.join(buildDir, 'candidate.pptx')
await (await PresentationFile.exportPptx(p)).save(candidatePath)
const templatePath = path.resolve('presentation/ube-farm-client-presentation.pptx')
await fs.writeFile(path.join(buildDir, 'finalization-inputs.json'), JSON.stringify({
  candidatePath,
  workspaceDir,
  finalPath: path.resolve('presentation/mvp/roote-origin-client-presentation-new-designs.pptx'),
  expectedSlideSizeEmu: '12192000,6858000',
  fontPolicy: { basis: 'reference', families: ['Georgia', 'Arial'], referencePath: templatePath, referenceSha256: createHash('sha256').update(await fs.readFile(templatePath)).digest('hex') },
  explicitTotalSlideCount: D.slideCount,
  requiredNativeTableOwnerSlides: [3, 4, 12, 13, 14],
}, null, 2))
console.log(`Created ${D.slideCount} slides with the three new concept images, ready for finalization.`)
