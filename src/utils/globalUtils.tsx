import { IImageTypes } from '../ImageMagnifier.types'

// Defaulted values to 0 to make the functions SSR safe
export const getPageCoords = (
  e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent | React.KeyboardEvent | KeyboardEvent,
  fallbackElement?: HTMLElement | null
): { x: number; y: number } => {
  if ('touches' in e && e.touches.length > 0) {
    return { x: e.touches[0].pageX, y: e.touches[0].pageY }
  } else if ('pageX' in e && 'pageY' in e) {
    return { x: e.pageX, y: e.pageY }
  } else if (fallbackElement) {
    const rect = fallbackElement.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  }
  return { x: 0, y: 0 }
}

export const getOffsets = (pageX: number, pageY: number, left: number, top: number) => {
  return {
    x: pageX - left,
    y: pageY - top,
  }
}

export const getBounds = (container: HTMLDivElement | null): DOMRect | { width: number; height: number; left: number; top: number } => {
  return container ? container.getBoundingClientRect() : { width: 0, height: 0, left: 0, top: 0 }
}

export const getRatios = (bounds: { width: number; height: number }, dimensions: { width: number; height: number }) => {
  return {
    x: (dimensions.width - bounds.width) / bounds.width,
    y: (dimensions.height - bounds.height) / bounds.height,
  }
}

export function clampToBounds(left: number, top: number, bounds: { minLeft: number; maxLeft: number; minTop: number; maxTop: number }) {
  return {
    left: Math.max(Math.min(left, bounds.maxLeft), bounds.minLeft),
    top: Math.max(Math.min(top, bounds.maxTop), bounds.minTop),
  }
}
export function calculateDragPosition(pageX: number, pageY: number, offsets: { x: number; y: number }) {
  return {
    left: pageX - offsets.x,
    top: pageY - offsets.y,
  }
}

export const getScaledDimensions = (zoomedImgRef: HTMLImageElement, zoomScale: number) => {
  if (!zoomedImgRef || !zoomedImgRef.naturalWidth || !zoomedImgRef.naturalHeight) {
    return { width: 0, height: 0 }
  }
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
    scaledDimensions: { width: 0, height: 0 },
    dragStartCoords: defaultCoordinates,
    wasDragging: false,
    velocity: { vx: 0, vy: 0 },
    prevDragCoords: { x: 0, y: 0, time: 0 },
    lastDragCoords: { x: 0, y: 0, time: 0 },
  }
}
