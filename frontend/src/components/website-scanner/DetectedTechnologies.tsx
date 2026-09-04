import { Cloud, Layout, Cpu, BarChart3, ShieldCheck } from 'lucide-react'
import type { TechnologyItem } from '../../types/websiteScanner'

interface DetectedTechnologiesProps {
  technologies: TechnologyItem[]
}

const techIcons = {
  Cloudflare: Cloud,
  WordPress: Layout,
  jQuery: Cpu,
  'Google Analytics': BarChart3,
  reCAPTCHA: ShieldCheck
}

export default function DetectedTechnologies({ technologies }: DetectedTechnologiesProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[280px] hover:border-slate-700 transition-colors">
      {/* Header */}
      <div className="mb-4 text-left">
        <h2 className="text-base font-bold text-white leading-none">Detected Technologies</h2>
        <span className="text-xs text-slate-500 mt-1 block">Web frameworks & services detected</span>
      </div>

      {/* Tech list */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin scrollbar-thumb-slate-800 text-left">
        {technologies.map((tech) => {
          const IconComponent = techIcons[tech.name as keyof typeof techIcons] || Cpu
          return (
            <div
              key={tech.name}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-950/20 border border-slate-850/50"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="p-1.5 rounded bg-slate-850 text-slate-400 flex-shrink-0">
                  <IconComponent className="w-4 h-4 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-slate-200 truncate">{tech.name}</h3>
                  <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                    {tech.category}
                  </span>
                </div>
              </div>

              {/* Version Info */}
              {tech.version && (
                <span className="text-[10px] text-slate-450 font-mono bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                  {tech.version}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
