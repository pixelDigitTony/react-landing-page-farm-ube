import { ASSETS, THEME } from '../constants/site'
import type { Layout } from '../constants/site'

/** Reserve enough hero space for the leaf form when wide artwork grows. */
export function sceneHeroMinimum(width: number, farmsHeight: number, formHeight: number, layout: Layout) {
  if (layout !== 'desktop') return 0
  const withoutHero = sceneGeometry(width, farmsHeight, formHeight, layout)
  return Math.max(0, Math.ceil(THEME.layout.lookupDesktopTop - withoutHero.lookup.y))
}

/** One uniform transform for every physically connected photographic part. */
export function sceneGeometry(width: number, ground: number, formHeight: number, layout: Layout) {
  const { master, anchors } = ASSETS
  const phone = layout === 'phone' || layout === 'compact'
  const minimumRoots = phone ? THEME.layout.phoneRootsMin : THEME.layout.rootsMin
  const scale = Math.max(width / master.width, minimumRoots / (master.height * (1 - anchors.soilLine)))
  const sceneWidth = master.width * scale
  const sceneHeight = master.height * scale
  const center = anchors.lookup.x + anchors.lookup.width / 2
  const proposedX = phone
    ? width * anchors.alignment.phoneCrown - sceneWidth * anchors.rootCrownX
    : width * (layout === 'tablet' ? anchors.alignment.tabletLookup : anchors.alignment.desktopLookup) - sceneWidth * center
  const x = Math.max(width - sceneWidth, Math.min(0, proposedX))
  const y = ground - sceneHeight * anchors.soilLine
  const safe = { x: x + sceneWidth * anchors.lookup.x, y: y + sceneHeight * anchors.lookup.y, width: sceneWidth * anchors.lookup.width, height: sceneHeight * anchors.lookup.height }
  const lookupWidth = Math.min(THEME.layout.lookupMax, safe.width)
  return {
    x, y, width: sceneWidth, height: sceneHeight,
    rootsHeight: sceneHeight * (1 - anchors.soilLine),
    ground, fade: y > 0 ? THEME.layout.sceneFade : 0,
    safe,
    lookup: { x: safe.x + (safe.width - lookupWidth) / 2, y: safe.y + Math.max(0, (safe.height - formHeight) / 2), width: lookupWidth },
  }
}
