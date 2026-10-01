import { JOURNEY } from '../constants/site'

export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))
export const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t) }
export const totalTravel = JOURNEY.reduce((total, point) => total + point.weight, 0)
export const starts = JOURNEY.map((_, index) => JOURNEY.slice(0, index).reduce((total, point) => total + point.weight, 0))
export function pointAt(travel: number) {
  const index = starts.findLastIndex(start => travel >= start)
  return Math.max(0, index)
}
export function waypointTravel(key: string) {
  const index = JOURNEY.findIndex(point => point.key === key)
  return index < 0 ? 0 : starts[index] + (key === 'leadership' ? 1 : Math.min(0.3, JOURNEY[index].weight * 0.25))
}

export function sceneValues(travel: number) {
  const growth = smooth((travel - 0.52) / 2.3)
  const ascent = smooth((travel - 1.1) / 2.1)
  const descent = smooth((travel - 4.1) / 5.5)
  return {
    drop: smooth(travel / 0.45),
    growth,
    sprout: smooth((travel - 0.55) / 0.35),
    camera: ascent * (1 - descent),
    root: Math.max(1 - smooth((travel - 0.6) / 0.48), smooth((travel - 8.95) / 0.45) * (1 - smooth((travel - 9.4) / 0.7))),
    board: smooth((travel - 9.4) / 0.95),
    earth: 1 - smooth((travel - 1.8) / 0.7) + smooth((travel - 8.7) / 0.7),
  }
}

// Every botanical object uses these coordinates, including the camera and soil.
// Values are viewport heights; resize does not change the narrative position.
export const PLANT = { base: 610, leaves: [0, 115, 230, 345, 460, 570], height: 650 } as const

export function plantCamera(travel: number) {
  if (travel < starts[2]) {
    const rise = smooth((travel - starts[1] - .15) / (JOURNEY[1].weight - .15))
    const scale = 1 - Math.sin(rise * Math.PI) * .78
    const focus = PLANT.base * (1 - rise)
    const tip = Math.max(20, 85 - rise * PLANT.base * scale)
    return { scale, y: tip - focus * scale, rise }
  }
  const index = Math.min(pointAt(travel) - 2, PLANT.leaves.length - 1)
  const local = (travel - starts[index + 2]) / JOURNEY[index + 2].weight
  const move = smooth((local - .66) / .34)
  const focus = PLANT.leaves[index] + ((PLANT.leaves[index + 1] ?? PLANT.leaves[index]) - PLANT.leaves[index]) * move
  return { scale: 1, y: 20 - focus, rise: 1 }
}
