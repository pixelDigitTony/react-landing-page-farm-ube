import { SITE } from '../constants/site'

export interface Farm {
  id: string
  name: string
  location: string
  story: string
  practices: string
  contact?: string
}

const catalog: Farm[] = SITE.farms.map(farm => ({ ...farm, story: SITE.farmStory, practices: SITE.farmPractices }))

/** Frontend-only static catalog. No network requests or backend are required. */
export const farmRepository = {
  async listPartnerFarms(): Promise<Farm[]> { return catalog.map(farm => ({ ...farm })) },
  async getFarmById(id: string): Promise<Farm | null> {
    const farm = catalog.find(item => item.id === id.trim())
    return farm ? { ...farm } : null
  },
}

export function resolveFarmId(input: string, origin: string): string | null {
  const value = input.trim()
  if (/^[A-Za-z0-9_-]{1,64}$/.test(value)) return value
  try {
    const url = new URL(value, origin)
    if (url.origin !== origin || !['http:', 'https:'].includes(url.protocol)) return null
    const match = /^\/farms\/([A-Za-z0-9_-]{1,64})\/?$/.exec(url.pathname)
    return match ? match[1] : null
  } catch { return null }
}

export function farmPath(id: string) { return `/farms/${encodeURIComponent(id)}` }
