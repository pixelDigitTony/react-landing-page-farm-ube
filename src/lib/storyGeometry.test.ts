import { describe, it, expect } from 'vitest'
import { containRect, subjectRect } from './storyGeometry'
import { STORY_ASSETS } from '../constants/storyAssets'
describe('botanical continuity geometry',()=>{
  it('fits the complete scene proportionally, including ultrawide letterboxing',()=>{
    const scene=containRect({left:760,top:68,width:1920,height:1372},1280,720)
    expect(scene).toEqual({left:760,top:214,width:1920,height:1080})
  })
  it('maps normalized subject bounds to the same proportions as its trimmed cutout',()=>{
    for(const source of Object.values(STORY_ASSETS)){
      const scene=containRect({left:0,top:0,width:1440,height:832},source.width,source.height)
      const crop=subjectRect(scene,source.bounds)
      expect(crop.width/crop.height).toBeCloseTo(source.subjectWidth/source.subjectHeight,8)
      expect(crop.left).toBeGreaterThanOrEqual(scene.left)
      expect(crop.top+crop.height).toBeLessThanOrEqual(scene.top+scene.height)
    }
  })
})
