import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp, Terminal } from 'lucide-react'

// Interface for ErrorFallback props
interface ErrorFallbackProps {
  error: Error | null
  resetErrorBoundary: () => void
}

// Visual premium fallback screen that can be used for both standard react crashes and router failures
export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false)

  const handleHomeClick = () => {
    window.location.href = '/'
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-50 px-4 py-12 overflow-hidden selection:bg-orange-100 selection:text-orange-950 font-sans">
      {/* Dynamic Ambient Blur Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] rounded-full bg-orange-600/5 blur-3xl pointer-events-none" />

      {/* Main Glassmorphic Error Container */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-2xl bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 text-center"
      >
        {/* Animated Warning Emblem */}
        <div className="inline-flex justify-center items-center mb-6">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: [0.9, 1.05, 0.9] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center border border-orange-500/20 shadow-inner"
          >
            <AlertTriangle size={32} className="stroke-[1.75]" />
          </motion.div>
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
          Something unexpected happened
        </h1>
        
        {/* User-friendly message */}
        <p className="text-slate-500 text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
          Nova encountered a minor glitch during processing. Don't worry, your files are safe. Let's try reloading or going back home.
        </p>

        {/* Responsive Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
          <button
            onClick={resetErrorBoundary}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-linear-to-r from-primary-start to-primary-end text-white hover:opacity-95 shadow-md shadow-orange-500/15 hover:shadow-orange-500/25 active:scale-[0.98] cursor-pointer"
          >
            <RefreshCw size={16} className="animate-spin-slow" />
            Reload Page
          </button>
          
          <button
            onClick={handleHomeClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-xs active:scale-[0.98] cursor-pointer"
          >
            <Home size={16} />
            Go to Home
          </button>
        </div>

        {/* Developer Diagnostics Accordion */}
        {error && (
          <div className="border-t border-slate-100 pt-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider cursor-pointer"
            >
              <Terminal size={14} />
              {showDetails ? 'Hide Diagnostics' : 'Show Diagnostics'}
              {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mt-4 text-left shadow-inner">
                    <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        Stack Trace Log
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${error.name}: ${error.message}\n\n${error.stack || ''}`)
                        }}
                        className="text-[10px] text-orange-400 hover:text-orange-300 font-mono transition-colors cursor-pointer"
                      >
                        [ Copy Log ]
                      </button>
                    </div>
                    
                    <div className="overflow-x-auto max-h-56 font-mono text-xs text-red-400 leading-relaxed scrollbar-thin select-text">
                      <div className="font-bold mb-1">{error.name}: {error.message}</div>
                      {error.stack && <pre className="whitespace-pre text-slate-400 opacity-90 mt-2">{error.stack}</pre>}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// Props and State interfaces for the boundary
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <ErrorFallback
          error={this.state.error}
          resetErrorBoundary={this.handleReset}
        />
      )
    }

    return this.props.children
  }
}
