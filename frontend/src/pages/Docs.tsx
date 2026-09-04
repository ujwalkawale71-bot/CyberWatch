import { useState } from 'react'
import ChaptersList from '../components/docs/ChaptersList'
import ChapterContent from '../components/docs/ChapterContent'
import { docsChapters } from '../data/docsDemoData'

export default function Docs() {
  const [selectedId, setSelectedId] = useState(docsChapters[0].id)

  const selectedChapter = docsChapters.find((ch) => ch.id === selectedId) || docsChapters[0]

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto text-left animate-in fade-in duration-350">
      {/* Page Header */}
      <div className="border-b border-slate-800/40 pb-4">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">System Documentation & API Reference</h1>
        <p className="text-xs text-slate-400 mt-1.5 font-medium">
          Review architectural guidelines, database schemas, and REST endpoint payload configurations.
        </p>
      </div>

      {/* Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side: Chapters nav */}
        <div className="lg:col-span-1">
          <ChaptersList
            chapters={docsChapters}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {/* Right Side: Chapter contents */}
        <div className="lg:col-span-3">
          <ChapterContent chapter={selectedChapter} />
        </div>
      </div>
    </div>
  )
}
