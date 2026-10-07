import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useLayerShuffle() {
  useEffect(() => {
    const media = gsap.matchMedia()

    media.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
        wide: '(min-width: 900px)',
      },
      (context) => {
        const { motion, wide } = context.conditions ?? {}
        if (!motion) return

        const layers = gsap.utils.toArray<HTMLElement>('[data-layer]')

        layers.forEach((layer, index) => {
          if (index === 0) return

          const direction = layer.dataset.tilt === 'right' ? 1 : -1
          const previous = layers[index - 1]

          gsap.fromTo(
            layer,
            { y: 120, rotation: 3 * direction, transformOrigin: direction > 0 ? '0% 0%' : '100% 0%' },
            {
              y: 0,
              rotation: 0,
              ease: 'none',
              scrollTrigger: { trigger: layer, start: 'top bottom', end: 'top 35%', scrub: 0.7 },
            },
          )

          if (!wide) return

          gsap.to(previous, {
            '--dim': 0.65,
            scale: 0.955,
            ease: 'none',
            scrollTrigger: { trigger: layer, start: 'top 75%', end: 'top top', scrub: 0.7 },
          })
        })

        ScrollTrigger.refresh()
      },
    )

    let frame = 0
    const refresh = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => ScrollTrigger.refresh())
    }

    let lastHeight = document.body.scrollHeight
    const observer = new ResizeObserver(() => {
      const height = document.body.scrollHeight
      if (Math.abs(height - lastHeight) < 40) return
      lastHeight = height
      refresh()
    })

    observer.observe(document.body)
    window.addEventListener('load', refresh)
    document.fonts?.ready.then(refresh)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('load', refresh)
      media.revert()
    }
  }, [])
}
