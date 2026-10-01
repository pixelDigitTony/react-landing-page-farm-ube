import { useId, useRef, useState } from 'react'
import { SITE } from '../constants/site'
import { farmRepository, resolveFarmId } from '../data/farms'

export function Lookup({ onFound, onScan }: { onFound: (id: string) => void; onScan: () => void }) {
  const id = useId()
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const sequence = useRef(0)
  async function find() {
    const current = ++sequence.current
    const farmId = resolveFarmId(value, location.origin)
    if (!value.trim() || !farmId) { setError(!value.trim() ? SITE.lookup.empty : SITE.lookup.invalid); return }
    setBusy(true); setError('')
    try {
      const farm = await farmRepository.getFarmById(farmId)
      if (current !== sequence.current) return
      if (farm) onFound(farm.id)
      else setError(SITE.lookup.notFound)
    } catch { if (current === sequence.current) setError(SITE.lookup.failed) }
    finally { if (current === sequence.current) setBusy(false) }
  }
  return <form className="farm-lookup" noValidate onSubmit={(event) => { event.preventDefault(); void find() }}>
    <label htmlFor={id}>{SITE.lookup.label}</label>
    <div className="lookup-row"><input id={id} name="farm-id" autoComplete="off" spellCheck={false} enterKeyHint="go" placeholder={SITE.lookup.placeholder} value={value} aria-invalid={!!error} aria-describedby={`${id}-help`} onChange={(event) => { sequence.current++; setBusy(false); setValue(event.target.value); setError('') }} /><button className="button" type="submit" disabled={busy}>{busy ? SITE.lookup.loading : SITE.lookup.submit}<span aria-hidden="true">{SITE.symbols.forward}</span></button></div>
    <div id={`${id}-help`} className={`lookup-feedback ${error ? 'error' : ''}`} aria-live="polite">{error || <button type="button" onClick={() => { setValue(SITE.lookup.exampleId); setError('') }}>{SITE.lookup.example}</button>}</div>
    <button className="button secondary scan-button" type="button" onClick={onScan}><svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" aria-hidden="true"><path d="M7 2H2V7M13 2H18V7M18 13V18H13M7 18H2V13M6 6H9V9H6ZM12 6H14V8H12ZM6 12H8V14H6ZM12 11V14H15V11Z" /></svg>{SITE.lookup.scan}</button>
  </form>
}

