export function animateTo(
  start: { left: number; top: number },
  end: { left: number; top: number },
  duration: number,
  easing: (t: number) => number,
  setLeft: (val: number) => void,
  setTop: (val: number) => void,
  onDone?: () => void
) {
  const startTime = performance.now()

  function step(now: number) {
    const elapsed = now - startTime
    const t = Math.min(1, elapsed / duration)
    const eased = easing(t)

    setLeft(start.left + (end.left - start.left) * eased)
    setTop(start.top + (end.top - start.top) * eased)

    if (t < 1) {
      requestAnimationFrame(step)
    } else {
      onDone && onDone()
    }
  }

  requestAnimationFrame(step)
}
