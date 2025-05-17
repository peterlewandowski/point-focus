import { IImageTypes } from '../ImageMagnifier.types'

export const getPageCoords = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
  return {
    x: (e as React.MouseEvent).pageX,
    y: (e as React.MouseEvent).pageY,
  }
}

export const getOffsets = (pageX: number, pageY: number, left: number, top: number) => ({
  x: pageX - left,
  y: pageY - top,
})

export const getBounds = (container: HTMLDivElement | null): DOMRect | { width: number; height: number; left: number; top: number } => {
  return container ? container.getBoundingClientRect() : { width: 0, height: 0, left: 0, top: 0 }
}

export const getRatios = (bounds: { width: number; height: number }, dimensions: { width: number; height: number }) => {
  return {
    x: (dimensions.width - bounds.width) / bounds.width,
    y: (dimensions.height - bounds.height) / bounds.height,
  }
}

export const getScaledDimensions = (zoomedImgRef: HTMLImageElement, zoomScale: number) => {
  return {
    width: zoomedImgRef.naturalWidth * zoomScale,
    height: zoomedImgRef.naturalHeight * zoomScale,
  }
}

export const getDefaults = (): IImageTypes => {
  const defaultCoordinates = { x: 0, y: 0 }
  return {
    onLoadCallback: null,
    bounds: { width: 0, height: 0, left: 0, top: 0 },
    offsets: defaultCoordinates,
    ratios: defaultCoordinates,
    eventPosition: defaultCoordinates,
    scaledDimensions: { width: 0, height: 0 },
    dragStartCoords: defaultCoordinates,
    wasDragging: false,
    velocity: { vx: 0, vy: 0 },
    prevDragCoords: { x: 0, y: 0, time: 0 },
    lastDragCoords: { x: 0, y: 0, time: 0 },
  }
}
