import React from 'react'
import { getBounds, getDefaults, getPageCoords, getRatios, getScaledDimensions } from './utils/globalUtils'
import { applyMouseMove, initializePanZoomPosition } from './utils/panUtils'
import { IImageMagnifierTypes, IImageTypes, IZoomImageTypes } from './ImageMagnifier.types'
import styles from './styles.module.scss'

import BaseImage from './components/BaseImage'
import ZoomImage from './components/ZoomImage'
import { animateTo } from './utils/animations'
import { animations } from './utils/animation.constants'

const ImageMagnifier = ({
  moveType = 'follow',
  zoomType = 'click',
  src,
  sources,
  width,
  height,
  padding,
  hasSpacer,
  imgAttributes = {},
  zoomSrc,
  zoomScale = 1,
  zoomPreload,
  fadeDuration = 150,
  hideCloseButton,
  hideHint,
  className,
  afterZoomIn,
  afterZoomOut,
}: IImageMagnifierTypes) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null)
  const zoomedImgRef = React.useRef<HTMLImageElement | null>(null)
  const zoomContextRef = React.useRef<IImageTypes>(getDefaults())

  const [isActive, setIsActive] = React.useState<boolean | undefined>(zoomPreload)
  const [isZoomed, setIsZoomed] = React.useState<boolean>(false)
  const [isDragging, setIsDragging] = React.useState<boolean>(false)
  const [isFading, setIsFading] = React.useState<boolean>(false)
  const [left, setLeft] = React.useState<number>(0)
  const [top, setTop] = React.useState<number>(0)

  const zoomIn = (pageX: number, pageY: number) => {
    setIsZoomed(true)
    initializePanZoomPosition(pageX, pageY, containerRef.current, zoomContextRef, setLeft, setTop)
    afterZoomIn && afterZoomIn()
  }

  const zoomOut = () => {
    setIsZoomed(false)
    afterZoomOut && afterZoomOut()
  }

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isZoomed) return

    // Mouse event
    if ('clientX' in e && 'clientY' in e) {
      setIsDragging(true)
      zoomContextRef.current.dragStartCoords = {
        x: e.clientX - left,
        y: e.clientY - top,
      }
    }

    if ('touches' in e && e.touches.length === 1) {
      setIsDragging(true)
      const touch = e.touches[0]
      zoomContextRef.current.dragStartCoords = {
        x: touch.clientX - left,
        y: touch.clientY - top,
      }
    }
  }

  const handleDragMove = (e: MouseEvent) => {
    if (!isDragging) return

    zoomContextRef.current.wasDragging = true

    // Retrieve dragStartCoords from zoomContextRef
    const { x: offsetX, y: offsetY } = zoomContextRef.current.dragStartCoords

    // Calculate new position using the stored offset
    let newLeft = e.clientX - offsetX
    let newTop = e.clientY - offsetY

    // Clamp to bounds
    const { width, height } = zoomContextRef.current.bounds
    const maxLeft = 0
    const minLeft = width * -zoomContextRef.current.ratios.x
    const maxTop = 0
    const minTop = height * -zoomContextRef.current.ratios.y

    newLeft = Math.max(Math.min(newLeft, maxLeft), minLeft)
    newTop = Math.max(Math.min(newTop, maxTop), minTop)

    setLeft(newLeft)
    setTop(newTop)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    zoomContextRef.current.dragStartCoords = { x: 0, y: 0 }

    // Calculate clamped (in-bounds) position
    const { width, height } = zoomContextRef.current.bounds
    const maxLeft = 0
    const minLeft = width * -zoomContextRef.current.ratios.x
    const maxTop = 0
    const minTop = height * -zoomContextRef.current.ratios.y

    const clampedLeft = Math.max(Math.min(left, maxLeft), minLeft)
    const clampedTop = Math.max(Math.min(top, maxTop), minTop)

    if (left !== clampedLeft || top !== clampedTop) {
      animateTo(
        { left, top },
        { left: clampedLeft, top: clampedTop },
        300, // duration in ms
        animations.easeOut, // or any easing you like
        setLeft,
        setTop
      )
    }
  }

  const applyImageLoad = (el: HTMLImageElement) => {
    const scaledDimensions = getScaledDimensions(el, zoomScale)

    zoomedImgRef.current = el
    zoomedImgRef.current.setAttribute('width', scaledDimensions.width.toString())
    zoomedImgRef.current.setAttribute('height', scaledDimensions.height.toString())

    zoomContextRef.current.scaledDimensions = scaledDimensions
    zoomContextRef.current.bounds = getBounds(containerRef.current)
    zoomContextRef.current.ratios = getRatios(zoomContextRef.current.bounds as { width: number; height: number }, scaledDimensions)

    if (zoomContextRef.current.onLoadCallback) {
      zoomContextRef.current.onLoadCallback()
      zoomContextRef.current.onLoadCallback = null
    }
  }

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    applyImageLoad(e.currentTarget)
  }

  const handleClose = (e: React.MouseEvent | React.TouchEvent) => {
    zoomOut()
  }

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (zoomContextRef.current.wasDragging) {
      zoomContextRef.current.wasDragging = false
      return
    }

    if (isZoomed) {
      zoomOut()
      return
    }

    if (zoomedImgRef.current) {
      applyImageLoad(zoomedImgRef.current)
      const { x, y } = getPageCoords(e)
      zoomIn(x, y)
    } else {
      const { x, y } = getPageCoords(e)
      zoomContextRef.current.onLoadCallback = () => zoomIn(x, y)
    }
  }

  const handleMouseEnter = (e: React.MouseEvent) => {
    setIsActive(true)
    setIsFading(false)
    if (zoomType === 'hover' && !isZoomed) {
      handleClick(e)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (moveType === 'follow' && isZoomed) {
      applyMouseMove(e.pageX, e.pageY, zoomContextRef, setLeft, setTop)
    }
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    handleClose(e)
  }

  const handleFadeOut = (e: any, noTransition?: boolean) => {
    if (noTransition || (e.propertyName === 'opacity' && containerRef?.current?.contains(e.target))) {
      if (!zoomPreload) {
        zoomedImgRef.current = null
        zoomContextRef.current = getDefaults()
        setIsActive(false)
      }

      setIsFading(false)
    }
  }

  // possibly extra to be removed
  React.useEffect(() => {
    zoomContextRef.current = getDefaults()
  }, [])

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove)
      window.addEventListener('mouseup', handleDragEnd)
      return () => {
        window.removeEventListener('mousemove', handleDragMove)
        window.removeEventListener('mouseup', handleDragEnd)
      }
    }
  }, [isDragging])

  const zoomImageProps: IZoomImageTypes = {
    src: zoomSrc || src,
    fadeDuration: fadeDuration,
    top,
    left,
    isZoomed,
    onLoad: handleLoad,
    onDragStart: moveType === 'drag' ? handleDragStart : undefined,
    onDragEnd: moveType === 'drag' ? handleDragEnd : undefined,
    onClose: !hideCloseButton ? handleClose : undefined,
    onFadeOut: isFading ? handleFadeOut : undefined,
    closeButtonRef: closeButtonRef,
  }

  const containerClass = [styles['c-point-focus'], className].filter(Boolean).join(' ')

  return (
    <figure
      role='group'
      ref={containerRef}
      data-movetype={moveType}
      aria-label='Zoom image Container'
      className={containerClass}
      style={{ width: width, height: height, padding: padding }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseMove={isZoomed ? handleMouseMove : undefined}
      onMouseLeave={handleMouseLeave}>
      <BaseImage
        src={src}
        sources={sources}
        width={width}
        height={height}
        hasSpacer={hasSpacer}
        imgAttributes={imgAttributes}
        fadeDuration={fadeDuration}
        isZoomed={isZoomed}
      />

      {isActive && <ZoomImage ref={zoomedImgRef} {...zoomImageProps} />}
    </figure>
  )
}

export default ImageMagnifier
