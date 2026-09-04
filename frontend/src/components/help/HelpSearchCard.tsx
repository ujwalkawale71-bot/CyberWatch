import { useState } from 'react'
import { Search } from 'lucide-react'

interface HelpSearchCardProps {
  onSearch: (query: string) => void
}

export default function HelpSearchCard({ onSearch }: HelpSearchCardProps) {
  const [query, setQuery] = useState('')

  const popular = ['False Positive', 'Whitelisting', 'API Integration', 'Scan Issues', 'Policy Rules']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  const handlePillClick = (term: string) => {
    setQuery(term)
    onSearch(term)
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-center space-y-4 hover:border-slate-750 transition-colors">
      <div className="space-y-1">
        <h2 className="text-lg font-extrabold text-white tracking-tight">How can we help you today?</h2>
        <p className="text-xs text-slate-500 font-medium">
          Search our knowledge base, guides, and documentation
        </p>
      </div>

      {/* Form query */}
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto flex gap-2 text-xs">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-slate-550" />
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search help articles..."
            className="w-full py-2.5 pl-9 pr-4 bg-slate-955 border border-slate-850 rounded-lg text-slate-200 placeholder-slate-650 focus:outline-none focus:border-blue-500 transition-all font-semibold"
          />
        </div>
        <button
          type="submit"
          className="py-2.5 px-5 font-bold text-white bg-gradient-to-r from-blue-500 to-purple-650 hover:from-blue-600 hover:to-purple-755 rounded-lg transition-all active:scale-[0.98] shadow-sm shadow-blue-500/10"
        >
          Search
        </button>
      </form>

      {/* Popular terms */}
      <div className="flex flex-wrap gap-2 items-center justify-center pt-2 text-[10.5px]">
        <span className="text-slate-500 font-bold uppercase tracking-wider scale-95">Popular:</span>
        {popular.map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => handlePillClick(term)}
            className="px-2.5 py-0.5 rounded-full bg-slate-950/40 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all leading-none font-semibold"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  )
}
