import { chromium } from 'playwright-core'
import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import sharp from 'sharp'
import QRCode from 'qrcode'
import { BinaryBitmap, HybridBinarizer, RGBLuminanceSource, QRCodeReader } from '@zxing/library'
import { JOURNEY, SITE } from '../src/constants/site.ts'

const base = process.env.TEST_URL || 'http://127.0.0.1:4173'
const out = 'scrollcraft/builds/ube-farm/verification'
await fs.mkdir(out, { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const errors = []
const checks = []
const states = []
const points = [0, .45, 1, 1.8, 2.6, 3.65, 4.9, 6.1, 7.3, 8.6, 10.6, 11]
async function context(options = {}) {
  const context = await browser.newContext(options)
  await context.addInitScript(() => {
    Element.prototype.requestPointerLock = () => {}
    Element.prototype.setPointerCapture = () => {}
    Element.prototype.releasePointerCapture = () => {}
  })
  return context
}
async function pageFor(ctx, path = '/') {
  const page = await ctx.newPage()
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(base + path)
  await page.evaluate(() => document.fonts.ready)
  await page.waitForFunction(() => [...document.images].every(image => image.complete))
  return page
}
async function capture(page, name, fullPage = false) { await page.screenshot({ path: `${out}/${name}.png`, fullPage }) }
try {
  for (const [name, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844], ['compact', 360, 640]]) {
    const ctx = await context({ viewport: { width, height } })
    const page = await pageFor(ctx)
    const frames = []
    for (const t of points) {
      await page.evaluate(t => scrollTo(0, t * innerHeight), t)
      await page.waitForTimeout(180)
      const state = await page.evaluate(() => ({ scroll: scrollY, rendered: document.querySelector('.journey').dataset.scVerifyState, active: document.querySelector('.journey').className, overflow: document.documentElement.scrollWidth > innerWidth }))
      assert.equal(state.overflow, false, `${name} horizontal overflow at ${t}`)
      states.push({ device: name, t, ...state })
      const path = `${out}/${name}-${String(t).replace('.', '_')}.png`
      await page.screenshot({ path }); frames.push(path)
    }
    const cellWidth = name === 'desktop' ? 360 : 195
    const cellHeight = Math.round(height * cellWidth / width)
    const tiles = await Promise.all(frames.map(async (path, i) => ({ input: await sharp(path).resize(cellWidth, cellHeight).toBuffer(), left: (i % 4) * cellWidth, top: Math.floor(i / 4) * cellHeight })))
    await sharp({ create: { width: cellWidth * 4, height: cellHeight * 3, channels: 4, background: SITE.colors.cream } }).composite(tiles).png().toFile(`${out}/${name}-sheet.png`)
    checks.push(`${name}: 12 scroll states, no horizontal overflow`)
    const denseFrames = []
    let start = 0
    for (const stage of JOURNEY) {
      for (const fraction of [.04, .2, .4, .6, .8, .96]) {
        const travel = start + stage.weight * fraction
        await page.evaluate(t => scrollTo(0, t * innerHeight), travel)
        await page.waitForTimeout(80)
        const path = `${out}/${name}-${stage.key}-${fraction}.png`
        await page.screenshot({ path }); denseFrames.push(path)
        states.push({ device: name, stage: stage.key, travel, rendered: await page.locator('.journey').getAttribute('data-sc-verify-state') })
      }
      start += stage.weight
    }
    const denseTiles = await Promise.all(denseFrames.map(async (path, i) => ({ input: await sharp(path).resize(cellWidth, cellHeight).toBuffer(), left: (i % 6) * cellWidth, top: Math.floor(i / 6) * cellHeight })))
    await sharp({ create: { width: cellWidth * 6, height: cellHeight * 8, channels: 4, background: SITE.colors.cream } }).composite(denseTiles).png().toFile(`${out}/${name}-dense-sheet.png`)
    checks.push(`${name}: six additional positions per stage, rendered motion sensor captured`)
    for (const [i, key] of ['lookup', 'story', 'growing', 'harvest'].entries()) {
      const t = JOURNEY.slice(0, i + 2).reduce((sum, stage) => sum + stage.weight, 0) + .35
      await page.evaluate(t => scrollTo(0, t * innerHeight), t)
      await page.waitForTimeout(200)
      const measured = await page.evaluate(({ i, key }) => {
        const leaf = document.querySelector(`.scene-${key} .leaf-art`)
        const stem = document.querySelector(`.branch-${i}`)
        const tip = new DOMPoint(860, 572).matrixTransform(leaf.getScreenCTM())
        const end = stem.getPointAtLength(stem.getTotalLength()).matrixTransform(stem.getScreenCTM())
        const content = document.querySelector(`.scene-${key} .leaf-content`)
        const bounds = content.getBoundingClientRect()
        return { gap: Math.hypot(tip.x - end.x, tip.y - end.y), opacity: getComputedStyle(content).opacity, bottom: bounds.bottom, right: bounds.right, unfurl: document.querySelector(`.scene-${key}`).style.getPropertyValue('--unfurl') }
      }, { i, key })
      assert(measured.gap < 2, `${name} ${key}: stem stays physically attached`)
      assert.equal(measured.unfurl, '1', `${name} ${key}: leaf fully opens`)
      assert.equal(measured.opacity, '1', `${name} ${key}: copy fully readable`)
      assert(measured.bottom < height - 35 && measured.right <= width, `${name} ${key}: content fits viewport`)
    }
    checks.push(`${name}: all four story leaf petioles connected within 2px, leaves fully open, copy fully opaque and inside viewport`)
    await ctx.close()
  }

  const ctx = await context({ viewport: { width: 1440, height: 900 }, acceptDownloads: true })
  const page = await pageFor(ctx)
  await page.getByRole('button', { name: SITE.nav.find, exact: true }).first().click()
  const lookup = page.locator('.scene-lookup')
  await lookup.getByRole('button', { name: SITE.lookup.submit, exact: false }).click()
  await lookup.getByText(SITE.lookup.empty).waitFor()
  await lookup.getByRole('textbox').fill('9999')
  await lookup.getByRole('button', { name: SITE.lookup.submit, exact: false }).click()
  await lookup.getByText(SITE.lookup.notFound).waitFor()
  await lookup.getByRole('textbox').fill('0001')
  const position = await page.evaluate(() => scrollY)
  await lookup.getByRole('button', { name: SITE.lookup.submit, exact: false }).click()
  await page.waitForURL('**/farms/0001')
  await page.getByRole('heading', { name: SITE.farms[0].name }).waitFor()
  await page.waitForFunction(() => document.querySelector('.qr-card img')?.getAttribute('src')?.startsWith('data:'))
  await capture(page, 'desktop-profile', true)
  const download = page.waitForEvent('download')
  await page.getByRole('link', { name: SITE.profile.download, exact: false }).click()
  const downloaded = await download
  assert.equal(downloaded.suggestedFilename(), 'ube-farm-0001.svg')
  const qrPixels = await sharp(await fs.readFile(await downloaded.path())).greyscale().raw().toBuffer({ resolveWithObject: true })
  const decodedQr = new QRCodeReader().decode(new BinaryBitmap(new HybridBinarizer(new RGBLuminanceSource(Uint8ClampedArray.from(qrPixels.data), qrPixels.info.width, qrPixels.info.height))))
  assert.equal(decodedQr.getText(), `${base}/farms/0001`, 'Downloaded QR opens the canonical farm profile')
  await page.goBack()
  await page.waitForTimeout(250)
  assert(Math.abs((await page.evaluate(() => scrollY)) - position) < 5, 'Browser Back restores leaf position')
  await page.locator('.route-rail').getByRole('button', { name: SITE.nav.partners, exact: true }).click()
  await page.locator('.scene-partners').getByRole('link').nth(1).click()
  await page.waitForURL('**/farms/0002')
  await page.getByRole('heading', { name: SITE.farms[1].name }).waitFor()
  await page.goto(base + '/farms/unknown')
  await page.getByRole('heading', { name: SITE.profile.missingTitle }).waitFor()
  await capture(page, 'missing-profile')
  checks.push('Lookup: empty, unknown, leading-zero valid ID; partner route; missing route; QR download; browser Back')
  await ctx.close()

  const mobile = await context({ viewport: { width: 390, height: 844 } })
  const phone = await pageFor(mobile)
  await phone.getByRole('button', { name: SITE.nav.menu, exact: true }).click()
  await phone.locator('#mobile-navigation').getByRole('button', { name: SITE.nav.find, exact: true }).click()
  await phone.locator('.scene-lookup input').focus()
  await phone.setViewportSize({ width: 390, height: 430 })
  await phone.waitForTimeout(600)
  assert.equal(await phone.locator('.scene-lookup').getAttribute('aria-hidden'), 'false', 'Keyboard resize retains active lookup stage')
  await capture(phone, 'keyboard-lookup')
  const submitBox = await phone.locator('.scene-lookup button[type="submit"]').boundingBox()
  assert(submitBox && submitBox.y >= 76 && submitBox.y + submitBox.height <= 430, 'Lookup submit reachable with keyboard-sized viewport')
  await phone.setViewportSize({ width: 390, height: 844 })
  await phone.evaluate(() => document.activeElement.blur())
  await phone.getByRole('button', { name: SITE.nav.reading, exact: true }).last().click()
  assert.equal(await phone.locator('.journey').isVisible(), false)
  await phone.reload()
  assert.equal(await phone.locator('.reading-page').isVisible(), true, 'Reading preference survives reload')
  await capture(phone, 'mobile-reading', true)
  assert.equal(await phone.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'Reading view has no horizontal overflow')
  await phone.getByRole('button', { name: SITE.nav.animated, exact: true }).last().click()
  assert.equal(await phone.locator('.journey').isVisible(), true)
  await phone.goto(base + '/farms/0003')
  await phone.getByRole('heading', { name: SITE.farms[2].name }).waitFor()
  await capture(phone, 'mobile-profile', true)
  checks.push('Mobile waypoint menu, keyboard viewport, reading/animated switch, profile')
  await mobile.close()

  const reduced = await context({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  const still = await pageFor(reduced)
  assert.equal(await still.locator('.journey').isVisible(), false)
  assert.equal(await still.locator('.reading-page').isVisible(), true)
  assert((await still.evaluate(() => document.body.scrollHeight)) < 7000, 'Reduced motion removes cinematic spacer')
  await capture(still, 'reduced-reading', true)
  checks.push('Reduced motion uses ordinary document flow with every story and partner')
  await reduced.close()

  for (const [error, title] of [['NotAllowedError', SITE.scanner.deniedTitle], ['NotFoundError', SITE.scanner.unavailableTitle]]) {
    const recovery = await context({ viewport: { width: 390, height: 844 } })
    await recovery.addInitScript(error => {
      navigator.mediaDevices.getUserMedia = async () => { throw new DOMException('Test camera state', error) }
    }, error)
    const camera = await pageFor(recovery)
    await camera.getByRole('button', { name: SITE.nav.find, exact: true }).first().click()
    await camera.locator('.scene-lookup').getByRole('button', { name: SITE.lookup.scan, exact: true }).click()
    await camera.getByRole('heading', { name: title, exact: true }).waitFor()
    await capture(camera, `camera-${error}`)
    await camera.keyboard.press('Escape')
    assert.equal(await camera.getByRole('dialog').count(), 0)
    await recovery.close()
  }
  checks.push('Camera permission denial, no-camera recovery, Escape closes modal')

  const lifecycle = await context({ viewport: { width: 390, height: 844 } })
  await lifecycle.addInitScript(() => {
    window.__cameraStarts = 0; window.__cameraStops = 0
    navigator.mediaDevices.getUserMedia = async () => {
      window.__cameraStarts++
      await new Promise(resolve => setTimeout(resolve, 300))
      const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 480
      const stream = canvas.captureStream(10)
      stream.getTracks().forEach(track => { const stop = track.stop.bind(track); track.stop = () => { window.__cameraStops++; stop() } })
      return stream
    }
  })
  const closing = await pageFor(lifecycle)
  await closing.getByRole('button', { name: SITE.nav.find, exact: true }).first().click()
  await closing.locator('.scene-lookup').getByRole('button', { name: SITE.lookup.scan, exact: true }).click()
  await closing.waitForFunction(() => window.__cameraStarts > 0)
  await closing.keyboard.press('Escape')
  await closing.waitForFunction(() => window.__cameraStops > 0)
  assert.equal(await closing.locator('.scene-lookup .scan-button').evaluate(el => el === document.activeElement), true, 'Closing scanner returns focus to its trigger')
  checks.push('Camera permission request completing after modal close releases its tracks and restores focus')
  await lifecycle.close()

  const qr = await QRCode.toDataURL('0003', { width: 320, margin: 4 })
  const scanning = await context({ viewport: { width: 390, height: 844 } })
  await scanning.addInitScript(data => {
    window.__cameraStarts = 0; window.__cameraStops = 0
    navigator.mediaDevices.getUserMedia = async () => {
      window.__cameraStarts++
      const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 480
      const image = new Image(); image.src = data; await image.decode()
      const draw = () => { const ctx = canvas.getContext('2d'); ctx.fillStyle = 'white'; ctx.fillRect(0, 0, 640, 480); ctx.drawImage(image, 160, 80); }
      draw()
      const timer = setInterval(draw, 50)
      const stream = canvas.captureStream(20)
      stream.getTracks().forEach(track => { const stop = track.stop.bind(track); track.stop = () => { window.__cameraStops++; clearInterval(timer); stop() } })
      return stream
    }
  }, qr)
  const scanner = await pageFor(scanning)
  assert.equal(await scanner.evaluate(() => window.__cameraStarts), 0, 'Camera waits for user action')
  await scanner.getByRole('button', { name: SITE.nav.find, exact: true }).first().click()
  await scanner.locator('.scene-lookup').getByRole('button', { name: SITE.lookup.scan, exact: true }).click()
  await scanner.waitForURL('**/farms/0003', { timeout: 15000 })
  await scanner.getByRole('heading', { name: SITE.farms[2].name }).waitFor()
  assert((await scanner.evaluate(() => window.__cameraStops)) > 0, 'Decoded camera stream stopped')
  checks.push('Real ZXing decoding from a simulated camera stream opens matching farm and stops tracks')
  await scanning.close()
  assert.equal(errors.length, 0, errors.join('\n'))
  await fs.writeFile(`${out}/report.json`, JSON.stringify({ baseURL: base, node: process.version, checks, errors, states, note: 'Headless installed Chrome. Physical phone camera, touch scrolling, and device keyboard acceptance remain unverified.' }, null, 2))
  console.log(checks.join('\n'))
} finally { await browser.close() }
