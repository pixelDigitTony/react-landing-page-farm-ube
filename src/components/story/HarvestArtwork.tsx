import { useLayoutEffect, useRef } from 'react'
import { ASSETS } from '../../constants/site'

// Keep a complete photograph underneath the cutout until decoding succeeds.
// The fallback also works on portrait and reduced-motion layouts.
export function HarvestArtwork({ phone }: { phone: boolean }) {
  const root = useRef<HTMLDivElement>(null)
  const source = phone ? ASSETS.story.phone : ASSETS.story.desktop
  useLayoutEffect(() => {
    const element = root.current!, image = element.querySelector<HTMLImageElement>('.harvest-yam')!
    let active = true
    element.dataset.decoded = 'false'
    void image.decode().then(() => { if (active) element.dataset.decoded = 'true' }).catch(() => { /* The completed photograph remains visible. */ })
    return () => { active = false }
  }, [source])
  return <div className="harvest-artwork" ref={root}>
    <img className="harvest-poster" src={source.end} width={source.width} height={source.height} alt="" />
    <img className="harvest-yam" src={source.subject} width={source.subjectWidth} height={source.subjectHeight} alt="" />
  </div>
}
