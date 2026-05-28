import { motion } from 'framer-motion'
import { Eye, Zap, ShieldAlert, Code, Table2, RefreshCw } from 'lucide-react'
import { Card, CardContent } from './ui/card'

const list = [
  {
    title: "Intelligent OCR Parsing",
    desc: "Uses contextual algorithms to extract flat and handwritten text from low-contrast PDF files.",
    icon: <Eye size={18} />,
  },
  {
    title: "Hardware Accelerated",
    desc: "Executes on blazing fast dedicated endpoints utilizing NVMe cache buffers and dedicated CPU allocations.",
    icon: <Zap size={18} />,
  },
  {
    title: "Zero-Trace Sandbox",
    desc: "Strictly processes documents in raw RAM. Absolutely no metadata, files, or logs touch static drives.",
    icon: <ShieldAlert size={18} />,
  },
  {
    title: "Developer API Bindings",
    desc: "Includes simple webhook callbacks and programmatic curl parameters for enterprise automation workflows.",
    icon: <Code size={18} />,
  },
  {
    title: "Table Layout Preservation",
    desc: "Intelligently identifies grid lines and cell boundaries to export structures from PDF directly into Excel.",
    icon: <Table2 size={18} />,
  },
  {
    title: "Pixel-Perfect Conversion",
    desc: "Applies anti-aliasing math filters when transforming between JPG, WebP, SVG, and ICO extensions.",
    icon: <RefreshCw size={18} />,
  }
]

export default function DetailedFeatures() {
  return (
    <section className="py-24 border-t border-slate-200/50" id="advanced-features">
      <div className="section-container">
        <div className="text-center mb-16">
          <p className="text-primary-start font-bold text-xs uppercase tracking-widest mb-3">Capabilities</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Built for power users</h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed mt-2">
            Explore advanced technical components engineered inside the Nova pipeline to guarantee speed, consistency, and precision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <Card className="h-full hover:border-slate-350 shadow-2xs hover:shadow-sm">
                <CardContent className="p-6 flex gap-4">
                  <div className="shrink-0 w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100/50 shadow-3xs">
                    {feat.icon}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">{feat.title}</h4>
                    <p className="text-slate-500 text-[11px] sm:text-xs leading-relaxed">{feat.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
