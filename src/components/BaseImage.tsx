import React from 'react'
import { IBaseImageTypes } from '../ImageMagnifier.types'
import styles from '../styles.module.scss'
import { FallbackImage } from '../assets/svgCollection'

const BaseImage = ({
  src,
  sources,
  baseImageStyle = {},
  isZoomed,
  fadeDuration,
  baseImageClassName,
  alt,
  loadingPlaceholder,
  errorPlaceholder,
  onError,
}: IBaseImageTypes) => {
  const imgRef = React.useRef<HTMLImageElement | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasError, setHasError] = React.useState(false)

  React.useEffect(() => {
    setIsLoading(true)
    setHasError(false)
  }, [src])

  const handleLoad = () => {
    console.log('Image loaded')
    setIsLoading(false)
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
    console.error('Image has error')
    onError?.()
  }

  React.useEffect(() => {
  const img = imgRef.current
  if (img && img.complete && img.naturalWidth > 0) {
    setIsLoading(false)
  }
}, [src])

  const imageStyle = React.useMemo(
    () => ({
      '--fade-duration': `${isZoomed ? fadeDuration : 0}ms`,
      ...baseImageStyle,
    }),
    [isZoomed, fadeDuration, baseImageStyle]
  )

  const imageClass = [styles['c-point-focus__img'], baseImageClassName].filter(Boolean).join(' ')

  const imgElement = !hasError ? (
    <img
      ref={imgRef}
      alt={alt}
      src={src}
      style={imageStyle}
      onLoad={handleLoad}
      onError={handleError}
      className={imageClass}
      data-hidden={isZoomed}
      data-testid='pf-base-image'
    />
  ) : null

  return (
    <>
      {sources && sources.length > 0 ? (
        <picture style={{ width: '100%', height: '100%' }}>
          {sources
            .filter(s => s.srcSet)
            .map((source, i) => (
              <source key={i} {...source} />
            ))}
          {imgElement}
        </picture>
      ) : (
        imgElement
      )}

      {isLoading && !hasError && (
        <div className={styles['c-point-focus__placeholder']} style={{ zIndex: 0 }} data-testid='pf-base-loading'>
          {loadingPlaceholder ?? <FallbackImage />}
        </div>
      )}

      {hasError && (
        <div className={styles['c-point-focus__placeholder']} style={{ zIndex: 0 }} data-testid='pf-base-error'>
          {errorPlaceholder ?? <FallbackImage />}
        </div>
      )}
    </>
  )
}

export default BaseImage
