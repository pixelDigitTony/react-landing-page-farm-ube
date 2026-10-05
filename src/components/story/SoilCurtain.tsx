import { useCallback, useImperativeHandle, useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { ASSETS, MOTION } from '../../constants/site'

export type SoilSceneApi = { progress: (value: number) => void; completed: (force: boolean) => void }

export function SoilCurtain({ phone, motionOff, api }: { phone: boolean; motionOff: boolean; api: RefObject<SoilSceneApi | null> }) {
  const root=useRef<HTMLDivElement>(null)
  const source=phone?ASSETS.story.phone:ASSETS.story.desktop
  const paint=useCallback((value: number)=>{
    const element=root.current
    if(!element)return
    const progress=motionOff?1:Math.max(0,Math.min(1,value))
    const inner=50*progress,outer=(50+MOTION.story.curtainFeather)*progress
    element.style.setProperty('--soil-mask',progress===0?'linear-gradient(#000, #000)':`linear-gradient(to right, #000 ${50-outer}%, transparent ${50-inner}%, transparent ${50+inner}%, #000 ${50+outer}%)`)
    element.dataset.reveal=String(progress)
  },[motionOff])
  useImperativeHandle(api,()=>({progress:paint,completed(force){if(force)paint(1)}}))
  useLayoutEffect(()=>{
    const element=root.current!
    let alive=true
    element.dataset.soilReady='false'
    paint(0)
    const images=[...element.querySelectorAll<HTMLImageElement>('img')]
    void Promise.all(images.map(image=>image.decode())).then(()=>{
      if(alive)element.dataset.soilReady='true'
    }).catch(()=>{if(alive)element.dataset.soilReady='fallback'})
    return()=>{alive=false}
  },[source,paint])
  return <div className="frame-sequence soil-curtain" ref={root} aria-hidden="true">
    <img className="soil-revealed" src={source.end} width={source.width} height={source.height} alt="" />
    <img className="soil-cover" src={source.clean} width={source.width} height={source.height} alt="" />
    <img className="sequence-clean" src={source.clean} width={source.width} height={source.height} alt="" />
  </div>
}
