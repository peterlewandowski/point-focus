import React from 'react'
import { IBaseImageTypes } from '../ImageMagnifier.types'
import styles from '../styles.module.scss'

const BaseImage = ({ src, sources, width, height, hasSpacer, imgAttributes = {}, isZoomed, fadeDuration }: IBaseImageTypes) => {
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
          {sources
            ?.filter(s => s.srcSet)
            .map((source, i) => (
              <source key={i} {...source} />
            ))}
          <img {...imgAttributes} className={imageClass} style={imageStyle} src={src} width={width} height={height} />
        </picture>
      ) : (
        <img {...imgAttributes} className={imageClass} style={imageStyle} src={src} width={width} height={height} />
      )}
    </div>
  )
}

export default BaseImage
