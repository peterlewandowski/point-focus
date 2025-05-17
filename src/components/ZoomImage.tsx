import React from 'react'
import { IZoomImageTypes } from '../ImageMagnifier.types'
import styles from '../styles.module.scss'
import { CloseIcon } from '../assets/CloseIcon'

const ZoomImage = React.forwardRef<HTMLImageElement, IZoomImageTypes>(
  ({ src, fadeDuration, top, left, isZoomed, onLoad, onClose, onFadeOut, closeButtonRef }, ref) => {
    //Add custom class
    const zoomImgClass = [styles['c-point-focus__zoom-img']].filter(Boolean).join(' ')
    const closeBtnClass = [styles['c-point-focus__button']].filter(Boolean).join(' ')

    return (
      <>
        <img
          ref={ref}
          data-visible={isZoomed}
          className={zoomImgClass}
          style={{
            transform: `translate(${left}px, ${top}px)`,
            transition: `opacity ${fadeDuration}ms linear, visibility ${fadeDuration}ms linear`,
          }}
          src={src}
          onLoad={onLoad}
          onTransitionEnd={onFadeOut}
          draggable='false'
          alt=''
        />

        {onClose && (
          <button
            type='button'
            ref={closeButtonRef}
            title='Close Zoom'
            aria-label='Zoom Out'
            data-visible={isZoomed}
            data-action-type='close'
            className={closeBtnClass}
            style={{
              transition: `opacity ${fadeDuration}ms linear, visibility ${fadeDuration}ms linear`,
            }}
            onClick={onClose}>
            <CloseIcon />
          </button>
        )}
      </>
    )
  }
)

ZoomImage.displayName = 'ZoomImage'
export default ZoomImage
