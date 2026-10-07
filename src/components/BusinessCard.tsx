import { useRef, useState } from 'react'
import { profile } from '../content.ts'
import { getInitials } from '../utils.ts'
import { usePointerEffect } from '../hooks/usePointerEffect.ts'

export default function BusinessCard() {
  const stageRef = useRef<HTMLDivElement>(null)
  const [flipped, setFlipped] = useState(false)
  const initials = getInitials(profile.name)

  usePointerEffect(stageRef, { tilt: 10 })

  return (
    <div className="card-wrap">
      <div className="card-stage" ref={stageRef}>
        <div className="bizcard-tilt">
          <button
            type="button"
            className={`bizcard${flipped ? ' is-flipped' : ''}`}
            onClick={() => setFlipped((value) => !value)}
            aria-pressed={flipped}
            aria-label="Odwróć wizytówkę"
          >
            <span className="bizcard__face bizcard__face--front">
              <span className="bizcard__top">
                <span className="bizcard__monogram">{initials}</span>
                <span className="bizcard__code" />
              </span>
              <span className="bizcard__identity">
                <span className="bizcard__name">{profile.name}</span>
                <span className="bizcard__role">{profile.role}</span>
              </span>
              <span className="bizcard__meta">
                <span>{profile.email}</span>
                {profile.phone && <span>{profile.phone}</span>}
              </span>
              <span className="bizcard__sheen" />
              <span className="bizcard__glare" />
            </span>
            <span className="bizcard__face bizcard__face--back">
              <span className="bizcard__emblem">{initials}</span>
              <span className="bizcard__tagline">{profile.tagline}</span>
              <span className="bizcard__url">{profile.website}</span>
              <span className="bizcard__sheen" />
            </span>
          </button>
        </div>
      </div>
      <p className="card-wrap__hint">Kliknij wizytówkę, aby ją odwrócić</p>
    </div>
  )
}
