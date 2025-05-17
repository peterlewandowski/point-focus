import React from 'react'
import { getBounds, getDefaults, getOffsets, getPageCoords, getRatios, getScaledDimensions } from './utils/globalUtils'
import { applyMouseMove, initializePanZoomPosition } from './utils/panUtils'
import { IImageMagnifierTypes, IImageTypes, IZoomImageTypes } from './ImageMagnifier.types'
import styles from './styles.module.scss'

import BaseImage from './components/BaseImage'
import ZoomImage from './components/ZoomImage'

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
    applyMouseMove(e.pageX, e.pageY, zoomContextRef, setLeft, setTop)
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

  React.useEffect(() => {
    zoomContextRef.current = getDefaults()
  }, [])

  const zoomImageProps: IZoomImageTypes = {
    src: zoomSrc || src,
    fadeDuration: fadeDuration,
    top,
    left,
    isZoomed,
    onLoad: handleLoad,
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
