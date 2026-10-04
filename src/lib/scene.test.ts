import { describe, expect, it } from 'vitest'
import { ASSETS, THEME, layoutForWidth } from '../constants/site'
import { sceneGeometry, sceneHeroMinimum } from './scene'

describe('Connected photographic composition', () => {
  it.each([[1440, 1414], [1086, 1060], [834, 1480], [390, 1800], [360, 1800]])('keeps uniform scale and aligns soil at %ipx', (width, ground) => {
    const scene = sceneGeometry(width, ground, 280, layoutForWidth(width))
    expect(scene.width / scene.height).toBeCloseTo(ASSETS.master.width / ASSETS.master.height)
    expect(scene.y + scene.height * ASSETS.anchors.soilLine).toBeCloseTo(ground)
    expect(scene.y + scene.height).toBeCloseTo(ground + scene.rootsHeight)
    expect(scene.x).toBeLessThanOrEqual(0)
    expect(scene.x + scene.width).toBeGreaterThanOrEqual(width)
  })
  it('keeps the tablet lookup within the measured reading rectangle', () => {
    const scene = sceneGeometry(834, 1480, 280, 'tablet')
    expect(scene.lookup.x).toBeGreaterThanOrEqual(scene.safe.x)
    expect(scene.lookup.x + scene.lookup.width).toBeLessThanOrEqual(scene.safe.x + scene.safe.width)
    expect(scene.lookup.y).toBeGreaterThanOrEqual(scene.safe.y)
    expect(scene.lookup.y + 280).toBeLessThanOrEqual(scene.safe.y + scene.safe.height)
  })
  it.each([[1920, 708], [2551, 844], [3440, 1037]])('keeps the attached desktop form below the header at %ipx', (width, farmsHeight) => {
    const formHeight = 310
    const heroHeight = Math.max(900, sceneHeroMinimum(width, farmsHeight, formHeight, 'desktop'))
    const scene = sceneGeometry(width, heroHeight + farmsHeight, formHeight, 'desktop')
    expect(scene.lookup.y).toBeGreaterThanOrEqual(THEME.layout.lookupDesktopTop)
    expect(scene.lookup.y).toBeGreaterThanOrEqual(scene.safe.y)
    expect(scene.lookup.y + formHeight).toBeLessThanOrEqual(scene.safe.y + scene.safe.height)
    expect(scene.y + scene.height * ASSETS.anchors.soilLine).toBeCloseTo(heroHeight + farmsHeight)
  })
  it('keeps the existing standard desktop hero and separate mobile layout', () => {
    expect(sceneHeroMinimum(1440, 610, 310, 'desktop')).toBeLessThan(798)
    expect(sceneHeroMinimum(390, 610, 310, 'phone')).toBe(0)
  })
})
