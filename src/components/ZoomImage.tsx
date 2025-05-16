import React from 'react'
import { IZoomImageTypes } from '../ImageMagnifier.types'
import styles from '../styles.module.scss'

const ZoomImage = React.forwardRef<HTMLImageElement, IZoomImageTypes>(({ src, fadeDuration, top, left, isZoomed, onLoad, onDragStart, onDragEnd, onClose, onFadeOut }, ref) => {
  const zoomImgClass = [styles['c-point-focus__zoom-img'], isZoomed && styles['c-point-focus__zoom-img--visible']].filter(Boolean).join(' ')
  const closeBtnClass = [styles['c-point-focus__btn'], styles['c-point-focus__close'], isZoomed && styles['c-point-focus__close--visible']].filter(Boolean).join(' ')

  return (
    <>
      <img
        ref={ref}
        className={zoomImgClass}
        style={{
          transform: `translate(${left}px, ${top}px)`,
          transition: `opacity ${fadeDuration}ms linear, visibility ${fadeDuration}ms linear`,
        }}
        src={src}
        onLoad={onLoad}
        onTouchStart={onDragStart}
        onTouchEnd={onDragEnd}
        onMouseDown={onDragStart}
        onMouseUp={onDragEnd}
        onTransitionEnd={onFadeOut}
        draggable='false'
        alt=''
      />

      {onClose && (
        <button
          type='button'
          className={closeBtnClass}
          style={{
            transition: `opacity ${fadeDuration}ms linear, visibility ${fadeDuration}ms linear`,
          }}
          onClick={onClose}
          aria-label='Zoom Out'
        />
      )}
    </>
  )
})

ZoomImage.displayName = 'ZoomImage'
export default ZoomImage
