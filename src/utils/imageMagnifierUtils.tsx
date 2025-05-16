import { IImageTypes } from '../ImageMagnifier.types'

export const getPageCoords = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
  if ('changedTouches' in e && e.changedTouches.length > 0) {
    return {
      x: e.changedTouches[0].pageX,
      y: e.changedTouches[0].pageY,
    }
  }
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
  if (!container) return { width: 0, height: 0, left: 0, top: 0 }
  return container.getBoundingClientRect()
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
  return {
    onLoadCallback: null,
    bounds: { width: 0, height: 0, left: 0, top: 0 },
    offsets: { x: 0, y: 0 },
    ratios: { x: 0, y: 0 },
    eventPosition: { x: 0, y: 0 },
    scaledDimensions: { width: 0, height: 0 },
  }
}

export const applyDragMove = (pageX: number, pageY: number, zoomContextRef: React.MutableRefObject<IImageTypes>, setLeft: (val: number) => void, setTop: (val: number) => void) => {
  let left = pageX - zoomContextRef.current.offsets.x
  let top = pageY - zoomContextRef.current.offsets.y

  const maxLeft = (zoomContextRef.current.scaledDimensions.width - zoomContextRef.current.bounds.width) * -1
  const maxTop = (zoomContextRef.current.scaledDimensions.height - zoomContextRef.current.bounds.height) * -1

  left = Math.max(Math.min(left, 0), maxLeft)
  top = Math.max(Math.min(top, 0), maxTop)

  setLeft(left)
  setTop(top)
}

export const handleNativeDragMove = (e: MouseEvent | TouchEvent, zoomContextRef: React.MutableRefObject<IImageTypes>, setLeft: (v: number) => void, setTop: (v: number) => void) => {
  let pageX: number
  let pageY: number

  if (e instanceof TouchEvent && e.touches.length > 0) {
    pageX = e.touches[0].pageX
    pageY = e.touches[0].pageY
  } else if (e instanceof MouseEvent) {
    pageX = e.pageX
    pageY = e.pageY
  } else {
    return
  }

  let left = pageX - zoomContextRef.current.offsets.x
  let top = pageY - zoomContextRef.current.offsets.y

  left = Math.max(Math.min(left, 0), (zoomContextRef.current.scaledDimensions.width - zoomContextRef.current.bounds.width) * -1)
  top = Math.max(Math.min(top, 0), (zoomContextRef.current.scaledDimensions.height - zoomContextRef.current.bounds.height) * -1)

  setLeft(left)
  setTop(top)
}

export const applyMouseMove = (pageX: number, pageY: number, zoomContextRef: React.MutableRefObject<IImageTypes>, setLeft: (val: number) => void, setTop: (val: number) => void) => {
  let left = pageX - zoomContextRef.current.offsets.x
  let top = pageY - zoomContextRef.current.offsets.y

  left = Math.max(Math.min(left, zoomContextRef.current.bounds.width), 0)
  top = Math.max(Math.min(top, zoomContextRef.current.bounds.height), 0)

  setLeft(left * -zoomContextRef.current.ratios.x)
  setTop(top * -zoomContextRef.current.ratios.y)
}

export const initializeZoomPosition = (
  pageX: number,
  pageY: number,
  type: 'drag' | 'pan',
  container: HTMLDivElement | null,
  zoomContextRef: React.MutableRefObject<IImageTypes>,
  setLeft: (val: number) => void,
  setTop: (val: number) => void,
  applyDragMove: (x: number, y: number, zoomContextRef: React.MutableRefObject<IImageTypes>, setLeft: (val: number) => void, setTop: (val: number) => void) => void,
  applyMouseMove: (x: number, y: number, zoomContextRef: React.MutableRefObject<IImageTypes>, setLeft: (val: number) => void, setTop: (val: number) => void) => void
) => {
  const bounds = getBounds(container)
  zoomContextRef.current.bounds = bounds

  if (type === 'drag') {
    const initialPageX = (pageX - (window.pageXOffset + bounds.left)) * -zoomContextRef.current.ratios.x
    const initialPageY = (pageY - (window.pageYOffset + bounds.top)) * -zoomContextRef.current.ratios.y
    zoomContextRef.current.offsets = getOffsets(0, 0, 0, 0)

    applyDragMove(initialPageX, initialPageY, zoomContextRef, setLeft, setTop)
  } else {
    const offsets = getOffsets(window.pageXOffset, window.pageYOffset, -bounds.left, -bounds.top)
    zoomContextRef.current.offsets = offsets

    applyMouseMove(pageX, pageY, zoomContextRef, setLeft, setTop)
  }
}

