import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const FAQS = [
  {
    q: "Is my data secure?",
    a: "Absolutely. We process files in-memory and delete them immediately after conversion. Your data never touches permanent storage."
  },
  {
    q: "Are there any usage limits?",
    a: "Nova Converter is 100% free with no hidden costs, premium tiers, or registration barriers. We are committed to keeping professional-grade document processing utilities open and accessible for everyone."
  },
  {
    q: "What file types are supported?",
    a: "We support a wide range of formats including PDF, Excel (XLSX/XLS), CSV, and various image formats like PNG, JPG, and WebP."
  },
  {
    q: "Do I need an account?",
    a: "No registration is required. You can start converting your files immediately without providing any personal information."
  }
]

export default function FAQBlock() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="py-20" id="faq">
      <div className="section-container">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary-start font-bold text-xs uppercase tracking-widest mb-3">Support</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Frequently asked questions</h2>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {FAQS.map((faq, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-2xl border bg-white transition-all duration-200 ${open === i ? 'border-slate-300 shadow-sm' : 'border-slate-200 hover:border-slate-300 hover:shadow-2xs'}`}
            >
              <button 
                className="w-full px-6 py-4.5 flex items-center justify-between text-left group cursor-pointer"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className={`text-sm sm:text-base font-bold transition-colors ${open === i ? 'text-orange-600' : 'text-slate-800 group-hover:text-slate-950'}`}>
                  {faq.q}
                </span>
                <motion.div 
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className={`flex-shrink-0 ml-4 transition-colors ${open === i ? 'text-orange-600' : 'text-slate-400 group-hover:text-slate-50'}`}
                >
                  <ChevronDown size={18} />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {open === i && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 pt-0.5 border-t border-slate-50">
                      <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}