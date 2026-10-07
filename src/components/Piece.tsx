import type { ReactNode } from 'react'

interface PieceProps {
  id: string
  title: string
  tone: 'ink' | 'black' | 'navy' | 'light'
  tilt: 'left' | 'right'
  layer: number
  children: ReactNode
}

export default function Piece({ id, title, tone, tilt, layer, children }: PieceProps) {
  return (
    <section
      id={id}
      className={`piece piece--${tone} piece--${tilt}`}
      style={{ zIndex: layer }}
      data-layer
      data-tilt={tilt}
      aria-labelledby={`${id}-title`}
    >
      <span className="piece__edge" aria-hidden="true" />
      <div className="container">
        <header className="piece__header" data-aos="fade-up">
          <h2 className="piece__title" id={`${id}-title`}>
            {title}
          </h2>
          <span className="piece__rule" aria-hidden="true" />
        </header>
        {children}
      </div>
    </section>
  )
}
