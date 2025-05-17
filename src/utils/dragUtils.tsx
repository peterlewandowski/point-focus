import { IImageTypes } from "../ImageMagnifier.types"

export const applyDragMove = (
  pageX: number,
  pageY: number,
  zoomContextRef: React.MutableRefObject<IImageTypes>,
  setLeft: (val: number) => void,
  setTop: (val: number) => void
) => {
  let left = pageX - zoomContextRef.current.offsets.x
  let top = pageY - zoomContextRef.current.offsets.y

  const maxLeft = (zoomContextRef.current.scaledDimensions.width - zoomContextRef.current.bounds.width) * -1
  const maxTop = (zoomContextRef.current.scaledDimensions.height - zoomContextRef.current.bounds.height) * -1

  left = Math.max(Math.min(left, 0), maxLeft)
  top = Math.max(Math.min(top, 0), maxTop)

  setLeft(left)
  setTop(top)
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

  let left = pageX - zoomContextRef.current.offsets.x
  let top = pageY - zoomContextRef.current.offsets.y

  left = Math.max(Math.min(left, 0), (zoomContextRef.current.scaledDimensions.width - zoomContextRef.current.bounds.width) * -1)
  top = Math.max(Math.min(top, 0), (zoomContextRef.current.scaledDimensions.height - zoomContextRef.current.bounds.height) * -1)

  setLeft(left)
  setTop(top)
}
