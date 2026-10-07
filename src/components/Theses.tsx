import { theses } from '../content.ts'
import { photos } from '../photos.ts'
import type { Thesis } from '../types.ts'
import { Icon } from './Icons.tsx'
import Gallery from './Gallery.tsx'
import Piece from './Piece.tsx'

interface ThesisCardProps {
  thesis: Thesis
  delay: number
}

function ThesisCard({ thesis, delay }: ThesisCardProps) {
  const images = photos(thesis.images)
  const classes = ['thesis', `thesis--${thesis.level}`, thesis.upcoming && 'thesis--upcoming', 'brackets', 'glow']
    .filter(Boolean)
    .join(' ')

  const meta = [
    ['Uczelnia', thesis.university],
    ['Kierunek', thesis.field],
    ['Specjalność', thesis.specialization],
    ['Promotor', thesis.supervisor],
    ['Ocena', thesis.grade],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]))

  return (
    <div className="thesis-slot" data-aos="fade-up" data-aos-delay={delay}>
      <article className={classes}>
        {thesis.level === 'doctorate' && <span className="thesis__ring" aria-hidden="true" />}
        <header className="thesis__head">
          <span className="thesis__degree">{thesis.degree}</span>
          {thesis.upcoming ? (
            <span className="thesis__soon">
              Planowane
            </span>
          ) : (
            thesis.year && <span className="thesis__year">{thesis.year}</span>
          )}
        </header>
        {thesis.upcoming && (
          <div className="thesis__placeholder" aria-hidden="true">
            <span className="thesis__placeholder-label">W przygotowaniu</span>
          </div>
        )}
        {!thesis.upcoming && images.length > 0 && (
          <div className="thesis__media">
            <Gallery images={images} title={thesis.title} kind={thesis.degree} />
          </div>
        )}
        <div className="thesis__body">
          <h3 className="thesis__title">{thesis.title}</h3>
          {meta.length > 0 && (
            <dl className="thesis__meta">
              {meta.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          )}
          {thesis.abstract && <p className="thesis__abstract">{thesis.abstract}</p>}
          {thesis.keywords && thesis.keywords.length > 0 && (
            <ul className="tags" aria-label="Słowa kluczowe">
              {thesis.keywords.map((keyword) => (
                <li className="tag" key={keyword}>
                  {keyword}
                </li>
              ))}
            </ul>
          )}
        </div>
        {(thesis.pdf || thesis.repo) && (
          <footer className="thesis__footer">
            {thesis.pdf && (
              <a className="link" href={thesis.pdf} target="_blank" rel="noreferrer">
                <Icon name="file" size={16} />
                Pobierz PDF
              </a>
            )}
            {thesis.repo && (
              <a className="link" href={thesis.repo} target="_blank" rel="noreferrer">
                <Icon name="github" size={16} />
                Repozytorium
              </a>
            )}
          </footer>
        )}
      </article>
    </div>
  )
}

export default function Theses() {
  return (
    <Piece id="dyplomy" title="Prace dyplomowe" tone="navy" tilt="left" layer={3}>
      <div className="theses">
        {theses.map((thesis, index) => (
          <ThesisCard key={`${thesis.degree}-${index}`} thesis={thesis} delay={(index % 2) * 120} />
        ))}
      </div>
    </Piece>
  )
}
