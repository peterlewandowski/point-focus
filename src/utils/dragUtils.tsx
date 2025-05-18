import { IImageTypes } from '../ImageMagnifier.types'
import { calculateDragPosition, clampToBounds } from './globalUtils'

export const applyDragMove = (
  pageX: number,
  pageY: number,
  zoomContextRef: React.MutableRefObject<IImageTypes>,
  setLeft: (val: number) => void,
  setTop: (val: number) => void
) => {
  const { left, top } = calculateDragPosition(pageX, pageY, zoomContextRef.current.offsets)

  const maxLeft = (zoomContextRef.current.scaledDimensions.width - zoomContextRef.current.bounds.width) * -1
  const maxTop = (zoomContextRef.current.scaledDimensions.height - zoomContextRef.current.bounds.height) * -1

  const bounds = { minLeft: maxLeft, maxLeft: 0, minTop: maxTop, maxTop: 0 }
  const clamped = clampToBounds(left, top, bounds)
  setLeft(clamped.left)
  setTop(clamped.top)
}

export const handleNativeDragMove = (
  e: MouseEvent | TouchEvent,
  zoomContextRef: React.MutableRefObject<IImageTypes>,
  setLeft: (v: number) => void,
  setTop: (v: number) => void
) => {
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

  const { left, top } = calculateDragPosition(pageX, pageY, zoomContextRef.current.offsets)

  const maxLeft = 0
  const minLeft = (zoomContextRef.current.scaledDimensions.width - zoomContextRef.current.bounds.width) * -1
  const maxTop = 0
  const minTop = (zoomContextRef.current.scaledDimensions.height - zoomContextRef.current.bounds.height) * -1
  const bounds = { minLeft, maxLeft, minTop, maxTop }
  const clamped = clampToBounds(left, top, bounds)
  setLeft(clamped.left)
  setTop(clamped.top)
}
