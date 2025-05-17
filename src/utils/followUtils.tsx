import { IImageTypes } from '../ImageMagnifier.types'
import { getBounds, getOffsets } from './globalUtils'

export const applyMouseMove = (
  pageX: number,
  pageY: number,
  zoomContextRef: React.MutableRefObject<IImageTypes>,
  setLeft: (val: number) => void,
  setTop: (val: number) => void
) => {
  let left = pageX - zoomContextRef.current.offsets.x
  let top = pageY - zoomContextRef.current.offsets.y

  left = Math.max(Math.min(left, zoomContextRef.current.bounds.width), 0)
  top = Math.max(Math.min(top, zoomContextRef.current.bounds.height), 0)

  setLeft(left * -zoomContextRef.current.ratios.x)
  setTop(top * -zoomContextRef.current.ratios.y)
}

export const initializeFollowZoomPosition = (
  pageX: number,
  pageY: number,
  container: HTMLDivElement | null,
  zoomContextRef: React.MutableRefObject<IImageTypes>,
  setLeft: (val: number) => void,
  setTop: (val: number) => void
) => {
  // SSR check: only run if window and container are available
  if (typeof window === 'undefined' || !container) {
    // Optionally, set defaults or skip
    zoomContextRef.current.bounds = { left: 0, top: 0, width: 0, height: 0 }
    zoomContextRef.current.offsets = { x: 0, y: 0 }
    setLeft(0)
    setTop(0)
    return
  }

  const bounds = getBounds(container)
  zoomContextRef.current.bounds = bounds

  const offsets = getOffsets(window.pageXOffset, window.pageYOffset, -bounds.left, -bounds.top)
  zoomContextRef.current.offsets = offsets

  applyMouseMove(pageX, pageY, zoomContextRef, setLeft, setTop)
}
