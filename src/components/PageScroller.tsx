import { useRef, useState } from 'react'
import { stripProtocol } from '../utils.ts'
import { Icon } from './Icons.tsx'

interface PageScrollerProps {
  src: string
  url?: string
  title: string
}

type LoadStatus = 'loading' | 'ready' | 'error'

export default function PageScroller({ src, url, title }: PageScrollerProps) {
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [touched, setTouched] = useState(false)
  const [progress, setProgress] = useState(0)
  const viewportRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef(0)

  const handleScroll = () => {
    cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(() => {
      const viewport = viewportRef.current
      if (!viewport) return
      const max = viewport.scrollHeight - viewport.clientHeight
      setProgress(max > 0 ? viewport.scrollTop / max : 0)
      if (viewport.scrollTop > 6) setTouched(true)
    })
  }

  const classes = ['scroller', touched && 'is-touched', `is-${status}`]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes}>
      <div className="scroller__bar">
        <span className="scroller__host">{url ? stripProtocol(url) : 'Podgląd strony'}</span>
        <span className="scroller__percent">{String(Math.round(progress * 100)).padStart(3, '0')}%</span>
      </div>
      <div
        className="scroller__viewport"
        ref={viewportRef}
        tabIndex={0}
        onScroll={handleScroll}
        aria-label={`Podgląd całej strony projektu ${title}. Przewiń, aby zobaczyć więcej.`}
      >
        <img
          className="scroller__image"
          src={src}
          alt={`Zrzut całej strony projektu ${title}`}
          loading="lazy"
          draggable={false}
          onLoad={() => setStatus('ready')}
          onError={() => setStatus('error')}
        />
      </div>
      {status === 'loading' && (
        <div className="scroller__status">
          <span className="scroller__loader" />
          Pobieranie zrzutu strony
        </div>
      )}
      {status === 'error' && (
        <div className="scroller__status scroller__status--error">
          Podgląd strony jest chwilowo niedostępny.
        </div>
      )}
      {status === 'ready' && (
        <span className="scroller__hint" aria-hidden="true">
          <Icon name="mouse" size={14} />
          Przewiń podgląd
        </span>
      )}
    </div>
  )
}
