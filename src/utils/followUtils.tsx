import { IImageTypes } from '../ImageMagnifier.types'
import { getBounds, getOffsets } from './globalUtils'

export const applyMouseMove = (
  pageX: number,
  pageY: number,
  zoomContextRef: React.MutableRefObject<IImageTypes>,
  setLeft: (val: number) => void,
  setTop: (val: number) => void,
  zoomLevel: number
) => {
  const bounds = zoomContextRef.current.bounds
  const imageDimensions = zoomContextRef.current.scaledDimensions

  // Mouse position relative to container
  const relX = pageX - bounds.left
  const relY = pageY - bounds.top

  // Calculate the scaled image size
  const scaledImageWidth = imageDimensions.width * zoomLevel
  const scaledImageHeight = imageDimensions.height * zoomLevel

  // Calculate overflow in each direction
  const overflowX = Math.max(0, scaledImageWidth - bounds.width)
  const overflowY = Math.max(0, scaledImageHeight - bounds.height)

  // Calculate the ideal offset so the point under the cursor stays under the cursor
  let left = (bounds.width / 2 - relX) * zoomLevel;
  let top = (bounds.height / 2 - relY) * zoomLevel;

  const minLeft = -overflowX / 2
  const maxLeft = overflowX / 2
  const minTop = -overflowY / 2
  const maxTop = overflowY / 2

  left = Math.max(Math.min(left, maxLeft), minLeft)
  top = Math.max(Math.min(top, maxTop), minTop)

  setLeft(left)
  setTop(top)
}

export const initializeFollowZoomPosition = (
  pageX: number,
  pageY: number,
  container: HTMLDivElement | null,
  zoomContextRef: React.MutableRefObject<IImageTypes>,
  setLeft: (val: number) => void,
  setTop: (val: number) => void,
  zoomLevel: number
) => {
  const bounds = getBounds(container)
  zoomContextRef.current.bounds = bounds

  const offsets = getOffsets(window.pageXOffset, window.pageYOffset, -bounds.left, -bounds.top)
  zoomContextRef.current.offsets = offsets

  applyMouseMove(pageX, pageY, zoomContextRef, setLeft, setTop, zoomLevel)
}
