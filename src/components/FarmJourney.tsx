import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { ASSETS, DEMO_DATA, MOTION, SITE, THEME } from '../constants/site'
import type { Layout } from '../constants/site'
import { sceneGeometry, sceneHeroMinimum } from '../lib/scene'
import type { OriginTarget } from '../data/farms'
import { Lookup } from './Lookup'
import { Arrow, FarmCard } from './UI'
import { imageSources } from '../lib/images'

gsap.registerPlugin(ScrollTrigger, useGSAP)
ScrollTrigger.config({ ignoreMobileResize: true })

export default function Landing({ layout, motionOff, onScan, onFound, onFarm }: { layout: Layout; motionOff: boolean; onScan: () => void; onFound: (target: OriginTarget) => void; onFarm: (id: string, anchor: string) => void }) {
  const root = useRef<HTMLElement>(null)
  const [layersReady, setLayersReady] = useState(false)
  useLayoutEffect(() => {
    const element = root.current!
    const hero = element.querySelector<HTMLElement>('.origin-hero')!
    const farms = element.querySelector<HTMLElement>('.featured-farms')!
    const roots = element.querySelector<HTMLElement>('.roots-section')!
    const lookup = element.querySelector<HTMLElement>('.leaf-lookup')!
    let frame = 0
    let previous = ''
    let alive = true
    const measure = () => {
      // Keep the lookup attached to the leaf. Increasing only its top would
      // disconnect it; grow the hero before aligning the shared soil anchor.
      const minimum = sceneHeroMinimum(element.clientWidth, farms.offsetHeight, lookup.offsetHeight, layout)
      element.style.setProperty('--scene-hero-min', `${minimum}px`)
      const geometry = sceneGeometry(element.clientWidth, roots.offsetTop, lookup.offsetHeight, layout)
      const values = { 'scene-x': geometry.x, 'scene-y': geometry.y, 'scene-width': geometry.width, 'scene-height': geometry.height, 'roots-height': geometry.rootsHeight, 'canopy-height': geometry.ground, 'scene-fade': geometry.fade, 'lookup-left': geometry.lookup.x, 'lookup-top': geometry.lookup.y, 'lookup-width': geometry.lookup.width }
      const signature = JSON.stringify(values)
      if (signature === previous) return
      previous = signature
      Object.entries(values).forEach(([key, value]) => element.style.setProperty(`--${key}`, `${value}px`))
      element.dataset.sceneSafe = JSON.stringify(geometry.safe)
      ScrollTrigger.refresh()
    }
    const schedule = () => { if (!alive) return; cancelAnimationFrame(frame); frame = requestAnimationFrame(measure) }
    const observer = new ResizeObserver(schedule)
    ;[element, hero, farms, lookup].forEach(node => observer.observe(node))
    measure()
    void document.fonts.ready.then(schedule)
    return () => { alive = false; observer.disconnect(); cancelAnimationFrame(frame) }
  }, [layout])
  useEffect(() => {
    let alive = true
    const images = [...root.current!.querySelectorAll<HTMLImageElement>('[data-sc-layer]')]
    Promise.all(images.map(image => image.decode())).then(() => { if (alive) setLayersReady(true) }).catch(() => { /* Keep the complete poster if any decorative layer fails. */ })
    return () => { alive = false }
  }, [])
  useGSAP(() => {
    if (motionOff || !layersReady) return
    const media = gsap.matchMedia()
    media.add({ desktop: `(min-width: ${MOTION.desktop}px)`, tablet: `(min-width: ${MOTION.phone}px) and (max-width: ${MOTION.desktop - 1}px)`, phone: `(max-width: ${MOTION.phone - 1}px)`, reduce: '(prefers-reduced-motion: reduce)' }, context => {
      if (context.conditions?.reduce) return
      const phone = Boolean(context.conditions?.phone)
      const header = context.conditions?.desktop ? THEME.layout.desktopHeader : THEME.layout.mobileHeader
      const heroTrigger = () => ({ trigger: '.origin-hero', start: `${MOTION.trigger.heroStart}+=${header}`, end: `${MOTION.trigger.heroEnd}+=${header}`, scrub: MOTION.scrub })
      gsap.to('.canopy-backplate', { y: phone ? MOTION.mobileLandscape : MOTION.landscape, ease: MOTION.ease, scrollTrigger: heroTrigger() })
      gsap.to('.middle-backplate', { y: phone ? MOTION.mobileMiddle : MOTION.middle, ease: MOTION.ease, scrollTrigger: heroTrigger() })
      gsap.to('.hero-foliage, .near-foliage', { y: phone ? MOTION.mobileForeground : MOTION.foreground, ease: MOTION.ease, scrollTrigger: heroTrigger() })
      gsap.from('.featured-grid .farm-card', { opacity: 0, y: phone ? MOTION.mobileCardRise : MOTION.cardRise, duration: MOTION.entrance, stagger: MOTION.stagger, ease: MOTION.entranceEase, scrollTrigger: { trigger: '.featured-grid', start: MOTION.trigger.cardsStart, once: true } })
      const roots = root.current!.querySelector<HTMLElement>('.roots-section')!
      // Lift the cover toward the soil surface while the underground scene enters.
      // Moving it down cancels native scroll and leaves the opaque soil offscreen.
      const rootEnd = () => {
        const top = roots.getBoundingClientRect().top + scrollY
        const intended = phone
          ? top - innerHeight * MOTION.rootReveal.mobileEndViewport
          : top + roots.offsetHeight - innerHeight * MOTION.rootReveal.endViewport
        const latest = ScrollTrigger.maxScroll(window) - MOTION.rootReveal.endHold
        return Math.max(top - innerHeight * MOTION.rootReveal.startViewport + 1, Math.min(intended, latest))
      }
      gsap.fromTo('.root-curtain', { yPercent: 0 }, { yPercent: -100, ease: MOTION.ease, scrollTrigger: { trigger: roots, start: `top ${MOTION.rootReveal.startViewport * 100}%`, end: rootEnd, scrub: MOTION.scrub, invalidateOnRefresh: true } })
      root.current!.dataset.scTriggers = String(ScrollTrigger.getAll().length)
    })
    const visibility = () => {
      ScrollTrigger.getAll().filter(trigger => root.current?.contains(trigger.trigger as Node)).forEach(trigger => {
        if (document.hidden) trigger.disable(false)
        else trigger.enable(false)
      })
    }
    document.addEventListener('visibilitychange', visibility)
    return () => { document.removeEventListener('visibilitychange', visibility); media.revert() }
  }, { scope: root, dependencies: [motionOff, layersReady], revertOnUpdate: true })
  const layer = (asset: typeof ASSETS.master, className: string, required = false) => <img className={className} src={asset.src} srcSet={imageSources(asset)} sizes="100vw" alt="" width={asset.width} height={asset.height} aria-hidden="true" data-sc-layer={required ? '' : undefined} loading="eager" decoding="async" />
  return <main ref={root} id="main-content" className={`origin-world ${layersReady ? 'layers-ready' : ''} ${motionOff ? 'motion-off' : ''}`} data-sc-ready={layersReady}>
    <div className="world-art" aria-hidden="true">
      {layer(ASSETS.canopy, 'landscape-extension')}
      <div className="plant-scene">
      {layer(ASSETS.master, 'scene-poster')}
      <div className="scene-layers">{layer(ASSETS.landscape, 'scene-base', true)}{layer(ASSETS.landscape, 'canopy-backplate')}{layer(ASSETS.landscape, 'middle-backplate')}{layer(ASSETS.plant, 'connected-plant', true)}{layer(ASSETS.foreground, 'near-foliage', true)}</div>
      </div>
    </div>
    <section className="origin-hero" aria-labelledby="hero-title">
      <div className="hero-foliage-window" aria-hidden="true">{layer(ASSETS.foreground, 'hero-foliage')}</div>
      <div className="hero-scrim" aria-hidden="true" />
      <div className="hero-copy"><p className="eyebrow">{SITE.hero.location}</p><h1 id="hero-title">{SITE.hero.title}</h1><p className="hero-body">{SITE.hero.body}</p><div className="hero-actions"><Link className="button" to="/#farms">{SITE.hero.explore}<Arrow /></Link><Link className="button secondary" to="/#roots">{SITE.hero.story}</Link></div></div>
      <div id="origin" className="leaf-lookup"><div className="lookup-scrim" aria-hidden="true" /><Lookup heading onFound={onFound} onScan={onScan} /></div>
    </section>
    <section id="farms" className="featured-farms" aria-labelledby="farms-title"><div className="farms-scrim" aria-hidden="true" /><div className="featured-content"><h2 id="farms-title">{SITE.farms.title}</h2><p className="section-note">{SITE.farms.sample}</p><div className="featured-grid">{DEMO_DATA.farms.filter(farm => SITE.farms.featured.some(id => id === farm.id)).map(farm => <FarmCard key={farm.id} farm={farm} onOpen={onFarm} />)}</div><Link className="all-farms text-link" to="/farms">{SITE.farms.all}<Arrow /></Link></div></section>
    <section id="roots" className="roots-section" aria-labelledby="roots-title"><div className="root-reveal-window" aria-hidden="true" style={{ maskImage: `url(${ASSETS.soilLip.small})` }}><div className="root-curtain" style={{ maskImage: `url(${ASSETS.soilRevealMask})` }}>{layer(ASSETS.soilLip, 'root-soil-photo', true)}</div></div><div className="roots-scrim" aria-hidden="true" /><div className="roots-copy"><h2 id="roots-title">{SITE.roots.title}</h2><Link className="text-link" to="/cooperative">{SITE.roots.action}<Arrow /></Link></div></section>
  </main>
}
