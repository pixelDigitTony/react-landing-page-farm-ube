import { chromium } from 'playwright-core'
import fs from 'node:fs/promises'
import sharp from 'sharp'
import { createHash } from 'node:crypto'
import { MOTION } from '../src/constants/site.ts'
const out='scrollcraft/builds/roote-origin-story/verification/soil-audit'
await fs.mkdir(out,{recursive:true})
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true})
const results=[]
try{
  for(const [name,width,height] of [['desktop',1440,900],['panoramic',3440,1440],['short-desktop',1440,650],['tablet',834,1194],['phone',390,844]]){
    const context=await browser.newContext({viewport:{width,height}})
    await context.addInitScript(()=>{Element.prototype.requestPointerLock=()=>{};Element.prototype.setPointerCapture=()=>{};Element.prototype.releasePointerCapture=()=>{}})
    const page=await context.newPage()
    await page.goto('http://127.0.0.1:4173/');await page.waitForSelector('.origin-story[data-story-ready="true"]')
    const range=await page.evaluate(m=>{
      const e=document.querySelector('#underground'),r=e.getBoundingClientRect(),h=document.querySelector('.site-header').offsetHeight,pinned=document.querySelector('.origin-story').dataset.pinned==='true'
      const start=pinned?r.top+scrollY-h:r.top+scrollY-innerHeight*.8
      return {start,end:pinned?start+(innerHeight-h)*m.pinTravel:r.bottom+scrollY-innerHeight*.85,pinned}
    },MOTION.story)
    const states=[],files=[]
    for(const p of [0,.12,.38,.49,.6,.75,.85,.98,1.12,.85,.49,0]){
      await page.evaluate(y=>scrollTo(0,y),range.start+(range.end-range.start)*p);await page.waitForTimeout(700)
      const state=await page.evaluate(()=>({scroll:scrollY,stage:document.querySelector('#underground').getBoundingClientRect().toJSON(),image:document.querySelector('.frame-sequence').getBoundingClientRect().toJSON(),frame:{...document.querySelector('.frame-sequence').dataset},overlayOpacity:getComputedStyle(document.querySelector('.yam-transfer')).opacity}))
      if(p===.49){
        const before=createHash('sha256').update(await page.locator('canvas').screenshot()).digest('hex')
        await page.waitForTimeout(1800)
        state.stableWithoutScroll=before===createHash('sha256').update(await page.locator('canvas').screenshot()).digest('hex')
      }
      const path=`${out}/${name}-${states.length}.png`;await page.screenshot({path});files.push(path);states.push({p,...state})
    }
    const w=name==='phone'?195:320,h=Math.round(height*w/width)
    const tiles=await Promise.all(files.map(async(path,i)=>({input:await sharp(path).resize(w,h).toBuffer(),left:(i%4)*w,top:Math.floor(i/4)*h})))
    await sharp({create:{width:w*4,height:h*3,channels:3,background:'#251d17'}}).composite(tiles).png().toFile(`${out}/${name}-sheet.png`)
    results.push({name,width,height,...range,states});await context.close()
  }
  await fs.writeFile(`${out}/results.json`,JSON.stringify(results,null,2))
  console.log(JSON.stringify(results.map(({name,pinned,states})=>({name,pinned,states:states.map(s=>({p:s.p,requested:s.frame.targetFrame,rendered:s.frame.frame,stageTop:s.stage.top,clean:s.frame.clean,stable:s.stableWithoutScroll}))})),null,2))
}finally{await browser.close()}
