import { useEffect, useId, useRef, useState } from 'react'
import { SITE } from '../constants/site'
import { originRepository } from '../data/farms'
import type { OriginTarget } from '../data/farms'
import { ScanIcon, SearchIcon } from './UI'

export function Lookup({ onFound, onScan, heading = false }: { onFound: (target: OriginTarget) => void; onScan: () => void; heading?: boolean }) {
  const id = useId()
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const sequence = useRef(0)
  useEffect(() => () => { sequence.current++ }, [])
  async function find() {
    const current = ++sequence.current
    if (!value.trim()) { setError(SITE.lookup.empty); return }
    setBusy(true); setError('')
    try {
      const result = await originRepository.resolve(value, location.origin)
      if (current !== sequence.current) return
      if (result.status === 'found') onFound(result.target)
      else setError(result.status === 'invalid' ? SITE.lookup.invalid : result.status === 'ambiguous' ? SITE.lookup.ambiguous : SITE.lookup.notFound)
    } catch { if (current === sequence.current) setError(SITE.lookup.failed) }
    finally { if (current === sequence.current) setBusy(false) }
  }
  return <form className="origin-lookup" noValidate onSubmit={event => { event.preventDefault(); void find() }}>
    {heading && <h2>{SITE.lookup.title}</h2>}
    <label htmlFor={id}>{SITE.lookup.label}</label>
    <input id={id} name="origin-id" autoComplete="off" spellCheck={false} enterKeyHint="go" placeholder={SITE.lookup.placeholder} value={value} aria-invalid={!!error} aria-describedby={`${id}-help`} onChange={event => { sequence.current++; setBusy(false); setValue(event.target.value); setError('') }} />
    <div className="lookup-actions"><button className="button" type="submit" disabled={busy}>{busy ? SITE.lookup.loading : SITE.lookup.submit}<SearchIcon /></button><button className="button secondary" type="button" onClick={onScan}>{SITE.lookup.scan}<ScanIcon /></button></div>
    <p id={`${id}-help`} className={`lookup-feedback ${error ? 'error' : ''}`} aria-live="polite">{error || SITE.lookup.example}</p>
  </form>
}
