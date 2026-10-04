import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
import JSZip from 'jszip'
import { brand, concepts, delivery as C, presentationThemes } from './content.mjs'

const root = 'presentation'
const staging = `${root}/delivery`
const checks=[]
const exportReport=JSON.parse((await fs.readFile(`${root}/source/export-report.json`,'utf8')).replace(/^\uFEFF/,''))
assert.equal(exportReport.length,4)
assert.equal(exportReport[0].slides,10)
assert(exportReport.every(r=>r.overflow.length===0),'Text overflow remains in an exported deck')
checks.push('PowerPoint opened and exported all four decks; no text-height overflow')

const deckZip=await JSZip.loadAsync(await fs.readFile(`${root}/ube-farm-client-presentation.pptx`))
const slideFiles=Object.keys(deckZip.files).filter(n=>/^ppt\/slides\/slide\d+\.xml$/.test(n))
assert.equal(slideFiles.length,10)
assert.equal(Object.keys(deckZip.files).filter(n=>/^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(n)).length,10)
assert(Object.keys(deckZip.files).some(n=>/^ppt\/media\/.+\.mp4$/.test(n)))
let textRuns=0
for(const name of slideFiles) textRuns+=(await deckZip.file(name).async('string')).match(/<a:t>/g)?.length||0
assert(textRuns>90)
for(const name of Object.keys(deckZip.files).filter(n=>n.endsWith('.rels'))) {
  const xml=await deckZip.file(name).async('string')
  const owner=name==='_rels/.rels'?'':name.replace('/_rels/','/').replace(/\.rels$/,'')
  const base=owner?path.posix.dirname(owner):''
  for(const rel of xml.match(/<Relationship\b[^>]*>/g)||[]) {
    if(/TargetMode="External"/.test(rel)) continue
    const target=rel.match(/Target="([^"]+)"/)?.[1]
    if(!target) continue
    const normalized=path.posix.normalize(target.startsWith('/')?target.slice(1):path.posix.join(base,target))
    assert(deckZip.files[normalized],`Missing PPTX relationship target ${normalized}`)
  }
}
checks.push(`10-slide PPTX: ${textRuns} editable text runs, 10 speaker-note pages, embedded MP4 and valid relationships`)

for(const [name,count] of [['ube-farm-client-presentation.pdf',10],...concepts.map(c=>[`pdfs/${c.id}-${c.slug}.pdf`,2])]) {
  const data=await fs.readFile(`${root}/${name}`)
  assert(data.subarray(0,5).toString()==='%PDF-')
  const actual=(data.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length
  assert.equal(actual,count,`Unexpected page count in ${name}`)
  checks.push(`${name}: valid PDF header, ${actual} pages`)
}

const boards=[[3,'01-root-to-story-presentation-board.png'],[5,'02-grown-together-presentation-board.png'],[7,'03-purple-to-world-presentation-board.png'],[9,'three-design-comparison.png']]
for(const [slide,name] of boards) await fs.copyFile(`${root}/previews/slides/Slide${slide}.PNG`,`${root}/images/${name}`)

await fs.mkdir(staging,{recursive:true})
for(const file of ['ube-farm-client-presentation.pptx','ube-farm-client-presentation.pdf','README.md']) await fs.copyFile(`${root}/${file}`,`${staging}/${file}`)
for(const dir of ['images','pdfs']) await fs.cp(`${root}/${dir}`,`${staging}/${dir}`,{recursive:true})
await fs.cp(`${root}/previews/slides`,`${staging}/slides`,{recursive:true})
await fs.mkdir(`${staging}/media`,{recursive:true})
await fs.copyFile(`${root}/media/01-root-to-story-scroll.mp4`,`${staging}/media/01-root-to-story-scroll.mp4`)
await fs.mkdir(`${staging}/resources/font-licenses`,{recursive:true})
for(const file of ['content.mjs','image-generation-prompt.txt','cooperative-concept-photo.png']) await fs.copyFile(`${root}/source/${file}`,`${staging}/resources/${file}`)
for(const font of ['cormorant-garamond','dm-sans','space-grotesk']) await fs.copyFile(`node_modules/@fontsource/${font}/LICENSE`,`${staging}/resources/font-licenses/${font}.txt`)
await fs.cp('public/presentation/assets',`${staging}/mockups/assets`,{recursive:true})
for(const file of ['ube-root.webp','ube-trellis.webp']) await fs.copyFile(`public/images/${file}`,`${staging}/mockups/assets/${file}`)
for(const c of concepts.slice(1)) {
  const html=(await fs.readFile(`public/presentation/${c.slug}.html`,'utf8')).replaceAll('/images/ube-root.webp','assets/ube-root.webp').replaceAll('/images/ube-trellis.webp','assets/ube-trellis.webp')
  await fs.writeFile(`${staging}/mockups/${c.slug}.html`,html)
}

const T=presentationThemes.deck
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')
const button=(label,href)=>`<a class="button" href="${href}">${escape(label)}</a>`
const html=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(C.title)}</title><style>
*{box-sizing:border-box}body{margin:0;background:${T.paper};color:${T.ink};font:16px/1.6 Arial,sans-serif}main{max-width:1500px;margin:auto;padding:65px 5%}h1,h2,h3{font-family:Georgia,serif;font-weight:400;line-height:1.15;color:${T.purple}}h1{font-size:55px;max-width:1000px;margin:0 0 22px}p{max-width:850px}.actions{display:flex;gap:10px;flex-wrap:wrap;margin:28px 0 45px}.button{padding:12px 18px;background:${T.green};color:${T.white};border-radius:100px;text-decoration:none;font-size:13px;display:inline-block}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:25px}article{background:${T.white};border:1px solid ${T.line};padding:20px}article img{display:block;width:100%;height:220px;object-fit:contain;background:${T.paper}}h3{font-size:27px;margin:22px 0 12px}article p{font-size:14px;color:${T.muted}}article .actions{margin-bottom:10px;gap:8px}article .button{font-size:11px;padding:9px 13px}section{margin-top:65px}h2{font-size:34px}video{width:100%;max-width:1000px;display:block;margin-top:25px;background:${T.paper}}.note{margin-top:45px;font-size:12px;color:${T.muted};border-top:1px solid ${T.line};padding-top:20px}@media(max-width:900px){.grid{grid-template-columns:1fr}h1{font-size:42px}main{padding:40px 6%}article img{height:auto}}
</style><main><h1>${escape(C.title)}</h1><p>${escape(C.intro)}</p><div class="actions">${button(C.powerpoint,'ube-farm-client-presentation.pptx')}${button(C.pdf,'ube-farm-client-presentation.pdf')}</div><div class="grid">${concepts.map(c=>`<article><img src="images/${c.id}-${c.slug}-desktop-hero.png" alt="${escape(c.title)}"><h3>${c.id} ${escape(c.title)}</h3><p>${escape(c.summary)}</p><p>${escape(c.status)}</p><div class="actions">${button(C.image,`images/${c.id}-${c.slug}-desktop-hero.png`)}${button(C.mobile,`images/${c.id}-${c.slug}-mobile-hero.png`)}${button(C.conceptPdf,`pdfs/${c.id}-${c.slug}.pdf`)}${c.id!=='01'?button(C.preview,`mockups/${c.slug}.html`):''}</div></article>`).join('')}</div><section><h2>${escape(C.motion)}</h2><p>${escape(C.motionBody)}</p><video controls preload="metadata" src="media/01-root-to-story-scroll.mp4"></video></section><p class="note">${escape(C.note)}</p></main></html>`
await fs.writeFile(`${root}/index.html`,html.replaceAll('href="mockups/','href="delivery/mockups/'))
await fs.writeFile(`${staging}/index.html`,html)

async function listFiles(dir) {
  const entries=await fs.readdir(dir,{withFileTypes:true})
  const files=[]
  for(const entry of entries) {
    const dest=path.join(dir,entry.name)
    if(entry.isDirectory()) files.push(...await listFiles(dest)); else files.push(dest)
  }
  return files
}
const archive=new JSZip()
const files=await listFiles(staging)
for(const file of files) archive.file(path.relative(staging,file).replaceAll('\\','/'),await fs.readFile(file))
checks.push(`Offline package: ${files.length} files, desktop/mobile images, concept PDFs, slide PNGs, MP4 and editable deck`)
const report={created:new Date().toISOString(),checks,files:files.map(f=>path.relative(staging,f).replaceAll('\\','/'))}
await fs.writeFile(`${root}/source/generation-report.json`,JSON.stringify(report,null,2))
archive.file('generation-report.json',JSON.stringify(report,null,2))
await fs.writeFile(`${root}/ube-farm-client-package.zip`,await archive.generateAsync({type:'nodebuffer',compression:'DEFLATE',compressionOptions:{level:6}}))
console.log(checks.join('\n'))
