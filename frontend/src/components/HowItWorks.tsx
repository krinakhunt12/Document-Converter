import { motion } from 'framer-motion'
import { MousePointerClick, UploadCloud, Download } from 'lucide-react'

const steps = [
  {
    title: "Select Tool",
    desc: "Choose from our comprehensive list of document and image utilities.",
    icon: <MousePointerClick size={22} />,
  },
  {
    title: "Upload File",
    desc: "Securely drag & drop or upload your document. We prioritize your privacy.",
    icon: <UploadCloud size={22} />,
  },
  {
    title: "Get Results",
    desc: "Download your processed file instantly after conversion is complete.",
    icon: <Download size={22} />,
  }
]

export default function HowItWorks() {
  return (
    <section className="py-24 border-t border-slate-200/50 bg-slate-50/50" id="features">
      <div className="section-container">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary-start font-bold text-xs uppercase tracking-widest mb-3"
          >
            Workflow
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight"
          >
            Simple three-step process
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-350 hover:shadow-md transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-2xl mb-6 border border-orange-100/50 shadow-2xs group-hover:scale-105 transition-transform">
                {step.icon}
              </div>

              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-md leading-none">0{i + 1}</span>
                <h3 className="text-base font-bold text-slate-900">{step.title}</h3>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
