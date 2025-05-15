import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import Image from './components/Image'
import ZoomImage from './components/ZoomImage'
import FullscreenPortal from './components/FullscreenPortal'
import { ImageMagnifierProps, ImgProps, ZoomImageProps } from './ImageMagnifier.types'
import styles from './styles.module.scss'

const ImageMagnifier = ({
  moveType = 'pan',
  zoomType = 'click',
  src,
  sources,
  width,
  height,
  hasSpacer,
  imgAttributes = {},
  zoomSrc,
  zoomScale = 1,
  zoomPreload,
  fadeDuration = 150,
  fullscreenOnMobile,
  mobileBreakpoint = 640,
  hideCloseButton,
  hideHint,
  className,
  afterZoomIn,
  afterZoomOut,
}: ImageMagnifierProps) => {
  const img = useRef<HTMLDivElement | null>(null)
  const zoomImg = useRef<HTMLImageElement | null>(null)
  const imgProps = useRef<ImgProps>({
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
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [isValidDrag, setIsValidDrag] = useState<boolean>(false)
  const [isFading, setIsFading] = useState<boolean>(false)
  const [currentMoveType, setCurrentMoveType] = useState<'pan' | 'drag'>(moveType)
  const [left, setLeft] = useState<number>(0)
  const [top, setTop] = useState<number>(0)

  const handleMouseEnter = (e: React.MouseEvent) => {
    setIsActive(true)
    setIsFading(false)
    if (zoomType === 'hover' && !isZoomed) {
      handleClick(e)
    }
  }

  const handleTouchStart = () => {
    setIsTouch(true)
    setIsFullscreen(getFullscreenStatus(fullscreenOnMobile, mobileBreakpoint))
    setCurrentMoveType('drag')
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

  const applyImageLoad = (el: HTMLImageElement) => {
    const scaledDimensions = getScaledDimensions(el, zoomScale)

    zoomImg.current = el
    zoomImg.current.setAttribute('width', scaledDimensions.width.toString())
    zoomImg.current.setAttribute('height', scaledDimensions.height.toString())

    imgProps.current.scaledDimensions = scaledDimensions
    imgProps.current.bounds = getBounds(img.current, false)
    imgProps.current.ratios = getRatios(imgProps.current.bounds as { width: number; height: number }, scaledDimensions)

    if (imgProps.current.onLoadCallback) {
      imgProps.current.onLoadCallback()
      imgProps.current.onLoadCallback = null
    }
  }

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    applyImageLoad(e.currentTarget)
  }

  const applyMouseMove = (pageX: number, pageY: number) => {
    let left = pageX - imgProps.current.offsets.x
    let top = pageY - imgProps.current.offsets.y
    console.log('**** Pan to:', left, top)
    left = Math.max(Math.min(left, imgProps.current.bounds.width), 0)
    top = Math.max(Math.min(top, imgProps.current.bounds.height), 0)

    setLeft(left * -imgProps.current.ratios.x)
    setTop(top * -imgProps.current.ratios.y)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    applyMouseMove(e.pageX, e.pageY)
  }

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const { x: pageX, y: pageY } = getPageCoords(e)

    imgProps.current.offsets = getOffsets(pageX, pageY, zoomImg.current?.offsetLeft ?? 0, zoomImg.current?.offsetTop ?? 0)

    setIsDragging(true)

    if (!isTouch) {
      imgProps.current.eventPosition = { x: pageX, y: pageY }
    }
  }

  const applyDragMove = (pageX: number, pageY: number) => {
    let left = pageX - imgProps.current.offsets.x
    let top = pageY - imgProps.current.offsets.y

    left = Math.max(Math.min(left, 0), (imgProps.current.scaledDimensions.width - imgProps.current.bounds.width) * -1)
    top = Math.max(Math.min(top, 0), (imgProps.current.scaledDimensions.height - imgProps.current.bounds.height) * -1)

    setLeft(left)
    setTop(top)
  }

  const handleDragMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    const { x: pageX, y: pageY } = getPageCoords(e)
    applyDragMove(pageX, pageY)
  }, [])

  const handleNativeDragMove = useCallback((e: MouseEvent | TouchEvent) => {
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
  }, [])

  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(false)

    if (!isTouch && 'pageX' in e) {
      const moveX = Math.abs(e.pageX - imgProps.current.eventPosition.x)
      const moveY = Math.abs(e.pageY - imgProps.current.eventPosition.y)
      setIsValidDrag(moveX > 5 || moveY > 5)
    }
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    currentMoveType === 'drag' && isZoomed ? handleDragEnd(e) : handleClose(e)
  }

  const handleClose = (e: any) => {
    if (!(!isTouch && e.target.classList.contains('iiz__close'))) {
      if (!isZoomed || isFullscreen || !fadeDuration) {
        handleFadeOut({}, true)
      } else {
        setIsFading(true)
      }
    }

    zoomOut()
  }

  const handleFadeOut = (e: any, noTransition?: boolean) => {
    if (noTransition || (e.propertyName === 'opacity' && img?.current?.contains(e.target))) {
      if ((zoomPreload && isTouch) || !zoomPreload) {
        zoomImg.current = null
        imgProps.current = getDefaults()
        setIsActive(false)
      }

      setIsTouch(false)
      setIsFullscreen(false)
      setCurrentMoveType(moveType)
      setIsFading(false)
    }
  }

  const initialMove = (pageX: number, pageY: number) => {
    imgProps.current.offsets = getOffsets(window.pageXOffset, window.pageYOffset, -imgProps.current.bounds.left, -imgProps.current.bounds.top)
    applyMouseMove(pageX, pageY)
  }

  const initialDrag = (pageX: number, pageY: number) => {
    let initialPageX = (pageX - (window.pageXOffset + imgProps.current.bounds.left)) * -imgProps.current.ratios.x
    let initialPageY = (pageY - (window.pageYOffset + imgProps.current.bounds.top)) * -imgProps.current.ratios.y

    initialPageX = initialPageX + (isFullscreen ? (window.innerWidth - imgProps.current.bounds.width) / 2 : 0)
    initialPageY = initialPageY + (isFullscreen ? (window.innerHeight - imgProps.current.bounds.height) / 2 : 0)
    imgProps.current.bounds = getBounds(img.current, isFullscreen)
    imgProps.current.offsets = getOffsets(0, 0, 0, 0)

    applyDragMove(initialPageX, initialPageY)
  }

  const getPageCoords = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
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

  const zoomIn = (pageX: number, pageY: number) => {
    setIsZoomed(true)
    currentMoveType === 'drag' ? initialDrag(pageX, pageY) : initialMove(pageX, pageY)
    afterZoomIn && afterZoomIn()
  }

  const zoomOut = () => {
    setIsZoomed(false)
    afterZoomOut && afterZoomOut()
  }

  const getDefaults = (): ImgProps => {
    return {
      onLoadCallback: null,
      bounds: { width: 0, height: 0, left: 0, top: 0 },
      offsets: { x: 0, y: 0 },
      ratios: { x: 0, y: 0 },
      eventPosition: { x: 0, y: 0 },
      scaledDimensions: { width: 0, height: 0 },
    }
  }

  const getBounds = (img: HTMLDivElement | null, isFullscreen?: boolean): DOMRect | { width: number; height: number; left: number; top: number } => {
    if (!img) return { width: 0, height: 0, left: 0, top: 0 }
    if (isFullscreen) {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
        left: 0,
        top: 0,
      }
    }

    return img.getBoundingClientRect()
  }

  const getOffsets = (pageX: number, pageY: number, left: number, top: number) => {
    return {
      x: pageX - left,
      y: pageY - top,
    }
  }

  const getRatios = (bounds: { width: number; height: number }, dimensions: { width: number; height: number }) => {
    return {
      x: (dimensions.width - bounds.width) / bounds.width,
      y: (dimensions.height - bounds.height) / bounds.height,
    }
  }

  const getFullscreenStatus = (fullscreenOnMobile?: boolean, mobileBreakpoint?: number): boolean => {
    return !!(fullscreenOnMobile && typeof window !== 'undefined' && window.matchMedia?.(`(max-width: ${mobileBreakpoint}px)`).matches)
  }

  const getScaledDimensions = (zoomImg: HTMLImageElement, zoomScale: number) => {
    return {
      width: zoomImg.naturalWidth * zoomScale,
      height: zoomImg.naturalHeight * zoomScale,
    }
  }

  const zoomImageProps: ZoomImageProps = {
    src: zoomSrc || src,
    fadeDuration: isFullscreen ? 0 : fadeDuration,
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
    getFullscreenStatus(fullscreenOnMobile, mobileBreakpoint) && setIsActive(false)
  }, [fullscreenOnMobile, mobileBreakpoint])

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
      className={[styles['c-point-focus'], currentMoveType === 'drag' && styles['c-point-focus--drag'], className].filter(Boolean).join(' ')}
      style={{ width: width, height: height }}
      ref={img}
      onTouchStart={isZoomed ? undefined : handleTouchStart}
      onClick={handleClick}
      onMouseEnter={isTouch ? undefined : handleMouseEnter}
      onMouseMove={currentMoveType === 'drag' || !isZoomed ? undefined : handleMouseMove}
      onMouseLeave={isTouch ? undefined : handleMouseLeave}>
      <Image src={src} sources={sources} width={width} height={height} hasSpacer={hasSpacer} imgAttributes={imgAttributes} fadeDuration={fadeDuration} isZoomed={isZoomed} />

      {isActive && (
        <Fragment>
          {isFullscreen ? (
            <FullscreenPortal>
              <ZoomImage {...zoomImageProps} />
            </FullscreenPortal>
          ) : (
            <ZoomImage {...zoomImageProps} />
          )}
        </Fragment>
      )}

      {!hideHint && !isZoomed && <span className={`${styles['c-point-focus__btn']} ${styles['c-point-focus__hint']}`}></span>}
    </figure>
  )
}

export default ImageMagnifier
