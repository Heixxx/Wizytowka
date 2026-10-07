import { profile } from '../content.ts'
import { Icon } from './Icons.tsx'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <a className="footer__top" href="#start">
          Wróć na górę
          <Icon name="arrowUp" size={16} />
        </a>
      </div>
    </footer>
  )
}
