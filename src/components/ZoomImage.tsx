import React, { Fragment } from 'react'
import { ZoomImageProps } from '../ImageMagnifier.types'
import styles from '../styles.module.scss'

const ZoomImage = ({ src, fadeDuration, top, left, isZoomed, onLoad, onDragStart, onDragEnd, onClose, onFadeOut }: ZoomImageProps) => {
  const zoomImgClass = [styles['c-point-focus__zoom-img'], isZoomed && styles['c-point-focus__zoom-img--visible']].filter(Boolean).join(' ')
  const closeBtnClass = [styles['c-point-focus__btn'], styles['c-point-focus__close'], isZoomed && styles['c-point-focus__close--visible']].filter(Boolean).join(' ')

  return (
    <Fragment>
      <img
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
          className={closeBtnClass}
          style={{
            transition: `opacity ${fadeDuration}ms linear, visibility ${fadeDuration}ms linear`,
          }}
          onClick={onClose}
          aria-label='Zoom Out'
        />
      )}
    </Fragment>
  )
}

export default ZoomImage
