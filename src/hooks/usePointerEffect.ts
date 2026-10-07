import { useEffect, type RefObject } from 'react'

interface PointerEffectOptions {
  tilt?: number
}

const canHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function usePointerEffect(ref: RefObject<HTMLElement | null>, { tilt = 0 }: PointerEffectOptions = {}) {
  useEffect(() => {
    const element = ref.current
    if (!element || !canHover()) return undefined

    const tiltEnabled = tilt > 0 && !prefersReducedMotion()
    let frame = 0

    const handleEnter = () => element.classList.add('is-tracking')

    const handleMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width
      const y = (event.clientY - rect.top) / rect.height

      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        element.style.setProperty('--mx', `${(x * 100).toFixed(2)}%`)
        element.style.setProperty('--my', `${(y * 100).toFixed(2)}%`)

        if (tiltEnabled) {
          element.style.setProperty('--rx', `${((0.5 - y) * tilt).toFixed(2)}deg`)
          element.style.setProperty('--ry', `${((x - 0.5) * tilt).toFixed(2)}deg`)
        }
      })
    }

    const handleLeave = () => {
      cancelAnimationFrame(frame)
      element.classList.remove('is-tracking')
      element.style.setProperty('--rx', '0deg')
      element.style.setProperty('--ry', '0deg')
    }

    element.addEventListener('pointerenter', handleEnter)
    element.addEventListener('pointermove', handleMove)
    element.addEventListener('pointerleave', handleLeave)

    return () => {
      cancelAnimationFrame(frame)
      element.removeEventListener('pointerenter', handleEnter)
      element.removeEventListener('pointermove', handleMove)
      element.removeEventListener('pointerleave', handleLeave)
    }
  }, [ref, tilt])
}
