import { chromium } from 'playwright-core'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { MOTION } from '../src/constants/site.ts'

const base=process.env.TEST_URL||'http://127.0.0.1:4173'
const out='scrollcraft/builds/roote-origin-story/verification/feedback'
await fs.mkdir(out,{recursive:true})
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true})
const results={assets:[],navigation:[],pacing:[],errors:[]}
async function open({width=1440,height=900,reduce=false,setup}={}){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:reduce?'reduce':'no-preference'})
  await context.addInitScript(()=>{Element.prototype.requestPointerLock=()=>{};Element.prototype.setPointerCapture=()=>{};Element.prototype.releasePointerCapture=()=>{}})
  if(setup)await setup(context)
  const page=await context.newPage();page.on('pageerror',e=>results.errors.push(e.message))
  await page.goto(base);await page.waitForSelector('.origin-story[data-story-ready="true"]')
  return {context,page}
}
async function transfer(page,p){
  await page.evaluate(p=>{const d=document.querySelector('.frame-sequence').dataset;scrollTo(0,Number(d.transferStart)+(Number(d.transferEnd)-Number(d.transferStart))*p)},p)
  await page.waitForTimeout(650)
}
async function state(page){return page.evaluate(()=>{
  const image=s=>{const e=document.querySelector(s);return {decoded:e.naturalWidth>0,opacity:getComputedStyle(e).opacity,visible:getComputedStyle(e).visibility}}
  return {assets:document.querySelector('.origin-story').dataset.transferAssets,mode:document.querySelector('.frame-sequence').dataset.transferMode,clean:document.querySelector('.frame-sequence').dataset.clean,overlay:image('.yam-transfer'),subject:image('.harvest-yam'),poster:image('.harvest-poster')}
})}
try{
  if(!process.env.NAV_ONLY){
  for(const asset of ['clean-desktop','subject-desktop']){
    const {context,page}=await open({setup:ctx=>ctx.route(`**/${asset}.webp`,route=>route.abort())})
    await page.waitForFunction(()=>document.querySelector('.origin-story').dataset.transferAssets==='failed')
    for(const p of [.06,.5,1,.5,0]){
      await transfer(page,p);const s=await state(page)
      assert.equal(s.clean,'false');assert.equal(s.overlay.opacity,'0');assert.equal(s.mode,'static')
      assert(s.subject.decoded&&s.subject.visible==='visible'||s.poster.decoded&&s.poster.visible==='visible','Destination has usable artwork')
      results.assets.push({asset,p,...s})
      if(p===.5)await page.screenshot({path:`${out}/${asset}-fallback.png`})
    }
    await page.locator('#harvest .button').click();await page.waitForURL('**/batches/SAMPLE-UBE-001')
    await context.close()
  }
  for(const [name,width,height,reduce] of [['portrait',390,844,false],['reduced',1440,900,true]]){
    const {context,page}=await open({width,height,reduce,setup:ctx=>ctx.route('**/subject-*.webp',route=>route.abort())})
    await page.locator('#harvest').scrollIntoViewIfNeeded()
    await page.waitForFunction(()=>document.querySelector('.harvest-poster').naturalWidth>0)
    const s=await state(page);assert.equal(s.subject.visible,'hidden');assert.equal(s.poster.visible,'visible')
    await page.screenshot({path:`${out}/${name}-fallback.png`});results.assets.push({name,...s});await context.close()
  }
  let release
  const delayed=await open({setup:ctx=>ctx.route('**/clean-desktop.webp',async route=>{await new Promise(resolve=>{release=resolve});await route.continue()})})
  await transfer(delayed.page,.5)
  assert.equal((await state(delayed.page)).mode,'static')
  release();await delayed.page.waitForFunction(()=>document.querySelector('.origin-story').dataset.transferAssets==='ready')
  assert.equal((await state(delayed.page)).mode,'static','Late decode does not insert a moving yam midway')
  await transfer(delayed.page,0);await transfer(delayed.page,.5)
  assert.equal((await state(delayed.page)).mode,'animated','Reverse boundary enables next fully decoded passage')
  results.assets.push({name:'delayed decode and reverse retry',passed:true});await delayed.context.close()
  }
  for(let index=0;index<12;index++){
    const {context,page}=await open({setup:index%3===0?ctx=>ctx.route('**/images/origin/plant-*.webp',async route=>{await new Promise(resolve=>setTimeout(resolve,900));await route.continue()}):undefined})
    const button=page.locator('#harvest .button');await button.scrollIntoViewIfNeeded();await button.click()
    await page.waitForURL('**/batches/SAMPLE-UBE-001')
    const height=index%4===0?900:650,width=index%4===2?390:1440
    await page.setViewportSize({width,height});if(index%4===3)await page.emulateMedia({reducedMotion:'reduce'})
    await page.goBack();await page.waitForSelector('.origin-story[data-story-ready="true"]')
    await page.waitForFunction(()=>{const r=document.querySelector('#harvest .button').getBoundingClientRect();return r.top>=60&&r.bottom<=innerHeight},{},{timeout:5000}).catch(async error=>{console.log('Back failure',index,await page.evaluate(()=>({scroll:scrollY,rect:document.querySelector('#harvest .button').getBoundingClientRect().toJSON(),world:{...document.querySelector('.origin-story').dataset}})));throw error})
    await page.waitForTimeout(1100)
    const rect=await button.boundingBox();assert(rect.y>=60&&rect.y+rect.height<=height,'No late layout rewind after restoration')
    results.navigation.push({index,width,height,rect});await context.close()
  }
  const {context,page}=await open()
  const range=await page.evaluate(travel=>{const r=document.querySelector('#underground').getBoundingClientRect(),header=document.querySelector('.site-header').offsetHeight;return [r.top+scrollY-header,r.top+scrollY-header+(innerHeight-header)*travel]},MOTION.story.pinTravel)
  for(const p of [0,.08,.4,.48,.62,.85,.95,1]){
    await page.evaluate(y=>scrollTo(0,y),range[0]+(range[1]-range[0])*p);await page.waitForTimeout(750)
    const s=await page.evaluate(()=>({frame:Number(document.querySelector('.frame-sequence').dataset.targetFrame),clean:document.querySelector('.frame-sequence').dataset.clean,stageTop:document.querySelector('#underground').getBoundingClientRect().top,transfer:Number(document.querySelector('.frame-sequence').dataset.transferProgress)}))
    assert.equal(s.clean,'false','Soil environment remains until pin release')
    assert(Math.abs(s.stageTop-68)<2,'Scene holds while revealing and reading')
    results.pacing.push({p,...s});await page.screenshot({path:`${out}/pacing-${p}.png`})
  }
  assert.equal(results.pacing[0].frame,results.pacing[1].frame,'Arrival holds')
  assert.equal(results.pacing[2].frame,results.pacing[3].frame,'Covered soil holds')
  assert.equal(results.pacing[5].frame,results.pacing[6].frame,'Completed reveal holds before departure')
  assert(results.pacing[4].frame>results.pacing[3].frame)
  await context.close();assert.equal(results.errors.length,0)
  await fs.writeFile(`${out}/results.json`,JSON.stringify(results,null,2))
  console.log('Transfer failure/delay/reverse, portrait/reduced fallback, 12 rapid Back scenarios and soil/reveal/departure pacing passed.')
}finally{await browser.close()}
