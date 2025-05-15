import React from 'react'
import { createPortal } from 'react-dom'
import styles from '../styles.module.scss'

type FullscreenPortalProps = {
  children: React.ReactElement
}

const FullscreenPortal = ({ children }: FullscreenPortalProps) => {
  const [portal] = React.useState(() => {
    const el = document.createElement('div')
    el.classList.add(styles['c-point-focus__zoom-portal'])
    return el
  })

  React.useEffect(() => {
    document.body.appendChild(portal)
    return () => {
      document.body.removeChild(portal)
    }
  }, [portal])

  return createPortal(children, portal)
}

export default FullscreenPortal
