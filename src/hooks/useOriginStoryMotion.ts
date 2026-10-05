import { useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { ASSETS, MOTION, THEME } from '../constants/site'
import { containRect, subjectRect } from '../lib/storyGeometry'
import type { SoilSceneApi } from '../components/story/SoilCurtain'
gsap.registerPlugin(ScrollTrigger,useGSAP)
ScrollTrigger.config({ignoreMobileResize:true})
export function useOriginStoryMotion(root: RefObject<HTMLElement | null>,frames: RefObject<SoilSceneApi | null>,motionOff: boolean,phone: boolean) {
  const returnPosition=useRef<{id:string;top:number}|null>(null)
  useLayoutEffect(()=>{
    const element=root.current
    let captureFrame=0
    const capture=()=>{
      captureFrame=0
      const chapter=[...element?.querySelectorAll<HTMLElement>('section[id]')||[]].find(section=>{const bounds=section.getBoundingClientRect();return bounds.top<=innerHeight*.5&&bounds.bottom>innerHeight*.5})
      const anchor=chapter?.id==='roots'?element?.querySelector<HTMLElement>('#underground'):chapter
      returnPosition.current=anchor?{id:anchor.id,top:anchor.getBoundingClientRect().top}:null
    }
    const schedule=()=>{cancelAnimationFrame(captureFrame);captureFrame=requestAnimationFrame(capture)}
    // Keep the last visible geometry before matchMedia removes a pin. Reading
    // only during effect cleanup is too late for a system preference change.
    window.addEventListener('scroll',schedule,{passive:true})
    schedule()
    return()=>{cancelAnimationFrame(captureFrame);window.removeEventListener('scroll',schedule)}
  },[motionOff,phone,root])
  useGSAP(()=>{
    const element = root.current!
    const saved=returnPosition.current
    element.setAttribute('data-story-ready','false')
    let active=true, readinessFrame=0
    const announce=()=>{void document.fonts.ready.then(()=>{
      if(!active)return
      readinessFrame=requestAnimationFrame(()=>{
        if(!active)return
        ScrollTrigger.refresh()
        // Refresh temporarily rewinds cached scroll positions while measuring.
        // Preserve the reader only after that work has completed.
        const section=saved?document.getElementById(saved.id):null
        if(section&&saved)scrollTo({top:scrollY+section.getBoundingClientRect().top-saved.top,behavior:'instant'})
        readinessFrame=requestAnimationFrame(()=>{if(active){element.setAttribute('data-story-ready','true');window.dispatchEvent(new Event('origin-story-ready'))}})
      })
    })}
    if(motionOff){element.setAttribute('data-pinned','false');announce();return()=>{active=false;cancelAnimationFrame(readinessFrame)}}
    const media=gsap.matchMedia()
    media.add({all:'(min-width: 0px)',wide:`(min-width: ${MOTION.desktop}px) and (min-height: ${MOTION.story.minimumPinHeight}px)`,reduce:'(prefers-reduced-motion: reduce)'},context=>{
      if(context.conditions?.reduce)return
      let assetsActive=true
      const header=element.closest<HTMLElement>('[data-layout]')?.dataset.layout==='desktop'?THEME.layout.desktopHeader:THEME.layout.mobileHeader
      const trigger=(selector:string|HTMLElement,start:string=MOTION.story.defaultStart,end:string=MOTION.story.defaultEnd)=>({trigger:selector,start,end,scrub:MOTION.story.scrub,invalidateOnRefresh:true})
      gsap.to('.story-far',{y:phone?MOTION.mobileLandscape:MOTION.landscape,ease:MOTION.ease,scrollTrigger:trigger('.story-hero',MOTION.trigger.heroStart,MOTION.trigger.heroEnd)})
      gsap.to('.story-near',{y:phone?MOTION.mobileForeground:MOTION.foreground,ease:MOTION.ease,scrollTrigger:trigger('.story-hero',MOTION.trigger.heroStart,MOTION.trigger.heroEnd)})
      gsap.fromTo('.origin-photo-frame',{clipPath:`inset(0 ${phone?0:MOTION.story.farmInset}% 0 ${phone?0:MOTION.story.farmInset}%)`,scale:phone?1:MOTION.story.farmScale},{clipPath:'inset(0 0% 0 0%)',scale:1,ease:MOTION.ease,scrollTrigger:trigger('.farm-origin',MOTION.story.farmStart,MOTION.story.farmEnd)})
      const stage=element.querySelector<HTMLElement>('.underground-stage')!,pinned=Boolean(context.conditions?.wide)
      element.dataset.pinned=String(pinned)
      const playhead={progress:0}
      const sceneTimeline=gsap.timeline({onUpdate:()=>frames.current?.progress(playhead.progress),scrollTrigger:{trigger:stage,start:pinned?`top ${header}px`:MOTION.story.sceneStart,end:pinned?()=>`+=${(innerHeight-header)*MOTION.story.pinTravel}`:MOTION.story.sceneEnd,pin:pinned,pinSpacing:true,scrub:MOTION.story.scrub,invalidateOnRefresh:true}})
      const score=MOTION.story.sceneScore
      sceneTimeline.to(playhead,{progress:0,duration:score.revealStart,ease:MOTION.ease})
        .to(playhead,{progress:1,duration:score.revealEnd-score.revealStart,ease:MOTION.ease})
        .to(playhead,{progress:1,duration:1-score.revealEnd,ease:MOTION.ease})
      if(!phone){
        const bridge=element.querySelector<HTMLElement>('.harvest-bridge')!,overlay=element.querySelector<HTMLImageElement>('.yam-transfer')!,destination=element.querySelector<HTMLElement>('.harvest-image')!,sequence=element.querySelector<HTMLElement>('.frame-sequence')!,source=ASSETS.story.desktop
        const offset=()=>{
          const base=bridge.getBoundingClientRect(),start=stage.getBoundingClientRect(),frame=sequence.getBoundingClientRect(),end=destination.getBoundingClientRect()
          // Use the stage's released document position. Its live rectangle stays
          // at the header during pinning and cannot anchor a subsequent handoff.
          const spacer=stage.parentElement?.classList.contains('pin-spacer')?stage.parentElement:null
          const top=spacer ? spacer.offsetTop+spacer.offsetHeight-stage.offsetHeight : stage.offsetTop
          const scene=containRect({left:frame.left-base.left,top:top+frame.top-start.top,width:frame.width,height:frame.height},source.width,source.height)
          const from=subjectRect(scene,source.bounds)
          const to=containRect({left:end.left-base.left,top:end.top-base.top,width:end.width,height:end.height},source.subjectWidth,source.subjectHeight)
          return {from,to}
        }
        let geometry=offset()
        const transfer={progress:0},ease=gsap.parseEase(MOTION.story.transferEase)
        let assetsReady=false, transferEnabled=false
        const clean=sequence.querySelector<HTMLImageElement>('.sequence-clean')!, subject=destination.querySelector<HTMLImageElement>('.harvest-yam')!
        element.dataset.transferAssets='pending'
        const paint=()=>{
          // Once a passage begins without usable artwork, keep it static until
          // the reader reverses to the boundary. Late decoding must not pop in.
          if(transfer.progress===0)transferEnabled=assetsReady
          const p=transfer.progress,moving=p>0&&p<MOTION.story.transferFinish
          const t=ease(gsap.utils.clamp(0,1,(p-MOTION.story.transferHold)/(MOTION.story.transferFinish-MOTION.story.transferHold)))
          const {from,to}=geometry
          gsap.set(overlay,{left:from.left,top:from.top,width:from.width,height:from.height,x:(to.left-from.left)*t,y:(to.top-from.top)*t,scale:1+(to.width/from.width-1)*t,opacity:transferEnabled&&moving?1:0})
          gsap.set('.harvest-artwork',{opacity:!transferEnabled||p>=MOTION.story.transferFinish?1:0})
          sequence.dataset.clean=String(transferEnabled&&p>0)
          sequence.dataset.transferMode=transferEnabled?'animated':'static'
          sequence.dataset.transferProgress=String(p)
          frames.current?.completed(p>0)
        }
        void Promise.all([clean.decode(),overlay.decode(),subject.decode()]).then(()=>{
          if(!active||!assetsActive)return
          assetsReady=true;element.dataset.transferAssets='ready';paint()
        }).catch(()=>{if(active&&assetsActive){element.dataset.transferAssets='failed';paint()}})
        const transferStart=()=>Math.max(sceneTimeline.scrollTrigger!.end, destination.closest('section')!.getBoundingClientRect().top+scrollY-innerHeight*MOTION.story.transferStartViewport)
        gsap.to(transfer,{progress:1,ease:MOTION.ease,onUpdate:paint,scrollTrigger:{...trigger('.harvest-chapter'),start:transferStart,end:()=>transferStart()+innerHeight*MOTION.story.transferTravel,onRefresh:self=>{sequence.dataset.transferStart=String(self.start);sequence.dataset.transferEnd=String(self.end);geometry=offset();paint()}}})
        paint()
      }
      const path=element.querySelector<SVGPathElement>('.handoff-progress')!,length=path.getTotalLength()
      gsap.fromTo(path,{strokeDasharray:length,strokeDashoffset:length},{strokeDashoffset:0,ease:'none',scrollTrigger:trigger('.handoff-history',MOTION.story.pathStart,MOTION.story.pathEnd)})
      element.querySelectorAll<HTMLElement>('.handoff-step').forEach(step=>{ScrollTrigger.create({trigger:step,start:MOTION.story.stepStart,end:MOTION.story.stepEnd,toggleClass:'is-current'})})
      gsap.from('.featured-grid .farm-card',{y:phone?MOTION.mobileCardRise:MOTION.cardRise,duration:MOTION.entrance,stagger:MOTION.stagger,ease:MOTION.entranceEase,scrollTrigger:{trigger:'.featured-grid',start:MOTION.trigger.cardsStart,once:true}})
      element.dataset.scTriggers=String(ScrollTrigger.getAll().filter(item=>element.contains(item.trigger as Node)).length)
      announce()
      return()=>{assetsActive=false;element.dataset.pinned='false';element.dataset.scTriggers='0';frames.current?.completed(false);element.querySelector<HTMLElement>('.frame-sequence')?.removeAttribute('data-clean')}
    })
    let raf=0
    const observer=new ResizeObserver(()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{if(!active)return;const top=scrollY;ScrollTrigger.refresh();scrollTo({top,behavior:'instant'})})})
    observer.observe(element.querySelector('.origin-photo-frame')!)
    return()=>{active=false;cancelAnimationFrame(readinessFrame);cancelAnimationFrame(raf);observer.disconnect();media.revert()}
  },{scope:root,dependencies:[motionOff,phone],revertOnUpdate:true})
}
