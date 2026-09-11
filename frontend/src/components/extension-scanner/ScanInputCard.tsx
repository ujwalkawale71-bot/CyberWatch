import { useState } from 'react'
import { ArrowRight, Upload, FileCode, Sparkles, Code2, Globe, Link2 } from 'lucide-react'

interface ScanInputCardProps {
  onScan: (value: string, method: 'url' | 'id' | 'upload' | 'paste' | 'package') => void
  onReset: () => void
  isLoading: boolean
}

type TabType = 'url' | 'upload' | 'paste'

const SAMPLE_MANIFESTS = {
  testA: {
    label: 'Test A: Minimal (Safe)',
    badge: 'SAFE',
    badgeCls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    data: {
      manifest_version: 3,
      name: 'Minimal Storage Utility',
      version: '1.0.0',
      description: 'A minimal extension with standard local storage permissions.',
      permissions: ['storage']
    }
  },
  testB: {
    label: 'Test B: Medium Risk',
    badge: 'MEDIUM',
    badgeCls: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    data: {
      manifest_version: 3,
      name: 'Scoped Tab Inspector',
      version: '1.2.0',
      description: 'Reads open tabs and communicates with a specific API origin.',
      permissions: ['tabs', 'storage'],
      host_permissions: ['https://*.api.example.com/*']
    }
  },
  testC: {
    label: 'Test C: High Risk',
    badge: 'HIGH',
    badgeCls: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    data: {
      manifest_version: 3,
      name: 'Universal Network Monitor',
      version: '2.0.0',
      description: 'Inspects web requests and cookies across all websites.',
      permissions: ['tabs', 'cookies', 'webRequest'],
      host_permissions: ['<all_urls>']
    }
  },
  testD: {
    label: 'Test D: Critical (Universal Interceptor)',
    badge: 'CRITICAL',
    badgeCls: 'text-red-400 bg-red-500/10 border-red-500/30',
    data: {
      manifest_version: 2,
      name: 'DevTools & Native Interceptor',
      version: '2.0.1',
      description: 'Legacy MV2 extension with debugger, native messaging, and blocking capabilities.',
      permissions: ['debugger', 'nativeMessaging', 'webRequest', 'webRequestBlocking'],
      host_permissions: ['<all_urls>']
    }
  }
}

export default function ScanInputCard({ onScan, onReset, isLoading }: ScanInputCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('url')
  const [urlInput, setUrlInput] = useState('')
  const [pasteInput, setPasteInput] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [manifestContent, setManifestContent] = useState<string | null>(null)
  const [packageBase64, setPackageBase64] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const realExtensionChips = [
    {
      label: 'Dark Reader',
      url: 'https://chromewebstore.google.com/detail/dark-reader/eimadpbcbfnmbkopoojfekhnkhdbieeh'
    },
    {
      label: 'React DevTools',
      url: 'https://chromewebstore.google.com/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi'
    },
    {
      label: 'uBlock Origin',
      url: 'https://chromewebstore.google.com/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm'
    },
    {
      label: 'Grammarly',
      url: 'https://chromewebstore.google.com/detail/grammarly-ai-writing-and/kbfnbcaeplbcioakkpcpgfkobkghlhen'
    }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (activeTab === 'url') {
      const clean = urlInput.trim()
      if (!clean) {
        setValidationError('Please enter a Chrome Web Store URL or 32-character Extension ID.')
        return
      }
      onScan(clean, 'url')
    } else if (activeTab === 'upload') {
      if (packageBase64) {
        onScan(packageBase64, 'package')
        return
      }
      if (!manifestContent) {
        setValidationError('Please select or drop a valid manifest.json or .crx/.zip package.')
        return
      }
      try {
        JSON.parse(manifestContent)
        onScan(manifestContent, 'upload')
      } catch (err: any) {
        setValidationError(`Invalid JSON syntax in manifest file: ${err.message}`)
      }
    } else if (activeTab === 'paste') {
      if (!pasteInput.trim()) {
        setValidationError('Please paste the manifest.json content.')
        return
      }
      try {
        JSON.parse(pasteInput)
        onScan(pasteInput, 'paste')
      } catch (err: any) {
        setValidationError(`Invalid JSON syntax: ${err.message}`)
      }
    }
  }

  const handleChipClick = (url: string) => {
    setActiveTab('url')
    setUrlInput(url)
    setValidationError(null)
  }

  const handleSampleManifestClick = (key: keyof typeof SAMPLE_MANIFESTS) => {
    const sample = SAMPLE_MANIFESTS[key]
    const jsonStr = JSON.stringify(sample.data, null, 2)
    setActiveTab('paste')
    setPasteInput(jsonStr)
    setManifestContent(jsonStr)
    setPackageBase64(null)
    setSelectedFile(`${key}_manifest.json`)
    setValidationError(null)
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
    setValidationError(null)

    if (file.name.endsWith('.crx') || file.name.endsWith('.zip')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          const binaryStr = event.target.result as ArrayBuffer
          const bytes = new Uint8Array(binaryStr)
          let binary = ''
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i])
          }
          const base64 = btoa(binary)
          setPackageBase64(base64)
          setManifestContent(null)
        }
      }
      reader.readAsArrayBuffer(file)
    } else {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          const text = event.target.result
          setManifestContent(text)
          setPasteInput(text)
          setPackageBase64(null)
        }
      }
      reader.readAsText(file)
    }
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
    setUrlInput('')
    setPasteInput('')
    setSelectedFile(null)
    setManifestContent(null)
    setPackageBase64(null)
    setValidationError(null)
    onReset()
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm transition-all">
      {/* Tab Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-1 p-1 bg-slate-950/60 rounded-lg border border-slate-800/80 self-start">
          <button
            type="button"
            onClick={() => {
              setActiveTab('url')
              setValidationError(null)
            }}
            className={`flex items-center space-x-1.5 py-1.5 px-3 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'url'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>Store URL / Extension ID</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('upload')
              setValidationError(null)
            }}
            className={`flex items-center space-x-1.5 py-1.5 px-3 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'upload'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-purple-400" />
            <span>Upload Manifest / CRX</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('paste')
              setValidationError(null)
            }}
            className={`flex items-center space-x-1.5 py-1.5 px-3 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'paste'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Paste JSON</span>
          </button>
        </div>

        {/* Test Preset Samples */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>Manifest Presets:</span>
          </span>
          {(Object.keys(SAMPLE_MANIFESTS) as Array<keyof typeof SAMPLE_MANIFESTS>).map((key) => {
            const item = SAMPLE_MANIFESTS[key]
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSampleManifestClick(key)}
                disabled={isLoading}
                className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-all hover:scale-105 active:scale-95 ${item.badgeCls}`}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      {validationError && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/25 rounded-lg text-xs font-medium text-red-300 flex items-center justify-between">
          <span>{validationError}</span>
          <button
            type="button"
            onClick={() => setValidationError(null)}
            className="text-red-400 hover:text-red-200 ml-2"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {activeTab === 'url' ? (
          /* Store URL / ID Input Tab */
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
              <Link2 className="w-4 h-4 text-blue-400" />
            </span>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value)
                setValidationError(null)
              }}
              placeholder="Paste Chrome Web Store URL (e.g. https://chromewebstore.google.com/detail/dark-reader/eimadpbcbfnmbkopoojfekhnkhdbieeh) or 32-char ID"
              disabled={isLoading}
              className="w-full py-3 pl-10 pr-4 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
            />
          </div>
        ) : activeTab === 'upload' ? (
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
              accept=".json,.crx,.zip"
              id="manifest-file"
              className="hidden"
              onChange={handleFileChange}
              disabled={isLoading}
            />
            <label htmlFor="manifest-file" className="cursor-pointer flex flex-col items-center space-y-2">
              <FileCode className={`w-8 h-8 ${selectedFile ? 'text-blue-400' : 'text-slate-500'}`} />
              <span className="text-xs font-bold text-slate-300">
                {selectedFile ? `Loaded: ${selectedFile}` : 'Drop manifest.json, .crx, or .zip here or click to browse'}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                Supports standard Chrome manifest.json or packed .crx / .zip extension archives
              </span>
            </label>
          </div>
        ) : (
          /* Paste JSON Tab */
          <div className="space-y-2">
            <textarea
              rows={6}
              value={pasteInput}
              onChange={(e) => {
                setPasteInput(e.target.value)
                setManifestContent(e.target.value)
                setValidationError(null)
              }}
              placeholder={`{\n  "manifest_version": 3,\n  "name": "My Extension",\n  "version": "1.0",\n  "permissions": ["storage", "tabs"],\n  "host_permissions": ["https://*.example.com/*"]\n}`}
              disabled={isLoading}
              className="w-full p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-650 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-y"
            />
          </div>
        )}

        {/* Submit and reset actions row */}
        <div className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center gap-3 pt-1">
          {activeTab === 'url' ? (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Quick Try:</span>
              {realExtensionChips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleChipClick(chip.url)}
                  disabled={isLoading}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded bg-slate-950/40 hover:bg-slate-800/80 border border-slate-800/80 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500 font-mono">
              {activeTab === 'upload' && selectedFile
                ? `Ready to audit: ${selectedFile}`
                : activeTab === 'paste' && pasteInput
                ? 'Manifest JSON ready to scan'
                : 'Select a file or paste manifest JSON above'}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 justify-end">
            <button
              type="submit"
              disabled={
                isLoading ||
                (activeTab === 'url' && !urlInput.trim()) ||
                (activeTab === 'upload' && !manifestContent && !packageBase64) ||
                (activeTab === 'paste' && !pasteInput.trim())
              }
              className="flex-1 sm:flex-initial py-2.5 px-5 text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all shadow-md shadow-blue-500/10 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center space-x-1.5 whitespace-nowrap"
            >
              <span>{isLoading ? 'Fetching & Analyzing Extension...' : 'Audit Security Risks'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>

            {((activeTab === 'url' && urlInput) ||
              (activeTab === 'upload' && selectedFile) ||
              (activeTab === 'paste' && pasteInput)) && (
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
