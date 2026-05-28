import { Hexagon } from 'lucide-react'

export default function Footer({ apiBase }: { apiBase: string }) {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-16">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="bg-linear-to-br from-primary-start to-primary-end text-white p-1.5 rounded-lg shadow-sm">
                <Hexagon size={18} className="fill-white/10" />
              </div>
              <span className="font-sans font-bold text-base tracking-tight text-slate-900">Nova Platform</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm mb-6">
              A professional suite of file conversion tools designed for speed, security, and simplicity.
              No registration, no tracking, just results.
            </p>
            <div className="flex gap-6">
              {['Twitter', 'LinkedIn', 'GitHub'].map(social => (
                <a key={social} href="#" className="text-slate-400 hover:text-slate-900 text-xs font-bold uppercase tracking-wider transition-colors">
                  {social}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-slate-800 text-xs font-extrabold uppercase tracking-widest mb-5">Tools</h4>
            <ul className="space-y-2.5 text-slate-500 text-sm">
              <li><a href="#tools" className="hover:text-primary-start transition-colors">PDF Utilities</a></li>
              <li><a href="#tools" className="hover:text-primary-start transition-colors">Data Processing</a></li>
              <li><a href="#tools" className="hover:text-primary-start transition-colors">Image Conversion</a></li>
              <li><a href="#features" className="hover:text-primary-start transition-colors">Core Features</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-800 text-xs font-extrabold uppercase tracking-widest mb-5">System Status</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
                <span className="font-medium">All Systems Operational</span>
              </div>
              <div className="text-xs text-slate-500 font-mono bg-white p-2 rounded-lg border border-slate-200 truncate shadow-2xs">
                {apiBase}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200/80 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-xs font-medium">&copy; {new Date().getFullYear()} Nova Platform. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-slate-700 text-xs font-medium transition-colors">Privacy Policy</a>
            <a href="#" className="text-slate-400 hover:text-slate-700 text-xs font-medium transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
