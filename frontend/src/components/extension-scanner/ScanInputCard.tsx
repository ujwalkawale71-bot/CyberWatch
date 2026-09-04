import { useState } from 'react'
import { ArrowRight, Puzzle, Upload, FileCode } from 'lucide-react'

interface ScanInputCardProps {
  onScan: (value: string, method: 'id' | 'upload') => void
  onReset: () => void
  isLoading: boolean
}

type TabType = 'id' | 'upload'

export default function ScanInputCard({ onScan, onReset, isLoading }: ScanInputCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('id')
  const [idInput, setIdInput] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  const exampleChips = [
    { label: 'Free Video Downloader Pro', id: 'aabcbjklmmebngbpkgaldbf...' },
    { label: 'PDF Converter Ultimate', id: 'mgihjoopjmpdfconvult...' },
    { label: 'Dark Theme for Chrome', id: 'darkthemechromeextension...' }
  ]

  const [manifestContent, setManifestContent] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (activeTab === 'id' && idInput.trim()) {
      onScan(idInput.trim(), 'id')
    } else if (activeTab === 'upload' && manifestContent) {
      onScan(manifestContent, 'upload')
    }
  }

  const handleChipClick = (id: string) => {
    setActiveTab('id')
    setIdInput(id)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const processFile = (file: File) => {
    setSelectedFile(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        setManifestContent(event.target.result)
      }
    }
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const handleClear = () => {
    setIdInput('')
    setSelectedFile(null)
    setManifestContent(null)
    onReset()
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-left transition-all duration-300 hover:border-slate-800/90">
      {/* Input Methods Tabs */}
      <div className="flex space-x-1.5 p-1 bg-slate-950/65 rounded-lg border border-slate-800/40 w-fit mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('id')}
          className={`flex items-center space-x-1.5 py-1.5 px-4 rounded-md text-xs font-semibold transition-all ${
            activeTab === 'id'
              ? 'bg-slate-800 text-white shadow-sm border border-slate-700/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Puzzle className="w-3.5 h-3.5" />
          <span>Extension ID</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex items-center space-x-1.5 py-1.5 px-4 rounded-md text-xs font-semibold transition-all ${
            activeTab === 'upload'
              ? 'bg-slate-800 text-white shadow-sm border border-slate-700/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload manifest.json</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {activeTab === 'id' ? (
          /* ID Input Tab */
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
              <Puzzle className="w-4 h-4 text-slate-500" />
            </span>
            <input
              type="text"
              value={idInput}
              onChange={(e) => setIdInput(e.target.value)}
              placeholder="e.g., aabcbjklmmebngbpkgaldbf..."
              disabled={isLoading}
              className="w-full py-2.5 pl-10 pr-4 bg-slate-950/40 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-650 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
            />
          </div>
        ) : (
          /* File Upload Tab */
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-500/5'
                : 'border-slate-800 hover:border-slate-700 bg-slate-950/20'
            }`}
          >
            <input
              type="file"
              accept=".json"
              id="manifest-file"
              className="hidden"
              onChange={handleFileChange}
              disabled={isLoading}
            />
            <label htmlFor="manifest-file" className="cursor-pointer flex flex-col items-center space-y-2">
              <FileCode className={`w-8 h-8 ${selectedFile ? 'text-blue-500' : 'text-slate-500'}`} />
              <span className="text-xs font-bold text-slate-350">
                {selectedFile ? `Selected: ${selectedFile}` : 'Drop manifest.json here or click to browse'}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">manifest.json files only</span>
            </label>
          </div>
        )}

        {/* Submit and reset actions row */}
        <div className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center gap-3 pt-1">
          {/* Example Chips */}
          {activeTab === 'id' ? (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Examples:</span>
              {exampleChips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleChipClick(chip.id)}
                  disabled={isLoading}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded bg-slate-950/40 hover:bg-slate-800/80 border border-slate-800/80 text-slate-400 hover:text-slate-200 transition-colors truncate max-w-[200px]"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          ) : (
            <div />
          )}

          {/* Action buttons */}
          <div className="flex gap-2 justify-end">
            <button
              type="submit"
              disabled={
                isLoading ||
                (activeTab === 'id' && !idInput.trim()) ||
                (activeTab === 'upload' && !selectedFile)
              }
              className="flex-1 sm:flex-initial py-2.5 px-5 text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all shadow-md shadow-blue-500/10 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center space-x-1.5 whitespace-nowrap"
            >
              <span>{isLoading ? 'Analyzing...' : 'Analyze Extension'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>

            {((activeTab === 'id' && idInput) || (activeTab === 'upload' && selectedFile)) && (
              <button
                type="button"
                onClick={handleClear}
                className="py-2.5 px-3 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-850 rounded-lg border border-slate-800 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
