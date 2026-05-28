import FeatureItem from './FeatureItem'
import { Shield, Zap, Check } from 'lucide-react'
import { motion } from 'framer-motion'

export default function FeaturesBlock() {
  return (
    <section className="py-24 border-t border-slate-200/50" id="features">
      <div className="section-container">
        <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-primary-start font-bold text-xs uppercase tracking-widest mb-3">
              Core Advantages
            </p>

            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
              Fast, secure, and <br />
              reliable conversion.
            </h2>

            <p className="text-slate-500 text-sm sm:text-base mb-10 leading-relaxed">
              We prioritize your productivity and data integrity. Our platform is engineered
              for professional use, ensuring your documents are handled with the highest standards.
            </p>

            <div className="grid grid-cols-3 gap-8 mb-12 py-8 border-y border-slate-200/60">
              {[
                { label: "Private", val: "100%" },
                { label: "Speed", val: "0.2s" },
                { label: "Uptime", val: "99.9%" }
              ].map((s, i) => (
                <div key={i}>
                  <p className="text-2xl font-extrabold text-slate-900">{s.val}</p>
                  <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-8">
              <FeatureItem
                icon={<Shield size={18} />}
                title="Data Privacy"
                desc="Files are processed in memory and immediately purged after conversion."
              />
              <FeatureItem
                icon={<Zap size={18} />}
                title="Instant Processing"
                desc="Optimized algorithms ensure your files are ready in the blink of an eye."
              />
              <FeatureItem
                icon={<Check size={18} />}
                title="Cross-Platform"
                desc="Works seamlessly across all modern browsers and devices."
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm aspect-square md:aspect-[4/5]">
              <img
                src="/secure_converter.png"
                alt="Professional Interface"
                className="w-full h-full object-cover opacity-90 transition-opacity"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-900/40 via-transparent to-transparent"></div>

              <div className="absolute bottom-6 left-6 right-6 p-5 rounded-xl bg-white/90 border border-slate-200/80 shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                  <p className="text-slate-900 text-xs font-bold tracking-widest uppercase">System Operational</p>
                </div>
                <div className="space-y-2">
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                      className="h-full bg-primary-start"
                    ></motion.div>
                  </div>
                  <p className="text-slate-500 text-[9px] font-semibold uppercase tracking-wider">Processing nodes active across 12 regions</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}