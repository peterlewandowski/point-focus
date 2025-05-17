import React from 'react'
import { IBaseImageTypes } from '../ImageMagnifier.types'
import styles from '../styles.module.scss'

const BaseImage = ({ src, sources, imgAttributes = {}, isZoomed, fadeDuration }: IBaseImageTypes) => {
  const imageStyle = React.useMemo(
    () => ({
      "--fade-duration": `${isZoomed ? fadeDuration : 0}ms`,
      ...(imgAttributes.style || {}),
    }),
    [isZoomed, fadeDuration, imgAttributes.style]
  )

  const imageClass = [styles['c-point-focus__img'], imgAttributes.className]
    .filter(Boolean)
    .join(' ')

  return sources && sources.length > 0 ? (
    <picture style={{ width: '100%', height: '100%' }}>
      {sources
        .filter(s => s.srcSet)
        .map((source, i) => (
          <source key={i} {...source} />
        ))}
      <img {...imgAttributes} data-hidden={isZoomed} className={imageClass} style={imageStyle} src={src} />
    </picture>
  ) : (
    <img {...imgAttributes} data-hidden={isZoomed} className={imageClass} style={imageStyle} src={src} />
  )
}

export default BaseImage
