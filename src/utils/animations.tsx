type InertiaOptions = {
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
    left = clamp(left, bounds.minLeft, bounds.maxLeft)
    top = clamp(top, bounds.minTop, bounds.maxTop)

    setLeft(left)
    setTop(top)

    if (Math.abs(vx) > minVelocity || Math.abs(vy) > minVelocity) {
      requestAnimationFrame(step)
    } else {
      // Snap to bounds one last time, if needed
      setLeft(clamp(left, bounds.minLeft, bounds.maxLeft))
      setTop(clamp(top, bounds.minTop, bounds.maxTop))
      if (onEnd) onEnd()
    }
  }

  requestAnimationFrame(step)
}
