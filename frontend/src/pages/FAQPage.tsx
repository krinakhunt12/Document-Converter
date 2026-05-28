import Header from '../components/Header'
import FAQBlock from '../components/FAQBlock'
import Footer from '../components/Footer'
import ScrollToTop from '../components/ScrollToTop'
import { API_BASE } from '../config'

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-surface-bg flex flex-col font-sans text-slate-600 selection:bg-orange-100 selection:text-orange-950">
      <Header />
      <main className="flex-1 pt-20 pb-12">
        <FAQBlock />
      </main>
      <Footer apiBase={API_BASE} />
      <ScrollToTop />
    </div>
  )
}

