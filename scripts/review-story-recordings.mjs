import { spawnSync } from 'node:child_process'
import fs from 'node:fs/promises'
import ffmpeg from '@ffmpeg-installer/ffmpeg'
const out='scrollcraft/builds/roote-origin-story/verification',rows=[]
for(const device of ['desktop','phone'])for(const pace of ['reading','fast','reverse']){
  const input=`${out}/${device}-${pace}-scroll.webm`
  const probe=spawnSync(ffmpeg.path,['-hide_banner','-i',input,'-t','0','-f','null','-'],{encoding:'utf8'})
  const duration=probe.stderr.match(/Duration: (\d+):(\d+):([\d.]+)/)
  if(!duration)throw new Error(probe.stderr)
  const seconds=Number(duration[1])*3600+Number(duration[2])*60+Number(duration[3])
  const result=spawnSync(ffmpeg.path,['-y','-i',input,'-vf',`fps=${12/seconds},scale=320:-1,tile=4x3`,'-frames:v','1',`${out}/${device}-${pace}-review.png`],{encoding:'utf8'})
  if(result.status)throw new Error(result.stderr)
  rows.push({device,pace,seconds,review:`${device}-${pace}-review.png`})
}
await fs.writeFile(`${out}/recordings.json`,JSON.stringify(rows,null,2))
console.log(JSON.stringify(rows))
