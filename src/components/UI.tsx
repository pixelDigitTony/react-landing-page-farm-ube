import { Link } from 'react-router-dom'
import { MOTION, SITE } from '../constants/site'
import { farmPath } from '../data/farms'
import type { Farm } from '../data/farms'
import { imageSources } from '../lib/images'
import type { ImageAsset } from '../lib/images'

export function Arrow() { return <span className="arrow" aria-hidden="true">{SITE.symbols.forward}</span> }
export function LeafMark() { return <svg width="25" height="34" viewBox="0 0 25 34" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true"><path d="M12.5 3C-2 12 3 26 12.5 31C22 26 27 12 12.5 3ZM12.5 3V31M12.5 13L6 8M12.5 20L4 15M12.5 26L5 23M12.5 13L19 8M12.5 20L21 15M12.5 26L20 23" /></svg> }
export function ScanIcon() { return <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M7 2H2V7M13 2H18V7M18 13V18H13M7 18H2V13M7 7H9V9H7ZM12 7H14V9H12ZM7 12H9V14H7ZM12 12H14V14H12Z" /></svg> }
export function SearchIcon() { return <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="8" cy="8" r="5.5" /><path d="M12 12L18 18" /></svg> }
export function Photo({ asset, alt = '', className = '', eager = false }: { asset: ImageAsset; alt?: string; className?: string; eager?: boolean }) {
  return <img className={className} src={asset.src} srcSet={imageSources(asset)} sizes={`(max-width: ${MOTION.phone - 1}px) 100vw, 50vw`} alt={alt} width={asset.width} height={asset.height} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} decoding="async" />
}
export function FarmCard({ farm, onOpen }: { farm: Farm; onOpen: (id: string, anchor: string) => void }) {
  return <Link id={`farm-${farm.id}`} className="farm-card" to={farmPath(farm.id)} onClick={event => { if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return; event.preventDefault(); onOpen(farm.id, `farm-${farm.id}`) }}><div className="farm-card-photo"><Photo asset={farm.image} alt={farm.imageAlt} /></div><div className="farm-card-caption"><div><h3>{farm.name}</h3><p>{farm.produce.join(SITE.symbols.separator)}</p></div><span className="farm-card-action">{SITE.farms.action}<Arrow /></span></div></Link>
}
