import { profile } from '../content.ts'
import BusinessCard from './BusinessCard.tsx'
import MatrixHills from './MatrixHills.tsx'

export default function Hero() {
  const lines = profile.name.split(' ').filter(Boolean)

  return (
    <section className="hero" id="start" data-layer>
      <MatrixHills />
      <div className="container hero__grid">
        <div className="hero__copy">
          <h1 className="hero__name" data-aos="fade-up">
            {lines.map((line, index) => (
              <span className="glitch" data-text={line} key={`${line}-${index}`}>
                {line}
              </span>
            ))}
          </h1>
          <p className="hero__role" data-aos="fade-up" data-aos-delay="120">
            {profile.role}
          </p>
          <p className="hero__headline" data-aos="fade-up" data-aos-delay="200">
            {profile.headline}
          </p>
          <div className="hero__actions" data-aos="fade-up" data-aos-delay="280">
            <a className="button button--primary" href="#projekty">
              <span>Zobacz projekty</span>
            </a>
            <a className="button button--ghost" href="#kontakt">
              <span>Kontakt</span>
            </a>
          </div>
        </div>
        <div className="hero__card" data-aos="zoom-in" data-aos-delay="250" data-aos-duration="1200">
          <BusinessCard />
        </div>
      </div>
    </section>
  )
}
