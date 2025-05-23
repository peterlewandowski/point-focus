import React from 'react'
import { IImageTypes, ZoomFallbackBoundaryProps, ZoomFallbackBoundaryState } from '../ImageMagnifier.types'

export type PageCoords = { x: number; y: number }
export type OffSetCoords = { left: number; top: number }
export type PageDimensions = { width: number; height: number }

export function isTouchEvent(
  e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent | React.KeyboardEvent | KeyboardEvent
): e is TouchEvent | React.TouchEvent {
  return 'touches' in e || ('nativeEvent' in e && 'touches' in e.nativeEvent)
}

// Defaulted values to 0 to make the functions SSR safe
export function getPageCoords(
  e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent | React.KeyboardEvent | KeyboardEvent,
  fallbackElement?: HTMLElement | null
): PageCoords {
  if ('touches' in e && e.touches && e.touches.length > 0) {
    return { x: e.touches[0].pageX, y: e.touches[0].pageY }
  } else if ('pageX' in e && 'pageY' in e) {
    return { x: (e as any).pageX, y: (e as any).pageY } // Could further narrow with type guards
  } else if (fallbackElement) {
    const rect = fallbackElement.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  }
  return { x: 0, y: 0 }
}

export const getOffsets = (pageX: number, pageY: number, left: number, top: number): PageCoords => {
  return {
    x: pageX - left,
    y: pageY - top,
  }
}

export const getBounds = (container: HTMLDivElement | null): DOMRect | { width: number; height: number; left: number; top: number } => {
  return container ? container.getBoundingClientRect() : { width: 0, height: 0, left: 0, top: 0 }
}

export const getRatios = (
  bounds: { width: number; height: number },
  natural: { width: number; height: number },
  zoomScale: number
): PageCoords => {
  const scaledWidth = natural.width * zoomScale
  const scaledHeight = natural.height * zoomScale
  return {
    x: (scaledWidth - bounds.width) / bounds.width,
    y: (scaledHeight - bounds.height) / bounds.height,
  }
}

export function clampToBounds(left: number, top: number, bounds: { minLeft: number; maxLeft: number; minTop: number; maxTop: number }): OffSetCoords {
  return {
    left: Math.max(Math.min(left, bounds.maxLeft), bounds.minLeft),
    top: Math.max(Math.min(top, bounds.maxTop), bounds.minTop),
  }
}
export function calculateDragPosition(pageX: number, pageY: number, offsets: { x: number; y: number }): OffSetCoords {
  return {
    left: pageX - offsets.x,
    top: pageY - offsets.y,
  }
}

export const getScaledDimensions = (zoomedImgRef: HTMLImageElement, zoomScale: number): PageDimensions => {
  if (!zoomedImgRef || !zoomedImgRef.naturalWidth || !zoomedImgRef.naturalHeight) {
    return { width: 0, height: 0 }
  }
  return {
    width: zoomedImgRef.naturalWidth * zoomScale,
    height: zoomedImgRef.naturalHeight * zoomScale,
  }
}

export const getDefaults = (): IImageTypes => {
  const defaultCoordinates = { x: 0, y: 0 }
  return {
    onLoadCallback: null,
    bounds: { width: 0, height: 0, left: 0, top: 0 },
    offsets: defaultCoordinates,
    ratios: defaultCoordinates,
    scaledDimensions: { width: 0, height: 0 },
    dragStartCoords: defaultCoordinates,
    wasDragging: false,
    velocity: { vx: 0, vy: 0 },
    prevDragCoords: { x: 0, y: 0, time: 0 },
    lastDragCoords: { x: 0, y: 0, time: 0 },
  }
}

export class ZoomFallbackBoundary extends React.Component<ZoomFallbackBoundaryProps, ZoomFallbackBoundaryState> {
  constructor(props: ZoomFallbackBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: any, info: any) {
    console.error('ZoomImage runtime error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null
    }
    return this.props.children
  }
}
