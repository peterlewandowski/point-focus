import { IImageTypes } from '../ImageMagnifier.types'
import { calculateDragPosition, clampToBounds, getBounds, getOffsets } from './globalUtils'

export const applyMouseMove = (
  pageX: number,
  pageY: number,
  zoomContextRef: React.MutableRefObject<IImageTypes>,
  setLeft: (val: number) => void,
  setTop: (val: number) => void
) => {
  const { left, top } = calculateDragPosition(pageX, pageY, zoomContextRef.current.offsets)

  const bounds = { minLeft: 0, maxLeft: zoomContextRef.current.bounds.width, minTop: 0, maxTop: zoomContextRef.current.bounds.height }
  const clamped = clampToBounds(left, top, bounds)
  setLeft(clamped.left * -zoomContextRef.current.ratios.x)
  setTop(clamped.top * -zoomContextRef.current.ratios.y)
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

export function applyDragMove(
  x: number,
  y: number,
  zoomContextRef: React.MutableRefObject<IImageTypes>,
  setLeft: (val: number) => void,
  setTop: (val: number) => void
) {

  // This is setting up the animation
  const now = Date.now()
  zoomContextRef.current.prevDragCoords = zoomContextRef.current.lastDragCoords
  zoomContextRef.current.lastDragCoords = { x, y, time: now }

  // Calculate new position using the stored offset
  const { left: newLeft, top: newTop } = calculateDragPosition(x, y, zoomContextRef.current.dragStartCoords)

  // Clamp to bounds
  const { width, height } = zoomContextRef.current.bounds
  const maxLeft = 0
  const minLeft = width * -zoomContextRef.current.ratios.x
  const maxTop = 0
  const minTop = height * -zoomContextRef.current.ratios.y

  const clamped = clampToBounds(newLeft, newTop, { minLeft, maxLeft, minTop, maxTop })

  setLeft(clamped.left)
  setTop(clamped.top)
}
