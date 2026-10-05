import { chromium } from 'playwright-core'
import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import { ASSETS, SITE, MOTION } from '../src/constants/site.ts'

const base=process.env.TEST_URL||'http://127.0.0.1:4173'
const out='scrollcraft/builds/roote-origin-story/verification'
await fs.mkdir(out,{recursive:true})
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true})
const checks=[],errors=[],timing=[]
async function context(viewport={width:1440,height:900}){
  const ctx=await browser.newContext({viewport})
  await ctx.addInitScript(()=>{
    Element.prototype.requestPointerLock=()=>{}
    Element.prototype.setPointerCapture=()=>{}
    Element.prototype.releasePointerCapture=()=>{}
  })
  return ctx
}
async function open(ctx){
  const page=await ctx.newPage()
  page.on('pageerror',error=>errors.push(error.message))
  await page.goto(base);await page.waitForSelector('.layers-ready');await page.waitForTimeout(350)
  return page
}
async function range(page){return page.evaluate(travel=>{
  const stage=document.querySelector('.underground-stage'),rect=stage.getBoundingClientRect(),top=rect.top+scrollY,header=document.querySelector('.site-header').offsetHeight,pinned=document.querySelector('.origin-story').dataset.pinned==='true'
  return pinned?[top-header,top-header+(innerHeight-header)*travel]:[top-innerHeight*.8,top+rect.height-innerHeight*.85]
},MOTION.story.pinTravel)}
try{
  const ctx=await context(),page=await open(ctx),bounds=await range(page)
  await page.evaluate(top=>scrollTo(0,top),(bounds[0]+bounds[1])/2);await page.waitForTimeout(700)
  assert.equal(await page.locator('.pin-spacer').count(),1)
  const stageTop=await page.locator('#underground').evaluate(el=>el.getBoundingClientRect().top)
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForSelector('.motion-off');await page.waitForTimeout(400)
  assert.equal(await page.locator('.pin-spacer').count(),0)
  assert.equal(await page.locator('.frame-sequence').getAttribute('data-frame-state'),'static')
  const afterTop=await page.locator('#underground').evaluate(el=>el.getBoundingClientRect().top)
  assert(Math.abs(stageTop-afterTop)<5,`Changing motion preserves the visible underground stage (${stageTop} -> ${afterTop})`)
  await page.screenshot({path:`${out}/mid-scene-motion-off.png`})
  await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(450)
  assert.equal(await page.locator('.pin-spacer').count(),1)
  assert(Number(await page.locator('.origin-story').getAttribute('data-sc-triggers'))<=12)
  checks.push('Mid-pin system motion changes preserve the visible scene, remove/recreate one pin and show the complete poster')

  await page.locator('#farm-0001').scrollIntoViewIfNeeded();await page.locator('#farm-0001').click();await page.waitForURL('**/farms/0001')
  await page.setViewportSize({width:390,height:844});await page.goBack();await page.waitForSelector('.layers-ready');await page.waitForTimeout(700)
  assert(await page.locator('#farm-0001').evaluate(el=>{const rect=el.getBoundingClientRect();return rect.top<innerHeight&&rect.bottom>60}),'Resized Back restores originating card')
  assert.equal(await page.locator('.pin-spacer').count(),0)
  await page.locator('.menu-button').click();await page.locator('#mobile-nav').getByRole('link',{name:SITE.nav.trace}).click()
  await page.waitForFunction(()=>document.activeElement?.getAttribute('name')==='origin-id')
  await page.waitForFunction(()=>{const r=document.querySelector('.origin-lookup input').getBoundingClientRect();return r.top>=60&&r.bottom<=innerHeight})
  assert(await page.locator('.origin-lookup input').evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=60&&r.bottom<=innerHeight}),'Explicit anchor navigation wins over saved card position')
  checks.push('Back after desktop-to-phone resize restores the farm card; explicit lookup anchor focuses the visible input')
  await ctx.close()

  const failedContext=await context(),failed=await failedContext.newPage()
  await failed.route('**/images/story/desktop/*.webp',route=>route.abort())
  await failed.goto(base);await failed.waitForSelector('.layers-ready')
  const failureRange=await range(failed)
  await failed.evaluate(top=>scrollTo(0,top),failureRange[1]);await failed.waitForTimeout(900)
  assert.equal(await failed.locator('.frame-sequence').getAttribute('data-frame-state'),'failed')
  assert(await failed.locator('.sequence-fallback').evaluate(el=>el.complete&&el.naturalWidth>0&&getComputedStyle(el).opacity==='1'),'Failed sequence keeps the exact complete poster')
  await failed.screenshot({path:`${out}/sequence-failed-poster.png`})
  await failed.locator('#harvest .button').click();await failed.waitForURL('**/batches/SAMPLE-UBE-001')
  checks.push('All frame requests failing leaves the completed photographic poster and a working public batch action')
  await failedContext.close()

  const missingContext=await context(),missing=await missingContext.newPage()
  await missing.route('**/images/story/desktop/035.webp',route=>route.abort())
  await missing.goto(base);await missing.waitForSelector('.layers-ready')
  const missingRange=await range(missing)
  const score=MOTION.story.sceneScore,frameProgress=35/(ASSETS.story.desktop.count-1)
  const scrollProgress=score.revealStart+(frameProgress-score.soilFrame)/(1-score.soilFrame)*(score.revealEnd-score.revealStart)
  await missing.evaluate(top=>scrollTo(0,top),missingRange[0]+(missingRange[1]-missingRange[0])*scrollProgress)
  await missing.waitForTimeout(850)
  const missingState=await missing.locator('.frame-sequence').evaluate(el=>el.dataset)
  assert.equal(Number(missingState.targetFrame),35)
  assert.equal(missingState.frameState,'ready')
  assert(Math.abs(Number(missingState.frame)-35)<=2&&Number(missingState.frame)!==35,'Missing frame uses a decoded neighbor')
  await missing.screenshot({path:`${out}/one-frame-missing.png`})
  checks.push('One missing interior frame uses a nearby decoded frame without blanking the scene or jumping to the end')
  await missingContext.close()

  const staleContext=await context()
  await staleContext.addInitScript(()=>{
    window.__decodeStarted=0;window.__decodeClosed=0
    const decode=createImageBitmap
    window.createImageBitmap=async(...args)=>{
      window.__decodeStarted++
      const bitmap=await decode(...args),close=bitmap.close.bind(bitmap)
      bitmap.close=()=>{window.__decodeClosed++;close()}
      await new Promise(resolve=>setTimeout(resolve,700))
      return bitmap
    }
  })
  const stale=await open(staleContext),staleRange=await range(stale)
  await stale.evaluate(top=>scrollTo(0,top),staleRange[0]);await stale.waitForFunction(()=>window.__decodeStarted>0)
  await stale.locator('#harvest .button').click();await stale.waitForURL('**/batches/SAMPLE-UBE-001');await stale.waitForTimeout(1000)
  const decoded=await stale.evaluate(()=>({started:window.__decodeStarted,closed:window.__decodeClosed}))
  assert.equal(decoded.closed,decoded.started,'Every bitmap completing after unmount is closed')
  assert.equal(await stale.locator('.pin-spacer,canvas,.yam-transfer').count(),0)
  checks.push(`Delayed decode after route change releases all ${decoded.started} ImageBitmaps and leaves no stage, canvas or pin`)
  await staleContext.close()

  for(const [device,width,height] of [['desktop',1440,900],['phone',390,844]]){
    const perfContext=await context({width,height}),perf=await open(perfContext),r=await range(perf)
    await perf.evaluate(top=>scrollTo(0,top),r[0]);await perf.waitForTimeout(500)
    const result=await perf.evaluate(async({start,end})=>{
      const deltas=[],longTasks=[]
      const observer=new PerformanceObserver(list=>longTasks.push(...list.getEntries().map(entry=>entry.duration)))
      observer.observe({type:'longtask',buffered:false})
      let previous=performance.now()
      for(let index=0;index<=90;index++){
        scrollTo(0,start+(end-start)*index/90)
        await new Promise(resolve=>requestAnimationFrame(now=>{deltas.push(now-previous);previous=now;resolve()}))
      }
      await new Promise(resolve=>setTimeout(resolve,600))
      observer.disconnect();deltas.sort((a,b)=>a-b)
      return {median:deltas[Math.floor(deltas.length*.5)],p95:deltas[Math.floor(deltas.length*.95)],maximum:deltas.at(-1),longTasks,frame:{...document.querySelector('.frame-sequence').dataset}}
    },{start:r[0],end:r[1]})
    assert(Number(result.frame.frame)>=(width<MOTION.desktop?ASSETS.story.phone.count:ASSETS.story.desktop.count)-2,'Fast passage still resolves the final frame')
    await perf.evaluate(top=>scrollTo(0,top),r[0]);await perf.waitForTimeout(600)
    assert(Number(await perf.locator('.frame-sequence').getAttribute('data-frame'))<5,'Fast reverse resolves the opening frame')
    timing.push({device,...result})
    await perfContext.close()
  }
  checks.push('Fast native forward/reverse passage resolves both endpoints; rAF timing and long-task observations recorded')
  assert.equal(errors.length,0,errors.join('\n'))
  await fs.writeFile(`${out}/lifecycle.json`,JSON.stringify({base,checks,errors,timing,note:'Headless Chrome timings are a development observation, not a physical-device or ordinary-laptop performance certification.'},null,2))
  console.log(JSON.stringify({checks,timing},null,2))
}finally{await browser.close()}
