import fs from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { chromium } from 'playwright-core'
import sharp from 'sharp'
import ffmpeg from '@ffmpeg-installer/ffmpeg'
import { concepts } from './content.mjs'

const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  // Disable native cursor capture before loading any workspace page.
  await context.addInitScript(() => {
    Element.prototype.requestPointerLock = () => Promise.resolve()
    Element.prototype.setPointerCapture = () => {}
  })
  const page = await context.newPage()
  for (const concept of concepts.slice(1)) {
    await page.goto(`http://127.0.0.1:4173/presentation/${concept.slug}.html`)
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(()=>{}))) })
    for (const [name, selector] of [['story','#cooperative'],['growing','#ube'],['lookup','#farms']]) {
      await page.locator(selector).screenshot({ path: `presentation/previews/${concept.id}-${concept.slug}-${name}-section.png`, animations: 'disabled' })
    }
  }
} finally { await browser.close() }

await promisify(execFile)(ffmpeg.path, ['-y','-ss','12','-i','presentation/media/01-root-to-story-scroll.mp4','-frames:v','1','-q:v','2','presentation/previews/video-poster.jpg'], { maxBuffer: 1_000_000 })

const imageFiles = (await fs.readdir('presentation/images')).filter(n => n.endsWith('-hero.png') || n.endsWith('-lookup.png'))
for (const name of imageFiles) await sharp(`presentation/images/${name}`).jpeg({ quality: 93, chromaSubsampling: '4:4:4' }).toFile(`presentation/previews/${name.replace('.png','.jpg')}`)
console.log('Deck screenshots and video poster prepared.')
