import React, { useCallback, useEffect, useRef, useState } from 'react'
import BaseImage from './components/BaseImage'
import ZoomImage from './components/ZoomImage'
import { IImageMagnifierTypes, IImageTypes, IZoomImageTypes } from './ImageMagnifier.types'
import styles from './styles.module.scss'
import { applyDragMove, applyMouseMove, getBounds, getDefaults, getOffsets, getPageCoords, getRatios, getScaledDimensions, handleNativeDragMove as handleNativeDragMoveUtil, initializeZoomPosition } from './utils/imageMagnifierUtils'

const ImageMagnifier = ({ moveType = 'pan', zoomType = 'click', src, sources, width, height, hasSpacer, imgAttributes = {}, zoomSrc, zoomScale = 1, zoomPreload, fadeDuration = 150, hideCloseButton, hideHint, className, afterZoomIn, afterZoomOut }: IImageMagnifierTypes) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const zoomImg = useRef<HTMLImageElement | null>(null)
  const imgProps = useRef<IImageTypes>({
    onLoadCallback: null,
    bounds: {} as DOMRect,
    offsets: { x: 0, y: 0 },
    ratios: { x: 0, y: 0 },
    eventPosition: { x: 0, y: 0 },
    scaledDimensions: { width: 0, height: 0 },
  })
  const [isActive, setIsActive] = useState<boolean | undefined>(zoomPreload)
  const [isTouch, setIsTouch] = useState<boolean>(false)
  const [isZoomed, setIsZoomed] = useState<boolean>(false)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [isValidDrag, setIsValidDrag] = useState<boolean>(false)
  const [isFading, setIsFading] = useState<boolean>(false)
  const [currentMoveType, setCurrentMoveType] = useState<'pan' | 'drag'>(moveType)
  const [left, setLeft] = useState<number>(0)
  const [top, setTop] = useState<number>(0)

  const zoomIn = (pageX: number, pageY: number) => {
    setIsZoomed(true)
    initializeZoomPosition(pageX, pageY, currentMoveType, containerRef.current, imgProps, setLeft, setTop, applyDragMove, applyMouseMove)
    afterZoomIn && afterZoomIn()
  }

  const zoomOut = () => {
    setIsZoomed(false)
    afterZoomOut && afterZoomOut()
  }

  // Needs to be move to Utils
  const applyImageLoad = (el: HTMLImageElement) => {
    const scaledDimensions = getScaledDimensions(el, zoomScale)

    zoomImg.current = el
    zoomImg.current.setAttribute('width', scaledDimensions.width.toString())
    zoomImg.current.setAttribute('height', scaledDimensions.height.toString())

    imgProps.current.scaledDimensions = scaledDimensions
    imgProps.current.bounds = getBounds(containerRef.current)
    imgProps.current.ratios = getRatios(imgProps.current.bounds as { width: number; height: number }, scaledDimensions)

    if (imgProps.current.onLoadCallback) {
      imgProps.current.onLoadCallback()
      imgProps.current.onLoadCallback = null
    }
  }

  // const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
  //   const callback = imgProps.current.onLoadCallback ?? undefined
  //   applyImageLoad(zoomImg.current, zoomScale, containerRef.current, imgProps, callback)
  // }

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    applyImageLoad(e.currentTarget)
  }

  const handleClose = (e: any) => {
    if (!(!isTouch && e.target.classList.contains('iiz__close'))) {
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

    if (zoomImg.current) {
      applyImageLoad(zoomImg.current)

      const { x, y } = getPageCoords(e)
      zoomIn(x, y)
    } else {
      const { x, y } = getPageCoords(e)
      imgProps.current.onLoadCallback = () => zoomIn(x, y)
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
    applyMouseMove(e.pageX, e.pageY, imgProps, setLeft, setTop)
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

    imgProps.current.offsets = getOffsets(pageX, pageY, zoomImg.current?.offsetLeft ?? 0, zoomImg.current?.offsetTop ?? 0)

    setIsDragging(true)

    if (!isTouch) {
      imgProps.current.eventPosition = { x: pageX, y: pageY }
    }
  }

  const handleDragMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    const { x: pageX, y: pageY } = getPageCoords(e)
    applyDragMove(pageX, pageY, imgProps, setLeft, setTop)
  }, [])

  const handleNativeDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    handleNativeDragMoveUtil(e, imgProps, setLeft, setTop)
  }, [])

  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(false)

    if (!isTouch && 'pageX' in e) {
      const moveX = Math.abs(e.pageX - imgProps.current.eventPosition.x)
      const moveY = Math.abs(e.pageY - imgProps.current.eventPosition.y)
      setIsValidDrag(moveX > 5 || moveY > 5)
    }
  }

  const handleFadeOut = (e: any, noTransition?: boolean) => {
    if (noTransition || (e.propertyName === 'opacity' && containerRef?.current?.contains(e.target))) {
      if ((zoomPreload && isTouch) || !zoomPreload) {
        zoomImg.current = null
        imgProps.current = getDefaults()
        setIsActive(false)
      }

      setIsTouch(false)
      setCurrentMoveType(moveType)
      setIsFading(false)
    }
  }

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

  useEffect(() => {
    imgProps.current = getDefaults()
  }, [])

  useEffect(() => {
    if (!zoomImg.current) {
      return
    }

    const eventType = isTouch ? 'touchmove' : 'mousemove'

    if (isDragging) {
      zoomImg.current.addEventListener(eventType, handleNativeDragMove, { passive: true })
    } else {
      zoomImg.current.removeEventListener(eventType, handleNativeDragMove)
    }
  }, [isDragging, isTouch, handleDragMove])

  return (
    <figure
      role='group'
      aria-label='Zoomable image'
      className={[styles['c-point-focus'], currentMoveType === 'drag' && styles['c-point-focus--drag'], className].filter(Boolean).join(' ')}
      style={{ width: width, height: height }}
      ref={containerRef}
      onTouchStart={isZoomed ? undefined : handleTouchStart}
      onClick={handleClick}
      onMouseEnter={isTouch ? undefined : handleMouseEnter}
      onMouseMove={currentMoveType === 'drag' || !isZoomed ? undefined : handleMouseMove}
      onMouseLeave={isTouch ? undefined : handleMouseLeave}>
      <BaseImage src={src} sources={sources} width={width} height={height} hasSpacer={hasSpacer} imgAttributes={imgAttributes} fadeDuration={fadeDuration} isZoomed={isZoomed} />

      {isActive && <ZoomImage {...zoomImageProps} />}

      {!hideHint && !isZoomed && <span className={`${styles['c-point-focus__btn']} ${styles['c-point-focus__hint']}`} aria-hidden='true' />}
    </figure>
  )
}

export default ImageMagnifier
