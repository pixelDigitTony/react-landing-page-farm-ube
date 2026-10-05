import { chromium } from 'playwright-core'
import fs from 'node:fs/promises'
import { MOTION } from '../src/constants/site.ts'
const output='scrollcraft/builds/roote-origin-story/verification'
await fs.mkdir(output,{recursive:true})
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'})
try{
  for(const [device,width,height] of [['desktop',1440,900],['phone',390,844]])for(const pace of ['reading','fast','reverse']){
    const context=await browser.newContext({viewport:{width,height},recordVideo:{dir:output,size:{width:device==='desktop'?960:390,height:device==='desktop'?600:844}}})
    await context.addInitScript(()=>{Element.prototype.requestPointerLock=()=>{};Element.prototype.setPointerCapture=()=>{};Element.prototype.releasePointerCapture=()=>{}})
    const page=await context.newPage()
    await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');await page.waitForSelector('.layers-ready');await page.waitForTimeout(800)
    const maximum=await page.evaluate(()=>document.documentElement.scrollHeight-innerHeight)
    if(pace==='reverse'){
      const range=await page.evaluate(()=>{const roots=document.querySelector('#roots').getBoundingClientRect().top+scrollY,harvest=document.querySelector('#harvest').getBoundingClientRect();return [roots-100,harvest.bottom+scrollY-innerHeight*.25]})
      await page.evaluate(top=>scrollTo(0,top),range[1]);await page.waitForTimeout(1000)
      for(let position=range[1];position>=range[0];position-=24){await page.evaluate(top=>scrollTo(0,top),position);await page.waitForTimeout(100)}
    }else{
      const pauses=await page.evaluate(m=>{
        const pauses=[...document.querySelectorAll('.story-hero,#farm-origin,#harvest,#batch-journey,#cooperative')].map(e=>e.getBoundingClientRect().top+scrollY)
        if(document.querySelector('.origin-story').dataset.pinned==='true'){
          const top=document.querySelector('#underground').getBoundingClientRect().top+scrollY-document.querySelector('.site-header').offsetHeight,travel=(innerHeight-document.querySelector('.site-header').offsetHeight)*m.pinTravel
          pauses.push(top+travel*m.sceneScore.revealStart*.5,top+travel*.55,top+travel*.93)
        }
        return pauses
      },MOTION.story)
      const step=pace==='reading'?22:130,delay=pace==='reading'?120:35
      for(let position=0;position<=maximum;position+=step){
        await page.evaluate(top=>scrollTo(0,top),position);await page.waitForTimeout(delay)
        if(pace==='reading'&&pauses.some(top=>top>=position&&top<position+step))await page.waitForTimeout(2500)
      }
      await page.evaluate(top=>scrollTo(0,top),maximum);await page.waitForTimeout(1000)
    }
    await page.waitForTimeout(500)
    const video=page.video();await context.close()
    await video.saveAs(`${output}/${device}-${pace}-scroll.webm`)
    if(pace==='reading')await fs.copyFile(`${output}/${device}-${pace}-scroll.webm`,`${output}/${device}-scroll.webm`)
    console.log(`${device} ${pace} recording saved`)
  }
}finally{await browser.close()}
