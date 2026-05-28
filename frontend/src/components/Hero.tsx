import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="relative pt-36 pb-20 overflow-hidden">
      {/* Premium ambient backdrop glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[450px] bg-gradient-to-b from-orange-500/5 to-transparent blur-3xl pointer-events-none z-0"></div>

      <div className="section-container relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50/60 border border-orange-100 text-orange-700 font-semibold text-xs sm:text-xs mb-8 uppercase tracking-wider shadow-xs"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-orange-600 animate-pulse"></span>
          Professional File Utilities
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.15]"
        >
          The easiest way to <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-start via-orange-600 to-primary-end">convert your files.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-base sm:text-lg text-slate-500 mb-10 leading-relaxed max-w-2xl mx-auto"
        >
          Seamlessly transform your PDFs, images, and documents into high-quality formats in seconds.
          Built for speed, precision, and complete data privacy.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-center gap-3"
        >
          <a href="#tools" className="btn-primary gap-2 group rounded-xl">
            Get Started
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </a>
          <a href="#features" className="btn-secondary rounded-xl">
            Learn More
          </a>
        </motion.div>
      </div>
    </section>
  )
}
