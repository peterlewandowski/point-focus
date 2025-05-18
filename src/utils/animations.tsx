import { InertiaOptions } from '../ImageMagnifier.types'
import { clampToBounds } from './globalUtils'

export function startInertia({
  initialLeft,
  initialTop,
  velocity,
  setLeft,
  setTop,
  bounds,
  friction = 0.95,
  minVelocity = 10,
  onEnd,
}: InertiaOptions) {
  let left = initialLeft
  let top = initialTop
  let vx = velocity.vx
  let vy = velocity.vy

  function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(value, max))
  }

  function step() {
    vx *= friction
    vy *= friction

    left += vx * (1 / 60)
    top += vy * (1 / 60)

    // Clamp to bounds
    const clamped = clampToBounds(left, top, bounds)
    setLeft(clamped.left)
    setTop(clamped.top)

    if (Math.abs(vx) > minVelocity || Math.abs(vy) > minVelocity) {
      requestAnimationFrame(step)
    } else {
      // Snap to bounds one last time
      const finalClamped = clampToBounds(left, top, bounds)
      setLeft(finalClamped.left)
      setTop(finalClamped.top)
      if (onEnd) onEnd()
    }
  }

  requestAnimationFrame(step)
}
