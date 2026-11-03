import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { pad } from '../utils.ts'
import { Icon } from './Icons.tsx'
import MatrixFrame from './MatrixFrame.tsx'

interface LightboxProps {
  images: string[]
  start: number
  title: string
  kind: string
  onClose: (index: number) => void
}

const swipeDistance = 50

export default function Lightbox({ images, start, title, kind, onClose }: LightboxProps) {
  const count = images.length
  const [index, setIndex] = useState(start)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const indexRef = useRef(start)
  const swipeRef = useRef<number | null>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  const show = (next: number) => {
    const target = (next + count) % count
    indexRef.current = target
    setIndex(target)
  }

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return undefined
    dialog.showModal()

    const handleCancel = (event: Event) => {
      event.preventDefault()
      closeRef.current(indexRef.current)
    }

    dialog.addEventListener('cancel', handleCancel)
    return () => {
      dialog.removeEventListener('cancel', handleCancel)
      if (dialog.open) dialog.close()
    }
  }, [])

  const handleKeyDown = (event: KeyboardEvent) => {
    if (count < 2) return
    if (event.key === 'ArrowRight') show(indexRef.current + 1)
    if (event.key === 'ArrowLeft') show(indexRef.current - 1)
  }

  const handlePointerDown = (event: PointerEvent) => {
    swipeRef.current = event.clientX
  }

  const handlePointerUp = (event: PointerEvent) => {
    if (swipeRef.current === null || count < 2) return
    const distance = event.clientX - swipeRef.current
    swipeRef.current = null
    if (Math.abs(distance) >= swipeDistance) show(indexRef.current + (distance < 0 ? 1 : -1))
  }

  return createPortal(
    <dialog
      className="lightbox"
      ref={dialogRef}
      aria-label={`${kind} ${title}, podgląd zdjęć`}
      onKeyDown={handleKeyDown}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose(indexRef.current)
      }}
    >
      <figure className="lightbox__figure">
        <div className="lightbox__frame" onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
          <MatrixFrame />
          <img
            className="lightbox__image"
            key={images[index]}
            src={images[index]}
            alt={`${kind} ${title}, zdjęcie ${index + 1} z ${count}`}
            draggable={false}
          />
        </div>
        <figcaption className="lightbox__caption">
          <span className="lightbox__title">{title}</span>
          {count > 1 && (
            <span className="lightbox__counter" aria-live="polite">
              {pad(index + 1)} / {pad(count)}
            </span>
          )}
        </figcaption>
      </figure>
      <button type="button" className="lightbox__button lightbox__close" onClick={() => onClose(indexRef.current)} aria-label="Zamknij podgląd">
        <Icon name="close" size={20} />
      </button>
      {count > 1 && (
        <>
          <button type="button" className="lightbox__button lightbox__nav lightbox__nav--prev" onClick={() => show(index - 1)} aria-label="Poprzednie zdjęcie">
            <Icon name="chevronLeft" size={22} />
          </button>
          <button type="button" className="lightbox__button lightbox__nav lightbox__nav--next" onClick={() => show(index + 1)} aria-label="Następne zdjęcie">
            <Icon name="chevronRight" size={22} />
          </button>
        </>
      )}
    </dialog>,
    document.body,
  )
}
