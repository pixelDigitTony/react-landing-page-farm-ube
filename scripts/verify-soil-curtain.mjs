import { chromium } from 'playwright-core'
import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import sharp from 'sharp'
import { createHash } from 'node:crypto'
import { MOTION, THEME } from '../src/constants/site.ts'
const base=process.env.TEST_URL||'http://127.0.0.1:4173'
const out='scrollcraft/builds/roote-origin-story/verification/curtain'
await fs.mkdir(out,{recursive:true})
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true})
const results={viewports:[],recovery:[],navigation:[],errors:[]}
async function open(width=1440,height=900,setup){
  const context=await browser.newContext({viewport:{width,height}})
  await context.addInitScript(()=>{Element.prototype.requestPointerLock=()=>{};Element.prototype.setPointerCapture=()=>{};Element.prototype.releasePointerCapture=()=>{}})
  if(setup)await setup(context)
  const page=await context.newPage();page.on('pageerror',e=>results.errors.push(e.message))
  await page.goto(base);await page.waitForSelector('.origin-story[data-story-ready="true"]')
  return {context,page}
}
async function range(page){return page.evaluate(m=>{
  const r=document.querySelector('#underground').getBoundingClientRect(),header=document.querySelector('.site-header').offsetHeight,pin=document.querySelector('.origin-story').dataset.pinned==='true'
  const start=pin?r.top+scrollY-header:r.top+scrollY-innerHeight*.8
  return {start,end:pin?start+(innerHeight-header)*m.pinTravel:r.bottom+scrollY-innerHeight*.85,pin,header}
},MOTION.story)}
async function scroll(page,r,p){await page.evaluate(y=>scrollTo(0,y),r.start+(r.end-r.start)*p);await page.waitForTimeout(650)}
const hash=buffer=>createHash('sha256').update(buffer).digest('hex')
try{
  for(const [name,width,height] of [['desktop',1440,900],['wide',1920,1080],['panoramic',3440,1440],['reference',1086,900],['tablet',834,1194],['phone',390,844],['compact',360,640],['short',1440,650]]){
    const {context,page}=await open(width,height),r=await range(page),states=[],tiles=[]
    await page.waitForSelector('.soil-curtain[data-soil-ready="true"]')
    for(const [index,p] of [0,.2,.4,.6,.82,.96].entries()){
      await scroll(page,r,p)
      const s=await page.locator('.soil-curtain').evaluate(el=>({reveal:Number(el.dataset.reveal),clean:el.dataset.clean,mask:getComputedStyle(el.querySelector('.soil-cover')).maskImage,opacity:getComputedStyle(el.querySelector('.soil-cover')).opacity,top:document.querySelector('#underground').getBoundingClientRect().top,overflow:document.documentElement.scrollWidth>innerWidth}))
      assert.equal(s.overflow,false)
      if(r.pin)assert(Math.abs(s.top-r.header)<2,'Pinned scene remains still while the curtain opens')
      assert.notEqual(s.clean,'true','Handoff must not remove the soil environment during this chapter')
      assert.equal(s.opacity,'1','The curtain reveals from its middle rather than fading the entire soil layer')
      if(index<2)assert.equal(s.reveal,0)
      if(index>3)assert(s.reveal>.99)
      const file=`${out}/${name}-${index}.png`;await page.screenshot({path:file})
      const w=width>1000?320:195,h=Math.round(height*w/width)
      tiles.push({input:await sharp(file).resize(w,h).toBuffer(),left:(index%3)*w,top:Math.floor(index/3)*h})
      states.push({p,...s})
    }
    const w=width>1000?320:195,h=Math.round(height*w/width)
    await sharp({create:{width:w*3,height:h*2,channels:3,background:THEME.colors.soil}}).composite(tiles).png().toFile(`${out}/${name}-sheet.png`)
    await scroll(page,r,.5)
    const before=hash(await page.screenshot());await page.waitForTimeout(1200)
    assert.equal(hash(await page.screenshot()),before,`${name}: curtain stops when scrolling stops`)
    await scroll(page,r,0);assert.equal(Number(await page.locator('.soil-curtain').getAttribute('data-reveal')),0,'Reverse closes the curtain completely')
    assert.equal(await page.evaluate(()=>performance.getEntriesByType('resource').filter(e=>/\/story\/(desktop|phone)\/\d+\.webp/.test(e.name)).length),0,'Curtain uses two photographic plates, without obsolete sequence downloads')
    await page.emulateMedia({reducedMotion:'reduce'});await page.waitForSelector('.motion-off')
    assert.equal(await page.locator('.soil-cover').evaluate(e=>getComputedStyle(e).display),'none');assert.equal(await page.locator('.pin-spacer').count(),0)
    results.viewports.push({name,...r,states});await context.close()
  }
  for(const asset of ['clean-desktop','subject-desktop']){
    const {context,page}=await open(1440,900,ctx=>ctx.route(`**/${asset}.webp`,route=>route.abort()))
    const r=await range(page);await scroll(page,r,1.1)
    assert.equal(await page.locator('.yam-transfer').evaluate(e=>getComputedStyle(e).opacity),'0')
    assert.notEqual(await page.locator('.soil-curtain').getAttribute('data-clean'),'true')
    if(asset==='clean-desktop')assert.equal(await page.locator('.soil-curtain').getAttribute('data-soil-ready'),'fallback')
    await page.locator('#harvest .button').click();await page.waitForURL('**/batches/SAMPLE-UBE-001')
    results.recovery.push({asset,passed:true});await context.close()
  }
  for(let i=0;i<8;i++){
    const {context,page}=await open(),button=page.locator('#harvest .button')
    await button.scrollIntoViewIfNeeded();await button.click();await page.waitForURL('**/batches/SAMPLE-UBE-001')
    const width=i%3===0?390:1440,height=650
    await page.setViewportSize({width,height});if(i%3===2)await page.emulateMedia({reducedMotion:'reduce'})
    await page.goBack();await page.waitForSelector('.origin-story[data-story-ready="true"]')
    await page.waitForFunction(()=>{const r=document.querySelector('#harvest .button').getBoundingClientRect();return r.top>=60&&r.bottom<=innerHeight})
    await page.waitForTimeout(700)
    const rect=await button.boundingBox();assert(rect.y>=60&&rect.y+rect.height<=height)
    results.navigation.push({i,width,height,rect});await context.close()
  }
  assert.equal(results.errors.length,0)
  await fs.writeFile(`${out}/results.json`,JSON.stringify(results,null,2))
  console.log('48 curtain states across eight viewports, stationary/reverse/reduced-motion, image failures, zero legacy frame downloads and eight rapid Back scenarios passed.')
}finally{await browser.close()}
