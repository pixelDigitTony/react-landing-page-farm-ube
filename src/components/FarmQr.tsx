import { useEffect, useState } from 'react'
import { SITE } from '../constants/site'
import { farmPath } from '../data/farms'

export function FarmQr({ id }: { id: string }) {
  const [qr, setQr] = useState('')
  useEffect(() => {
    let cancelled = false
    import('qrcode').then(async ({ default: QRCode }) => {
      const svg = await QRCode.toString(`${location.origin}${farmPath(id)}`, { type: 'svg', margin: 3, width: 280, errorCorrectionLevel: 'M', color: { dark: SITE.colors.ink, light: SITE.colors.paper } })
      if (!cancelled) setQr(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`)
    }).catch(() => { /* The locally generated ID code remains a usable scanner fallback. */ })
    return () => { cancelled = true }
  }, [id])
  return <div className="qr-card"><img src={qr || `/qr/${id}.svg`} alt={`${SITE.profile.qrAlt} ${id}`} width={168} height={168} /><h2>{SITE.profile.qrTitle}</h2><p>{SITE.profile.qrBody}</p><a className="button secondary" href={qr || `/qr/${id}.svg`} download={`ube-farm-${id}.svg`}>{SITE.profile.download}<span aria-hidden="true">{SITE.symbols.download}</span></a></div>
}
