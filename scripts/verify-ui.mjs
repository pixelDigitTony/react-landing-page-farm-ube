import { chromium } from 'playwright-core'
import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import sharp from 'sharp'
import QRCode from 'qrcode'
import AxeBuilder from '@axe-core/playwright'
import { BinaryBitmap, HybridBinarizer, RGBLuminanceSource, QRCodeReader } from '@zxing/library'
import { SITE, THEME } from '../src/constants/site.ts'
import { rootsAreUncovered, visibleSoilCoverage } from './verify-reveal.mjs'

const base = process.env.TEST_URL || 'http://127.0.0.1:4173'
const out = 'scrollcraft/builds/roote-origin/verification'
await fs.mkdir(out, { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const checks = [], errors = [], states = [], accessibility = [], imageTransfer = []
let zoomEvidence
async function context(options = {}) {
  const ctx = await browser.newContext(options)
  await ctx.addInitScript(() => {
    Element.prototype.requestPointerLock = () => {}
    Element.prototype.setPointerCapture = () => {}
    Element.prototype.releasePointerCapture = () => {}
  })
  return ctx
}
async function pageFor(ctx, path = '/') {
  const page = await ctx.newPage()
  page.setDefaultTimeout(10000)
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(base + path)
  await page.evaluate(() => document.fonts.ready)
  return page
}
async function capture(page, name, fullPage = false) { await page.screenshot({ path: `${out}/${name}.png`, fullPage }) }
async function clickVisible(locator) {
  // Locator.click() scrolls sticky header controls into their original document
  // position in Chrome. Use the visible pointer target for scroll-return tests.
  const bounds = await locator.boundingBox()
  assert(bounds, 'Visible pointer target exists')
  await locator.page().mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
}
async function axe(page, name) {
  const report = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  accessibility.push({ name, violations: report.violations })
  assert.equal(report.violations.length, 0, `${name}: ${report.violations.map(item => `${item.id}: ${item.nodes.map(node => node.target).join(',')}`).join('; ')}`)
}
async function lookup(page, value) {
  await page.locator('.origin-lookup input').fill(value)
  await page.getByRole('button', { name: SITE.lookup.submit, exact: true }).click()
}
try {
  for (const [name, width, height] of [['desktop',1440,900],['wide',1920,1080],['ultrawide',2551,1260],['panoramic',3440,1440],['reference',1086,900],['tablet',834,1194],['mobile',390,844],['compact',360,640]]) {
    const ctx = await context({ viewport: { width, height } })
    const page = await pageFor(ctx)
    await page.waitForSelector('.layers-ready')
    if (width >= 768) {
      assert(await page.locator('.leaf-lookup').evaluate(el => {
        const world = el.closest('.origin-world'), safe = JSON.parse(world.dataset.sceneSafe)
        const lookup = el.getBoundingClientRect(), origin = world.getBoundingClientRect()
        const header = document.querySelector('.site-header').getBoundingClientRect()
        return lookup.top >= header.bottom && lookup.bottom <= origin.top + document.querySelector('.origin-hero').offsetHeight &&
          lookup.left >= safe.x - 1 && lookup.right <= safe.x + safe.width + 1 &&
          lookup.top - origin.top >= safe.y - 1 && lookup.bottom - origin.top <= safe.y + safe.height + 1
      }), `${name}: complete lookup clears the header and stays inside the attached leaf`)
    }
    await capture(page, `${name}-opening`)
    imageTransfer.push({name,...await page.evaluate(() => {
      const assets=performance.getEntriesByType('resource').filter(entry=>entry.name.includes('/images/origin/')).map(entry=>({name:entry.name.split('/').pop(),bytes:entry.encodedBodySize}))
      return {assets,totalBytes:assets.reduce((total,asset)=>total+asset.bytes,0)}
    })})
    const geometry = await page.evaluate(() => ({ hero: document.querySelector('.origin-hero').getBoundingClientRect().height, roots: document.querySelector('#roots').getBoundingClientRect().top + scrollY, max: document.documentElement.scrollHeight - innerHeight }))
    const frames = [], rootCoverage = []
    for (const [region, start, end] of [['hero',0, Math.min(geometry.hero, geometry.max)],['roots',Math.max(0,geometry.roots-height*.9),geometry.max]]) {
      for (let i = 0; i < 6; i++) {
        await page.evaluate(top => scrollTo(0,top), start+(end-start)*i/5)
        await page.waitForTimeout(600)
        const state = await page.evaluate(() => ({ top: scrollY, overflow: document.documentElement.scrollWidth > innerWidth, curtain: getComputedStyle(document.querySelector('.root-curtain')).transform, background: getComputedStyle(document.querySelector('.canopy-backplate')).transform, middle: getComputedStyle(document.querySelector('.middle-backplate')).transform, foreground: getComputedStyle(document.querySelector('.hero-foliage')).transform }))
        assert.equal(state.overflow,false,`${name} ${region} ${i}: overflow`)
        states.push({ name, region, i, ...state })
        const file = `${out}/${name}-${region}-${i}.png`
        await page.screenshot({ path: file }); frames.push(file)
        if (region === 'roots') {
          const coverage = await visibleSoilCoverage(page)
          rootCoverage.push(coverage)
          states.at(-1).visibleSoilPercent = coverage
        }
      }
    }
    assert(Math.max(...rootCoverage.slice(1,5)) > 2, `${name}: soil must visibly conceal roots during the reveal, not animate outside the viewport`)
    assert(rootCoverage.at(-1) < .1, `${name}: complete root artwork at page end`)
    assert(await rootsAreUncovered(page), `${name}: soil cover leaves the root window at page end`)
    await page.evaluate(top => scrollTo(0,top), geometry.max - 20)
    await page.waitForTimeout(600)
    assert(await rootsAreUncovered(page), `${name}: reveal settles before the final scroll position`)
    await page.evaluate(top => scrollTo(0,top), Math.max(0,geometry.roots-height*.9)+(geometry.max-Math.max(0,geometry.roots-height*.9))*.4)
    await page.waitForTimeout(600)
    assert(await visibleSoilCoverage(page) > 2, `${name}: reverse scrolling restores visible soil coverage`)
    await page.evaluate(top => scrollTo(0,top), geometry.max)
    await page.waitForTimeout(600)
    const scene = await page.locator('.plant-scene').boundingBox()
    assert(Math.abs(scene.width / scene.height - 1086 / 1448) < .001, `${name}: connected plant keeps its original proportions`)
    if(name === 'tablet') {
      assert(await page.locator('.leaf-lookup').evaluate(el => {
        const world = el.closest('.origin-world'), safe=JSON.parse(world.dataset.sceneSafe), r=el.getBoundingClientRect(), origin=world.getBoundingClientRect()
        return r.left>=safe.x-1 && r.right<=safe.x+safe.width+1 && r.top-origin.top>=safe.y-1 && r.bottom-origin.top<=safe.y+safe.height+1
      }), 'Tablet lookup fits the measured leaf reading area')
    }
    if(name === 'mobile' || name === 'compact') {
      assert(await page.locator('.hero-actions .button, .lookup-actions .button').evaluateAll(buttons => buttons.every(el => parseFloat(getComputedStyle(el).fontSize) >= 14 && el.getBoundingClientRect().height >= 44)),`${name}: legible phone actions and touch targets`)
      await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(100)
      const button=await page.locator('.hero-actions .button').first().boundingBox()
      const image=await sharp(await page.screenshot()).removeAlpha().raw().toBuffer({resolveWithObject:true})
      const pixel=(Math.floor(button.y+5)*image.info.width+Math.floor(button.x+button.width/2))*3
      const expected=THEME.colors.buttonFill.match(/\w\w/g).map(channel=>parseInt(channel,16))
      assert(expected.every((channel,i)=>Math.abs(image.data[pixel+i]-channel)<3),`${name}: photographic text scrims never shade the primary action`)
      await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));await page.waitForTimeout(600)
    }
    const tileWidth = width > 1000 ? 300 : 195, tileHeight = Math.round(height*tileWidth/width)
    const tiles = await Promise.all(frames.map(async (file,i) => ({ input: await sharp(file).resize(tileWidth,tileHeight).toBuffer(), left: i%6*tileWidth, top: Math.floor(i/6)*tileHeight })))
    await sharp({ create: { width: tileWidth*6, height: tileHeight*2, channels: 4, background: THEME.colors.canvas } }).composite(tiles).png().toFile(`${out}/${name}-motion-sheet.png`)
    await capture(page,`${name}-closing`)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.waitForSelector('.motion-off')
    assert(await visibleSoilCoverage(page) < .1, `${name}: reduced motion immediately shows the complete roots`)
    await page.evaluate(() => { document.activeElement?.blur(); scrollTo(0,0) })
    await capture(page,`${name}-full`,true)
    if (name === 'desktop' || name === 'mobile') await axe(page, name)
    checks.push(`${name}: responsive layout, six hero and six root frames, visible intermediate soil coverage, reverse reveal, complete roots held before page end, reduced-motion composition`)
    await ctx.close()
  }

  const ctx = await context({ viewport: { width:1440,height:900 }, acceptDownloads: true })
  const page = await pageFor(ctx)
  await page.locator('.origin-lookup input').fill('0001')
  await page.evaluate(() => {
    const input=document.querySelector('.origin-lookup input')
    input.form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'9999')
    input.dispatchEvent(new Event('input',{bubbles:true}))
  })
  await page.waitForTimeout(200)
  assert.equal(new URL(page.url()).pathname,'/','Editing input cancels pending lookup navigation')
  await lookup(page,'')
  await page.getByText(SITE.lookup.empty).waitFor()
  await lookup(page,'9999')
  await page.getByText(SITE.lookup.notFound).waitFor()
  await lookup(page,'https://unrelated.example/farms/0001')
  await page.getByText(SITE.lookup.invalid).waitFor()
  await lookup(page,'0001')
  await page.waitForURL('**/farms/0001')
  await page.getByRole('heading',{name:'Sample Farm 01',exact:true}).waitFor()
  await axe(page,'farm profile')
  await capture(page,'farm-profile',true)
  for (const type of ['svg','png']) {
    const waiting = page.waitForEvent('download')
    await page.getByRole('link',{name:SITE.qr[type],exact:true}).click()
    const download = await waiting
    assert.equal(download.suggestedFilename(),`roote-origin-farm-0001.${type}`)
    const pixels = await sharp(await fs.readFile(await download.path())).greyscale().raw().toBuffer({resolveWithObject:true})
    const code = new QRCodeReader().decode(new BinaryBitmap(new HybridBinarizer(new RGBLuminanceSource(Uint8ClampedArray.from(pixels.data),pixels.info.width,pixels.info.height))))
    assert.equal(code.getText(),`${base}/farms/0001`)
  }
  await page.goBack()
  await page.waitForSelector('.origin-hero')
  await lookup(page,`${base}/batches/SAMPLE-UBE-001`)
  await page.waitForURL('**/batches/SAMPLE-UBE-001')
  await page.getByRole('heading',{name:SITE.batch.title,exact:true}).waitFor()
  assert.equal(await page.locator('time').getAttribute('datetime'),'2026-10-01')
  await axe(page,'batch summary')
  await capture(page,'batch-summary',true)
  const batchDownload = page.waitForEvent('download')
  await page.getByRole('link',{name:SITE.qr.png,exact:true}).click()
  const batchPixels = await sharp(await fs.readFile(await (await batchDownload).path())).greyscale().raw().toBuffer({resolveWithObject:true})
  const batchCode = new QRCodeReader().decode(new BinaryBitmap(new HybridBinarizer(new RGBLuminanceSource(Uint8ClampedArray.from(batchPixels.data),batchPixels.info.width,batchPixels.info.height))))
  assert.equal(batchCode.getText(),`${base}/batches/SAMPLE-UBE-001`)
  await page.reload(); await page.getByRole('heading',{name:SITE.batch.title}).waitFor()
  await page.goto(base+'/farms')
  await page.getByRole('heading',{name:SITE.farms.directory,exact:true}).waitFor()
  assert.equal(await page.locator('.farm-card').count(),3)
  await page.getByRole('searchbox').fill('no-match')
  await page.getByText(SITE.farms.empty).waitFor()
  await page.getByRole('button',{name:SITE.farms.clear}).click()
  assert.equal(await page.locator('.farm-card').count(),3)
  await page.getByRole('searchbox').fill('site C')
  assert.equal(await page.locator('.farm-card').count(),1)
  await page.goto(base+'/batches/missing')
  await page.getByRole('heading',{name:SITE.batch.missingTitle}).waitFor()
  await lookup(page,'/farms/0003')
  await page.waitForURL('**/farms/0003')
  await page.getByRole('heading',{name:'Sample Farm 03'}).waitFor()
  await page.goto(base+'/cooperative')
  await page.getByRole('heading',{name:SITE.cooperative.name}).waitFor()
  await page.getByText(SITE.cooperative.role).waitFor()
  await axe(page,'cooperative')
  await page.locator('.desktop-nav').getByRole('link',{name:SITE.nav.trace}).click()
  await page.waitForFunction(() => document.activeElement?.getAttribute('name') === 'origin-id')
  await page.locator('.desktop-nav').getByRole('button',{name:SITE.nav.member}).click()
  await page.getByRole('heading',{name:SITE.member.title}).waitFor()
  assert.equal(await page.locator('dialog[open] input').count(),0)
  await axe(page,'member preview')
  await page.keyboard.press('Escape')
  assert.equal(await page.locator('dialog[open]').count(),0)
  for (const [name,width,height,top] of [['desktop',1440,900,700],['mobile',390,844,1200]]) {
    await page.setViewportSize({width,height})
    await page.goto(base)
    await page.waitForSelector('.layers-ready')
    await page.evaluate(top=>scrollTo(0,top),top)
    await page.waitForTimeout(600)
    const memberPosition = await page.evaluate(()=>scrollY)
    if (name === 'mobile') {
      await clickVisible(page.locator('.menu-button'))
      await clickVisible(page.locator('#mobile-nav').getByRole('button',{name:SITE.nav.member,exact:true}))
    } else await clickVisible(page.locator('.desktop-nav').getByRole('button',{name:SITE.nav.member}))
    assert(Math.abs(await page.evaluate(()=>scrollY)-memberPosition)<5, `${name}: opening member dialog preserves landing position`)
    await page.getByRole('link',{name:SITE.member.action}).click()
    await page.waitForURL('**/batches/SAMPLE-UBE-001')
    await page.getByRole('heading',{name:SITE.batch.title}).waitFor()
    await page.goBack()
    await page.waitForSelector('.layers-ready')
    await page.waitForTimeout(600)
    const restored = await page.evaluate(()=>scrollY)
    assert(Math.abs(restored-memberPosition)<5,`${name}: Back restores landing position after member-preview batch navigation`)
    states.push({name,flow:'member-preview batch Back',before:memberPosition,after:restored})
  }
  await page.setViewportSize({width:1440,height:900})
  await page.goto(base)
  await page.locator('#farms').scrollIntoViewIfNeeded()
  await page.waitForTimeout(900)
  const position = await page.evaluate(() => scrollY)
  await page.locator('.farm-card').first().click()
  await page.waitForURL('**/farms/0001')
  await page.goBack()
  await page.waitForTimeout(600)
  assert(Math.abs(await page.evaluate(() => scrollY)-position)<5,'Back restores originating farm position')
  for (let i=0;i<3;i++) {
    await page.locator('.farm-card').first().click(); await page.waitForURL('**/farms/0001'); await page.goBack(); await page.waitForSelector('.layers-ready')
    assert(await page.locator('.origin-world').evaluate(el => Number(el.dataset.scTriggers)<=5),'Route remounts do not accumulate scroll controllers')
  }
  await page.getByRole('button',{name:SITE.footer.reduce,exact:true}).click()
  await page.waitForSelector('.app-shell.motion-off')
  await page.goto(base+'/farms')
  await page.waitForSelector('.app-shell.motion-off .farm-card')
  await page.locator('.farm-card').first().hover()
  assert.equal(await page.locator('.farm-card img').first().evaluate(el => getComputedStyle(el).transform),'none','Manual motion setting stops directory photograph scaling')
  assert.equal(await page.locator('.farm-card .arrow').first().evaluate(el => getComputedStyle(el).transform),'none','Manual motion setting stops directory arrows')
  for(const route of ['/farms/0001','/batches/SAMPLE-UBE-001','/cooperative']) {
    await page.goto(base+route); await page.waitForSelector('.app-shell.motion-off .detail-page')
    assert.equal(await page.locator('.button').first().evaluate(el => getComputedStyle(el).transitionDuration),'0s',`${route}: shared motion preference`)
  }
  await page.goto(base)
  await page.reload(); await page.waitForSelector('.motion-off')
  await page.getByRole('button',{name:SITE.footer.enable,exact:true}).click()
  await page.waitForFunction(() => !document.querySelector('.origin-world').classList.contains('motion-off'))
  await page.setViewportSize({width:720,height:450})
  for(const closeBy of ['escape','button']) {
    await page.locator('.menu-button').click()
    await page.locator('#mobile-nav').getByRole('button',{name:SITE.nav.member,exact:true}).click()
    await page.getByRole('heading',{name:SITE.member.title}).waitFor()
    if(closeBy==='escape') await page.keyboard.press('Escape')
    else await page.getByRole('button',{name:SITE.member.close}).click()
    assert.equal(await page.locator('.menu-button').evaluate(el=>el===document.activeElement),true,`Mobile member preview ${closeBy} restores focus to visible menu button`)
  }
  await page.locator('.menu-button').click()
  await page.locator('#mobile-nav').getByRole('link',{name:SITE.nav.trace}).click()
  await page.waitForFunction(() => document.activeElement?.getAttribute('name')==='origin-id')
  assert.equal(await page.locator('#mobile-nav').isVisible(),false)
  await capture(page,'zoom-equivalent')
  checks.push('Lookup validation, farm/batch routes, SVG/PNG QR decoding, direct refresh, catalogue search, missing recovery, cooperative, member dialog, Back restoration, scroll-controller cleanup, app-wide stored motion setting, mobile navigation and dialog focus restoration')
  await ctx.close()

  // Native Chrome page zoom in an isolated QA profile; no user profile changes.
  const zoomProfile=`${out}/zoom-check.local`,level=Math.log(2)/Math.log(1.2)
  await fs.mkdir(`${zoomProfile}/Default`,{recursive:true})
  await fs.writeFile(`${zoomProfile}/Default/Preferences`,JSON.stringify({partition:{default_zoom_level:{x:level},per_host_zoom_levels:{x:{'127.0.0.1':{zoom_level:level,last_modified:String(Date.now()*1000)}}}}}))
  const zoomContext=await chromium.launchPersistentContext(zoomProfile,{executablePath:process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,viewport:null,args:['--window-size=1440,900']})
  try {
    await zoomContext.addInitScript(()=>{Element.prototype.requestPointerLock=()=>{};Element.prototype.setPointerCapture=()=>{};Element.prototype.releasePointerCapture=()=>{}})
    const zoom=await pageFor(zoomContext)
    await zoom.waitForSelector('.layers-ready')
    zoomEvidence=await zoom.evaluate(()=>({innerWidth,innerHeight,outerWidth,outerHeight,dpr:devicePixelRatio,visualScale:visualViewport.scale,layout:document.querySelector('.app-shell').dataset.layout,overflow:document.documentElement.scrollWidth>innerWidth}))
    assert.equal(zoomEvidence.dpr,2,'Native browser zoom has doubled the pixel ratio')
    assert.equal(zoomEvidence.visualScale,1,'Native page zoom is distinct from pinch zoom')
    assert(zoomEvidence.innerWidth<=720 && zoomEvidence.outerWidth===1440,'200% zoom reflows a 1440px browser to half-width CSS content')
    assert.equal(zoomEvidence.overflow,false,'200% zoom has no horizontal overflow')
    // Playwright's default clipping assumes an unzoomed CSS viewport. Capture
    // the complete physical viewport directly so the right-hand menu is shown.
    const zoomSession=await zoomContext.newCDPSession(zoom)
    const captureZoom=async name=>{
      const result=await zoomSession.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false})
      await fs.writeFile(`${out}/${name}.png`,Buffer.from(result.data,'base64'))
    }
    await captureZoom('browser-zoom-200')
    await zoom.locator('.origin-lookup input').fill('0001')
    await zoom.getByRole('button',{name:SITE.lookup.submit,exact:true}).focus()
    await zoom.keyboard.press('Enter');await zoom.waitForURL('**/farms/0001')
    await zoom.goBack();await zoom.waitForSelector('.layers-ready')
    await zoom.locator('.menu-button').click()
    await zoom.locator('#mobile-nav').getByRole('button',{name:SITE.nav.member,exact:true}).click()
    await zoom.getByRole('heading',{name:SITE.member.title}).waitFor()
    await axe(zoom,'200% zoom member dialog')
    await zoom.keyboard.press('Escape')
    assert.equal(await zoom.locator('.menu-button').evaluate(el=>el===document.activeElement),true,'Zoomed dialog returns focus to menu')
    await zoom.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));await zoom.waitForTimeout(600)
    assert(await rootsAreUncovered(zoom),'200% zoom root reveal finishes')
    await captureZoom('browser-zoom-200-closing')
    checks.push('Actual native Chrome 200% page zoom: half-width layout, no overflow, keyboard lookup, dialog focus restoration, Axe and completed roots')
  } finally {await zoomContext.close()}

  for (const [error,title] of [['NotAllowedError',SITE.scanner.deniedTitle],['NotFoundError',SITE.scanner.unavailableTitle],['insecure',SITE.scanner.secureTitle]]) {
    const cameraContext = await context({viewport:{width:390,height:844}})
    await cameraContext.addInitScript(error => {
      window.__attempts=0
      if(error==='insecure') Object.defineProperty(window,'isSecureContext',{get:()=>false})
      else navigator.mediaDevices.getUserMedia=async()=>{window.__attempts++;throw new DOMException('Test camera state',error)}
    },error)
    const camera = await pageFor(cameraContext)
    await camera.getByRole('button',{name:SITE.lookup.scan,exact:true}).click()
    await camera.getByRole('heading',{name:title,exact:true}).waitFor()
    if(error!=='insecure') { await camera.getByRole('button',{name:SITE.scanner.retry}).click(); await camera.waitForFunction(()=>window.__attempts===2) }
    await capture(camera,`camera-${error}`)
    await camera.getByRole('button',{name:SITE.scanner.manual}).click()
    await camera.waitForFunction(()=>document.activeElement?.getAttribute('name')==='origin-id')
    assert.equal(await camera.locator('dialog[open]').count(),0)
    await camera.setViewportSize({width:390,height:430})
    await camera.locator('.origin-lookup input').scrollIntoViewIfNeeded()
    await camera.locator('.origin-lookup button[type=submit]').scrollIntoViewIfNeeded()
    await capture(camera,'mobile-keyboard')
    assert.equal(await camera.locator('.origin-lookup button[type=submit]').isEnabled(),true)
    await cameraContext.close()
  }
  checks.push('Camera denial, missing camera, insecure context, retry, manual fallback and simulated keyboard reachability')

  for(const payload of [null,'0003','SAMPLE-UBE-001']) {
    const cameraContext = await context({viewport:{width:390,height:844}})
    const qr = payload ? await QRCode.toDataURL(payload,{width:320,margin:4}) : ''
    await cameraContext.addInitScript(({qr,delayed})=>{
      window.__starts=0;window.__stops=0
      navigator.mediaDevices.getUserMedia=async()=>{
        window.__starts++
        if(delayed) await new Promise(resolve=>setTimeout(resolve,300))
        const canvas=document.createElement('canvas');canvas.width=640;canvas.height=480
        const image=new Image()
        if(qr){image.src=qr;await image.decode()}
        const draw=()=>{const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,640,480);if(qr)ctx.drawImage(image,160,80)}
        draw();const timer=setInterval(draw,50);const stream=canvas.captureStream(20)
        stream.getTracks().forEach(track=>{const stop=track.stop.bind(track);track.stop=()=>{window.__stops++;clearInterval(timer);stop()}})
        return stream
      }
    },{qr,delayed:!payload})
    const camera=await pageFor(cameraContext)
    assert.equal(await camera.evaluate(()=>window.__starts),0)
    await camera.getByRole('button',{name:SITE.lookup.scan,exact:true}).click()
    await camera.waitForFunction(()=>window.__starts>0)
    if(!payload){await camera.keyboard.press('Escape');await camera.waitForFunction(()=>window.__stops>0)}
    else {await camera.waitForURL(payload==='0003'?'**/farms/0003':'**/batches/SAMPLE-UBE-001',{timeout:15000});assert(await camera.evaluate(()=>window.__stops>0))}
    await cameraContext.close()
  }
  checks.push('Real ZXing farm and batch decoding from simulated video; camera starts only on request; delayed permission, Escape and success stop tracks')
  const fallbackContext=await context({viewport:{width:390,height:844}})
  const fallback=await fallbackContext.newPage()
  await fallback.route('**/images/origin/plant-*.webp',route=>route.abort())
  await fallback.goto(base)
  await fallback.waitForTimeout(700)
  assert.equal(await fallback.locator('.layers-ready').count(),0)
  assert.equal(await fallback.locator('.scene-poster').evaluate(el=>getComputedStyle(el).opacity),'1')
  await lookup(fallback,'0001');await fallback.waitForURL('**/farms/0001')
  checks.push('Failed decorative layer retains complete static poster and functional lookup')
  await fallbackContext.close()
  const slowContext=await context({viewport:{width:390,height:844}})
  const slow=await slowContext.newPage()
  await slow.route('**/images/origin/plant-*.webp',async route=>{await new Promise(resolve=>setTimeout(resolve,1200));await route.continue()})
  await slow.goto(base,{waitUntil:'domcontentloaded'})
  assert.equal(await slow.getByRole('heading',{name:SITE.hero.title.replace('\n',' '),exact:true}).isVisible(),true)
  assert.equal(await slow.locator('.origin-lookup input').isEnabled(),true)
  await slow.waitForSelector('.layers-ready')
  await slow.keyboard.press('Tab')
  assert.equal(await slow.getByRole('link',{name:SITE.nav.skip}).evaluate(el=>el===document.activeElement),true)
  await slow.keyboard.press('Enter')
  await slow.getByRole('button',{name:SITE.lookup.scan,exact:true}).focus()
  assert.equal(await slow.locator('.origin-lookup input').evaluate(el=>getComputedStyle(el).fontSize),'16px')
  checks.push('Input edits cancel pending navigation; slow artwork keeps semantic copy and controls available; keyboard skip and form focus work')
  await slowContext.close()
  assert.equal(errors.length,0,errors.join('\n'))
  await fs.writeFile(`${out}/report.json`,JSON.stringify({base,node:process.version,checks,errors,states,accessibility,imageTransfer,zoomEvidence,note:'Installed Chrome headless, including actual native 200% browser zoom. Physical iPhone/Android camera, keyboard and touch checks remain pending.'},null,2))
  console.log(checks.join('\n'))
} finally {await browser.close()}
