import { useLayoutEffect, useRef } from 'react'
import type { CSSProperties, RefObject } from 'react'
import { Link } from 'react-router-dom'
import { ASSETS, JOURNEY, SITE } from '../constants/site'
import { farmPath } from '../data/farms'
import { clamp, PLANT, plantCamera, pointAt, sceneValues, smooth, starts, totalTravel } from '../lib/journey'
import { Leaf, RootBoard } from './Botanical'
import { Lookup } from './Lookup'

type Actions = { onScan: () => void; openFarm: (id: string) => void; onFind: () => void }

function Headline({ children }: { children: string }) {
  return <h2>{children.split('\n').map((line, i) => <span className="headline-line" key={line} style={{ '--line': i } as CSSProperties}><span>{line}</span></span>)}</h2>
}

export function StoryContent({ kind, onScan, openFarm, onFind }: Actions & { kind: string }) {
  if (kind === 'intro') return <div className="intro-copy"><h1>{SITE.intro.title.split('\n').map((line, i) => <span key={line} className={i === 1 ? 'italic' : ''}>{line}</span>)}</h1><p>{SITE.intro.body}</p><small>{SITE.intro.footer}</small></div>
  if (kind === 'growth') return <div className="growth-copy"><Headline>{SITE.growth.title}</Headline><p>{SITE.growth.body}</p></div>
  if (kind === 'lookup') return <div className="leaf-copy lookup-copy"><Leaf /><div className="leaf-content"><Headline>{SITE.lookup.title}</Headline><p>{SITE.lookup.body}</p><Lookup onFound={openFarm} onScan={onScan} /></div></div>
  if (kind === 'story') return <div className="leaf-copy story-copy"><Leaf /><div className="leaf-content"><Headline>{SITE.story.title}</Headline><p>{SITE.story.body}</p><small>{SITE.story.note}</small></div><img className="story-botanical" src={ASSETS.plant} alt={SITE.accessibility.plant} /></div>
  if (kind === 'growing') return <div className="leaf-copy growing-copy"><Leaf /><div className="leaf-content"><Headline>{SITE.growing.title}</Headline><p>{SITE.growing.body}</p><ul className="practices">{SITE.growing.practices.map((item, i) => <li key={item} style={{ '--pod': i } as CSSProperties}><svg viewBox="0 0 32 32" aria-hidden="true"><path d={['M16 28V17M16 19C5 21 3 9 6 5C17 5 19 11 16 19ZM16 21C28 20 30 10 26 7C18 8 16 12 16 21Z', 'M9 29V3M23 29V3M9 8H23M9 16H23M9 24H23M16 28C12 17 25 15 15 4', 'M16 28V15M16 15C6 16 5 5 7 3C17 3 20 9 16 15ZM22 17Q30 23 22 26Q14 23 22 17Z'][i]} /></svg><span>{item}</span></li>)}</ul><small>{SITE.growing.note}</small></div></div>
  if (kind === 'harvest') return <div className="leaf-copy harvest-copy"><Leaf /><div className="leaf-content"><Headline>{SITE.harvest.title}</Headline><p>{SITE.harvest.body}</p><small>{SITE.harvest.note}</small></div><img className="harvest-root" src={ASSETS.root} alt={SITE.accessibility.root} /></div>
  if (kind === 'partners') return <div className="partners-copy"><Headline>{SITE.partners.title}</Headline><div className="partner-leaves">{SITE.farms.map((farm, i) => <Link key={farm.id} to={farmPath(farm.id)} style={{ '--partner': i } as CSSProperties} onClick={(event) => { if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return; event.preventDefault(); openFarm(farm.id) }} className="partner-leaf"><Leaf /><span><strong>{farm.name}</strong><span>{farm.location}{SITE.symbols.separator}{SITE.partners.idLabel} {farm.id}</span><b>{SITE.partners.action}<span aria-hidden="true">{SITE.symbols.forward}</span></b></span></Link>)}</div><small className="partner-note">{SITE.partners.note}</small></div>
  return <div className="leadership-copy"><RootBoard /><div className="board-content"><Headline>{SITE.leadership.title}</Headline><p>{SITE.leadership.body}</p><h3>{SITE.leadership.name}</h3><p className="roles">{SITE.leadership.roles}</p><button className="button secondary" onClick={onFind}>{SITE.leadership.action}<span aria-hidden="true">{SITE.symbols.forward}</span></button><small>{SITE.leadership.footer}</small></div></div>
}

// A growing helix, branch stems and the pipe live in the same world as the copy.
function Trellis() {
  let vine = 'M1123 6100'
  for (let y = 6100; y > 45; y -= 130) vine += `C1077 ${y - 35} 1170 ${y - 90} 1123 ${y - 130}`
  return <svg className="trellis" viewBox="0 0 1440 6500" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="pipe" x1="0" x2="1"><stop stopColor="var(--ube-pipe-dark)" /><stop offset=".42" stopColor="var(--ube-pipe-light)" /><stop offset="1" stopColor="var(--ube-green)" /></linearGradient></defs>
    <rect className="pipe-shaft" x="1113" y="30" width="20" height="6320" rx="10" fill="url(#pipe)" />
    <path className="vine" d={vine} pathLength="1" />
    {[0, 115, 230, 345].map((y, i) => <path key={y} className={`branch branch-${i}`} style={{ '--branch': i } as CSSProperties} d={`M1123 ${(y + 76) * 10}Q1060 ${(y + 68) * 10} ${i === 2 ? 1123 : 1102} ${(y + (i === 0 ? 71.5 : i === 2 ? 68.82 : 69.72)) * 10}`} />)}
    <g className="partner-stems">{[0, 1, 2].map(i => <path key={i} />)}</g>
  </svg>
}

export function Landing({ hidden, reading, onScan, openFarm, onFind, active, setActive, viewport, onViewportChange }: Actions & { hidden: boolean; reading: boolean; active: number; setActive: (index: number) => void; viewport: RefObject<number>; onViewportChange: (height: number) => void }) {
  const root = useRef<HTMLDivElement>(null)
  const engine = useRef<ScrollCraftInstance | null>(null)
  useLayoutEffect(() => {
    if (reading || hidden || !root.current) return
    onViewportChange(innerHeight)
    if (!engine.current) engine.current = window.ScrollCraft?.mount(root.current.parentElement!) ?? null
    engine.current?.layout()
    let frame = 0
    let painted = clamp(scrollY / viewport.current, 0, totalTravel)
    let previousTime = performance.now()
    const render = (now: number) => {
      frame = 0
      const element = root.current
      if (!element) return
      const target = clamp(scrollY / viewport.current, 0, totalTravel)
      const dt = Math.min(now - previousTime, 48); previousTime = now
      // Smooth only the visual camera. Native scrolling, keyboard and URL routes remain native.
      painted = Math.abs(target - painted) > .9 ? target : painted + (target - painted) * (1 - Math.exp(-dt / 42))
      if (Math.abs(target - painted) < .001) painted = target
      const values = sceneValues(painted)
      const camera = plantCamera(painted)
      Object.entries(values).forEach(([name, value]) => element.style.setProperty(`--${name}`, String(value)))
      element.style.setProperty('--camera-y', `${camera.y}vh`)
      element.style.setProperty('--camera-scale', String(camera.scale))
      element.style.setProperty('--rise', String(camera.rise))
      const index = pointAt(painted)
      setActive(index)
      element.querySelectorAll<HTMLElement>('[data-sc-segment]').forEach((section, i) => {
        const p = clamp((painted - starts[i]) / JOURNEY[i].weight)
        section.style.setProperty('--local', String(p))
        const content = section.querySelector<HTMLElement>(':scope > div:not([hidden])')!
        const entry = i === 0 ? 1 : smooth((painted - starts[i]) / .15)
        const exit = i === JOURNEY.length - 1 ? 1 : 1 - smooth((p - .67) / .2)
        const inactive = i !== index || entry * exit < .9 || (i === 7 && values.board < .95)
        section.inert = inactive
        section.setAttribute('aria-hidden', String(inactive))
        const unfurl = i < 2 ? 1 : smooth((camera.rise - (1 - (PLANT.leaves[i - 2] + 105) / PLANT.base)) / .16)
        section.style.setProperty('--unfurl', String(unfurl))
        content.style.setProperty('--copy-opacity', String(i === index ? entry * exit : 0))
        if (i < 2) content.style.opacity = String(i === index ? entry * exit : 0)
      })
      // Resolve petioles from the real leaf SVGs. This keeps their stems attached
      // through unfurling, fan rotation, responsive layouts and camera zoom.
      const trellis = element.querySelector<SVGSVGElement>('.trellis')!
      const inverse = trellis.getScreenCTM()?.inverse()
      if (inverse) {
        const attachments = [
          ...['lookup', 'story', 'growing', 'harvest'].map((key, i) => ({ leaf: `.scene-${key} .leaf-art`, stem: `.branch-${i}`, y: (PLANT.leaves[i] + 76) * 10 })),
          ...[0, 1, 2].map(i => ({ leaf: `.scene-partners .partner-leaf:nth-child(${i + 1}) .leaf-art`, stem: `.partner-stems path:nth-child(${i + 1})`, y: 5340 + i * 20 })),
        ]
        for (const attachment of attachments) {
          const leaf = element.querySelector<SVGSVGElement>(attachment.leaf)
          const matrix = leaf?.getScreenCTM()
          if (!matrix) continue
          const tip = new DOMPoint(860, 572).matrixTransform(matrix).matrixTransform(inverse)
          const bend = Math.min(tip.x - 30, 1060)
          element.querySelector(attachment.stem)?.setAttribute('d', `M1123 ${attachment.y}Q${bend} ${(attachment.y + tip.y) / 2 - 30} ${tip.x} ${tip.y}`)
        }
      }
      element.dataset.scVerifyState = ['.world-camera', '.opening-root', '.vine', '.leadership-copy', '.earth-plane', `.scene-${JOURNEY[index].key} h2`, `.scene-${JOURNEY[index].key} .leaf-content`].map(selector => {
        const node = element.querySelector(selector)
        if (!node) return ''
        const rendered = getComputedStyle(node)
        return `${rendered.transform}|${rendered.opacity}|${rendered.clipPath}|${rendered.strokeDashoffset}`
      }).join(';')
      const local = (painted - starts[index]) / JOURNEY[index].weight
      element.dataset.scVerifyHold = (index > 1 && index < 7 && local > .2 && local < .66) || values.board === 1 ? 'true' : ''
      engine.current?.read()
      if (painted !== target) frame = requestAnimationFrame(render)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(render) }
    const resize = () => {
      const travel = scrollY / viewport.current
      onViewportChange(innerHeight)
      engine.current?.layout()
      scrollTo({ top: travel * viewport.current, behavior: 'instant' })
      painted = travel
      schedule()
    }
    render(performance.now() + 16)
    addEventListener('scroll', schedule, { passive: true })
    addEventListener('resize', resize)
    return () => { cancelAnimationFrame(frame); removeEventListener('scroll', schedule); removeEventListener('resize', resize) }
  }, [hidden, reading, setActive, viewport, onViewportChange])

  const actions = { onScan, openFarm, onFind }
  const scene = (point: typeof JOURNEY[number], i: number) => <section key={point.key} className={`scene scene-${point.key}`} style={i > 1 ? { '--world-y': `${PLANT.leaves[i - 2]}vh` } as CSSProperties : undefined} data-sc-segment data-sc-w={point.weight} data-sc-waypoint={point.label} aria-label={point.label}><div data-sc-poster hidden /><StoryContent kind={point.key} {...actions} /></section>
  return <main id="main-content" hidden={hidden}>
    <div ref={root} className={`journey current-${JOURNEY[active].key}`} hidden={reading} data-sc-mode="worldflight" data-sc-seam="0.12">
      <div data-sc-world className="plant-world">
        <div className="sky-plane" aria-hidden="true"><div className="sun-plane" /><Leaf /><Leaf /></div>
        {JOURNEY.slice(0, 2).map(scene)}
        <div className="world-camera">
          <Trellis />
          <img className="mature-plant" src={ASSETS.plant} alt="" aria-hidden="true" fetchPriority="high" />
          {JOURNEY.slice(2).map((point, i) => scene(point, i + 2))}
          <img className="opening-root" src={ASSETS.root} alt="" aria-hidden="true" fetchPriority="high" />
          <svg className="earth-plane" viewBox="0 0 1440 200" preserveAspectRatio="none" aria-hidden="true"><path d="M0 200V100Q250 70 490 130Q760 175 960 65Q1160 10 1440 90V200Z" /><path d="M0 200V155Q300 95 580 170Q880 125 1140 120Q1360 85 1440 100V200Z" /></svg>
        </div>
      </div><div data-sc-spacer />
    </div>
    <div className="reading-page" hidden={!reading}>
      <div className="reading-intro"><div><h1>{SITE.reading.title}</h1><p>{SITE.reading.body}</p></div><img src={ASSETS.plant} alt={SITE.accessibility.plant} /></div>
      {JOURNEY.slice(2).map(point => <section key={point.key} id={`reading-${point.key}`} aria-label={point.label}><StoryContent kind={point.key} {...actions} /></section>)}
      <footer>{SITE.reading.disclosure}<p>{SITE.footer}</p></footer>
    </div>
  </main>
}
