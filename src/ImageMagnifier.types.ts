export type ImageSource = React.SourceHTMLAttributes<HTMLSourceElement>

export interface IImageMagnifierTypes {
  moveType?: 'follow' | 'drag' | 'pinch'
  zoomType?: 'click' | 'hover'
  buttonScale?: number
  src: string
  sources?: ImageSource[]
  width?: number | undefined
  height?: number | undefined
  padding?: number | undefined
  hasSpacer?: boolean | undefined
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
  hideHint?: boolean | undefined
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
  eventPosition: ICoordinateObject
  scaledDimensions: { width: number; height: number }
  dragStartCoords: ICoordinateObject
  wasDragging: boolean
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
  hasSpacer?: boolean
  imgAttributes?: React.ImgHTMLAttributes<HTMLImageElement>
  isZoomed?: boolean
  fadeDuration?: number
}
