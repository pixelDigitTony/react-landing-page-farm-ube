import { useImperativeHandle, useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { ASSETS, MOTION, SITE } from '../../constants/site'
import { frameIndex, frameWindow, nearestFrame } from '../../lib/storyFrames'

export type FramePresentation = { requested: number; rendered: number; presentation: 'sequence' | 'completed-poster'; pending: number; failed: number }
export type FrameApi = { progress: (value: number) => void; completed: (force: boolean) => void; state: () => FramePresentation | null }
export function FrameSequence({ phone, motionOff, api }: { phone: boolean; motionOff: boolean; api: RefObject<FrameApi | null> }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const container = useRef<HTMLDivElement>(null)
  const update = useRef<(value: number) => void>(() => {})
  const completed = useRef<(force: boolean) => void>(() => {})
  const state = useRef<FramePresentation | null>(null)
  useImperativeHandle(api, () => ({ progress(value) { update.current(value) }, completed(force) { completed.current(force) }, state: () => state.current }), [])
  const source = phone ? ASSETS.story.phone : ASSETS.story.desktop
  useLayoutEffect(() => {
    const element = container.current!, surface = canvas.current!
    if (motionOff) { element.dataset.frameState = 'static'; return }
    const context = surface.getContext('2d')
    if (!context) return
    const count = source.count
    const capacity = phone ? MOTION.story.cachePhone : MOTION.story.cacheDesktop
    const cache = new Map<number, ImageBitmap>()
    const pending = new Set<number>(), failed = new Set<number>()
    const abort = new AbortController()
    let alive = true, nearby = false, target = 0, direction = 1, drawFrame = 0, lastDrawn = -1, forceEnd = false
    const draw = () => {
      drawFrame = 0
      if (!alive || document.hidden || !nearby) return
      const candidates = frameWindow(target,count,capacity,direction)
      const relevantPending = candidates.filter(index=>pending.has(index)).length
      const exhausted = candidates.every(index=>failed.has(index)) && !relevantPending
      const index = forceEnd ? (cache.has(count-1) ? count-1 : undefined) : nearestFrame(target,candidates.filter(index=>cache.has(index)))
      const poster = (forceEnd && index === undefined) || exhausted
      if (index !== undefined && index !== lastDrawn) {
        const bitmap = cache.get(index)!
        context.clearRect(0, 0, surface.width, surface.height)
        context.drawImage(bitmap, 0, 0, surface.width, surface.height)
        lastDrawn = index
      }
      // Presentation must change even if reversing selects the last drawn bitmap.
      element.dataset.frameState = poster ? 'failed' : index !== undefined ? 'ready' : 'loading'
      element.dataset.presentation = poster ? 'completed-poster' : lastDrawn >= 0 ? 'sequence' : 'opening-poster'
      element.dataset.frame = String(poster ? count-1 : lastDrawn)
      element.dataset.pending = String(relevantPending)
      element.dataset.failed = String(candidates.filter(index=>failed.has(index)).length)
      element.dataset.cache = String(cache.size)
      state.current = {requested:target,rendered:poster?count-1:lastDrawn,presentation:poster?'completed-poster':'sequence',pending:relevantPending,failed:Number(element.dataset.failed)}
    }
    const schedule = () => { if (!drawFrame) drawFrame = requestAnimationFrame(draw) }
    const pump = () => {
      if (!alive || !nearby || document.hidden) return
      const wanted = frameWindow(target, count, capacity, direction)
      for (const index of wanted) {
        if (pending.size >= MOTION.story.decodeConcurrency) break
        if (cache.has(index) || pending.has(index) || failed.has(index)) continue
        pending.add(index)
        fetch(source.frames[index], {signal:abort.signal})
          .then(response => { if (!response.ok) throw new Error('frame'); return response.blob() })
          .then(blob => createImageBitmap(blob))
          .then(bitmap => {
            if (!alive) { bitmap.close(); return }
            const current = frameWindow(target,count,capacity,direction)
            if (!current.includes(index)) { bitmap.close(); return }
            cache.set(index,bitmap)
            for (const [key,value] of cache) if (!current.includes(key)) { value.close(); cache.delete(key) }
            element.dataset.cache = String(cache.size)
            schedule()
          }).catch(() => {
            if (!alive) return
            failed.add(index)
          }).finally(() => {
            pending.delete(index)
            if (!alive) return
            pump()
            schedule()
          })
      }
    }
    update.current = value => {
      const next = frameIndex(value,count)
      direction = next === target ? direction : next > target ? 1 : -1
      target = next
      element.dataset.targetFrame = String(target)
      schedule(); pump()
    }
    completed.current = force => { forceEnd = force; schedule() }
    const resize = () => {
      const bounds = element.getBoundingClientRect()
      const ratio = source.width/source.height
      const dpr = Math.min(devicePixelRatio,phone ? MOTION.story.phoneDpr : MOTION.story.frameDpr)
      surface.width = Math.min(source.width,Math.round(bounds.width*dpr))
      surface.height = Math.round(surface.width/ratio)
      lastDrawn = -1; schedule()
    }
    const observer = new ResizeObserver(resize); observer.observe(element); resize()
    const visibility = () => { if (!document.hidden) { schedule(); pump() } }
    document.addEventListener('visibilitychange',visibility)
    const intersection = new IntersectionObserver(entries => {
      nearby = entries[0].isIntersecting
      if (nearby) { pump(); schedule() }
    },{rootMargin:MOTION.story.preloadViewport})
    intersection.observe(element)
    return () => {
      alive = false; update.current = () => {}; completed.current = () => {}; state.current = null; abort.abort(); cancelAnimationFrame(drawFrame)
      observer.disconnect(); intersection.disconnect(); document.removeEventListener('visibilitychange',visibility)
      for (const bitmap of cache.values()) bitmap.close()
      cache.clear(); surface.width = 0; surface.height = 0
    }
  },[motionOff,phone,source])
  return <div ref={container} className="frame-sequence" data-frame-state={motionOff ? 'static' : 'loading'} aria-hidden="true">
    <img className="sequence-poster" src={motionOff ? source.end : source.start} alt="" width={source.width} height={source.height} loading="lazy" />
    <img className="sequence-fallback" src={source.end} alt="" width={source.width} height={source.height} loading="lazy" />
    <canvas ref={canvas} width={source.width} height={source.height} />
    <img className="sequence-clean" src={source.clean} alt="" width={source.width} height={source.height} loading="lazy" />
    <span className="sr-only">{SITE.story.undergroundAlt}</span>
  </div>
}
