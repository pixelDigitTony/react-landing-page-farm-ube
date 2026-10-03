import { describe, expect, it } from 'vitest'
import { farmRepository, resolveFarmId, resolveOrigin, originPath } from './farms'

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

describe('Unified origin lookup', () => {
  const origin = 'https://farm.example'
  it('resolves farm and batch IDs to distinct public routes', () => {
    expect(resolveOrigin(' 0001 ', origin)).toEqual({ status: 'found', target: { kind: 'farm', id: '0001' } })
    expect(resolveOrigin('SAMPLE-UBE-001', origin)).toEqual({ status: 'found', target: { kind: 'batch', id: 'SAMPLE-UBE-001' } })
    expect(originPath({ kind: 'batch', id: 'SAMPLE-UBE-001' })).toBe('/batches/SAMPLE-UBE-001')
  })
  it.each(['/farms/0001', `${origin}/farms/0001`])('accepts canonical farm destination %s', value => {
    expect(resolveOrigin(value, origin)).toEqual({ status: 'found', target: { kind: 'farm', id: '0001' } })
  })
  it.each(['/batches/SAMPLE-UBE-001', `${origin}/batches/SAMPLE-UBE-001`])('accepts canonical batch destination %s', value => {
    expect(resolveOrigin(value, origin)).toEqual({ status: 'found', target: { kind: 'batch', id: 'SAMPLE-UBE-001' } })
  })
  it.each(['https://evil.example/batches/SAMPLE-UBE-001', 'javascript:alert(1)', '//evil.example/farms/0001', '/farms/%2F', '/members/0001', 'bad id', '', 'https://user:pass@farm.example/farms/0001'])('rejects unsafe payload %s', value => expect(resolveOrigin(value, origin)).toEqual({ status: 'invalid' }))
  it('does not invent unknown records or coerce IDs', () => {
    expect(resolveOrigin('1', origin).status).toBe('not-found')
    expect(resolveOrigin('sample-ube-001', origin).status).toBe('not-found')
    expect(resolveOrigin('/batches/0001', origin).status).toBe('not-found')
  })
  it('requires a qualified URL when IDs collide', () => {
    const catalog = { farms: [{ id: 'same' }], batches: [{ id: 'same' }] }
    expect(resolveOrigin('same', origin, catalog).status).toBe('ambiguous')
    expect(resolveOrigin('/farms/same', origin, catalog)).toEqual({ status: 'found', target: { kind: 'farm', id: 'same' } })
    expect(resolveOrigin('/batches/same', origin, catalog)).toEqual({ status: 'found', target: { kind: 'batch', id: 'same' } })
  })
})
