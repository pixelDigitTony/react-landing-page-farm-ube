import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import PptxGenJS from 'pptxgenjs'
import { brand, concepts, deck as D, presentation as P, presentationThemes } from './content.mjs'

const T = Object.fromEntries(Object.entries(presentationThemes.deck).map(([k,v])=>[k,v.slice(1)]))
const W = 13.333333, H = 7.5
const out = 'presentation'
const assets = 'presentation/previews'
const metadata = new Map()
await sharp('presentation/source/cooperative-concept-photo.png').resize(1187,1500,{fit:'cover',position:'right'}).jpeg({quality:94}).toFile(`${assets}/cover-photo.jpg`)
for (const dir of ['presentation/images',assets]) {
  for (const f of await fs.readdir(dir)) {
    if (/\.(jpg|png)$/.test(f)) metadata.set(`${dir}/${f}`,await sharp(`${dir}/${f}`).metadata())
  }
}
const poster = `data:image/jpeg;base64,${(await fs.readFile(`${assets}/video-poster.jpg`)).toString('base64')}`
const file = (c,device='desktop',scene='hero') => `${assets}/${c.id}-${c.slug}-${device}-${scene}.jpg`
const section = (c,scene) => `${assets}/${c.id}-${c.slug}-${scene}-section.png`
const SH = new PptxGenJS().ShapeType

function createDeck() {
  const p = new PptxGenJS()
  p.layout = 'LAYOUT_WIDE'
  p.author = P.metadata.author
  p.subject = P.metadata.subject
  p.title = P.metadata.title
  p.company = brand.name
  p.lang = 'en-PH'
  p.theme = { headFontFace:'Georgia', bodyFontFace:'Arial', lang:'en-PH' }
  return p
}
function text(slide,value,x,y,w,h,size=16,opts={}) {
  slide.addText(value,{x,y,w,h,fontFace:'Arial',fontSize:size,color:T.ink,margin:0,breakLine:false,valign:'top',paraSpaceAfterPt:0,...opts})
}
function display(slide,value,x,y,w,h,size=35,opts={}) {
  text(slide,value,x,y,w,h,size,{fontFace:'Georgia',color:T.purple,...opts})
}
function rect(slide,x,y,w,h,color=T.white,lineColor=color,opts={}) {
  slide.addShape(SH.rect,{x,y,w,h,fill:{color},line:{color:lineColor,width:.6},...opts})
}
function line(slide,x,y,w,color=T.line) {
  slide.addShape(SH.line,{x,y,w,h:0,line:{color,width:.7}})
}
function image(slide,src,x,y,w,h) {
  const m = metadata.get(src)
  if(!m) throw new Error(`Missing image metadata: ${src}`)
  const s = Math.min(w/m.width,h/m.height)
  const iw=m.width*s, ih=m.height*s
  slide.addImage({path:src,x:x+(w-iw)/2,y:y+(h-ih)/2,w:iw,h:ih,altText:path.basename(src)})
}
function badge(slide,label,x,y,w,color=T.green,light=T.white) {
  slide.addShape(SH.roundRect,{x,y,w,h:.31,radius:.14,rectRadius:.14,fill:{color},line:{color,width:0}})
  text(slide,label,x+.12,y+.07,w-.24,.17,8.7,{color:light,bold:true})
}
function dot(slide,x,y,color,size=.14) {
  slide.addShape(SH.ellipse,{x,y,w:size,h:size,fill:{color},line:{color,width:0}})
}
function footer(slide,n,light=false) {
  const color=light?T.paper:T.muted
  text(slide,P.footer,.65,7.13,10,.14,8.4,{color,charSpacing:.8})
  text(slide,String(n).padStart(2,'0'),12.15,7.11,.52,.2,10,{color,align:'right'})
}
function base(p,n,light=false) {
  const s=p.addSlide()
  s.background={color:light?T.purple:T.paper}
  footer(s,n,light)
  return s
}
function heading(slide,kicker,title,subtitle='') {
  text(slide,kicker.toUpperCase(),.65,.5,12,.18,9.5,{color:T.green,charSpacing:1.3,bold:true})
  display(slide,title,.65,.91,12,.64,33)
  if(subtitle) text(slide,subtitle,.65,1.69,11.9,.61,14.4,{color:T.muted})
}
function frame(slide,src,x,y,w,h,color=T.white) {
  rect(slide,x-.035,y-.035,w+.07,h+.07,color,T.line)
  image(slide,src,x,y,w,h)
}
function notes(slide,content) { slide.addNotes(content) }

function cover(p,n) {
  const s=base(p,n)
  image(s,`${assets}/cover-photo.jpg`,7.4,0,W-7.4,H)
  rect(s,7.4,6.28,W-7.4,1.22,T.green,T.green,{transparency:8})
  text(s,brand.footer,7.83,6.67,4.92,.4,18,{color:T.white,fontFace:'Georgia'})
  text(s,P.photoLabel,7.84,7.16,4.5,.15,8.3,{color:T.white})
  text(s,P.sectionLabel,.65,.65,6.2,.25,10,{bold:true,color:T.green,charSpacing:1.1})
  display(s,D.title,.65,1.45,6.44,1.75,45)
  text(s,D.subtitle,.69,3.5,6.3,.4,20,{color:T.green})
  text(s,D.date,.69,4.03,6.3,.26,12.5,{color:T.muted})
  for(let i=0;i<3;i++) {
    line(s,.69,4.7+i*.64,5.8)
    text(s,concepts[i].id,.69,4.93+i*.64,.4,.26,11,{color:T.green,bold:true})
    text(s,concepts[i].title,1.3,4.87+i*.64,5.3,.38,17.5,{color:T.purple,fontFace:'Georgia'})
  }
  notes(s,`${D.goalBody}\n${D.draftNote}\n${concepts[1].notes}\nThe cooperative descriptor is a proposed identity. The client can replace it with the registered name.`)
}
function goal(p,n) {
  const s=base(p,n)
  text(s,P.sectionLabel,.65,.5,11,.22,9.5,{color:T.green,charSpacing:1.3,bold:true})
  display(s,D.goalTitle,.65,1.23,5.2,1.92,36)
  text(s,D.goalBody,.65,3.37,4.95,.93,16,{color:T.muted})
  text(s,P.sharedLabel,.65,4.48,5,.32,13.5,{bold:true,color:T.green})
  D.shared.forEach((v,i)=>{dot(s,.69,5.03+i*.4,T.green,.09);text(s,v,.97,4.97+i*.4,4.58,.34,13.3)})
  concepts.forEach((c,i)=>{
    const y=1.15+i*1.9
    rect(s,6.18,y,6.5,1.62,T.white,T.line)
    image(s,file(c),6.25,y+.07,2.39,1.47)
    text(s,c.id,8.93,y+.19,.4,.22,10,{color:T.green,bold:true})
    display(s,c.title,8.93,y+.51,3.48,.66,22)
    text(s,c.short,8.93,y+1.25,3.5,.24,11.7,{color:T.muted})
  })
  notes(s,`Brief: create three distinct visual directions for a growing Davao cooperative, keeping farm storytelling and ID / QR farm discovery.\n${D.goalBody}\nAll presentation farm records are static samples. This presentation makes no numerical sales, export or certification claims.`)
}
function overview(p,n,c) {
  const s=base(p,n)
  heading(s,`${c.id} / ${c.short}`,c.title,c.summary)
  const desktopH=4.22,desktopW=7.15
  frame(s,file(c),.65,2.48,desktopW,desktopH)
  frame(s,file(c,'mobile'),8.04,2.48,1.95,4.22)
  text(s,c.id==='02'?P.photoOpening:P.opening,.65,6.85,7,.19,9.3,{color:T.muted})
  text(s,P.mobile,8.04,6.85,1.96,.19,9.3,{color:T.muted})
  const x=10.33,w=2.34
  text(s,P.strength.toUpperCase(),x,2.54,w,.19,9.1,{bold:true,color:T.green,charSpacing:.55})
  text(s,c.strength,x,2.93,w,.83,15.1)
  line(s,x,3.92,w)
  text(s,P.audience.toUpperCase(),x,4.17,w,.19,9.1,{bold:true,color:T.green,charSpacing:.55})
  text(s,c.audience,x,4.52,w,.97,13.3,{color:T.muted})
  text(s,P.palette.toUpperCase(),x,5.84,w,.18,9.1,{bold:true,color:T.green,charSpacing:.55})
  c.colors.forEach((color,i)=>{dot(s,x+i*.48,6.2,color.slice(1),.32)})
  badge(s,c.id==='01'?P.prototypeLabel:P.conceptLabel,.65,2.05,c.id==='01'?1.6:2.69)
  notes(s,`${c.title}\n${c.theme}\nAudience: ${c.audience}\nTone: ${c.tone}\nWhy choose it: ${c.strength}\nConsideration: ${c.consideration}\n${c.notes}`)
}
function rootMotion(p,n) {
  const c=concepts[0],s=base(p,n)
  heading(s,`${c.id} / ${D.motionTitle}`,P.rootMotionTitle,P.rootMotionNote)
  s.addMedia({type:'video',path:'presentation/media/01-root-to-story-scroll.mp4',cover:poster,x:.65,y:2.5,w:7.32,h:4.118,objectName:'Actual prototype scroll video'})
  text(s,P.rootVideoCaption,.65,6.74,7.45,.22,10.5,{bold:true,color:T.green})
  const x=8.38
  c.beats.forEach((b,i)=>{
    const y=2.46+i*1.0
    dot(s,x,y+.02,T.green,.32)
    text(s,String(i+1),x,y+.055,.32,.21,10,{align:'center',color:T.white,bold:true})
    text(s,b,x+.5,y,3.78,.31,15,{bold:true,color:T.purple})
    text(s,P.rootStepDetails[i],x+.5,y+.4,3.78,.53,12.9,{color:T.muted})
  })
  notes(s,`${c.notes}\nPlay the embedded H.264 MP4 in PowerPoint. The video captures the actual local browser prototype, scrolling from root planting through the lookup, story, growing, harvest, partners and leadership.\n${P.rootVideoPdfCaption}\nThe video can also be played separately from media/01-root-to-story-scroll.mp4.`)
}
function conceptMotion(p,n,c,index) {
  const s=base(p,n)
  heading(s,`${c.id} / ${D.motionTitle}`,index===1?P.editorialMotionTitle:P.globalMotionTitle,P.motionNote)
  P.motionDetails[index].forEach((detail,i)=>{
    const x=.65+i*4.13,w=3.77
    frame(s,section(c,detail.scene),x,2.53,w,2.38)
    text(s,String(i+1).padStart(2,'0'),x,5.14,.37,.26,11.5,{color:T.green,bold:true})
    text(s,detail.title,x+.5,5.08,w-.5,.57,16.2,{fontFace:'Georgia',color:T.purple})
    text(s,detail.body,x,5.83,w,.96,13.1,{color:T.muted})
  })
  notes(s,`${c.notes}\n${c.motion}\n${c.beats.join(' -> ')}\n${P.motionDetails[index].map(d=>`${d.title}: ${d.body}`).join('\n')}\n${c.consideration}\nReduced-motion visitors should see complete readable sections without the movement.`)
}
function comparison(p,n) {
  const s=base(p,n)
  heading(s,P.sectionLabel,D.comparisonTitle)
  concepts.forEach((c,i)=>{
    const x=.65+i*4.13,w=3.77
    frame(s,file(c),x,1.87,w,2.04)
    display(s,`${c.id}  ${c.title}`,x,4.04,w,.8,20.4)
    text(s,P.comparison[i].audience,x,4.91,w,.43,14.3,{bold:true,color:T.green})
    text(s,P.comparison[i].motion,x,5.4,w,.52,12.1,{color:T.muted})
  })
  rect(s,.65,6.1,12.03,.83,T.soft,T.soft)
  text(s,D.recommendation,.86,6.26,11.61,.25,15,{bold:true,color:T.purple})
  text(s,D.recommendationBody,.86,6.58,11.61,.26,10.8,{color:T.ink})
  notes(s,`${D.recommendation}\n${D.recommendationBody}\nRoot to Story is appropriate if the distinctive scroll experience is the main priority. Grown Together emphasizes cooperative trust. Purple to the World emphasizes product and buyer discovery. The client decides which should lead.\nAll three retain stories, farm partners and the same farm profile lookup.`)
}
function choice(p,n) {
  const s=base(p,n,true)
  text(s,P.sectionLabel,.65,.5,12,.18,9.5,{color:T.sage,charSpacing:1.3,bold:true})
  display(s,D.choiceTitle,.65,1.03,11.9,1.66,39,{color:T.paper})
  text(s,P.choiceHint,.65,2.93,11.9,.38,15.2,{color:T.paper})
  concepts.forEach((c,i)=>{
    const x=.65+i*4.13
    rect(s,x,3.58,3.77,1.48,T.paper,T.paper)
    s.addShape(SH.ellipse,{x:x+.2,y:3.83,w:.29,h:.29,fill:{color:T.paper},line:{color:T.purple,width:1.1}})
    display(s,c.title,x+.7,3.76,2.88,.8,20)
    text(s,c.short,x+.7,4.68,2.8,.25,11.5,{color:T.green})
  })
  D.prompts.forEach((v,i)=>text(s,`${String(i+1).padStart(2,'0')}    ${v}`,.65,5.38+i*.46,11.8,.32,15.1,{color:T.paper}))
  text(s,D.draftNote,.65,6.85,11.9,.2,9.2,{color:T.sage})
  notes(s,`${D.choiceBody}\n${P.nextBody}\n${D.prompts.join('\n')}\n${D.draftNote}\nDiscuss the overall direction first. Record exact content and any details to borrow before approving the implementation.`)
}

const main=createDeck()
cover(main,1);goal(main,2)
overview(main,3,concepts[0]);rootMotion(main,4)
overview(main,5,concepts[1]);conceptMotion(main,6,concepts[1],1)
overview(main,7,concepts[2]);conceptMotion(main,8,concepts[2],2)
comparison(main,9);choice(main,10)
await main.writeFile({fileName:`${out}/ube-farm-client-presentation.pptx`,compression:true})

const conceptFiles=[]
for(let i=0;i<concepts.length;i++) {
  const c=concepts[i],p=createDeck()
  p.title=c.title
  overview(p,1,c)
  if(i===0) rootMotion(p,2); else conceptMotion(p,2,c,i)
  const dest=`${out}/source/${c.id}-${c.slug}.pptx`
  await p.writeFile({fileName:dest,compression:true})
  conceptFiles.push({source:path.resolve(dest),pdf:path.resolve(`${out}/pdfs/${c.id}-${c.slug}.pdf`)})
}
await fs.writeFile(`${out}/source/export-jobs.json`,JSON.stringify([
  {source:path.resolve(`${out}/ube-farm-client-presentation.pptx`),pdf:path.resolve(`${out}/ube-farm-client-presentation.pdf`),images:path.resolve(`${out}/previews/slides`)},
  ...conceptFiles,
],null,2))
console.log('10-slide editable deck and three two-slide concept decks created.')
