import { profile } from '../content.ts'
import { stripProtocol } from '../utils.ts'
import { Icon, type IconName } from './Icons.tsx'
import Piece from './Piece.tsx'

interface ContactRowData {
  label: string
  value: string
  href?: string
  icon: IconName
  external?: boolean
}

const contactRows = [
  profile.email && { label: 'E-mail', value: profile.email, href: `mailto:${profile.email}`, icon: 'mail' },
  profile.phone && {
    label: 'Telefon',
    value: profile.phone,
    href: `tel:${profile.phone.replace(/\s/g, '')}`,
    icon: 'phone',
  },
  profile.location && { label: 'Lokalizacja', value: profile.location, icon: 'pin' },
  profile.github && {
    label: 'GitHub',
    value: stripProtocol(profile.github),
    href: profile.github,
    icon: 'github',
    external: true,
  },
  profile.website && {
    label: 'Strona',
    value: profile.website,
    href: profile.website.includes('.') ? `https://${stripProtocol(profile.website)}` : undefined,
    icon: 'globe',
    external: true,
  },
].filter(Boolean) as ContactRowData[]

function ContactRow({ row }: { row: ContactRowData }) {
  const content = (
    <>
      <span className="contact-row__label">{row.label}</span>
      <span className="contact-row__value">{row.value}</span>
      <Icon name={row.icon} size={18} />
    </>
  )

  if (!row.href) return <div className="contact-row">{content}</div>

  return (
    <a
      className="contact-row"
      href={row.href}
      {...(row.external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {content}
    </a>
  )
}

export default function Contact() {
  return (
    <Piece id="kontakt" title="Kontakt" tone="light" tilt="right" layer={4}>
      <div className="contact">
        <div className="contact__intro">
          <h3 className="contact__title" data-aos="fade-up">
            Chętnie zrealizuję z Tobą pomysł!
          </h3>
          <p className="contact__text" data-aos="fade-up" data-aos-delay="80">
            Odpowiadam najszybciej, jak to możliwe.
          </p>
        </div>
        <div data-aos="fade-left" data-aos-delay="120">
          <div className="contact-card brackets">
            <p className="contact-card__head">
              <span>Dane kontaktowe</span>
            </p>
            <ul className="contact-card__list">
              {contactRows.map((row) => (
                <li key={row.label}>
                  <ContactRow row={row} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Piece>
  )
}
