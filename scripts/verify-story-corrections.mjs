import { chromium } from 'playwright-core'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { ASSETS, MOTION } from '../src/constants/site.ts'
import { containRect, subjectRect } from '../src/lib/storyGeometry.ts'

const out='scrollcraft/builds/roote-origin-story/verification',base=process.env.TEST_URL||'http://127.0.0.1:4173'
await fs.mkdir(out,{recursive:true})
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true})
const results={alignment:[],recovery:[],navigation:[],performance:[]}
async function open(width=1440,height=900,setup){
  const context=await browser.newContext({viewport:{width,height}})
  await context.addInitScript(()=>{Element.prototype.requestPointerLock=()=>{};Element.prototype.setPointerCapture=()=>{};Element.prototype.releasePointerCapture=()=>{}})
  if(setup)await setup(context)
  const page=await context.newPage()
  await page.goto(base);await page.waitForSelector('.origin-story[data-story-ready="true"]');await page.waitForSelector('.layers-ready')
  return {context,page}
}
async function ranges(page){return page.evaluate(m=>{
  const stage=document.querySelector('.underground-stage'),r=stage.getBoundingClientRect(),header=document.querySelector('.site-header').offsetHeight,pin=document.querySelector('.origin-story').dataset.pinned==='true',h=document.querySelector('#harvest').getBoundingClientRect().top+scrollY
  const d=document.querySelector('.frame-sequence').dataset
  return {scene:pin?[r.top+scrollY-header,r.top+scrollY-header+(innerHeight-header)*m.pinTravel]:[r.top+scrollY-innerHeight*.8,r.bottom+scrollY-innerHeight*.85],transfer:d.transferStart?[Number(d.transferStart),Number(d.transferEnd)]:[h-innerHeight*.82,h-innerHeight*.24]}
},MOTION.story)}
async function scroll(page,range,p){await page.evaluate(y=>scrollTo(0,y),range[0]+(range[1]-range[0])*p);await page.waitForTimeout(650)}
try{
  for(const [name,width,height] of [['desktop',1440,900],['wide',1920,1080],['ultrawide',2551,1260],['panoramic',3440,1440],['reference',1086,900],['tablet',834,1194],['mobile',390,844],['compact',360,640]]){
    const {context,page}=await open(width,height),r=await ranges(page),source=width>=MOTION.desktop?ASSETS.story.desktop:ASSETS.story.phone
    for(const [index,p] of [0,.06,.25,.5,.75,1].entries()){
      await scroll(page,r.transfer,p)
      const state=await page.evaluate(()=>{
        const rect=s=>document.querySelector(s).getBoundingClientRect().toJSON(),style=s=>getComputedStyle(document.querySelector(s)).opacity
        return {scene:rect('.frame-sequence'),overlay:rect('.yam-transfer'),destination:rect('.harvest-image'),copy:[...document.querySelectorAll('.harvest-intro,.harvest-record-copy')].map(e=>e.getBoundingClientRect().toJSON()),overlayOpacity:style('.yam-transfer'),destinationOpacity:style('.harvest-artwork'),clean:document.querySelector('.frame-sequence').dataset.clean,progress:Number(document.querySelector('.frame-sequence').dataset.transferProgress||0),overflow:document.documentElement.scrollWidth>innerWidth}
      })
      assert.equal(state.overflow,false)
      if(width>=MOTION.desktop){
        assert(Math.abs(state.overlay.width/state.overlay.height-source.subjectWidth/source.subjectHeight)<.005,'Uniform subject proportions')
        if(index===1){
          const expected=subjectRect(containRect(state.scene,source.width,source.height),source.bounds)
          for(const key of ['left','top','width','height'])assert(Math.abs(expected[key]-state.overlay[key])<=2,`${name}: start ${key} alignment ${expected[key]} vs ${state.overlay[key]}`)
        }
        if(index===5){
          const expected=containRect(state.destination,source.subjectWidth,source.subjectHeight)
          for(const key of ['left','top','width','height'])assert(Math.abs(expected[key]-state.overlay[key])<=2,`${name}: end ${key} alignment`)
          assert.equal(state.overlayOpacity,'0');assert.equal(state.destinationOpacity,'1')
        }
        if(Number(state.overlayOpacity)>0)for(const text of state.copy)assert(state.overlay.left>=text.right-2||state.overlay.top+state.overlay.height<=text.top||state.overlay.top>=text.bottom,`${name}: subject overlaps text`)
        assert(!(Number(state.overlayOpacity)>0&&Number(state.destinationOpacity)>0),'One subject owner')
      }
      await page.screenshot({path:`${out}/${name}-correction-${index}.png`})
      results.alignment.push({name,index,...state})
    }
    await context.close()
  }
  const {context,page}=await open(1440,900,async ctx=>{await ctx.route('**/images/story/desktop/*.webp',route=>Number(route.request().url().match(/(\d{3})\.webp$/)?.[1])>=12?route.abort():route.continue())})
  const r=await ranges(page)
  await scroll(page,r.scene,0);await page.waitForFunction(()=>document.querySelector('.frame-sequence').dataset.frameState==='ready')
  await scroll(page,r.scene,.9)
  await page.waitForFunction(()=>document.querySelector('.frame-sequence').dataset.presentation==='completed-poster')
  results.recovery.push(await page.locator('.frame-sequence').evaluate(el=>({...el.dataset})))
  await scroll(page,r.scene,0)
  await page.waitForFunction(()=>document.querySelector('.frame-sequence').dataset.frameState==='ready'&&document.querySelector('.frame-sequence').dataset.presentation==='sequence')
  results.recovery.push(await page.locator('.frame-sequence').evaluate(el=>({...el.dataset})))
  await context.close()
  for(const [name,width,height,reduce] of [['height',1440,650,false],['width',390,844,false],['pin-threshold',1440,MOTION.story.minimumPinHeight-1,false],['motion',1440,900,true]]){
    const {context,page}=await open(),button=page.locator('#harvest .button')
    await button.scrollIntoViewIfNeeded();await button.click();await page.waitForURL('**/batches/SAMPLE-UBE-001')
    await page.setViewportSize({width,height});if(reduce)await page.emulateMedia({reducedMotion:'reduce'})
    await page.goBack();await page.waitForSelector('.origin-story[data-story-ready="true"]');await page.waitForTimeout(250)
    const rect=await button.boundingBox();assert(rect.y>=60&&rect.y+rect.height<=height,`${name}: originating batch button visible`)
    results.navigation.push({name,rect});await context.close()
  }
  const delayed=await open(1440,900,ctx=>ctx.route('**/*.woff2',async route=>{await new Promise(resolve=>setTimeout(resolve,1800));await route.continue()}))
  await delayed.page.locator('.origin-lookup input').focus()
  assert(await delayed.page.locator('.origin-lookup input').evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=68&&r.bottom<innerHeight}))
  const short=await open(1440,500)
  assert.equal(await short.page.locator('.pin-spacer').count(),0)
  await short.page.locator('#harvest .button').scrollIntoViewIfNeeded()
  assert(await short.page.locator('#harvest .button').isVisible())
  results.navigation.push({name:'delayed fonts and focused lookup',passed:true},{name:'short landscape with no pin',passed:true})
  const interrupted=await delayed.context.newPage()
  await interrupted.goto(`${base}/#harvest`,{waitUntil:'domcontentloaded'})
  await interrupted.waitForSelector('.origin-lookup input')
  await interrupted.mouse.wheel(0,600)
  await interrupted.waitForTimeout(200)
  await interrupted.waitForSelector('.origin-story[data-story-ready="true"]')
  await interrupted.waitForTimeout(150)
  assert(await interrupted.evaluate(()=>scrollY<1200),'Late font readiness must not override user wheel scrolling with the requested distant anchor')
  results.navigation.push({name:'late readiness honors user scroll',passed:true})
  await delayed.context.close();await short.context.close()
  for(const [device,width,height] of [['desktop',1440,900],['phone',390,844]]){
    const {context,page}=await open(width,height),r=await ranges(page)
    await scroll(page,r.scene,0)
    const activeRange=[r.scene[0]+(r.scene[1]-r.scene[0])*MOTION.story.sceneScore.revealStart,r.scene[0]+(r.scene[1]-r.scene[0])*MOTION.story.sceneScore.revealEnd]
    const samples=await page.evaluate(async ([start,end])=>{
      const samples=[],tasks=[];let previousFrame=-1,changed=performance.now(),maxStall=0
      const observer=new PerformanceObserver(list=>tasks.push(...list.getEntries().map(e=>e.duration)));observer.observe({type:'longtask'})
      for(let i=0;i<=100;i++){
        scrollTo(0,start+(end-start)*i/100);await new Promise(resolve=>setTimeout(resolve,35))
        const d=document.querySelector('.frame-sequence').dataset,frame=Number(d.frame),now=performance.now()
        if(frame!==previousFrame){maxStall=Math.max(maxStall,now-changed);changed=now;previousFrame=frame}
        samples.push({requested:Number(d.targetFrame),rendered:frame,presentation:d.presentation,cache:Number(d.cache),pending:Number(d.pending),time:now})
      }
      observer.disconnect();return {samples,maxStall,longTasks:tasks}
    },activeRange)
    await page.waitForTimeout(750)
    const source=width>=MOTION.desktop?ASSETS.story.desktop:ASSETS.story.phone
    assert(Number(await page.locator('.frame-sequence').getAttribute('data-frame'))>=source.count-2)
    assert(samples.samples.every(s=>s.cache<=(width>=MOTION.desktop?MOTION.story.cacheDesktop:MOTION.story.cachePhone)&&s.pending<=MOTION.story.decodeConcurrency),'Decoded residency and request concurrency stay bounded throughout scrolling')
    assert(samples.maxStall<500,'No visible half-second frame stall during the sustained passage')
    results.performance.push({device,...samples});await context.close()
  }
  await fs.writeFile(`${out}/corrections.json`,JSON.stringify(results,null,2))
  console.log('48 continuity states, partial failure/reverse, 4 changed-geometry Back scenarios and sustained frame-lag observations passed.')
}finally{await browser.close()}
