import React from 'react'
import BaseImage from './components/BaseImage'
import ZoomImage from './components/ZoomImage'
import { IImageMagnifierTypes, IImageTypes, IZoomImageTypes } from './ImageMagnifier.types'
import styles from './styles.module.scss'
import { applyDragMove, applyMouseMove, getBounds, getDefaults, getOffsets, getPageCoords, getRatios, getScaledDimensions, handleNativeDragMove as handleNativeDragMoveUtil, initializeZoomPosition } from './utils/imageMagnifierUtils'

const ImageMagnifier = ({ moveType = 'pan', zoomType = 'click', src, sources, width, height, hasSpacer, imgAttributes = {}, zoomSrc, zoomScale = 1, zoomPreload, fadeDuration = 150, hideCloseButton, hideHint, className, afterZoomIn, afterZoomOut }: IImageMagnifierTypes) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const zoomedImgRef = React.useRef<HTMLImageElement | null>(null)
  const zoomContextRef = React.useRef<IImageTypes>({
    onLoadCallback: null,
    bounds: {} as DOMRect,
    offsets: { x: 0, y: 0 },
    ratios: { x: 0, y: 0 },
    eventPosition: { x: 0, y: 0 },
    scaledDimensions: { width: 0, height: 0 },
  })
  const [isActive, setIsActive] = React.useState<boolean | undefined>(zoomPreload)
  const [isTouch, setIsTouch] = React.useState<boolean>(false)
  const [isZoomed, setIsZoomed] = React.useState<boolean>(false)
  const [isDragging, setIsDragging] = React.useState<boolean>(false)
  const [isValidDrag, setIsValidDrag] = React.useState<boolean>(false)
  const [isFading, setIsFading] = React.useState<boolean>(false)
  const [currentMoveType, setCurrentMoveType] = React.useState<'pan' | 'drag'>(moveType)
  const [left, setLeft] = React.useState<number>(0)
  const [top, setTop] = React.useState<number>(0)

  const zoomIn = (pageX: number, pageY: number) => {
    setIsZoomed(true)
    initializeZoomPosition(pageX, pageY, currentMoveType, containerRef.current, zoomContextRef, setLeft, setTop, applyDragMove, applyMouseMove)
    afterZoomIn && afterZoomIn()
  }

  const zoomOut = () => {
    setIsZoomed(false)
    afterZoomOut && afterZoomOut()
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

  const handleClose = (e: any) => {
    if (!(!isTouch && e.target.classList.contains('c-point-focus__close'))) {
      if (!isZoomed || !fadeDuration) {
        handleFadeOut({}, true)
      } else {
        setIsFading(true)
      }
    }

    zoomOut()
  }

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (isZoomed) {
      if (isTouch) {
        hideCloseButton && handleClose(e)
      } else {
        !isValidDrag && zoomOut()
      }
      return
    }

    isTouch && setIsActive(true)

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
    console.log('handleMouseEnter')
    setIsActive(true)
    setIsFading(false)
    if (zoomType === 'hover' && !isZoomed) {
      handleClick(e)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    applyMouseMove(e.pageX, e.pageY, zoomContextRef, setLeft, setTop)
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    currentMoveType === 'drag' && isZoomed ? handleDragEnd(e) : handleClose(e)
  }

  const handleTouchStart = () => {
    setIsTouch(true)
    setCurrentMoveType('drag')
  }

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const { x: pageX, y: pageY } = getPageCoords(e)

    zoomContextRef.current.offsets = getOffsets(pageX, pageY, zoomedImgRef.current?.offsetLeft ?? 0, zoomedImgRef.current?.offsetTop ?? 0)

    setIsDragging(true)

    if (!isTouch) {
      zoomContextRef.current.eventPosition = { x: pageX, y: pageY }
    }
  }

  const handleDragMove = React.useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    const { x: pageX, y: pageY } = getPageCoords(e)
    applyDragMove(pageX, pageY, zoomContextRef, setLeft, setTop)
  }, [])

  const handleNativeDragMove = React.useCallback((e: MouseEvent | TouchEvent) => {
    handleNativeDragMoveUtil(e, zoomContextRef, setLeft, setTop)
  }, [])

  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(false)

    if (!isTouch && 'pageX' in e) {
      // This function checks the distance between mousedown and mouseup and if it's greater than 5px, it considers it as a drag and not a click and it sets isValidDrag to true 
      const moveX = Math.abs(e.pageX - zoomContextRef.current.eventPosition.x)
      const moveY = Math.abs(e.pageY - zoomContextRef.current.eventPosition.y)
      setIsValidDrag(moveX > 5 || moveY > 5)
    }
  }

  const handleFadeOut = (e: any, noTransition?: boolean) => {
    if (noTransition || (e.propertyName === 'opacity' && containerRef?.current?.contains(e.target))) {
      if ((zoomPreload && isTouch) || !zoomPreload) {
        zoomedImgRef.current = null
        zoomContextRef.current = getDefaults()
        setIsActive(false)
      }

      setIsTouch(false)
      setCurrentMoveType(moveType)
      setIsFading(false)
    }
  }

  React.useEffect(() => {
    zoomContextRef.current = getDefaults()
  }, [])

  React.useEffect(() => {
    if (!zoomedImgRef.current) {
      return
    }

    const eventType = isTouch ? 'touchmove' : 'mousemove'

    if (isDragging) {
      zoomedImgRef.current.addEventListener(eventType, handleNativeDragMove, { passive: true })
    } else {
      zoomedImgRef.current.removeEventListener(eventType, handleNativeDragMove)
    }
  }, [isDragging, isTouch, handleDragMove])

  const zoomImageProps: IZoomImageTypes = {
    src: zoomSrc || src,
    fadeDuration: fadeDuration,
    top,
    left,
    isZoomed,
    onLoad: handleLoad,
    onDragStart: currentMoveType === 'drag' ? handleDragStart : undefined,
    onDragEnd: currentMoveType === 'drag' ? handleDragEnd : undefined,
    onClose: !hideCloseButton && currentMoveType === 'drag' ? handleClose : undefined,
    onFadeOut: isFading ? handleFadeOut : undefined,
  }

  const containerClass = [styles['c-point-focus'], className].filter(Boolean).join(' ')

  return (
    <figure
      role='group'
      ref={containerRef}
      data-movetype={currentMoveType}
      aria-label='Zoomable image'
      className={containerClass}
      style={{ width: width, height: height }}
      onTouchStart={isZoomed ? undefined : handleTouchStart}
      onClick={handleClick}
      onMouseEnter={isTouch ? undefined : handleMouseEnter}
      onMouseMove={currentMoveType === 'drag' || !isZoomed ? undefined : handleMouseMove}
      onMouseLeave={isTouch ? undefined : handleMouseLeave}>
      <BaseImage src={src} sources={sources} width={width} height={height} hasSpacer={hasSpacer} imgAttributes={imgAttributes} fadeDuration={fadeDuration} isZoomed={isZoomed} />

      {isActive && <ZoomImage ref={zoomedImgRef} {...zoomImageProps} />}

      {!hideHint && !isZoomed && <span className={`${styles['c-point-focus__btn']} ${styles['c-point-focus__hint']}`} aria-hidden='true' />}
    </figure>
  )
}

export default ImageMagnifier
