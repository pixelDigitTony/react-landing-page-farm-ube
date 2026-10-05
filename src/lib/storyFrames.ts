export function frameIndex(progress: number, count: number) {
  return Math.round(Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0)) * Math.max(0, count - 1))
}
export function frameWindow(target: number, count: number, capacity: number, direction = 1) {
  const result = [target]
  for (let distance = 1; result.length < Math.min(capacity, count); distance++) {
    for (const index of [target + distance * direction, target - distance * direction]) {
      if (index >= 0 && index < count && result.length < capacity) result.push(index)
    }
  }
  return result
}
export function nearestFrame(target: number, available: Iterable<number>) {
  let nearest: number | undefined
  for (const index of available) if (nearest === undefined || Math.abs(index - target) < Math.abs(nearest - target)) nearest = index
  return nearest
}
