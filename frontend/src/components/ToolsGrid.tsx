import { useState } from 'react'
import ToolCard from './ToolCard'
import useConverter from '../hooks/useConverter'
import { FileText, Layers, Image, Database, Grid, CheckCircle2, AlertCircle, Settings } from 'lucide-react'
import { motion } from 'framer-motion'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Select } from './ui/select'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

export default function ToolsGrid() {
  const { activeEndpoint, message, postFile } = useConverter()
  const [imageFormat, setImageFormat] = useState('png')

  return (
    <section className="py-20" id="tools">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Essential File Tools</h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed">
            Professional-grade utilities designed for speed and reliability.
            No registration required—just upload, convert, and download.
          </p>
        </motion.div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 max-w-xl mx-auto"
          >
            <Alert variant={message.type === 'success' ? 'success' : 'destructive'} className="shadow-xs">
              {message.type === 'success' ? (
                <CheckCircle2 className="text-emerald-600 flex-shrink-0" size={18} />
              ) : (
                <AlertCircle className="text-red-600 flex-shrink-0" size={18} />
              )}
              <AlertTitle>{message.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
              <AlertDescription>
                {message.text.replace(/^[✅❌]\s*/, '')}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <motion.div variants={itemVariants}>
            <ToolCard
              title="MD to PDF"
              desc="Convert Markdown or plain text files into clean, professional PDF documents."
              icon={<FileText size={20} />}
              accept=".md,text/markdown"
              targetExt=".pdf"
              loading={activeEndpoint === '/md-to-pdf'}
              onFile={(f, name) => postFile('/md-to-pdf', f, 'output.pdf', name)}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <ToolCard
              title="PDF to MD"
              desc="Extract text content from PDF documents accurately for editing and analysis."
              icon={<Layers size={20} />}
              accept="application/pdf"
              targetExt=".md"
              loading={activeEndpoint === '/pdf-to-md'}
              onFile={(f, name) => postFile('/pdf-to-md', f, 'output.md', name)}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <ToolCard
              title="Image Converter"
              desc="Transform images between multiple formats while maintaining visual integrity."
              icon={<Image size={20} />}
              accept="image/*"
              targetExt={'.' + imageFormat}
              loading={activeEndpoint === '/image/convert'}
              extraInput={
                <div className="mt-2 flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Settings size={11} className="text-orange-500" />
                    Output Format
                  </label>
                  <Select
                    value={imageFormat}
                    onChange={e => setImageFormat(e.target.value)}
                  >
                    {['png', 'jpg', 'webp', 'gif', 'bmp', 'tiff', 'ico', 'svg'].map(fmt => (
                      <option key={fmt} value={fmt}>{fmt.toUpperCase()}</option>
                    ))}
                  </Select>
                </div>
              }
              onFile={(f, name) => postFile(`/image/convert?to=${imageFormat}`, f, `new_image.${imageFormat}`, name)}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <ToolCard
              title="Excel to CSV"
              desc="Convert complex Excel spreadsheets into portable CSV files for data processing."
              icon={<Grid size={20} />}
              accept=".xlsx,.xls"
              targetExt=".csv"
              loading={activeEndpoint === '/excel-to-csv'}
              onFile={(f, name) => postFile('/excel-to-csv', f, 'data.csv', name)}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <ToolCard
              title="CSV to Excel"
              desc="Import CSV data into formatted Excel workbooks for better visualization."
              icon={<Database size={20} />}
              accept=".csv"
              targetExt=".xlsx"
              loading={activeEndpoint === '/csv-to-excel'}
              onFile={(f, name) => postFile('/csv-to-excel', f, 'data.xlsx', name)}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <ToolCard
              title="JSON ↔ CSV"
              desc="Convert JSON datasets to flat CSV spreadsheets, or translate CSV spreadsheets into structured JSON."
              icon={<Database size={20} />}
              accept=".json,.csv"
              targetExt=".csv/.json"
              loading={activeEndpoint === '/data-convert'}
              onFile={(f, name) => {
                const isCsv = f.name.toLowerCase().endsWith('.csv')
                const defaultOut = isCsv ? 'converted.json' : 'converted.csv'
                postFile('/data-convert', f, defaultOut, name)
              }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
