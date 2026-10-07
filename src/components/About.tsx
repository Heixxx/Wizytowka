import { useRef } from 'react'
import { profile } from '../content.ts'
import Piece from './Piece.tsx'

export default function About() {
  const panelRef = useRef<HTMLElement>(null)

  return (
    <Piece id="o-mnie" title="O mnie" tone="ink" tilt="left" layer={1}>
      <div className="about">
        <div className="about__text">
          {profile.about.map((paragraph, index) => (
            <p key={paragraph.slice(0, 32)} data-aos="fade-up" data-aos-delay={index * 90}>
              {paragraph}
            </p>
          ))}
        </div>
        <div data-aos="fade-left" data-aos-delay="120">
          <aside className="spec brackets glow" ref={panelRef} aria-label="Informacje">
            <dl className="spec__list">
              {profile.details.map((detail) => (
                <div className="spec__row" key={detail.label}>
                  <dt>{detail.label}</dt>
                  <dd>{detail.value}</dd>
                </div>
              ))}
            </dl>
            <h3 className="spec__title">Technologie</h3>
            <ul className="chips">
              {profile.stack.map((item) => (
                <li className="chip" key={item}>
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </Piece>
  )
}
