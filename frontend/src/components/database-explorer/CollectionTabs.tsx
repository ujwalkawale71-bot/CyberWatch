interface CollectionTabsProps {
  activeTab: string
  onChange: (tab: string) => void
}

const tabs = [
  'All Collections',
  'URLs/Domains',
  'IP Addresses',
  'Extensions',
  'Files/Hashes',
  'Behavior Events',
  'Indicators',
  'Alerts',
  'Whitelist',
  'Others'
]

export default function CollectionTabs({ activeTab, onChange }: CollectionTabsProps) {
  return (
    <div className="flex overflow-x-auto gap-1.5 p-1 bg-slate-950/45 border border-slate-850 rounded-xl scrollbar-none select-none">
      {tabs.map((tab) => {
        const isActive = activeTab === tab

        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-semibold tracking-wide transition-all whitespace-nowrap leading-none ${
              isActive
                ? 'bg-slate-900 border border-slate-800 text-white font-bold'
                : 'text-slate-450 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        )
      })}
    </div>
  )
}
