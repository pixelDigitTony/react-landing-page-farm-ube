import type { ASSETS } from '../constants/site'

export type ImageAsset = typeof ASSETS.master
export const imageSources = (asset: ImageAsset) => asset.smallWidth === asset.largeWidth ? `${asset.small} ${asset.smallWidth}w` : `${asset.small} ${asset.smallWidth}w, ${asset.src} ${asset.largeWidth}w`
