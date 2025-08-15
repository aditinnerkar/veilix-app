import NavBar from './components/Navbar'
import Hero from './components/Hero'
import Company from './components/companies'
import WhySection from './components/WhySection'
import About from './components/About'
import Footer from './components/Footer'
import BeyondWave from './components/CustomPill'
import Services from './components/Services'
import Process from './components/Process'

const App = () => {
  return (
    <>
      <NavBar />
      <Hero />
      <Company/>
      <WhySection/>
      <About/>
      <Services/>
      <Process/>
      <div className="bg-[#0b0b0b] py-16">
        <BeyondWave className="mb-16" onClick={() => window.location.assign('mailto:parvez.rumi@veilix.ai')} />
      </div>
      <Footer/>
    </>
  )
}

export default App