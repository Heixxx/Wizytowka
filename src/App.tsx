import { useEffect } from 'react'
import AOS from 'aos'
import { profile } from './content.ts'
import { useLayerShuffle } from './hooks/useLayerShuffle.ts'
import Background from './components/Background.tsx'
import Navigation from './components/Navigation.tsx'
import Hero from './components/Hero.tsx'
import About from './components/About.tsx'
import Projects from './components/Projects.tsx'
import Theses from './components/Theses.tsx'
import Contact from './components/Contact.tsx'
import Footer from './components/Footer.tsx'

export default function App() {
  useLayerShuffle()

  useEffect(() => {
    document.title = `${profile.name} | ${profile.role}`

    AOS.init({
      duration: 850,
      easing: 'ease-out-cubic',
      once: true,
      offset: 100,
      disable: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    })
  }, [])

  return (
    <div className="page">
      <Background />
      <Navigation />
      <main>
        <Hero />
        <About />
        <Projects />
        <Theses />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
