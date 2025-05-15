import React from 'react'
import { ImageProps } from '../ImageMagnifier.types'
import styles from '../styles.module.scss'

const Image = ({ src, sources, width, height, hasSpacer, imgAttributes = {}, isZoomed, fadeDuration }: ImageProps) => {
  const createSpacer = width && height && hasSpacer
  const transitionDelay = `${isZoomed ? fadeDuration : 0}ms`

  const imageStyle = {
    transition: `opacity 0ms linear ${transitionDelay}, visibility 0ms linear ${transitionDelay}`,
    ...(imgAttributes.style || {}),
  }

  const imageClass = [styles['c-point-focus__img'], imgAttributes.className, isZoomed && styles['c-point-focus__img--hidden'], createSpacer && styles['c-point-focus__img--abs']].filter(Boolean).join(' ')

  return (
    <div style={{ paddingTop: createSpacer ? `${(height! / width!) * 100}%` : undefined }}>
      {sources && sources.length > 0 ? (
        <picture>
          {sources.map((source, i) =>
            source.srcSet ? (
              <React.Fragment key={i}>
                <source {...source} />
              </React.Fragment>
            ) : null
          )}
          <img {...imgAttributes} className={imageClass} style={imageStyle} src={src} width={width} height={height} />
        </picture>
      ) : (
        <img {...imgAttributes} className={imageClass} style={imageStyle} src={src} width={width} height={height} />
      )}
    </div>
  )
}

export default Image
