import { describe, expect, it } from 'vitest'
import { frameIndex, frameWindow, nearestFrame } from './storyFrames'
describe('scroll frame scheduling',()=>{
  it('clamps endpoints and handles reverse progress without skipping the final frame',()=>{
    expect([-.3,0,.5,1,1.4,NaN].map(p=>frameIndex(p,72))).toEqual([0,0,36,71,71,0])
    expect([1,.75,.25,0].map(p=>frameIndex(p,72))).toEqual([71,53,18,0])
  })
  it('keeps the requested decode window bounded at either end and favors scroll direction',()=>{
    expect(frameWindow(0,72,6)).toEqual([0,1,2,3,4,5])
    expect(frameWindow(71,72,6,-1)).toEqual([71,70,69,68,67,66])
    expect(frameWindow(35,72,4,-1)).toEqual([35,34,36,33])
    expect(frameWindow(1,3,12)).toHaveLength(3)
  })
  it('uses a nearby decoded frame while the requested one is loading',()=>{
    expect(nearestFrame(35,[12,32,40])).toBe(32)
    expect(nearestFrame(35,[])).toBeUndefined()
  })
})
