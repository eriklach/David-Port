import Navigation from './components/Navigation'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import About from './components/About'
import Services from './components/Services'
import Portfolio from './components/Portfolio'
import Manifesto from './components/Manifesto'
import Team from './components/Team'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function Home() {
  return (
    <main className="bg-dm-black">
      <Navigation />
      <Hero />
      <Marquee />
      <About />
      <Services />
      <Portfolio />
      <Manifesto />
      <Team />
      <Contact />
      <Footer />
    </main>
  )
}
