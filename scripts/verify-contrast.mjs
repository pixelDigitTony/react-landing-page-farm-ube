import { chromium } from 'playwright-core'
import fs from 'node:fs/promises'
import sharp from 'sharp'
import { MOTION } from '../src/constants/site.ts'

// Conservative composited-image check: hide glyphs, sample the brightest pixel
// behind each actual text line, then compare its luminance with the text color.
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
const rows = []
async function measure(page, selector, width, height, detail) {
  const info = await page.locator(selector).evaluate(el=>{
    const css=getComputedStyle(el),color=css.color,size=parseFloat(css.fontSize)
    const range=document.createRange();range.selectNodeContents(el)
    const rects=[...range.getClientRects()].map(r=>({x:r.x,y:r.y,width:r.width,height:r.height}))
    el.style.color='transparent'
    return {color,size,rects,header:document.querySelector('.site-header').getBoundingClientRect().bottom}
  })
  try {
    const pixels=await sharp(await page.screenshot()).removeAlpha().raw().toBuffer({resolveWithObject:true})
    const luminance=(r,g,b)=>[r,g,b].map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0)
    let bright=0,samples=0
    for(const r of info.rects)for(let y=Math.max(Math.ceil(info.header),Math.floor(r.y));y<Math.min(height,r.y+r.height);y++)for(let x=Math.max(0,Math.floor(r.x));x<Math.min(width,r.x+r.width);x++) {
      const i=(y*width+x)*3;bright=Math.max(bright,luminance(...pixels.data.subarray(i,i+3)));samples++
    }
    if(!samples) {
      if(detail.mode.startsWith('animated-')) { rows.push({...detail,selector,skipped:'Text is outside the viewport or behind the sticky header at this position'}); return }
      throw new Error(`${selector}: no visible text pixels at ${JSON.stringify(detail)}`)
    }
    const color=info.color.match(/[\d.]+/g).slice(0,3).map(Number)
    const ratio=(luminance(...color)+.05)/(bright+.05),minimum=info.size>=24?3:4.5
    rows.push({...detail,selector,ratio:+ratio.toFixed(2),minimum,pass:ratio>=minimum})
  } finally {await page.locator(selector).evaluate(el=>el.style.removeProperty('color'))}
}
try {
  for (const [device,width,height] of [['desktop',1440,900],['tablet',834,1194],['mobile',390,844]]) {
    const page = await browser.newPage({viewport:{width,height},reducedMotion:'reduce'})
    await page.addInitScript(()=>{Element.prototype.requestPointerLock=()=>{};Element.prototype.setPointerCapture=()=>{};Element.prototype.releasePointerCapture=()=>{}})
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4173')
    await page.waitForSelector('.layers-ready')
    await page.evaluate(()=>document.fonts.ready)
    for(const selector of ['.hero-copy h1','.hero-body','.origin-lookup h2','.origin-lookup label','.lookup-feedback','.origin-photo-frame figcaption strong','.origin-photo-frame figcaption .text-link','.underground-reading h2','.underground-reading p','.scene-disclosure','.home-footer p']) {
      await page.locator(selector).scrollIntoViewIfNeeded()
      await measure(page,selector,width,height,{device,mode:'motion-off'})
    }
    await page.emulateMedia({reducedMotion:'no-preference'})
    await page.waitForFunction(()=>!document.querySelector('.origin-world').classList.contains('motion-off'))
    const geometry=await page.evaluate(travel=>{
      const stage=document.querySelector('.underground-stage'),bounds=stage.getBoundingClientRect(),top=bounds.top+scrollY,header=document.querySelector('.site-header').offsetHeight,pinned=document.querySelector('.origin-story').dataset.pinned==='true'
      return pinned?{start:top-header,end:top-header+(innerHeight-header)*travel}:{start:top-innerHeight*.8,end:top+bounds.height-innerHeight*.85}
    },MOTION.story.pinTravel)
    for(const progress of [0,.2,.4,.6,.8,1]) {
      await page.evaluate(top=>scrollTo(0,Math.max(0,top)),geometry.start+(geometry.end-geometry.start)*progress)
      await page.waitForTimeout(700)
      for(const selector of ['.underground-reading h2','.underground-reading p','.scene-disclosure']) await measure(page,selector,width,height,{device,mode:'animated-roots',progress})
    }
    const harvest=await page.locator('#harvest').evaluate(el=>el.getBoundingClientRect().top+scrollY)
    for(const progress of [0,.2,.4,.6,.8,1]) {
      await page.evaluate(top=>scrollTo(0,top),harvest-height*.82+height*.58*progress)
      await page.waitForTimeout(500)
      for(const selector of ['.harvest-intro > p','.harvest-record-copy h3','.harvest-record-copy > p','.harvest-record-copy dl div:first-child dd']) await measure(page,selector,width,height,{device,mode:'animated-handoff',progress})
    }
    await page.close()
  }
  await fs.mkdir('scrollcraft/builds/roote-origin-story/verification',{recursive:true})
  await fs.writeFile('scrollcraft/builds/roote-origin-story/verification/contrast.json',JSON.stringify(rows,null,2))
  console.log(JSON.stringify({measured:rows.filter(row=>row.ratio).length,skipped:rows.filter(row=>row.skipped).length,failed:rows.filter(row=>row.pass===false)},null,2))
  if(rows.some(row=>row.pass===false))process.exitCode=1
} finally {await browser.close()}
