import React, { useState } from 'react'
import { Loader2, UploadCloud } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from './ui/card'

type Props = {
  title: string
  desc: string
  icon: React.ReactNode
  accept: string
  targetExt: string
  loading: boolean
  onFile: (file: File, customName?: string) => void
  extraInput?: React.ReactNode
}

const MotionCard = motion(Card)

export default function ToolCard({ title, desc, icon, accept, targetExt, loading, onFile, extraInput }: Props) {
  const [customName, setCustomName] = useState('')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileSelection = (file: File) => {
    const lastDot = file.name.lastIndexOf('.')
    const baseName = lastDot === -1 ? file.name : file.name.substring(0, lastDot)
    setCustomName(baseName)
    setPendingFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!loading) setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (loading) return

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelection(file)
    }
  }

  // Dynamically resolve dual-extension values (e.g. ".csv/.json") based on uploaded file type
  const getResolvedTargetExt = () => {
    if (targetExt.includes('/') && pendingFile) {
      const fileExt = pendingFile.name.substring(pendingFile.name.lastIndexOf('.')).toLowerCase()
      if (fileExt === '.json') return '.csv'
      if (fileExt === '.csv') return '.json'
    }
    return targetExt
  }

  return (
    <>
      <MotionCard
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col h-full relative overflow-hidden"
      >
        <CardContent className="p-6 sm:p-7 flex-1 flex flex-col">
          <div className="h-11 w-11 rounded-xl bg-orange-50 border border-orange-100/50 text-orange-600 flex items-center justify-center text-xl mb-5 shadow-2xs">
            {icon}
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6 line-clamp-2">{desc}</p>

          {extraInput && (
            <div className="space-y-5 mt-auto">
              <div className="border-t border-slate-100 pt-4">
                {extraInput}
              </div>
            </div>
          )}
        </CardContent>

        <div className="px-6 pb-6 sm:px-7 sm:pb-7">
          <label
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`group/btn w-full flex flex-col items-center justify-center gap-3 px-5 py-6 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer text-center
              ${isDragOver
                ? 'border-orange-500 bg-orange-50/30'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100/60 hover:border-slate-300'
              } 
              ${loading ? 'opacity-60 cursor-not-allowed border-slate-200 bg-slate-50' : ''}`}
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="p-2.5 rounded-full bg-white border border-slate-100 shadow-xs"
              >
                <Loader2 size={20} className="text-orange-600" />
              </motion.div>
            ) : (
              <div className={`p-2.5 rounded-full bg-white border border-slate-100 shadow-2xs group-hover/btn:scale-105 transition-transform ${isDragOver ? 'border-orange-200 scale-105' : ''}`}>
                <UploadCloud size={20} className={isDragOver ? 'text-orange-600' : 'text-slate-400 group-hover/btn:text-orange-600 transition-colors'} />
              </div>
            )}

            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-800 block">
                {loading ? "Processing files..." : "Drag & drop or browse"}
              </span>
              <span className="text-xs text-slate-400 block uppercase tracking-wider font-bold">
                Supports: {accept}
              </span>
            </div>

            <input
              type="file"
              accept={accept}
              className="hidden"
              disabled={loading}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) {
                  handleFileSelection(f)
                  e.currentTarget.value = ''
                }
              }}
            />
          </label>
        </div>
      </MotionCard>

      {/* Modern, elegant filename request dialog overlay */}
      <AnimatePresence>
        {pendingFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Darkened blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPendingFile(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
              className="relative w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-2xl p-6 md:p-7 overflow-hidden z-10"
            >
              {/* Premium color accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 to-amber-500" />

              <div className="flex items-start gap-4 mb-6">
                <div className="h-11 w-11 rounded-xl bg-orange-50 border border-orange-100/50 text-orange-600 flex items-center justify-center text-lg shrink-0">
                  {icon}
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-base md:text-lg font-bold text-slate-950">Name Your Converted File</h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Specify the custom download name for your converted file.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                    Source File
                  </span>
                  <div className="text-xs font-semibold text-slate-600 bg-slate-50 rounded-xl px-3.5 py-3 border border-slate-100/60 truncate flex items-center gap-2.5">
                    <span className="shrink-0 text-sm">📄</span>
                    <span className="truncate">{pendingFile.name}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                    Output Filename
                  </span>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="Enter custom filename..."
                        className="w-full flex h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all duration-200 font-medium"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && customName.trim() !== '') {
                            onFile(pendingFile, customName.trim())
                            setPendingFile(null)
                          }
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-center px-4 h-11 rounded-xl bg-orange-50 border border-orange-100/80 text-orange-600 font-bold text-xs shrink-0 select-none shadow-2xs">
                      {getResolvedTargetExt()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-7 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPendingFile(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={customName.trim() === ''}
                  onClick={() => {
                    if (pendingFile && customName.trim() !== '') {
                      onFile(pendingFile, customName.trim())
                      setPendingFile(null)
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white transition-all shadow-md shadow-orange-600/15 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Convert & Download
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
