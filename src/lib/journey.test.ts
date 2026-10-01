import { describe, expect, it } from 'vitest'
import { PLANT, plantCamera, pointAt, sceneValues, totalTravel, waypointTravel } from './journey'

describe('Reversible plant timeline', () => {
  it('gives the growth peak the longest travel span and closes at leadership', () => {
    expect(totalTravel).toBeCloseTo(11)
    expect(pointAt(waypointTravel('lookup'))).toBe(2)
    expect(pointAt(totalTravel)).toBe(7)
  })
  it('settles the root, reveals the entire vine, and brings the camera back to earth', () => {
    expect(sceneValues(0).drop).toBe(0)
    expect(sceneValues(.6).drop).toBe(1)
    expect(sceneValues(3.2).growth).toBe(1)
    expect(sceneValues(3.2).camera).toBe(1)
    expect(sceneValues(11).camera).toBe(0)
    expect(sceneValues(11).board).toBe(1)
  })
  it('travels from the shared soil anchor to the tip and holds each useful leaf', () => {
    const opening = plantCamera(.6)
    expect(PLANT.base * opening.scale + opening.y).toBeCloseTo(85)
    expect(plantCamera(3.2)).toEqual({ scale: 1, y: 20, rise: 1 })
    for (const [index, key] of ['lookup', 'story', 'growing', 'harvest', 'partners', 'leadership'].entries()) {
      const camera = plantCamera(waypointTravel(key))
      expect(camera.scale).toBe(1)
      expect(PLANT.leaves[index] + camera.y).toBeCloseTo(20)
    }
    expect(plantCamera(1.975).scale).toBeLessThan(.23)
    expect(plantCamera(11).y + PLANT.base).toBe(60)
  })
})
