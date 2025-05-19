export type ImageSource = React.SourceHTMLAttributes<HTMLSourceElement>

export interface IImageMagnifierTypes {
  // Core
  src: string
  sources?: ImageSource[]
  width?: number | undefined
  height?: number | undefined
  zoomSrc?: string | undefined
  zoomScale?: number | undefined
  zoomPreload?: boolean | undefined
  fadeDuration?: number | undefined
  moveType?: 'follow' | 'drag' | 'pinch'
  zoomType?: 'click' | 'hover'

  // State control
  externalZoomState?: boolean | undefined
  setExternalZoomState?: (value: boolean) => void | undefined
  clickToZoomOut?: boolean | undefined

  // Styling
  containerClassName?: string | undefined
  baseImageClassName?: string | undefined
  zoomImageClassName?: string | undefined
  closeButtonClassName?: string | undefined

  // Accessibility
  alt: string
  containerAriaLabel?: string
  closeButtonAriaLabel?: string
  zoomImageAriaLabel?: string
  tabIndex?: number

  // Customization
  hideCloseButton?: boolean | undefined
  closeButtonContent?: React.ReactNode | undefined
  overlay?: React.ReactNode | undefined
  baseImageStyle?: React.CSSProperties | undefined

  // Callbacks
  onMouseEnter?: (() => void) | undefined
  onMouseLeave?: (() => void) | undefined
  onClickImage?: (() => void) | undefined
  onZoom?: (() => void) | undefined
  onClose?: (() => void) | undefined
  afterZoomImgLoaded?: (() => void) | undefined
  afterZoomOut?: (() => void) | undefined
  onBaseImageError?: (() => void) | undefined
  onZoomImageError?: (() => void) | undefined
  onDragStart?: (() => void) | undefined
  onDragEnd?: (() => void) | undefined
  onZoomedMouseMove?: (() => void) | undefined

  // Advanced
  disableDrag?: boolean
  disableInertia?: boolean
  loadingPlaceholder?: React.ReactNode
  errorPlaceholder?: React.ReactNode
}

type ICoordinateObject = { x: number; y: number }

export type IImageTypes = {
  onLoadCallback: (() => void) | null
  bounds: DOMRect | Record<string, number>
  offsets: ICoordinateObject
  ratios: ICoordinateObject
  scaledDimensions: { width: number; height: number }
  wasDragging: boolean
  velocity: { vx: number; vy: number } | null
  dragStartCoords: ICoordinateObject
  prevDragCoords: { x: number; y: number; time: number } | null
  lastDragCoords: { x: number; y: number; time: number } | null
}

export type IZoomImageTypes = {
  src: string
  fadeDuration: number
  top: number
  left: number
  isZoomed: boolean
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void
  onError?: () => void
  onClose?: (e: React.MouseEvent) => void
  onFadeOut?: (e: React.TransitionEvent<HTMLImageElement>) => void
  closeButtonRef: React.RefObject<HTMLButtonElement>
  onDragStart?: (e: React.MouseEvent | React.TouchEvent) => void | undefined
  onDragEnd?: (e: React.MouseEvent | React.TouchEvent) => void | undefined
  onTouchStart: (e: React.MouseEvent | React.TouchEvent) => void
  onTouchEnd: (e: React.MouseEvent | React.TouchEvent) => void
  zoomImageClassName?: string | undefined
  closeButtonClassName?: string | undefined
  alt: string
  closeButtonAriaLabel?: string
  zoomImageAriaLabel?: string
  onKeyDown: (e: React.KeyboardEvent) => void
  closeButtonContent?: React.ReactNode | undefined
  loadingPlaceholder?: React.ReactNode
  errorPlaceholder?: React.ReactNode
}

export type IBaseImageTypes = {
  src: string
  sources?: ImageSource[]
  width?: number
  height?: number
  baseImageClassName?: string
  baseImageStyle?: React.CSSProperties
  isZoomed?: boolean
  fadeDuration?: number
  alt: string
  loadingPlaceholder?: React.ReactNode
  errorPlaceholder?: React.ReactNode
  onError?: (() => void) | undefined
}

export type InertiaOptions = {
  initialLeft: number
  initialTop: number
  velocity: { vx: number; vy: number }
  setLeft: (left: number) => void
  setTop: (top: number) => void
  bounds: { minLeft: number; maxLeft: number; minTop: number; maxTop: number }
  friction?: number
  minVelocity?: number
  onEnd?: () => void
}
