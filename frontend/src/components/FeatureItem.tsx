import React from 'react'

export default function FeatureItem({ title, desc, icon }: { title: string, desc: string, icon: React.ReactNode }) {
  return (
    <div className="flex gap-4.5">
      <div className="shrink-0 w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-xl border border-orange-100/50 shadow-2xs">
        {icon}
      </div>
      <div>
        <h4 className="text-base font-bold text-slate-900 mb-1">{title}</h4>
        <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}
