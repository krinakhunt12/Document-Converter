import { useState, useEffect } from 'react'
import { Activity, Server, Cpu, Clock, Sliders } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'

export default function MetricsDashboard() {
  const [fileSize, setFileSize] = useState(15) // in MB
  const [activeNodes, setActiveNodes] = useState(11)
  
  // Estimate conversion speed (e.g. 0.05 seconds per MB)
  const estTime = Math.max(0.1, (fileSize * 0.035)).toFixed(2)

  // Simulate pulsating active nodes
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveNodes(prev => prev === 12 ? 11 : prev === 11 ? 12 : 11)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="py-20 bg-slate-50/30" id="metrics">
      <div className="section-container">
        <div className="text-center mb-16">
          <p className="text-primary-start font-bold text-xs uppercase tracking-widest mb-3">Live Telemetry</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Performance & estimation</h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed mt-2">
            Real-time server telemetry and conversion speed calculator. 
            Experience our ultra-low latency server array.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
          {/* Latency & Hardware Dashboard */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity size={18} className="text-orange-500" />
                Global Node Network
              </CardTitle>
              <CardDescription>Real-time edge latencies across our distribution nodes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Latency row */}
              <div className="space-y-4">
                {[
                  { region: "US Virginia Node", ip: "13.250.9.112", latency: "18ms", status: "Optimal", active: true },
                  { region: "EU Frankfurt Node", ip: "3.120.48.91", latency: "36ms", status: "Optimal", active: true },
                  { region: "Asia Tokyo Node", ip: "54.180.12.3", latency: "64ms", status: "Active", active: true },
                ].map((node, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{node.region}</p>
                        <p className="text-[10px] font-mono text-slate-400">{node.ip}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-orange-600">{node.latency}</p>
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide leading-none mt-0.5">{node.status}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Server Stats row */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                <div className="text-center p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
                  <Server size={16} className="text-slate-400 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-slate-800">{activeNodes}/12</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Active Nodes</p>
                </div>
                <div className="text-center p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
                  <Cpu size={16} className="text-slate-400 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-slate-800">18.4%</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Cluster Load</p>
                </div>
                <div className="text-center p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
                  <Clock size={16} className="text-slate-400 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-slate-800">99.99%</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Monthly Uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Calculator */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sliders size={18} className="text-orange-500" />
                Speed Calculator
              </CardTitle>
              <CardDescription>Select a size to estimate pipeline speeds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-orange-50/50 px-4 py-3 rounded-xl border border-orange-100/50">
                  <span className="text-xs font-bold text-slate-700">Mock File Size:</span>
                  <span className="text-sm font-extrabold text-orange-600">{fileSize} MB</span>
                </div>

                <div className="space-y-2 py-4">
                  <input 
                    type="range" 
                    min="1" 
                    max="100" 
                    value={fileSize}
                    onChange={e => setFileSize(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500 focus:outline-none"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>1 MB</span>
                    <span>50 MB</span>
                    <span>100 MB</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3.5 relative overflow-hidden shadow-md">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-orange-500/10 blur-xl pointer-events-none"></div>
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <Clock size={14} className="text-orange-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Estimated Pipeline Latency</span>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-extrabold text-white tracking-tight">{estTime}s</p>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Estimated time to complete upload, conversion, and start download on our cluster.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
