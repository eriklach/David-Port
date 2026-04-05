import Navigation from './components/Navigation'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Portfolio from './components/Portfolio'
import Services from './components/Services'
import Manifesto from './components/Manifesto'
import About from './components/About'
import Team from './components/Team'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function Home() {
  return (
    <main className="bg-dm-black">
      <Navigation />
      <Hero />
      <Marquee />
      <Portfolio />
      <Services />
      <Manifesto />
      <About />
      <Team />
      <Contact />
      <Footer />
    </main>
  )
}
