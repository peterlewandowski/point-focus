export type ImageSource = React.SourceHTMLAttributes<HTMLSourceElement>

export interface IImageMagnifierTypes {
  moveType?: 'follow' | 'drag' | 'pinch'
  zoomType?: 'click' | 'hover'
  buttonScale?: number
  src: string
  sources?: ImageSource[]
  width?: number | undefined
  height?: number | undefined
  imgAttributes?:
    | (React.ImgHTMLAttributes<HTMLImageElement> & {
        [key: `data-${string}`]: unknown
      })
    | undefined
  zoomSrc?: string | undefined
  zoomScale?: number | undefined
  zoomPreload?: boolean | undefined
  fadeDuration?: number | undefined
  hideCloseButton?: boolean | undefined
  className?: string | undefined
  afterZoomIn?: (() => void) | undefined
  afterZoomOut?: (() => void) | undefined
  ref?: React.MutableRefObject<HTMLDivElement | null> | undefined
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