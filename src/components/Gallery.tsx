import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { pad } from '../utils.ts'
import { Icon } from './Icons.tsx'
import Lightbox from './Lightbox.tsx'

interface GalleryProps {
  images: string[]
  title: string
  kind?: string
}

const visibleDepth = 3
const tilts = [0, 2.4, -1.8]

const poseFor = (position: number) => {
  const depth = Math.min(position, visibleDepth - 1)

  return {
    '--x': `${depth * 6}px`,
    '--y': `${depth * -6}px`,
    '--r': `${tilts[depth] * 0.55}deg`,
    '--s': 1 - depth * 0.025,
    '--o': position < visibleDepth ? 1 : 0,
    '--shade': depth * 0.34,
    '--z': 10 - Math.min(position, 9),
  } as CSSProperties
}

export default function Gallery({ images, title, kind = 'Projekt' }: GalleryProps) {
  const count = images.length
  const [front, setFront] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const frontRef = useRef(0)
  const zoomRef = useRef<HTMLButtonElement>(null)
  const restoreRef = useRef(false)

  const closeZoom = useCallback((index: number) => {
    frontRef.current = index
    restoreRef.current = true
    setFront(index)
    setZoomed(false)
  }, [])

  useEffect(() => {
    if (zoomed || !restoreRef.current) return
    restoreRef.current = false
    zoomRef.current?.focus()
  }, [zoomed])

  const advance = useCallback(() => {
    if (count < 2) return
    const current = frontRef.current
    const upcoming = (current + 1) % count
    frontRef.current = upcoming
    setFront(upcoming)
  }, [count])

  const label =
    count > 1 ? `${kind} ${title}, zdjęcie ${front + 1} z ${count}. Pokaż następne zdjęcie` : `${kind} ${title}`

  return (
    <div className={`stack${count > 1 ? ' stack--multi' : ''}`}>
      <button type="button" className="stack__hit" onClick={advance} disabled={count < 2} aria-label={label}>
        {images.map((src, index) => {
          return (
            <span
              key={`${src}-${index}`}
              className="stack__layer"
              style={poseFor((index - front + count) % count)}
            >
              <img src={src} alt="" loading="lazy" draggable={false} />
            </span>
          )
        })}
        {count > 1 && (
          <span className="stack__counter" aria-hidden="true">
            {pad(front + 1)} / {pad(count)}
          </span>
        )}
      </button>
      <button
        type="button"
        className="stack__zoom"
        ref={zoomRef}
        onClick={() => setZoomed(true)}
        aria-label={`Powiększ zdjęcie ${front + 1} z ${count}: ${kind} ${title}`}
      >
        <Icon name="expand" size={18} />
      </button>
      {zoomed && <Lightbox images={images} start={front} title={title} kind={kind} onClose={closeZoom} />}
    </div>
  )
}
