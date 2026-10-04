import { chromium } from 'playwright-core'
import fs from 'node:fs/promises'
import sharp from 'sharp'
const out=process.env.AUDIT_OUT || 'scrollcraft/builds/roote-origin/recheck'
await fs.mkdir(out,{recursive:true})
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true})
const findings=[]
async function diff(a,b){
 const A=await sharp(a).removeAlpha().raw().toBuffer({resolveWithObject:true}),B=await sharp(b).removeAlpha().raw().toBuffer()
 let changed=0,sum=0,max=0
 for(let i=0;i<A.data.length;i+=3){const d=Math.max(...[0,1,2].map(k=>Math.abs(A.data[i+k]-B[i+k])));if(d>=5)changed++;sum+=d;max=Math.max(max,d)}
 return {changedPixels:changed,changedPercent:+(changed/(A.info.width*A.info.height)*100).toFixed(4),meanChannelDifference:+(sum/(A.info.width*A.info.height)).toFixed(4),maximumDifference:max}
}
try{
for(const [name,width,height] of [['desktop',1440,900],['tablet',834,1194],['mobile',390,844],['compact',360,640]]){
 const ctx=await browser.newContext({viewport:{width,height},reducedMotion:'no-preference'})
 await ctx.addInitScript(()=>{Element.prototype.requestPointerLock=()=>{};Element.prototype.setPointerCapture=()=>{};Element.prototype.releasePointerCapture=()=>{}})
 const p=await ctx.newPage();await p.goto('http://127.0.0.1:4173');await p.waitForSelector('.layers-ready');await p.evaluate(()=>document.fonts.ready)
 const g=await p.evaluate(()=>({root:document.querySelector('#roots').getBoundingClientRect().top+scrollY,hero:document.querySelector('.origin-hero').offsetHeight,max:document.documentElement.scrollHeight-innerHeight}))
 const entry=Math.max(0,g.root-height*.9),frames=[]
 for(let i=0;i<6;i++){
  const top=entry+(g.max-entry)*i/5;await p.evaluate(top=>scrollTo(0,top),top);await p.waitForTimeout(800)
  const visible=await p.screenshot();await fs.writeFile(`${out}/${name}-root-${i}.png`,visible);frames.push(visible)
  const geometry=await p.locator('.root-curtain').evaluate(el=>({bounds:el.getBoundingClientRect().toJSON(),transform:getComputedStyle(el).transform,opacity:getComputedStyle(el).opacity}))
  const textMask=await p.addStyleTag({content:'*{color:transparent!important;text-shadow:none!important;caret-color:transparent!important}'})
  const artwork=await p.screenshot()
  await p.locator('.root-curtain').evaluate(el=>el.style.visibility='hidden')
  const hidden=await p.screenshot();const change=await diff(artwork,hidden)
  await textMask.evaluate(el=>el.remove())
  await p.locator('.root-curtain').evaluate(el=>el.style.removeProperty('visibility'))
  findings.push({name,region:'roots',sample:i,scroll:top,...geometry,...change})
 }
 const tw=width>1000?320:208,th=Math.round(height*tw/width)
 await sharp({create:{width:tw*3,height:th*2,channels:4,background:'#102F26'}}).composite(await Promise.all(frames.map(async(input,i)=>({input:await sharp(input).resize(tw,th).toBuffer(),left:(i%3)*tw,top:Math.floor(i/3)*th})))).png().toFile(`${out}/${name}-roots-sheet.png`)
 await p.evaluate(top=>scrollTo(0,top),Math.min(g.hero*.35,g.max));await p.waitForTimeout(800)
 const animated=await p.screenshot()
 const styles=await p.addStyleTag({content:'.canopy-backplate,.middle-backplate,.hero-foliage,.near-foliage{transform:none!important}'})
 const staticFrame=await p.screenshot()
 findings.push({name,region:'hero',scroll:Math.min(g.hero*.35,g.max),...await diff(animated,staticFrame)})
 await fs.writeFile(`${out}/${name}-hero-animated.png`,animated);await fs.writeFile(`${out}/${name}-hero-static.png`,staticFrame);await styles.evaluate(el=>el.remove())
 await ctx.close()
}
await fs.writeFile(`${out}/motion-impact.json`,JSON.stringify(findings,null,2))
console.log(findings.map(f=>({name:f.name,region:f.region,sample:f.sample,changed:f.changedPercent,mean:f.meanChannelDifference,curtainTop:f.bounds?.top})))
}finally{await browser.close()}
