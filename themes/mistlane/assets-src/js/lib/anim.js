// Shared, dependency-free animation helpers. Both the archive hub and the
// album page animate their headline statistics from zero when data arrives.

export const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const countUp = (element, value, { duration = 900, decimals = 0 } = {}) => {
  const target = Number(value)
  if (!element || !Number.isFinite(target)) return
  const factor = 10 ** decimals
  const format = number => (Math.round(number * factor) / factor).toFixed(decimals)
  if (prefersReducedMotion() || target <= 0) {
    element.textContent = format(target)
    return
  }

  const start = performance.now()
  const tick = now => {
    const progress = Math.min((now - start) / duration, 1)
    const eased = 1 - (1 - progress) ** 3
    element.textContent = format(target * eased)
    if (progress < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}
