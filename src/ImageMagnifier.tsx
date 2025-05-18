import React from 'react'
import { getBounds, getDefaults, getOffsets, getPageCoords, getRatios, getScaledDimensions } from './utils/globalUtils'
import { applyMouseMove, initializeFollowZoomPosition, applyDragMove } from './utils/movementUtils'
import { IImageMagnifierTypes, IImageTypes, IZoomImageTypes } from './ImageMagnifier.types'
import styles from './styles.module.scss'

import BaseImage from './components/BaseImage'
import ZoomImage from './components/ZoomImage'
import { startInertia } from './utils/animations'

const ImageMagnifier = ({
  src,
  sources,
  width,
  height,
  zoomSrc,
  zoomScale = 1,
  zoomPreload,
  fadeDuration = 150,
  moveType = 'follow',
  zoomType = 'click',
  imgAttributes = {},
  hideCloseButton,
  containerClassName,
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
    initializeFollowZoomPosition(pageX, pageY, containerRef.current, zoomContextRef, setLeft, setTop)
    afterZoomIn && afterZoomIn()
  }

  const zoomOut = () => {
    setIsZoomed(false)
    afterZoomOut && afterZoomOut()
  }

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isZoomed) return

    const { x, y } = getPageCoords(e)
    setIsDragging(true)
    zoomContextRef.current.dragStartCoords = getOffsets(x, y, left, top)
  }

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return

    const { x, y } = getPageCoords(e)
    applyDragMove(x, y, zoomContextRef, setLeft, setTop)
    if ('touches' in e) e.preventDefault?.()
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    zoomContextRef.current.dragStartCoords = { x: 0, y: 0 }

    // Animation on end
    // Calculate velocity
    const last = zoomContextRef.current.lastDragCoords
    const prev = zoomContextRef.current.prevDragCoords

    let vx = 0,
      vy = 0
    if (last && prev) {
      const dt = (last.time - prev.time) / 1000
      if (dt > 0) {
        vx = (last.x - prev.x) / dt
        vy = (last.y - prev.y) / dt
      }
    }
    zoomContextRef.current.velocity = { vx, vy }

    // Calculate bounds
    const { width, height } = zoomContextRef.current.bounds
    const maxLeft = 0
    const minLeft = width * -zoomContextRef.current.ratios.x
    const maxTop = 0
    const minTop = height * -zoomContextRef.current.ratios.y

    startInertia({
      initialLeft: left,
      initialTop: top,
      velocity: { vx, vy },
      setLeft,
      setTop,
      bounds: { minLeft, maxLeft, minTop, maxTop },
      friction: 0.95,
      minVelocity: 10,
      onEnd: () => {
        // Optionally, snap to bounds or do something else
      },
    })
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
      return
    } // is important to keep it to avoid issues when dragging the image with the animation

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
      window.addEventListener('touchmove', handleDragMove, { passive: false })
      window.addEventListener('touchend', handleDragEnd)
      return () => {
        window.removeEventListener('mousemove', handleDragMove)
        window.removeEventListener('mouseup', handleDragEnd)
        window.removeEventListener('touchmove', handleDragMove)
        window.removeEventListener('touchend', handleDragEnd)
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
    onTouchStart: handleDragStart,
    onTouchEnd: handleDragEnd,
    onClose: !hideCloseButton ? handleClose : undefined,
    onFadeOut: isFading ? handleFadeOut : undefined,
    closeButtonRef: closeButtonRef,
  }

  const containerClass = [styles['c-point-focus'], containerClassName].filter(Boolean).join(' ')

  return (
    <figure
      role='group'
      ref={containerRef}
      data-movetype={moveType}
      aria-label='Zoom image Container'
      className={containerClass}
      style={{ width: width, height: height }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseMove={isZoomed ? handleMouseMove : undefined}
      onMouseLeave={handleMouseLeave}>
      <BaseImage
        src={src}
        sources={sources}
        width={width}
        height={height}
        imgAttributes={imgAttributes}
        fadeDuration={fadeDuration}
        isZoomed={isZoomed}
      />

      {isActive && <ZoomImage ref={zoomedImgRef} {...zoomImageProps} />}
    </figure>
  )
}

export default ImageMagnifier
