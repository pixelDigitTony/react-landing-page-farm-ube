import { chromium } from 'playwright-core'
import fs from 'node:fs/promises'
import sharp from 'sharp'

// Conservative composited-image check: hide glyphs, sample the brightest pixel
// behind each actual text line, then compare its luminance with the text color.
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
const rows = []
try {
  for (const [device,width,height] of [['desktop',1440,900],['mobile',390,844]]) {
    const page = await browser.newPage({viewport:{width,height},reducedMotion:'reduce'})
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4173')
    await page.waitForSelector('.layers-ready')
    await page.evaluate(()=>document.fonts.ready)
    for(const selector of ['.hero-copy h1','.hero-body','.origin-lookup h2','.origin-lookup label','.lookup-feedback','.roots-copy h2','.roots-copy a','.home-footer p']) {
      await page.locator(selector).scrollIntoViewIfNeeded()
      const info = await page.locator(selector).evaluate(el=>{
        const css=getComputedStyle(el),color=css.color,size=parseFloat(css.fontSize)
        const range=document.createRange();range.selectNodeContents(el)
        const rects=[...range.getClientRects()].map(r=>({x:r.x,y:r.y,width:r.width,height:r.height}))
        el.style.color='transparent'
        return {color,size,rects}
      })
      const pixels=await sharp(await page.screenshot()).removeAlpha().raw().toBuffer({resolveWithObject:true})
      const luminance=(r,g,b)=>[r,g,b].map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0)
      let bright=0
      for(const r of info.rects)for(let y=Math.max(0,Math.floor(r.y));y<Math.min(height,r.y+r.height);y++)for(let x=Math.max(0,Math.floor(r.x));x<Math.min(width,r.x+r.width);x++) {
        const i=(y*width+x)*3;bright=Math.max(bright,luminance(...pixels.data.subarray(i,i+3)))
      }
      const color=info.color.match(/[\d.]+/g).slice(0,3).map(Number)
      const ratio=(luminance(...color)+.05)/(bright+.05),minimum=info.size>=24?3:4.5
      rows.push({device,selector,ratio:+ratio.toFixed(2),minimum,pass:ratio>=minimum})
      await page.locator(selector).evaluate(el=>el.style.removeProperty('color'))
    }
    await page.close()
  }
  await fs.writeFile('scrollcraft/builds/roote-origin/verification/contrast.json',JSON.stringify(rows,null,2))
  console.log(rows)
  if(rows.some(row=>!row.pass))process.exitCode=1
} finally {await browser.close()}
