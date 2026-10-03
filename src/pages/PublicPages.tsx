import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ASSETS, DEMO_DATA, SITE } from '../constants/site'
import { batchPath, batchRepository, farmPath, farmRepository } from '../data/farms'
import type { OriginTarget } from '../data/farms'
import { Lookup } from '../components/Lookup'
import { OriginQr } from '../components/FarmQr'
import { Arrow, FarmCard, Photo } from '../components/UI'

type Actions = { onFound: (target: OriginTarget) => void; onScan: () => void }
function useRecord<T>(id: string, load: (id: string) => Promise<T | null>) {
  const [state, setState] = useState<{ id: string; attempt: number; record: T | null; status: 'loading' | 'ready' | 'missing' | 'failed' }>({ id: '', attempt: -1, record: null, status: 'loading' })
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    let alive = true
    load(id).then(record => { if (alive) setState({ id, attempt: retry, record, status: record ? 'ready' : 'missing' }) }).catch(() => { if (alive) setState({ id, attempt: retry, record: null, status: 'failed' }) })
    return () => { alive = false }
  }, [id, load, retry])
  useEffect(() => { if (state.status !== 'loading') document.querySelector<HTMLElement>('.detail-page h1')?.focus({ preventScroll: true }) }, [state.status, id])
  const current = state.id === id && state.attempt === retry ? state : { record: null, status: 'loading' as const }
  return { ...current, retry: () => setRetry(value => value + 1) }
}
function BackLink() {
  const navigate = useNavigate()
  const location = useLocation()
  return <Link className="back-link" to="/" onClick={event => { if (location.state?.fromLanding && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) { event.preventDefault(); navigate(-1) } }}><span aria-hidden="true">{SITE.symbols.back}</span>{SITE.common.back}</Link>
}
function Recovery({ kind, status, retry, ...actions }: Actions & { kind: 'farm' | 'batch' | 'page'; status: string; retry?: () => void }) {
  const title = status === 'loading' ? SITE.profile.loading : status === 'failed' ? SITE.profile.failed : kind === 'farm' ? SITE.profile.missingTitle : kind === 'batch' ? SITE.batch.missingTitle : SITE.common.unknownTitle
  const body = kind === 'farm' ? SITE.profile.missingBody : kind === 'batch' ? SITE.batch.missingBody : SITE.common.unknownBody
  return <main id="main-content" className="detail-page recovery"><BackLink /><h1 tabIndex={-1}>{title}</h1>{status !== 'loading' && <><p>{body}</p><Lookup {...actions} /><div className="recovery-actions"><Link className="text-link" to="/farms">{SITE.common.browse}<Arrow /></Link>{status === 'failed' && <button className="button" onClick={retry}>{SITE.profile.retry}</button>}</div></>}</main>
}
export function FarmDirectory({ onFarm }: { onFarm: (id: string, anchor: string) => void }) {
  const [query, setQuery] = useState('')
  const farms = DEMO_DATA.farms.filter(farm => [farm.name, farm.location, ...farm.produce].join(' ').toLowerCase().includes(query.trim().toLowerCase()))
  return <main id="main-content" className="detail-page directory-page"><BackLink /><p className="eyebrow">{SITE.farms.sample}</p><h1>{SITE.farms.directory}</h1><p className="detail-lead">{SITE.farms.directoryBody}</p><div className="directory-search"><label htmlFor="farm-search">{SITE.farms.search}</label><input id="farm-search" type="search" value={query} placeholder={SITE.farms.placeholder} onChange={event => setQuery(event.target.value)} /><span aria-live="polite">{farms.length} {SITE.farms.count}</span></div><div className="directory-grid">{farms.map(farm => <FarmCard key={farm.id} farm={farm} onOpen={onFarm} />)}</div>{!farms.length && <div className="empty-state"><p>{SITE.farms.empty}</p><button className="button secondary" onClick={() => setQuery('')}>{SITE.farms.clear}</button></div>}<p className="detail-disclosure">{SITE.common.sample}</p></main>
}
export function FarmProfile(actions: Actions) {
  const { farmId = '' } = useParams()
  const state = useRecord(farmId, farmRepository.getFarmById)
  const farm = state.record
  if (!farm) return <Recovery kind="farm" status={state.status} retry={state.retry} {...actions} />
  const batches = DEMO_DATA.batches.filter(batch => batch.farmId === farm.id)
  return <main id="main-content" className="detail-page profile-page"><BackLink /><div className="detail-hero"><div><p className="eyebrow">{SITE.profile.sample}{SITE.symbols.separator}{farm.id}</p><h1 tabIndex={-1}>{farm.name}</h1><p className="detail-lead">{farm.location}</p><p className="muted">{SITE.profile.disclosure}</p></div><figure><Photo asset={farm.image} alt={farm.imageAlt} eager /><figcaption>{SITE.profile.imageNote}</figcaption></figure></div><div className="detail-grid"><div className="detail-stories"><section><h2>{SITE.profile.story}</h2><p>{farm.story}</p></section><section><h2>{SITE.profile.practices}</h2><p>{farm.practices}</p></section><section><h2>{SITE.profile.produce}</h2><p>{farm.produce.join(SITE.symbols.separator)}</p></section><section><h2>{SITE.profile.batches}</h2>{batches.length ? batches.map(batch => <Link className="batch-link text-link" to={batchPath(batch.id)} key={batch.id}>{batch.id}<Arrow /></Link>) : <p>{SITE.profile.noBatches}</p>}</section></div><OriginQr target={{ kind: 'farm', id: farm.id }} /></div></main>
}
export function BatchSummary(actions: Actions) {
  const { batchId = '' } = useParams()
  const state = useRecord(batchId, batchRepository.getBatchById)
  const batch = state.record
  if (!batch) return <Recovery kind="batch" status={state.status} retry={state.retry} {...actions} />
  const farm = DEMO_DATA.farms.find(farm => farm.id === batch.farmId)!
  const date = new Intl.DateTimeFormat(SITE.format.locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${batch.harvestDate}T00:00:00Z`))
  const stages = [batch.growingSummary, date, batch.processor, batch.recipient]
  return <main id="main-content" className="detail-page batch-page"><BackLink /><p className="eyebrow">{SITE.batch.sample}</p><h1 tabIndex={-1}>{SITE.batch.title}</h1><p className="batch-id">{batch.id}</p><p className="detail-lead">{SITE.batch.disclosure}</p><div className="detail-grid"><div><dl className="origin-details"><div><dt>{SITE.batch.id}</dt><dd>{batch.id}</dd></div><div><dt>{SITE.batch.produce}</dt><dd>{batch.produce}</dd></div><div><dt>{SITE.batch.farm}</dt><dd><Link className="text-link" to={farmPath(farm.id)}>{farm.name}<Arrow /></Link></dd></div><div><dt>{SITE.batch.growing}</dt><dd>{batch.growingSummary}</dd></div><div><dt>{SITE.batch.harvest}</dt><dd><time dateTime={batch.harvestDate}>{date}</time></dd></div><div><dt>{SITE.batch.processor}</dt><dd>{batch.processor}</dd></div><div><dt>{SITE.batch.recipient}</dt><dd>{batch.recipient}</dd></div></dl><section className="batch-history"><h2>{SITE.batch.journey}</h2><ol>{SITE.batch.stages.map((stage, index) => <li key={stage}><h3>{stage}</h3><p>{stages[index]}</p></li>)}</ol></section></div><OriginQr target={{ kind: 'batch', id: batch.id }} /></div></main>
}
export function CooperativePage() {
  return <main id="main-content" className="detail-page cooperative-page"><BackLink /><div className="detail-hero"><div><p className="eyebrow">{SITE.brand}</p><h1>{SITE.cooperative.title}</h1><p className="detail-lead">{SITE.cooperative.intro}</p><p className="muted">{SITE.cooperative.sample}</p></div><Photo asset={ASSETS.farmTwo} alt={DEMO_DATA.farms[1].imageAlt} eager /></div><div className="cooperative-story"><section><h2>{SITE.cooperative.ecosystemTitle}</h2><p>{SITE.cooperative.ecosystemBody}</p></section><section><h2>{SITE.cooperative.leadershipTitle}</h2><h3>{SITE.cooperative.name}</h3><p>{SITE.cooperative.role}</p></section><Link className="button" to="/farms">{SITE.cooperative.action}<Arrow /></Link></div></main>
}
export function MissingPage(actions: Actions) { return <Recovery kind="page" status="missing" {...actions} /> }
