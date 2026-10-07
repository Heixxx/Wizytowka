import { useEffect, useState } from 'react'

export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState('')
  const key = ids.join('|')

  useEffect(() => {
    const sections = key
      .split('|')
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )

    sections.forEach((section) => observer.observe(section))

    const handleScroll = () => {
      if (window.scrollY < window.innerHeight * 0.4) setActive('')
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [key])

  return active
}
