import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { applyTheme, layoutForWidth, MOTION, SITE } from './constants/site'
import { batchPath, originPath } from './data/farms'
import type { OriginTarget } from './data/farms'
import Landing from './components/story/OriginStory'
import { Scanner } from './components/Scanner'
import { Arrow, LeafMark } from './components/UI'
import './App.css'

const FarmDirectory = lazy(() => import('./pages/PublicPages').then(module => ({ default: module.FarmDirectory })))
const FarmProfile = lazy(() => import('./pages/PublicPages').then(module => ({ default: module.FarmProfile })))
const BatchSummary = lazy(() => import('./pages/PublicPages').then(module => ({ default: module.BatchSummary })))
const CooperativePage = lazy(() => import('./pages/PublicPages').then(module => ({ default: module.CooperativePage })))
const MissingPage = lazy(() => import('./pages/PublicPages').then(module => ({ default: module.MissingPage })))

function readChoice() { try { return sessionStorage.getItem('ube-reading') === 'true' } catch { return false } }
type LandingSnapshot = { top: number; width: number; height: number; anchor: string; href: string; elementTop: number; mode: string }
function readSnapshot(key: string): LandingSnapshot | undefined {
  try { return JSON.parse(sessionStorage.getItem(`ube-return:${key}`)||'null') || undefined } catch { return undefined }
}
function useMotionPreference() {
  const [system, setSystem] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [choice, setChoice] = useState(readChoice)
  useEffect(() => { const query = matchMedia('(prefers-reduced-motion: reduce)'); const update = () => setSystem(query.matches); query.addEventListener('change', update); return () => query.removeEventListener('change', update) }, [])
  const toggle = () => setChoice(value => { try { sessionStorage.setItem('ube-reading', String(!value)) } catch { /* Session preference is optional. */ } return !value })
  return { system, off: system || choice, toggle }
}
function responsiveState() { return { layout: layoutForWidth(innerWidth), narrow: innerWidth <= MOTION.narrowDesktop } }
function useResponsiveLayout() {
  const [current, setCurrent] = useState(responsiveState)
  useEffect(() => {
    const queries = [MOTION.desktop, MOTION.phone, MOTION.compact, MOTION.narrowDesktop + 1].map(width => matchMedia(`(min-width: ${width}px)`))
    const update = () => setCurrent(responsiveState())
    queries.forEach(query => query.addEventListener('change', update))
    return () => queries.forEach(query => query.removeEventListener('change', update))
  }, [])
  return current
}
function MemberPreview({ open, close, returnFocus, onFound }: { open: boolean; close: () => void; returnFocus: RefObject<HTMLElement | null>; onFound: (target: OriginTarget, anchor: string) => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => { if (!open) return; const element = dialog.current!; const trigger = returnFocus.current; element.showModal(); return () => { element.close(); if (trigger?.isConnected && trigger.getClientRects().length) trigger.focus({ preventScroll: true }) } }, [open, returnFocus])
  return <dialog className="member-dialog" ref={dialog} aria-labelledby="member-title" onCancel={event => { event.preventDefault(); close() }} onClick={event => { if (event.target === dialog.current) close() }}><div className="member-panel"><button className="dialog-close" aria-label={SITE.member.close} onClick={close}>{SITE.symbols.close}</button><LeafMark /><h2 id="member-title">{SITE.member.title}</h2><p>{SITE.member.body}</p><ul>{SITE.member.roles.map(role => <li key={role}>{role}</li>)}</ul><p className="muted">{SITE.member.note}</p><Link className="button" to={batchPath(SITE.batch.sampleId)} onClick={event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    const anchor = [...document.querySelectorAll<HTMLElement>('.origin-world section[id]')].reverse().find(section => section.getBoundingClientRect().top <= innerHeight / 2)?.id || 'origin'
    onFound({ kind: 'batch', id: SITE.batch.sampleId }, anchor)
    close()
  }}>{SITE.member.action}<Arrow /></Link></div></dialog>
}
function FarmApp() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const navigate = useNavigate()
  const motion = useMotionPreference()
  const responsive = useResponsiveLayout()
  const memberReturnFocus = useRef<HTMLElement | null>(null)
  const motionOff = useRef(motion.off)
  useLayoutEffect(() => { motionOff.current = motion.off }, [motion.off])
  const [menu, setMenu] = useState(false)
  const [scanner, setScanner] = useState(false)
  const [member, setMember] = useState(false)
  const snapshots = useRef(new Map<string, LandingSnapshot>())
  const home = location.pathname === '/'
  const rememberLanding = useCallback((anchor: string, href: string, element: HTMLElement | null) => {
    const snapshot = { top: scrollY, width: innerWidth, height: innerHeight, anchor, href, elementTop: element?.getBoundingClientRect().top || 0, mode: `${motionOff.current}:${document.querySelector<HTMLElement>('.origin-story')?.dataset.pinned}` }
    snapshots.current.set(location.key,snapshot)
    // Also survive a native link navigation or a history document restore.
    try { sessionStorage.setItem(`ube-return:${location.key}`,JSON.stringify(snapshot)) } catch { /* In-memory restoration remains available. */ }
  },[location.key])
  const openMember = (trigger: HTMLElement) => {
    memberReturnFocus.current = trigger.closest('#mobile-nav') ? document.querySelector<HTMLElement>('.menu-button') : trigger
    setMenu(false)
    setMember(true)
  }
  useEffect(() => {
    if (!menu) return
    document.querySelector<HTMLAnchorElement>('#mobile-nav a')?.focus()
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setMenu(false); document.querySelector<HTMLButtonElement>('.menu-button')?.focus() } }
    window.addEventListener('keydown', escape)
    return () => window.removeEventListener('keydown', escape)
  }, [menu])
  const openTarget = useCallback((target: OriginTarget, anchor = 'origin') => {
    if (home) {
      const section=document.getElementById(anchor)
      const href=originPath(target)
      const focused=document.activeElement instanceof HTMLElement && section?.contains(document.activeElement) ? document.activeElement : null
      const element=focused || section?.querySelector<HTMLElement>(`a[href="${href}"]`) || section?.querySelector<HTMLElement>('input') || section
      rememberLanding(anchor,href,element||null)
    }
    setScanner(false)
    navigate(originPath(target), { state: { fromLanding: home } })
  }, [home, rememberLanding, navigate])
  const openFarm = useCallback((id: string, anchor: string) => openTarget({ kind: 'farm', id }, anchor), [openTarget])
  useLayoutEffect(() => {
    let cancelled = false, restored = false, frame=0
    const restore = () => {
      if (cancelled) return
      const saved = snapshots.current.get(location.key)||readSnapshot(location.key)
      if(restored && !(home && navigationType==='POP' && saved))return
      const world=document.querySelector<HTMLElement>('.origin-story')
      if(home && (world?.dataset.navigationKey!==location.key || world.dataset.storyReady !== 'true'))return
      if (home && navigationType === 'POP' && saved) {
        const mode=`${motionOff.current}:${world?.dataset.pinned}`
        if (Math.abs(saved.width - innerWidth) < 2 && Math.abs(saved.height-innerHeight)<2 && saved.mode===mode) scrollTo({ top: saved.top, behavior: 'instant' })
        else {
          const section=document.getElementById(saved.anchor)
          const element=section?.querySelector<HTMLElement>(`a[href="${saved.href}"]`) || section?.querySelector<HTMLElement>('input') || section
          if(element){
            const rect=element.getBoundingClientRect(),header=document.querySelector<HTMLElement>('.site-header')!.offsetHeight
            const top=Math.max(header+24,Math.min(saved.elementTop,innerHeight-Math.min(rect.height,44)-24))
            scrollTo({top:scrollY+rect.top-top,behavior:'instant'})
          }else return
        }
      } else if (home && location.hash) {
        const section = document.getElementById(location.hash.slice(1))
        if(!section)return
        section.scrollIntoView({ behavior: motionOff.current ? 'instant' : 'smooth', block: 'start' })
        if (location.hash === '#origin') section?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true })
      } else scrollTo({ top: 0, behavior: 'instant' })
      restored=true
      setMenu(false)
    }
    // Restore once fonts and ScrollTrigger measurements settle. User input owns
    // scrolling after that; late asset readiness must never move them back.
    const onReady = () => { cancelAnimationFrame(frame);frame=requestAnimationFrame(restore) }
    const userScroll=()=>{cancelled=true;cancelAnimationFrame(frame)}
    const keyScroll=(event:KeyboardEvent)=>{if(['PageDown','PageUp','Home','End','ArrowDown','ArrowUp',' '].includes(event.key))userScroll()}
    // Suspense may retain the outgoing page. Only restore against this route's
    // mounted scene, and observe readiness so a child event cannot be missed.
    const measured=new WeakSet<Element>()
    const sizes=new ResizeObserver(onReady)
    const observeLayout=()=>{
      document.querySelectorAll('.origin-story section[id],.origin-story #origin,.site-header').forEach(element=>{if(!measured.has(element)){measured.add(element);sizes.observe(element)}})
      onReady()
    }
    const observer=new MutationObserver(observeLayout)
    observer.observe(document.querySelector('.app-shell')!,{subtree:true,childList:true,attributes:true,attributeFilter:['data-story-ready','data-navigation-key']})
    window.addEventListener('origin-story-ready', onReady)
    window.addEventListener('wheel',userScroll,{passive:true});window.addEventListener('touchstart',userScroll,{passive:true});window.addEventListener('keydown',keyScroll)
    observeLayout()
    return () => { cancelled = true;observer.disconnect();sizes.disconnect();cancelAnimationFrame(frame);window.removeEventListener('origin-story-ready', onReady);window.removeEventListener('wheel',userScroll);window.removeEventListener('touchstart',userScroll);window.removeEventListener('keydown',keyScroll) }
  }, [location.key, location.hash, home, navigationType])
  const manual = () => {
    setScanner(false)
    requestAnimationFrame(() => {
      if (home) document.getElementById('origin')?.scrollIntoView({ behavior: 'instant', block: 'center' })
      document.querySelector<HTMLInputElement>(home ? '#origin input' : '.recovery input')?.focus({ preventScroll: true })
    })
  }
  return <div className={`app-shell ${motion.off ? 'motion-off' : ''}`} data-layout={responsive.layout} data-narrow={responsive.narrow} onClickCapture={event=>{
    if(!home||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return
    const link=(event.target as HTMLElement).closest<HTMLAnchorElement>('a[href]')
    const section=link?.closest<HTMLElement>('.origin-story section[id]')
    if(link&&section&&link.origin===window.location.origin&&link.pathname!=='/')rememberLanding(section.id,link.pathname,link)
  }}>
    <a className="skip-link" href="#main-content">{SITE.nav.skip}</a>
    <header className="site-header"><Link className="brand" to="/" aria-label={SITE.nav.home}><LeafMark /><span>{SITE.brand}</span></Link><nav className="desktop-nav" aria-label={SITE.nav.label}><Link to="/#farms">{SITE.nav.farms}</Link><Link to="/#roots">{SITE.nav.story}</Link><Link to="/#origin">{SITE.nav.trace}</Link><button onClick={event => openMember(event.currentTarget)}>{SITE.nav.member}</button></nav><button className="menu-button" aria-expanded={menu} aria-controls="mobile-nav" onClick={() => setMenu(!menu)}>{menu ? SITE.nav.close : SITE.nav.menu}<span aria-hidden="true">{menu ? SITE.symbols.close : SITE.symbols.menu}</span></button></header>
    <nav id="mobile-nav" className="mobile-nav" aria-label={SITE.accessibility.menu} hidden={!menu} onKeyDown={event => { if (event.key === 'Escape') { setMenu(false); document.querySelector<HTMLButtonElement>('.menu-button')?.focus() } }}><Link to="/#farms">{SITE.nav.farms}</Link><Link to="/#roots">{SITE.nav.story}</Link><Link to="/#origin">{SITE.nav.trace}</Link><button onClick={event => openMember(event.currentTarget)}>{SITE.nav.member}</button><button disabled={motion.system} onClick={motion.toggle}>{motion.off ? SITE.footer.enable : SITE.footer.reduce}</button></nav>
    <Suspense fallback={<main id="main-content" className="detail-page"><p role="status">{SITE.profile.loading}</p></main>}><Routes><Route path="/" element={<Landing key={location.key} navigationKey={location.key} layout={responsive.layout} motionOff={motion.off} onScan={() => setScanner(true)} onFound={openTarget} onFarm={openFarm} />} /><Route path="/farms" element={<FarmDirectory onFarm={openFarm} />} /><Route path="/farms/:farmId" element={<FarmProfile onFound={openTarget} onScan={() => setScanner(true)} />} /><Route path="/batches/:batchId" element={<BatchSummary onFound={openTarget} onScan={() => setScanner(true)} />} /><Route path="/cooperative" element={<CooperativePage />} /><Route path="*" element={<MissingPage onFound={openTarget} onScan={() => setScanner(true)} />} /></Routes></Suspense>
    <footer className={`site-footer ${home ? 'home-footer' : ''}`}><p>{SITE.footer.disclosure}</p><button className="motion-toggle" aria-pressed={motion.off} disabled={motion.system} onClick={motion.toggle}>{motion.system ? SITE.footer.system : motion.off ? SITE.footer.enable : SITE.footer.reduce}</button></footer>
    <Scanner open={scanner} onClose={() => setScanner(false)} onFound={openTarget} onManual={manual} />
    <MemberPreview open={member} close={() => setMember(false)} returnFocus={memberReturnFocus} onFound={openTarget} />
  </div>
}
applyTheme()
history.scrollRestoration = 'manual'
export default function App() { return <BrowserRouter><FarmApp /></BrowserRouter> }

