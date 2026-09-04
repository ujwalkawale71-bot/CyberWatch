import { BookOpen, Shield, Sliders, Bell, Cpu, Wrench, Users, Code, ArrowRight } from 'lucide-react'
import type { HelpTopicItem } from '../../types/help'

const iconMap = {
  BookOpen,
  Shield,
  Sliders,
  Bell,
  Cpu,
  Wrench,
  Users,
  Code
}

interface HelpTopicsGridProps {
  topics: HelpTopicItem[]
}

export default function HelpTopicsGrid({ topics }: HelpTopicsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
      {topics.map((topic) => {
        const Icon = iconMap[topic.iconName] || BookOpen

        return (
          <div
            key={topic.id}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4.5 flex flex-col justify-between hover:border-slate-700 transition-colors h-[175px]"
          >
            <div className="space-y-2">
              <div className="p-2 w-9 h-9 rounded bg-slate-955 text-slate-450 border border-slate-850 flex items-center justify-center">
                <Icon className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-200 block">{topic.title}</h3>
              <p className="text-[10.5px] text-slate-500 font-medium leading-relaxed">
                {topic.desc}
              </p>
            </div>

            <button className="text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors flex items-center space-x-1 mt-3">
              <span>View Articles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
