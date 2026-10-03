import { DEMO_DATA } from '../constants/site'
export type Farm = typeof DEMO_DATA.farms[number]
export type Batch = typeof DEMO_DATA.batches[number]
export type OriginTarget = { kind: 'farm'; id: string } | { kind: 'batch'; id: string }
export type OriginLookupResult = { status: 'found'; target: OriginTarget } | { status: 'invalid' | 'not-found' | 'ambiguous' }
export interface PublicCatalog { farms: readonly { id: string }[]; batches: readonly { id: string }[] }
export const farmRepository = {
  async listPartnerFarms(): Promise<Farm[]> { return DEMO_DATA.farms.map(farm => ({ ...farm })) },
  async getFarmById(id: string): Promise<Farm | null> { return DEMO_DATA.farms.find(farm => farm.id === id.trim()) ?? null },
}
export const batchRepository = {
  async getBatchById(id: string): Promise<Batch | null> { return DEMO_DATA.batches.find(batch => batch.id === id.trim()) ?? null },
  async listFarmBatches(id: string): Promise<Batch[]> { return DEMO_DATA.batches.filter(batch => batch.farmId === id) },
}
export function farmPath(id: string) { return `/farms/${encodeURIComponent(id)}` }
export function batchPath(id: string) { return `/batches/${encodeURIComponent(id)}` }
export function originPath(target: OriginTarget) { return target.kind === 'farm' ? farmPath(target.id) : batchPath(target.id) }
function parseOrigin(input: string, origin: string): { id: string; kind?: OriginTarget['kind'] } | null {
  const value = input.trim()
  if (/^[A-Za-z0-9_-]{1,64}$/.test(value)) return { id: value }
  if (!value.startsWith('/') && !/^https?:\/\//i.test(value)) return null
  try {
    const url = new URL(value, origin)
    if (url.origin !== new URL(origin).origin || !['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null
    const match = /^\/(farms|batches)\/([A-Za-z0-9_-]{1,64})\/?$/.exec(url.pathname)
    return match ? { id: match[2], kind: match[1] === 'farms' ? 'farm' : 'batch' } : null
  } catch { return null }
}
export function resolveOrigin(input: string, origin: string, catalog: PublicCatalog = DEMO_DATA): OriginLookupResult {
  const parsed = parseOrigin(input, origin)
  if (!parsed) return { status: 'invalid' }
  const farms = parsed.kind !== 'batch' && catalog.farms.some(farm => farm.id === parsed.id)
  const batches = parsed.kind !== 'farm' && catalog.batches.some(batch => batch.id === parsed.id)
  if (farms && batches) return { status: 'ambiguous' }
  if (farms || batches) return { status: 'found', target: { kind: farms ? 'farm' : 'batch', id: parsed.id } }
  return { status: 'not-found' }
}
export const originRepository = { async resolve(input: string, origin: string): Promise<OriginLookupResult> { return resolveOrigin(input, origin) } }
export function resolveFarmId(input: string, origin: string): string | null {
  const parsed = parseOrigin(input, origin)
  return parsed && parsed.kind !== 'batch' ? parsed.id : null
}
