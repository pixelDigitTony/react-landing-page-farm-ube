import { chromium } from 'playwright-core'
import fs from 'node:fs/promises'
import sharp from 'sharp'
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import ffmpeg from '@ffmpeg-installer/ffmpeg'
import { concepts } from './content.mjs'

const out = 'presentation/images'
const base = process.env.PRESENTATION_URL || 'http://127.0.0.1:4173'
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const checks = []
async function context(width, height, video = false) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, ...(video ? { recordVideo: { dir: 'presentation/media/raw', size: { width, height } } } : {}) })
  await ctx.addInitScript(() => { Element.prototype.requestPointerLock = () => {}; Element.prototype.setPointerCapture = () => {}; Element.prototype.releasePointerCapture = () => {} })
  return ctx
}
async function ready(page, url) {
  await page.goto(url)
  await page.evaluate(() => document.fonts.ready)
  await page.waitForFunction(() => [...document.images].every(image => image.complete))
}
try {
  for (const [device, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
    const ctx = await context(width, height)
    const page = await ctx.newPage()
    await ready(page, base)
    const scenes = [['hero', 0], ['growth', 1.85], ['lookup', 3.65], ['story', 4.9], ['growing', 6.1], ['harvest', 7.3], ['partners', 8.6], ['leadership', 10.6]]
    for (const [scene, t] of scenes) {
      await page.evaluate(t => scrollTo(0, t * innerHeight), t)
      await page.waitForTimeout(280)
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
      await page.screenshot({ path: `${out}/01-root-to-story-${device}-${scene}.png` })
    }
    const selected = ['hero','lookup','story','growing','harvest','partners','leadership']
    await sharp({ create: { width, height: height * selected.length, channels: 4, background: '#F6F3EA' } }).composite(selected.map((scene, i) => ({ input: `${out}/01-root-to-story-${device}-${scene}.png`, top: height * i, left: 0 }))).png().toFile(`${out}/01-root-to-story-${device}-journey.png`)
    checks.push(`Existing prototype: ${device}, eight scroll states captured without horizontal overflow`)
    await ctx.close()
  }
  for (const concept of concepts.slice(1)) {
    for (const [device, width, height] of [['desktop',1440,1000],['mobile',390,844]]) {
      const ctx = await context(width,height)
      const page = await ctx.newPage()
      await ready(page, `${base}/presentation/${concept.slug}.html`)
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
      await page.screenshot({ path: `${out}/${concept.id}-${concept.slug}-${device}-hero.png` })
      await page.screenshot({ path: `${out}/${concept.id}-${concept.slug}-${device}-full.png`, fullPage: true })
      for (const [name,selector] of [['story','#cooperative'],['lookup','#farms'],['growing','#ube']]) {
        await page.locator(selector).evaluate(el => { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, el.offsetTop) })
        await page.waitForTimeout(100)
        await page.screenshot({ path: `${out}/${concept.id}-${concept.slug}-${device}-${name}.png` })
      }
      checks.push(`Concept ${concept.id}: ${device} hero, full page and three content states; no horizontal overflow`)
      await ctx.close()
    }
  }

  // Record actual native scrolling. Alternative concepts use labeled storyboards.
  const videoCtx = await context(1280,720,true)
  const videoPage = await videoCtx.newPage()
  await ready(videoPage,base)
  const video = videoPage.video()
  await videoPage.waitForTimeout(700)
  const points = [[.5,1800],[3.65,5400],[4.9,2000],[6.1,1800],[7.3,1800],[8.6,2000],[10.6,2600]]
  let from = 0
  for (const [to,duration] of points) {
    await videoPage.evaluate(({from,to,duration}) => new Promise(resolve => {
      const start = performance.now()
      const tick = now => {
        const t = Math.min(1,(now-start)/duration)
        const p = t*t*(3-2*t)
        scrollTo(0,(from+(to-from)*p)*innerHeight)
        if(t<1) requestAnimationFrame(tick); else resolve()
      }
      requestAnimationFrame(tick)
    }), {from,to,duration})
    await videoPage.waitForTimeout(to===3.65 || to===8.6 ? 850 : 400)
    from = to
  }
  await videoPage.waitForTimeout(1200)
  await videoCtx.close()
  const path = await video.path()
  await promisify(execFile)(ffmpeg.path,['-y','-i',path,'-c:v','libx264','-preset','fast','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart','-an','presentation/media/01-root-to-story-scroll.mp4'],{maxBuffer:2_000_000})
  checks.push('Actual working prototype scroll recorded as H.264 MP4')
  await fs.writeFile('presentation/source/capture-report.json',JSON.stringify({base,checks},null,2))
  console.log(checks.join('\n'))
} finally { await browser.close() }
