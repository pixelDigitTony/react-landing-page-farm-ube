import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ASSETS, JOURNEY, SITE, applyTheme } from './constants/site'
import { farmPath, farmRepository } from './data/farms'
import type { Farm } from './data/farms'
import { waypointTravel } from './lib/journey'
import { Lookup } from './components/Lookup'
import { Scanner } from './components/Scanner'
import { FarmQr } from './components/FarmQr'
import { Landing } from './components/FarmJourney'
import './App.css'

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  return reduced
}

function Profile({ back, onScan, openFarm }: { back: () => void; onScan: () => void; openFarm: (id: string) => void }) {
  const { farmId } = useParams()
  const [state, setState] = useState<{ farm: Farm | null; status: 'loading' | 'ready' | 'missing' | 'failed' }>({ farm: null, status: 'loading' })
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    let cancelled = false
    farmRepository.getFarmById(farmId ?? '').then((farm) => { if (!cancelled) setState({ farm, status: farm ? 'ready' : 'missing' }) }).catch(() => { if (!cancelled) setState({ farm: null, status: 'failed' }) })
    return () => { cancelled = true }
  }, [farmId, retry])
  useEffect(() => { if (state.status !== 'loading') document.querySelector<HTMLElement>('.profile-page h1')?.focus({ preventScroll: true }) }, [state.status])
  const farm = state.farm
  return <main className="profile-page" id="profile-content">
    <button className="back-link" onClick={back}><span aria-hidden="true">{SITE.symbols.back}</span> {SITE.profile.back}</button>
    {!farm ? <div className="profile-recovery" aria-live="polite"><h1 tabIndex={-1}>{state.status === 'loading' ? SITE.profile.loadingTitle : state.status === 'failed' ? SITE.profile.failedTitle : SITE.profile.missingTitle}</h1><p>{state.status === 'loading' ? SITE.profile.loadingBody : state.status === 'failed' ? SITE.profile.failedBody : SITE.profile.missingBody}</p>{state.status !== 'loading' && <><Lookup onFound={openFarm} onScan={onScan} /><button className="text-button" onClick={state.status === 'failed' ? () => setRetry(retry + 1) : back}>{state.status === 'failed' ? SITE.profile.retry : SITE.profile.browse}</button></>}</div> : <>
      <div className="profile-hero"><div><span className="tag">{SITE.profile.sample}{SITE.symbols.separator}{SITE.profile.idLabel} {farm.id}</span><h1 tabIndex={-1}>{farm.name}</h1><p className="location">{farm.location}</p><p>{SITE.profile.disclosure}</p></div><figure><img src={ASSETS.plant} alt={SITE.accessibility.farmImage} /><figcaption>{SITE.profile.imageNote}</figcaption></figure></div>
      <div className="profile-grid"><div className="profile-stories"><section><h2>{SITE.profile.storyTitle}</h2><p>{farm.story}</p></section><section><h2>{SITE.profile.practicesTitle}</h2><p>{farm.practices}</p></section><section><h2>{SITE.profile.contactTitle}</h2><p>{farm.contact || SITE.profile.noContact}</p></section></div><aside><div className="details-card"><h2>{SITE.profile.detailsTitle}</h2><dl><dt>{SITE.profile.idLabel}</dt><dd>{farm.id}</dd><dt>{SITE.profile.partnerLabel}</dt><dd>{farm.name}</dd><dt>{SITE.profile.location}</dt><dd>{farm.location}</dd></dl></div><FarmQr id={farm.id} /></aside></div>
      <footer>{SITE.footer}</footer>
    </>}
  </main>
}

function FarmApp() {
  const reduced = useReducedMotion()
  const [readingChoice, setReadingChoice] = useState(() => sessionStorage.getItem('ube-reading') === 'true')
  const reading = reduced || readingChoice
  const [menu, setMenu] = useState(false)
  const [scanner, setScanner] = useState(false)
  const [active, setActive] = useState(0)
  const viewport = useRef(window.innerHeight)
  const onViewportChange = useCallback((height: number) => { viewport.current = height }, [])
  const savedScroll = useRef(0)
  const savedHeight = useRef(window.innerHeight)
  const cameFromLanding = useRef(false)
  const location = useLocation()
  const navigate = useNavigate()
  const home = location.pathname === '/'
  const previousHome = useRef(home)
  useLayoutEffect(() => {
    if (home && !previousHome.current) requestAnimationFrame(() => scrollTo({ top: reading ? savedScroll.current : savedScroll.current * viewport.current / savedHeight.current, behavior: 'instant' }))
    else if (!home) scrollTo({ top: 0, behavior: 'instant' })
    previousHome.current = home
  }, [home, location.pathname, reading])
  const openFarm = (id: string) => {
    setScanner(false)
    if (home) { savedScroll.current = scrollY; savedHeight.current = viewport.current; cameFromLanding.current = true }
    navigate(farmPath(id))
  }
  const jump = (key: string, focus = false) => {
    setMenu(false)
    const go = () => {
      if (reading) document.getElementById(`reading-${key}`)?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' })
      else scrollTo({ top: waypointTravel(key) * viewport.current, behavior: 'instant' })
      if (focus) requestAnimationFrame(() => document.querySelector<HTMLInputElement>(reading ? '#reading-lookup input' : '.scene-lookup input')?.focus({ preventScroll: true }))
    }
    if (!home) { cameFromLanding.current = false; savedScroll.current = reading ? 0 : waypointTravel(key) * viewport.current; navigate('/'); setTimeout(go, 60) } else go()
  }
  const back = () => { if (cameFromLanding.current) navigate(-1); else jump('partners') }
  const resetHome = () => { savedScroll.current = 0; setMenu(false); scrollTo({ top: 0, behavior: 'instant' }) }
  const toggleReading = () => {
    const next = !readingChoice
    setReadingChoice(next)
    sessionStorage.setItem('ube-reading', String(next))
    scrollTo({ top: 0, behavior: 'instant' })
  }
  return <>
    <a className="skip-link" href={home ? '#main-content' : '#profile-content'} onClick={(event) => { if (home) { event.preventDefault(); jump('lookup', true) } }}>{SITE.nav.skipContent}</a>
    <header className="site-header"><Link className="brand" to="/" aria-label={SITE.nav.home} onClick={resetHome}>{SITE.brand}</Link><nav className="header-nav" aria-label={SITE.nav.menuLabel}>{(['story', 'partners'] as const).map((key) => <button key={key} onClick={() => jump(key)}>{SITE.nav[key]}</button>)}</nav><div className="header-actions"><button className="button" onClick={() => jump('lookup', true)}>{SITE.nav.find}<span aria-hidden="true">{SITE.symbols.forward}</span></button><button className="menu-button" aria-expanded={menu} aria-controls="mobile-navigation" onClick={() => setMenu(!menu)}>{menu ? SITE.nav.close : SITE.nav.menu}</button></div></header>
    <nav id="mobile-navigation" className="mobile-navigation" aria-label={SITE.nav.menuLabel} hidden={!menu}>{JOURNEY.slice(2).map((point) => <button key={point.key} onClick={() => jump(point.key)}>{point.label}</button>)}<button disabled={reduced} onClick={() => { toggleReading(); setMenu(false) }}>{reading ? SITE.nav.animated : SITE.nav.reading}</button></nav>
    <Landing hidden={!home} reading={reading} onScan={() => setScanner(true)} openFarm={openFarm} onFind={() => jump('lookup', true)} active={active} setActive={setActive} viewport={viewport} onViewportChange={onViewportChange} />
    <Routes><Route path="/" element={null} /><Route path="/farms/:farmId" element={<Profile key={location.pathname} back={back} onScan={() => setScanner(true)} openFarm={openFarm} />} /><Route path="*" element={<Profile key={location.pathname} back={back} onScan={() => setScanner(true)} openFarm={openFarm} />} /></Routes>
    {home && <><nav className="route-rail" aria-label={SITE.nav.waypointLabel}>{JOURNEY.slice(2).map((point, i) => <button key={point.key} aria-current={!reading && active === i + 2 ? 'step' : undefined} onClick={() => jump(point.key)}><span aria-hidden="true" />{point.label}</button>)}</nav><div className={`journey-tools ${reading ? 'reading-tools' : ''}`}>{!reading && active < 2 && <button onClick={() => jump('lookup')}>{SITE.nav.skip}<span aria-hidden="true">{SITE.symbols.forward}</span></button>}<button onClick={toggleReading} disabled={reduced}>{reading ? (reduced ? SITE.nav.reading : SITE.nav.animated) : SITE.nav.reading}</button></div></>}
    <Scanner open={scanner} onClose={() => setScanner(false)} onFound={openFarm} onManual={() => { setScanner(false); if (home) jump('lookup', true); else setTimeout(() => document.querySelector<HTMLInputElement>('.profile-page input')?.focus(), 0) }} />
  </>
}

applyTheme()
history.scrollRestoration = 'manual'
export default function App() { return <BrowserRouter><FarmApp /></BrowserRouter> }


