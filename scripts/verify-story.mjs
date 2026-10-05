import assert from 'node:assert/strict'
import sharp from 'sharp'
import { createHash } from 'node:crypto'
import { MOTION,THEME } from '../src/constants/site.ts'

export async function rootsAreUncovered(page) {
  return page.locator('.soil-curtain').evaluate(el=>el.dataset.soilReady==='fallback'||Number(el.dataset.reveal)>.95)
}
export async function verifyStoryLayouts({context,pageFor,capture,axe,out,checks,states,imageTransfer}) {
  for (const [name,width,height] of [['desktop',1440,900],['wide',1920,1080],['ultrawide',2551,1260],['panoramic',3440,1440],['reference',1086,900],['tablet',834,1194],['mobile',390,844],['compact',360,640]]) {
    const ctx=await context({viewport:{width,height}}),page=await pageFor(ctx)
    await page.waitForSelector('.layers-ready')
    assert(await page.locator('.leaf-lookup').evaluate(el=>{const r=el.getBoundingClientRect(),header=document.querySelector('.site-header').getBoundingClientRect(),hero=document.querySelector('.origin-hero').getBoundingClientRect();return r.top>=header.bottom&&r.bottom<=hero.bottom&&r.left>=0&&r.right<=innerWidth}),`${name}: lookup stays inside hero and below header`)
    assert.equal(await page.locator('h1').count(),1)
    await capture(page,`${name}-opening`)
    imageTransfer.push({name,...await page.evaluate(()=>{const resources=performance.getEntriesByType('resource').filter(entry=>entry.name.includes('/images/'));return {totalBytes:resources.reduce((sum,entry)=>sum+entry.encodedBodySize,0),resources:resources.map(item=>({url:item.name,bytes:item.encodedBodySize}))}})})
    const ranges=await page.evaluate(travel=>{
      const rect=selector=>{const el=document.querySelector(selector),r=el.getBoundingClientRect();return {top:r.top+scrollY,height:r.height}}
      const hero=rect('.story-hero'),farm=rect('#farm-origin'),stage=rect('.underground-stage'),harvest=rect('#harvest'),path=rect('.handoff-history'),close=rect('#cooperative'),pinned=document.querySelector('.origin-story').dataset.pinned==='true',header=document.querySelector('.site-header').offsetHeight
      const d=document.querySelector('.frame-sequence').dataset
      return {hero:[0,hero.height*.75],farm:[farm.top-innerHeight*.78,farm.top+farm.height-innerHeight*.72],underground:pinned?[stage.top-header,stage.top-header+(innerHeight-header)*travel]:[stage.top-innerHeight*.8,stage.top+stage.height-innerHeight*.85],handoff:d.transferStart?[Number(d.transferStart),Number(d.transferEnd)]:[harvest.top-innerHeight*.82,harvest.top-innerHeight*.24],history:[path.top-innerHeight*.7,path.top+path.height-innerHeight*.65],close:[close.top-innerHeight*.7,document.documentElement.scrollHeight-innerHeight]}
    },MOTION.story.pinTravel)
    const contact=[],cinema=[]
    for(const [region,range] of Object.entries(ranges)) {
      for(let index=0;index<6;index++) {
        await page.evaluate(top=>scrollTo(0,Math.max(0,top)),range[0]+(range[1]-range[0])*index/5)
        await page.waitForTimeout(region==='underground'?650:400)
        const state=await page.evaluate(()=>({top:scrollY,overflow:document.documentElement.scrollWidth>innerWidth,frame:{...document.querySelector('.frame-sequence').dataset},overlay:document.querySelector('.yam-transfer').getBoundingClientRect().toJSON(),path:getComputedStyle(document.querySelector('.handoff-progress')).strokeDashoffset}))
        assert.equal(state.overflow,false,`${name}/${region}/${index}: no horizontal overflow`)
        states.push({name,region,index,...state})
        const file=`${out}/${name}-${region}-${index}.png`
        await page.screenshot({path:file});contact.push(file)
        if(region==='underground') {
          const pixels=await page.screenshot()
          cinema.push(createHash('sha256').update(pixels).digest('hex'))
          if(index===5) assert(Number(state.frame.reveal)>.99,`${name}: soil curtain opens completely`)
        }
      }
    }
    assert(new Set(cinema).size>=5,`${name}: visible curtain pixels change through the reveal`)
    await page.evaluate(top=>scrollTo(0,Math.max(0,top)),ranges.underground[0]+(ranges.underground[1]-ranges.underground[0])*.25)
    await page.waitForTimeout(700)
    assert(Number(await page.locator('.soil-curtain').getAttribute('data-reveal'))<.01,`${name}: reverse scroll closes the soil curtain`)
    const tileWidth=width>1000?240:156,tileHeight=Math.round(height*tileWidth/width)
    const tiles=await Promise.all(contact.map(async(file,index)=>({input:await sharp(file).resize(tileWidth,tileHeight).toBuffer(),left:index%6*tileWidth,top:Math.floor(index/6)*tileHeight})))
    await sharp({create:{width:tileWidth*6,height:tileHeight*6,channels:4,background:THEME.colors.canvas}}).composite(tiles).png().toFile(`${out}/${name}-story-sheet.png`)
    await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));await capture(page,`${name}-closing`)
    await page.emulateMedia({reducedMotion:'reduce'});await page.waitForSelector('.motion-off')
    assert.equal(await page.locator('.pin-spacer').count(),0,`${name}: reduced motion removes pin`)
    assert.equal(await page.locator('.soil-cover').evaluate(el=>getComputedStyle(el).display),'none')
    await page.evaluate(()=>scrollTo(0,0));await capture(page,`${name}-reduced-full`,true)
    if(name==='desktop'||name==='mobile') await axe(page,`${name} reduced motion`)
    await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>!document.querySelector('.app-shell').classList.contains('motion-off'))
    if(name==='desktop'||name==='mobile')await axe(page,`${name} animated`)
    checks.push(`${name}: six states in each of six regions, rendered curtain opening/reverse, lookup clearance, complete reduced-motion DOM`)
    await ctx.close()
  }
}
