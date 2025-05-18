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
  isZoomed?: boolean | undefined
  defaultZoomed?: boolean | undefined
  onZoomChange?: (zoomed: boolean) => void | undefined

  // Styling
  containerClassName?: string | undefined
  baseImageClassName?: string | undefined
  zoomImageClassName?: string | undefined
  closeButtonClassName?: string | undefined

  // Accessibility
  alt?: string
  zoomAlt?: string
  containerAriaLabel?: string
  closeButtonAriaLabel?: string
  zoomImageAriaLabel?: string
  tabIndex?: number

  // Customization
  hideCloseButton?: boolean | undefined
  closeButton?: React.ReactNode | undefined
  overlay?: React.ReactNode | undefined
  imgAttributes?:
    | (React.ImgHTMLAttributes<HTMLImageElement> & {
        [key: `data-${string}`]: unknown
      })
    | undefined

  // Callbacks
  onOpen?: (() => void) | undefined
  onClose?: (() => void) | undefined
  afterZoomIn?: (() => void) | undefined
  afterZoomOut?: (() => void) | undefined

  // Advanced
  disableDrag?: boolean;
  disableInertia?: boolean;
  loadingPlaceholder?: React.ReactNode;
  errorPlaceholder?: React.ReactNode;
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
  onClose?: (e: React.MouseEvent) => void
  onFadeOut?: (e: React.TransitionEvent<HTMLImageElement>) => void
  closeButtonRef: React.RefObject<HTMLButtonElement>
  onDragStart?: (e: React.MouseEvent | React.TouchEvent) => void | undefined
  onDragEnd?: (e: React.MouseEvent | React.TouchEvent) => void | undefined
  onTouchStart: (e: React.MouseEvent | React.TouchEvent) => void
  onTouchEnd: (e: React.MouseEvent | React.TouchEvent) => void
}

export type IBaseImageTypes = {
  src: string
  sources?: ImageSource[]
  width?: number
  height?: number
  imgAttributes?: React.ImgHTMLAttributes<HTMLImageElement>
  isZoomed?: boolean
  fadeDuration?: number
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
