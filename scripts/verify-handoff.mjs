// Regional regression check after changes to the moving subject/text boundary.
import { chromium } from 'playwright-core'
import AxeBuilder from '@axe-core/playwright'
import fs from 'node:fs/promises'
import sharp from 'sharp'
import assert from 'node:assert/strict'
import { THEME } from '../src/constants/site.ts'

const out='scrollcraft/builds/roote-origin-story/verification',rows=[]
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true})
try{
  for(const [name,width,height] of [['desktop',1440,900],['wide',1920,1080],['ultrawide',2551,1260],['panoramic',3440,1440],['reference',1086,900],['tablet',834,1194],['mobile',390,844],['compact',360,640]]){
    const context=await browser.newContext({viewport:{width,height}})
    await context.addInitScript(()=>{Element.prototype.requestPointerLock=()=>{};Element.prototype.setPointerCapture=()=>{};Element.prototype.releasePointerCapture=()=>{}})
    const page=await context.newPage()
    await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');await page.waitForSelector('.layers-ready');await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(350)
    const top=await page.locator('#harvest').evaluate(el=>el.getBoundingClientRect().top+scrollY)
    const range=await page.locator('.frame-sequence').evaluate((el,{top,height})=>el.dataset.transferStart?[Number(el.dataset.transferStart),Number(el.dataset.transferEnd)]:[top-height*.82,top-height*.24],{top,height})
    for(let index=0;index<6;index++){
      await page.evaluate(top=>scrollTo(0,top),range[0]+(range[1]-range[0])*index/5)
      await page.waitForTimeout(550)
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)
      assert(await page.locator('#harvest .button').isEnabled())
      await page.screenshot({path:`${out}/${name}-handoff-${index}.png`})
      if(index===3&&(name==='desktop'||name==='mobile')){
        const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()
        assert.equal(result.violations.length,0)
        rows.push({name,index,violations:result.violations})
      }
    }
    // Refresh full sheets using existing unchanged-region evidence and new handoff frames.
    const tileWidth=width>1000?240:156,tileHeight=Math.round(height*tileWidth/width),regions=['hero','farm','underground','handoff','history','close']
    const tiles=[]
    for(const [row,region] of regions.entries())for(let column=0;column<6;column++)tiles.push({input:await sharp(`${out}/${name}-${region}-${column}.png`).resize(tileWidth,tileHeight).toBuffer(),left:column*tileWidth,top:row*tileHeight})
    await sharp({create:{width:tileWidth*6,height:tileHeight*6,channels:4,background:THEME.colors.canvas}}).composite(tiles).png().toFile(`${out}/${name}-story-sheet.png`)
    await context.close()
  }
  await fs.writeFile(`${out}/handoff-review.json`,JSON.stringify({viewports:8,states:48,accessibility:rows,note:'Final handoff regression uses measured transfer boundaries after the completed reveal hold. Other region snapshots come from the full browser run.'},null,2))
  console.log('48 final handoff states captured across eight viewports; two intermediate Axe scans passed.')
}finally{await browser.close()}
