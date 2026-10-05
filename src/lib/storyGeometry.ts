export type Rect = { left: number; top: number; width: number; height: number }
export function containRect(box: Rect, width: number, height: number): Rect {
  const scale = Math.min(box.width / width, box.height / height)
  return { left: box.left + (box.width-width*scale)/2, top: box.top+(box.height-height*scale)/2, width: width*scale, height: height*scale }
}
export function subjectRect(scene: Rect, bounds: {x:number;y:number;width:number;height:number}): Rect {
  return {left:scene.left+scene.width*bounds.x,top:scene.top+scene.height*bounds.y,width:scene.width*bounds.width,height:scene.height*bounds.height}
}
