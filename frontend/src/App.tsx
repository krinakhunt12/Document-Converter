import React from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import ToolsGrid from './components/ToolsGrid'
import MetricsDashboard from './components/MetricsDashboard'
import HowItWorks from './components/HowItWorks'
import DetailedFeatures from './components/DetailedFeatures'
import FeaturesBlock from './components/FeaturesBlock'
import FAQBlock from './components/FAQBlock'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import { API_BASE } from './config'

function App({ initialScroll }: { initialScroll?: string } = {}) {
  React.useEffect(() => {
    const id = initialScroll || undefined
    if (id) {
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
    }
  }, [initialScroll])

  return (
    <div className="relative min-h-screen font-sans bg-surface-bg text-slate-600 selection:bg-orange-100 selection:text-orange-950">
      <Header />

      <main>
        <Hero />
        <ToolsGrid />
        <MetricsDashboard />
        <HowItWorks />
        <DetailedFeatures />
        <FeaturesBlock />
        <FAQBlock />

        {/* CTA Section */}
        <section className="py-24 bg-slate-100/50 border-y border-slate-200/60 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-orange-500/5 blur-3xl pointer-events-none"></div>

          <div className="section-container text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
              Ready to convert your files?
            </h2>
            <p className="text-slate-500 text-base mb-10 max-w-xl mx-auto leading-relaxed">
              Experience lightning-fast processing with our professional toolset.
              No installation required—start using Nova Platform today.
            </p>
            <a href="#tools" className="btn-primary px-8 py-3.5 text-base rounded-xl ">
              Get Started for Free
            </a>
          </div>
        </section>
      </main>

      <Footer apiBase={API_BASE} />
      <ScrollToTop />
    </div>
  )
}

export default App