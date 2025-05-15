export type ImageSource = React.SourceHTMLAttributes<HTMLSourceElement>

export interface ImageMagnifierProps {
  moveType?: 'pan' | 'drag' | undefined;
  zoomType?: 'click' | 'hover' | undefined;
  src: string;
  sources?: ImageSource[];
  width?: number | undefined;
  height?: number | undefined;
  hasSpacer?: boolean | undefined;
  imgAttributes?: React.ImgHTMLAttributes<HTMLImageElement> & {
    [key: `data-${string}`]: unknown;
  } | undefined;
  zoomSrc?: string | undefined;
  zoomScale?: number | undefined;
  zoomPreload?: boolean | undefined;
  fadeDuration?: number | undefined;
  fullscreenOnMobile?: boolean | undefined;
  mobileBreakpoint?: number | undefined;
  hideCloseButton?: boolean | undefined;
  hideHint?: boolean | undefined;
  className?: string | undefined;
  afterZoomIn?: (() => void) | undefined;
  afterZoomOut?: (() => void) | undefined;
  ref?: React.MutableRefObject<HTMLDivElement | null> | undefined;
}

export type ImgProps = {
  onLoadCallback: (() => void) | null
  bounds: DOMRect | Record<string, number>
  offsets: { x: number; y: number }
  ratios: { x: number; y: number }
  eventPosition: { x: number; y: number }
  scaledDimensions: { width: number; height: number }
}

export type ZoomImageProps = {
  src: string
  fadeDuration: number
  top: number
  left: number
  isZoomed: boolean
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void
  onDragStart?: (e: React.MouseEvent | React.TouchEvent) => void
  onDragEnd?: (e: React.MouseEvent | React.TouchEvent) => void
  onClose?: (e: React.MouseEvent) => void
  onFadeOut?: (e: React.TransitionEvent<HTMLImageElement>) => void
}

export type ImageProps = {
  src: string
  sources?: ImageSource[]
  width?: number
  height?: number
  hasSpacer?: boolean
  imgAttributes?: React.ImgHTMLAttributes<HTMLImageElement>
  isZoomed?: boolean
  fadeDuration?: number
}
