import { useEffect, useRef, useState, type AnimationEvent, type CSSProperties } from 'react'

interface Script {
  title: string
  tone: 'blue' | 'red'
  lines: string[]
}

interface Popup {
  id: number
  slot: number
  script: number
}

const scripts: Script[] = [
  { title: 'root@al: ~/scan', tone: 'blue', lines: ['$ nmap -sV 10.0.0.12', '22/tcp   open  ssh', '443/tcp  open  https', '> scan complete'] },
  { title: 'al@dev: ~/wizytowka', tone: 'blue', lines: ['$ npm run build', 'vite building for production...', '✓ 182 modules transformed', '> built in 0.19s'] },
  { title: 'wcag-audit', tone: 'blue', lines: ['$ wcag-audit --level AA', 'contrast ........ OK', 'keyboard ........ OK', '> score: 98/100'] },
  { title: 'security alert', tone: 'red', lines: ['intrusion attempt detected', 'origin: 185.23.11.4', 'firewall: blocked', '> threat neutralized'] },
  { title: 'root@al: ~', tone: 'blue', lines: ['$ ping matrix.local', '64 bytes: time=0.42 ms', '64 bytes: time=0.39 ms', '> link stable'] },
  { title: 'auth', tone: 'red', lines: ['ACCESS REQUEST', 'user: guest', 'pass: ********', '> ACCESS GRANTED'] },
  { title: 'al@dev: ~/wizytowka', tone: 'blue', lines: ['$ git push origin main', 'Enumerating objects: 12', 'Writing objects: 100%', '> deployed'] },
]

const slots: CSSProperties[] = [
  { left: '3%', top: '56%' },
  { left: '6%', top: '74%' },
  { right: '3%', top: '58%' },
  { right: '6%', top: '75%' },
]

const maxOpen = 2

export default function HeroWindows() {
  const [popups, setPopups] = useState<Popup[]>([])
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    let visible = true
    let timer = 0
    let nextId = 0
    let lastScript = -1

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    observer.observe(root)

    const spawn = () => {
      timer = window.setTimeout(spawn, 3500 + Math.random() * 3000)
      if (!visible || document.hidden || getComputedStyle(root).display === 'none') return

      const id = nextId
      nextId += 1
      let script = Math.floor(Math.random() * scripts.length)
      if (script === lastScript) script = (script + 1) % scripts.length
      lastScript = script
      const pick = Math.random()

      setPopups((current) => {
        if (current.length >= maxOpen) return current
        const used = new Set(current.map((popup) => popup.slot))
        const free = slots.map((_, index) => index).filter((index) => !used.has(index))
        return [...current, { id, script, slot: free[Math.floor(pick * free.length)] }]
      })
    }

    timer = window.setTimeout(spawn, 2200)

    return () => {
      window.clearTimeout(timer)
      observer.disconnect()
    }
  }, [])

  const remove = (id: number) => (event: AnimationEvent) => {
    if (event.target !== event.currentTarget) return
    setPopups((current) => current.filter((popup) => popup.id !== id))
  }

  return (
    <div className="hero__windows" ref={rootRef} aria-hidden="true">
      {popups.map((popup) => {
        const { title, tone, lines } = scripts[popup.script]
        return (
          <div className={`term term--${tone}`} style={slots[popup.slot]} key={popup.id} onAnimationEnd={remove(popup.id)}>
            <div className="term__bar">
              <span className="term__dots" />
              <span>{title}</span>
            </div>
            <div className="term__body">
              {lines.map((text, index) => (
                <span className="term__line" style={{ '--i': index, '--n': text.length } as CSSProperties} key={text}>
                  {text}
                </span>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
