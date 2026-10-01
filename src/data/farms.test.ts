import { describe, expect, it } from 'vitest'
import { farmRepository, resolveFarmId } from './farms'

describe('Public farm lookup boundary', () => {
  const origin = 'https://farm.example'
  it('preserves leading zeroes and trims printed IDs', () => { expect(resolveFarmId(' 0001 ', origin)).toBe('0001') })
  it('accepts its canonical profile URL', () => { expect(resolveFarmId(`${origin}/farms/0002`, origin)).toBe('0002') })
  it.each(['https://other.example/farms/0001', 'javascript:alert(1)', `${origin}/admin/0001`, `${origin}/farms/a/b`, 'bad id', '', `${origin}/farms/%2F`])('rejects unrelated or malformed payload %s', (value) => { expect(resolveFarmId(value, origin)).toBeNull() })
  it('returns a matching sample or null without making up a farm', async () => {
    expect((await farmRepository.getFarmById('0001'))?.id).toBe('0001')
    expect(await farmRepository.getFarmById('9999')).toBeNull()
  })
})
