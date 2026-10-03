import { useEffect, useState } from 'react'
import { SITE, THEME } from '../constants/site'
import { originPath } from '../data/farms'
import type { OriginTarget } from '../data/farms'

export function OriginQr({ target }: { target: OriginTarget }) {
  const { kind, id } = target
  const [art, setArt] = useState({ svg: '', png: '', failed: false })
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    let cancelled = false
    import('qrcode').then(async ({ default: QRCode }) => {
      const value = `${SITE.links.publicOrigin || location.origin}${originPath({ kind, id })}`
      const options = { margin: 4, width: 320, errorCorrectionLevel: 'M' as const, color: { dark: THEME.colors.surfaceDeep, light: THEME.colors.buttonFill } }
      const [svg, png] = await Promise.all([QRCode.toString(value, { ...options, type: 'svg' }), QRCode.toDataURL(value, options)])
      if (!cancelled) setArt({ svg: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, png, failed: false })
    }).catch(() => { if (!cancelled) setArt({ svg: '', png: '', failed: true }) })
    return () => { cancelled = true }
  }, [id, kind, retry])
  const farm = target.kind === 'farm'
  return <aside className="qr-card"><h2>{farm ? SITE.qr.farmTitle : SITE.qr.batchTitle}</h2><p>{farm ? SITE.qr.farmBody : SITE.qr.batchBody}</p>{art.svg && <img src={art.svg} width={200} height={200} alt={`${SITE.qr.alt} ${target.id}`} />}{art.failed ? <><p role="status">{SITE.qr.failed}</p><button className="button" onClick={() => setRetry(retry + 1)}>{SITE.qr.retry}</button></> : <div className="qr-actions">{(['svg', 'png'] as const).map(type => art[type] && <a key={type} className="button secondary" href={art[type]} download={`${SITE.format.qrPrefix}-${target.kind}-${target.id}.${type}`}>{SITE.qr[type]}</a>)}</div>}</aside>
}
