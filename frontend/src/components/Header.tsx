import { Link } from 'react-router-dom'
import { Hexagon } from 'lucide-react'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-xs">
      <div className="section-container">
        <div className="h-16 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <div className="bg-linear-to-br from-primary-start to-primary-end text-white p-1.5 rounded-lg shadow-sm">
              <Hexagon size={18} className="fill-white/10" />
            </div>
            <span className="font-sans font-bold text-base tracking-tight text-slate-900">Nova Platform</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <nav className="flex gap-6 text-sm font-medium text-slate-500">
              <Link to="/tools" className="hover:text-slate-950 transition-colors">Tools</Link>
              <Link to="/features" className="hover:text-slate-950 transition-colors">Features</Link>
              <Link to="/faq" className="hover:text-slate-950 transition-colors">Help</Link>
            </nav>
            <a href="#tools" className="btn-primary text-sm py-1.5 px-4.5 rounded-lg shadow-sm">
              Get Started
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
