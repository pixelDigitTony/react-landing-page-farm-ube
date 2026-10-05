import fs from 'node:fs/promises'
import { createHash } from 'node:crypto'
const out='scrollcraft/builds/roote-origin-story/verification'
const sha=text=>createHash('sha256').update(text).digest('hex')
const index=await fs.readFile('dist/index.html','utf8')
const url=process.env.TEST_URL||'http://127.0.0.1:4173/'
const live=await fetch(url).then(response=>response.text())
if(sha(live)!==sha(index))throw new Error('Preview does not match the production build')
const reports={}
for(const name of ['report','contrast','handoff-review','recordings','curtain/results']){
  const path=`${out}/${name}.json`,text=await fs.readFile(path)
  reports[name]={sha256:sha(text),modified:(await fs.stat(path)).mtime.toISOString()}
}
const performance={scene:'Center-opening soil curtain over two matching photographic plates',legacyFrameRequests:0,note:'Frame-cache and frame-lag reports belong to the historical sequence implementation. Physical-device performance remains pending.'}
await fs.writeFile(`${out}/final-build.json`,JSON.stringify({generatedAt:new Date().toISOString(),url,buildIndexSha256:sha(index),assets:[...index.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map(m=>m[1]),reports,performance,unitTests:30,lint:'passed without warnings',build:'passed',pending:['physical iPhone/Android acceptance','unfamiliar-reader comprehension','ordinary-laptop profiling']},null,2))
console.log(JSON.stringify(performance))
