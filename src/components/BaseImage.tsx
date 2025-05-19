import React from 'react'
import { IBaseImageTypes } from '../ImageMagnifier.types'
import styles from '../styles.module.scss'

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
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasError, setHasError] = React.useState(false)

  const handleLoad = () => setIsLoading(false)

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
    onError?.()
  }

  const imageStyle = React.useMemo(
    () => ({
      '--fade-duration': `${isZoomed ? fadeDuration : 0}ms`,
      ...baseImageStyle,
    }),
    [isZoomed, fadeDuration, baseImageStyle]
  )

  const imageClass = [styles['c-point-focus__img'], baseImageClassName].filter(Boolean).join(' ')

  const imgElement = (
    <img
      alt={alt}
      src={src}
      style={imageStyle}
      onLoad={handleLoad}
      onError={handleError}
      className={imageClass}
      data-hidden={isZoomed}
      data-testid='pf-base-image'
    />
  )

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

      {isLoading && loadingPlaceholder && (
        <div className={styles['c-point-focus__placeholder']} data-testid='pf-base-loading'>
          {loadingPlaceholder}
        </div>
      )}

      {hasError && errorPlaceholder && (
        <div className={styles['c-point-focus__placeholder']} data-testid='pf-base-error'>
          {errorPlaceholder}
        </div>
      )}
    </>
  )
}

export default BaseImage
