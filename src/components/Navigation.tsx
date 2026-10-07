import { useEffect, useState } from 'react'
import { profile } from '../content.ts'
import { getInitials } from '../utils.ts'
import { useActiveSection } from '../hooks/useActiveSection.ts'

const links = [
  { id: 'o-mnie', label: 'O mnie' },
  { id: 'projekty', label: 'Projekty' },
  { id: 'dyplomy', label: 'Dyplomy' },
  { id: 'kontakt', label: 'Kontakt' },
]

const sectionIds = links.map((link) => link.id)

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const active = useActiveSection(sectionIds)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`nav${scrolled ? ' nav--scrolled' : ''}`}>
      <div className="nav__frame" data-aos="fade-down" data-aos-offset="0">
        <div className="nav__bar">
          <nav className="nav__content" aria-label="Główna nawigacja">
            <a className="nav__brand" href="#start">
              <span className="nav__logo">{getInitials(profile.name)}</span>
              <span className="nav__name">{profile.name}</span>
            </a>
            <ul className="nav__links">
              {links.map((link) => (
                <li key={link.id}>
                  <a
                    className="nav__link"
                    href={`#${link.id}`}
                    aria-current={active === link.id ? 'true' : undefined}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}
