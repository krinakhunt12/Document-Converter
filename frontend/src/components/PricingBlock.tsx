import { motion } from 'framer-motion'
import { Check, Flame } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card'

const plans = [
  {
    name: "Starter",
    price: "$0",
    desc: "Perfect for quick, one-off file conversions.",
    features: [
      "15 MB file size limit",
      "Standard queue priority",
      "Access to all 6 core tools",
      "No account required"
    ],
    popular: false,
    btn: "Start Converting"
  },
  {
    name: "Pro Team",
    price: "$19",
    period: "/mo",
    desc: "For professionals needing bulk speed & limits.",
    features: [
      "100 MB file size limit",
      "Priority hardware queues",
      "Bulk multiple file uploading",
      "24/7 dedicated support desk",
      "Early-access beta utilities"
    ],
    popular: true,
    btn: "Upgrade to Pro"
  },
  {
    name: "Developer API",
    price: "$49",
    period: "/mo",
    desc: "For software engineers automating parsing workflows.",
    features: [
      "500 MB file size limit",
      "Full webhook callback triggers",
      "cURL & Node SDK libraries",
      "Secure server memory sandboxing",
      "99.99% operational SLA uptime"
    ],
    popular: false,
    btn: "Get API Access"
  }
]

export default function PricingBlock() {
  return (
    <section className="py-24 border-t border-slate-200/50 bg-slate-50/20" id="pricing">
      <div className="section-container">
        <div className="text-center mb-20">
          <p className="text-primary-start font-bold text-xs uppercase tracking-widest mb-3">Licensing</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Flexible plans for everyone</h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed mt-2">
            No long term contracts. Upgrade, downgrade, or cancel at any time. 
            All core conversions are free forever.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
          {plans.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative"
            >
              {p.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-3 py-1 rounded-full bg-linear-to-r from-orange-500 to-amber-500 text-white font-extrabold text-[9px] uppercase tracking-wider shadow-sm">
                  <Flame size={10} className="fill-white" />
                  Most Popular
                </div>
              )}

              <Card className={`h-full flex flex-col relative overflow-hidden ${
                p.popular 
                  ? 'border-2 border-orange-500 shadow-md shadow-orange-500/5 bg-white scale-[1.01] z-10' 
                  : 'border-slate-200/80 bg-white/70 backdrop-blur-xs'
              }`}>
                {p.popular && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-xl pointer-events-none"></div>
                )}
                
                <CardHeader className="space-y-2">
                  <CardTitle className="text-lg font-extrabold text-slate-800">{p.name}</CardTitle>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{p.price}</span>
                    {p.period && <span className="text-xs text-slate-400 font-bold">{p.period}</span>}
                  </div>
                  <CardDescription className="text-xs font-semibold leading-relaxed">{p.desc}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 flex-1 flex flex-col justify-between pt-0 mt-4">
                  <ul className="space-y-3.5 text-xs">
                    {p.features.map((feat, index) => (
                      <li key={index} className="flex items-center gap-3 text-slate-600 font-medium">
                        <div className={`p-0.5 rounded-full ${p.popular ? 'bg-orange-500/10 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                          <Check size={11} strokeWidth={3} />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <a 
                    href="#tools"
                    className={`w-full py-2.5 rounded-xl text-center text-xs font-bold transition-all duration-200 block shadow-2xs hover:shadow-sm cursor-pointer ${
                      p.popular
                        ? 'bg-linear-to-r from-orange-500 to-amber-600 text-white hover:opacity-95 shadow-orange-500/10'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {p.btn}
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
