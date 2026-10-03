import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { ASSETS, DEMO_DATA, MOTION, SITE } from '../constants/site'
import type { OriginTarget } from '../data/farms'
import { Lookup } from './Lookup'
import { Arrow, FarmCard } from './UI'

gsap.registerPlugin(ScrollTrigger, useGSAP)
ScrollTrigger.config({ ignoreMobileResize: true })

export default function Landing({ motionOff, onScan, onFound, onFarm }: { motionOff: boolean; onScan: () => void; onFound: (target: OriginTarget) => void; onFarm: (id: string, anchor: string) => void }) {
  const root = useRef<HTMLElement>(null)
  const [layersReady, setLayersReady] = useState(false)
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
      const phone = !context.conditions?.desktop
      gsap.to('.canopy-backplate', { y: phone ? MOTION.mobileLandscape : MOTION.landscape, ease: 'none', scrollTrigger: { trigger: '.origin-hero', start: 'top top', end: 'bottom top', scrub: MOTION.scrub } })
      gsap.to('.near-foliage', { y: phone ? MOTION.mobileForeground : MOTION.foreground, ease: 'none', scrollTrigger: { trigger: '.roots-section', start: 'top bottom', end: 'clamp(bottom bottom)', scrub: MOTION.scrub } })
      gsap.from('.featured-grid .farm-card', { opacity: 0, y: phone ? MOTION.mobileCardRise : MOTION.cardRise, duration: MOTION.entrance, stagger: MOTION.stagger, ease: 'power2.out', scrollTrigger: { trigger: '.featured-grid', start: 'top 85%', once: true } })
      gsap.fromTo('.root-curtain', { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(100% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: '.roots-section', start: 'top 90%', end: phone ? 'clamp(top 28%)' : 'clamp(bottom 95%)', scrub: MOTION.scrub } })
    })
    let previousWidth = root.current!.clientWidth
    const observer = new ResizeObserver(entries => {
      const width = entries[0].contentRect.width
      if (Math.abs(width - previousWidth) > 2) { previousWidth = width; ScrollTrigger.refresh() }
    })
    observer.observe(root.current!)
    const visibility = () => {
      ScrollTrigger.getAll().filter(trigger => root.current?.contains(trigger.trigger as Node)).forEach(trigger => {
        if (document.hidden) trigger.disable(false)
        else trigger.enable(false)
      })
    }
    document.addEventListener('visibilitychange', visibility)
    void document.fonts.ready.then(() => { if (root.current) ScrollTrigger.refresh() })
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', visibility); media.revert() }
  }, { scope: root, dependencies: [motionOff, layersReady], revertOnUpdate: true })
  const layer = (asset: typeof ASSETS.master, className: string, required = false) => <img className={className} src={asset.src} srcSet={`${asset.small} 800w, ${asset.src} 1600w`} sizes="100vw" alt="" width={asset.width} height={asset.height} aria-hidden="true" data-sc-layer={required ? '' : undefined} loading="eager" decoding="async" />
  return <main ref={root} id="main-content" className={`origin-world ${layersReady ? 'layers-ready' : ''} ${motionOff ? 'motion-off' : ''}`} data-sc-ready={layersReady}>
    <div className="world-art" aria-hidden="true">
      {layer(ASSETS.master, 'scene-poster')}
      <div className="scene-layers">{layer(ASSETS.landscape, 'scene-base', true)}<div className="canopy-clip">{layer(ASSETS.landscape, 'canopy-backplate')}</div>{layer(ASSETS.plant, 'connected-plant', true)}{layer(ASSETS.foreground, 'near-foliage', true)}</div>
    </div>
    <section className="origin-hero" aria-labelledby="hero-title">
      <div className="hero-scrim" aria-hidden="true" />
      <div className="hero-copy"><p className="eyebrow">{SITE.hero.location}</p><h1 id="hero-title">{SITE.hero.title}</h1><p className="hero-body">{SITE.hero.body}</p><div className="hero-actions"><Link className="button" to="/#farms">{SITE.hero.explore}<Arrow /></Link><Link className="button secondary" to="/#roots">{SITE.hero.story}</Link></div></div>
      <div id="origin" className="leaf-lookup"><div className="lookup-scrim" aria-hidden="true" /><Lookup heading onFound={onFound} onScan={onScan} /></div>
    </section>
    <section id="farms" className="featured-farms" aria-labelledby="farms-title"><div className="farms-scrim" aria-hidden="true" /><div className="featured-content"><h2 id="farms-title">{SITE.farms.title}</h2><p className="section-note">{SITE.farms.sample}</p><div className="featured-grid">{DEMO_DATA.farms.filter(farm => SITE.farms.featured.some(id => id === farm.id)).map(farm => <FarmCard key={farm.id} farm={farm} onOpen={onFarm} />)}</div><Link className="all-farms text-link" to="/farms">{SITE.farms.all}<Arrow /></Link></div></section>
    <section id="roots" className="roots-section" aria-labelledby="roots-title"><div className="root-curtain" style={{ backgroundImage: `url(${ASSETS.soil.small})` }} aria-hidden="true" /><div className="roots-scrim" aria-hidden="true" /><div className="roots-copy"><h2 id="roots-title">{SITE.roots.title}</h2><Link className="text-link" to="/cooperative">{SITE.roots.action}<Arrow /></Link></div></section>
  </main>
}
