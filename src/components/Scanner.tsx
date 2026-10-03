import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { IScannerControls } from '@zxing/browser'
import { SITE } from '../constants/site'
import { originRepository } from '../data/farms'
import type { OriginTarget } from '../data/farms'

type Status = 'starting' | 'ready' | 'denied' | 'unavailable' | 'secure' | 'error'

export function Scanner({ open, onClose, onFound, onManual }: { open: boolean; onClose: () => void; onFound: (target: OriginTarget) => void; onManual: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const controls = useRef<IScannerControls | null>(null)
  const stream = useRef<MediaStream | null>(null)
  const callbacks = useRef({ onClose, onFound, onManual })
  useLayoutEffect(() => { callbacks.current = { onClose, onFound, onManual } }, [onClose, onFound, onManual])
  const [status, setStatus] = useState<Status>('starting')
  const [message, setMessage] = useState('')
  const [attempt, setAttempt] = useState(0)
  function stop() {
    controls.current?.stop(); controls.current = null
    stream.current?.getTracks().forEach((track) => track.stop()); stream.current = null
    if (video.current) video.current.srcObject = null
  }
  useEffect(() => {
    if (!open) { stop(); dialog.current?.close(); return }
    const trigger = document.activeElement as HTMLElement | null
    const modal = dialog.current
    modal?.showModal()
    return () => { modal?.close(); trigger?.focus({ preventScroll: true }) }
  }, [open])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    let checking = false
    let lastCode = ''
    async function start() {
      await Promise.resolve()
      if (cancelled) return
      setStatus('starting'); setMessage('')
      if (!window.isSecureContext) { setStatus('secure'); return }
      if (!navigator.mediaDevices?.getUserMedia) { setStatus('unavailable'); return }
      try {
        const { BrowserQRCodeReader } = await import('@zxing/browser')
        if (cancelled) return
        const media = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' } } })
        if (cancelled) { media.getTracks().forEach((track) => track.stop()); return }
        stream.current = media
        const reader = new BrowserQRCodeReader(undefined, { delayBetweenScanAttempts: 200 })
        const scanner = await reader.decodeFromStream(media, video.current!, async (result) => {
          if (!result || cancelled || checking || result.getText() === lastCode) return
          checking = true
          lastCode = result.getText()
          try {
            const result = await originRepository.resolve(lastCode, location.origin)
            if (cancelled) return
            if (result.status === 'found') { cancelled = true; stop(); callbacks.current.onFound(result.target) }
            else setMessage(result.status === 'invalid' ? SITE.scanner.invalid : result.status === 'ambiguous' ? SITE.lookup.ambiguous : SITE.scanner.missing)
          } catch { if (!cancelled) setMessage(SITE.lookup.failed) }
          finally { checking = false }
        })
        if (cancelled) { scanner.stop(); media.getTracks().forEach((track) => track.stop()); return }
        controls.current = scanner
        setStatus('ready')
      } catch (error) {
        if (cancelled) return
        stop()
        const name = error instanceof Error ? error.name : ''
        setStatus(name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : name === 'NotFoundError' || name === 'DevicesNotFoundError' ? 'unavailable' : 'error')
      }
    }
    void start()
    return () => { cancelled = true; stop() }
  }, [open, attempt])

  const failed = !['starting', 'ready'].includes(status)
  const title = status === 'denied' ? SITE.scanner.deniedTitle : status === 'unavailable' ? SITE.scanner.unavailableTitle : status === 'secure' ? SITE.scanner.secureTitle : SITE.scanner.errorTitle
  const body = status === 'denied' ? SITE.scanner.deniedBody : status === 'unavailable' ? SITE.scanner.unavailableBody : status === 'secure' ? SITE.scanner.secureBody : SITE.scanner.errorBody
  return <dialog ref={dialog} className="scanner-dialog" aria-labelledby="scanner-title" onCancel={(event) => { event.preventDefault(); stop(); onClose() }} onClick={(event) => { if (event.target === dialog.current) { stop(); onClose() } }}>
    <div className="scanner-panel"><button className="dialog-close" aria-label={SITE.scanner.close} onClick={() => { stop(); onClose() }}>{SITE.symbols.close}</button><h2 id="scanner-title">{SITE.scanner.title}</h2><p>{SITE.scanner.body}</p>
      <div className={`camera-frame ${failed ? 'camera-failed' : ''}`}><video ref={video} autoPlay muted playsInline aria-label={SITE.scanner.preview} hidden={failed} /><div className="camera-guide" hidden={failed} aria-hidden="true" />{failed && <div><h3>{title}</h3><p>{body}</p></div>}</div>
      <p className={`scanner-status ${message ? 'error' : ''}`} role="status">{message || (status === 'starting' ? SITE.scanner.starting : status === 'ready' ? SITE.scanner.ready : '')}</p>
      <div className="scanner-actions">{(failed || message) && <button className="button" onClick={() => { stop(); setAttempt(attempt + 1) }}>{SITE.scanner.retry}</button>}<button className="button secondary" onClick={() => { stop(); callbacks.current.onManual() }}>{SITE.scanner.manual}</button></div>
    </div>
  </dialog>
}

