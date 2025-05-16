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

export const getScaledDimensions = (zoomImg: HTMLImageElement, zoomScale: number) => {
  return {
    width: zoomImg.naturalWidth * zoomScale,
    height: zoomImg.naturalHeight * zoomScale,
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

export const applyDragMove = (pageX: number, pageY: number, imgProps: React.MutableRefObject<IImageTypes>, setLeft: (val: number) => void, setTop: (val: number) => void) => {
  let left = pageX - imgProps.current.offsets.x
  let top = pageY - imgProps.current.offsets.y

  const maxLeft = (imgProps.current.scaledDimensions.width - imgProps.current.bounds.width) * -1
  const maxTop = (imgProps.current.scaledDimensions.height - imgProps.current.bounds.height) * -1

  left = Math.max(Math.min(left, 0), maxLeft)
  top = Math.max(Math.min(top, 0), maxTop)

  setLeft(left)
  setTop(top)
}

export const handleNativeDragMove = (e: MouseEvent | TouchEvent, imgProps: React.MutableRefObject<IImageTypes>, setLeft: (v: number) => void, setTop: (v: number) => void) => {
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

  let left = pageX - imgProps.current.offsets.x
  let top = pageY - imgProps.current.offsets.y

  left = Math.max(Math.min(left, 0), (imgProps.current.scaledDimensions.width - imgProps.current.bounds.width) * -1)
  top = Math.max(Math.min(top, 0), (imgProps.current.scaledDimensions.height - imgProps.current.bounds.height) * -1)

  setLeft(left)
  setTop(top)
}

export const applyMouseMove = (pageX: number, pageY: number, imgProps: React.MutableRefObject<IImageTypes>, setLeft: (val: number) => void, setTop: (val: number) => void) => {
  let left = pageX - imgProps.current.offsets.x
  let top = pageY - imgProps.current.offsets.y

  left = Math.max(Math.min(left, imgProps.current.bounds.width), 0)
  top = Math.max(Math.min(top, imgProps.current.bounds.height), 0)

  setLeft(left * -imgProps.current.ratios.x)
  setTop(top * -imgProps.current.ratios.y)
}

export const initializeZoomPosition = (
  pageX: number,
  pageY: number,
  type: 'drag' | 'pan',
  container: HTMLDivElement | null,
  imgProps: React.MutableRefObject<IImageTypes>,
  setLeft: (val: number) => void,
  setTop: (val: number) => void,
  applyDragMove: (x: number, y: number, imgProps: React.MutableRefObject<IImageTypes>, setLeft: (val: number) => void, setTop: (val: number) => void) => void,
  applyMouseMove: (x: number, y: number, imgProps: React.MutableRefObject<IImageTypes>, setLeft: (val: number) => void, setTop: (val: number) => void) => void
) => {
  const bounds = getBounds(container)
  imgProps.current.bounds = bounds

  if (type === 'drag') {
    const initialPageX = (pageX - (window.pageXOffset + bounds.left)) * -imgProps.current.ratios.x
    const initialPageY = (pageY - (window.pageYOffset + bounds.top)) * -imgProps.current.ratios.y
    imgProps.current.offsets = getOffsets(0, 0, 0, 0)

    applyDragMove(initialPageX, initialPageY, imgProps, setLeft, setTop)
  } else {
    const offsets = getOffsets(window.pageXOffset, window.pageYOffset, -bounds.left, -bounds.top)
    imgProps.current.offsets = offsets

    applyMouseMove(pageX, pageY, imgProps, setLeft, setTop)
  }
}

// TO EXTRACT LATER DID NOT WORK FIRST TIME

// export const applyImageLoad = (
//   el: HTMLImageElement | null,
//   zoomScale: number,
//   container: HTMLDivElement | null,
//   imgProps: React.MutableRefObject<IImageTypes>,
//   onLoadCallback?: () => void
// ) => {
//      if (!el) return
//   const scaledDimensions = getScaledDimensions(el, zoomScale)

//   el.setAttribute('width', scaledDimensions.width.toString())
//   el.setAttribute('height', scaledDimensions.height.toString())

//   imgProps.current.scaledDimensions = scaledDimensions
//   imgProps.current.bounds = getBounds(container)
//   imgProps.current.ratios = getRatios(imgProps.current.bounds as DOMRect, scaledDimensions)

//   if (onLoadCallback) {
//     onLoadCallback()
//     imgProps.current.onLoadCallback = null
//   }
// }
