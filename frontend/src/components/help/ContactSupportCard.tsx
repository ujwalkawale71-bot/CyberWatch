import { MessageSquare, Mail, Phone, Globe, ChevronRight } from 'lucide-react'
import type { ContactChannel } from '../../types/help'

const iconMap = {
  MessageSquare,
  Mail,
  Phone,
  Globe
}

interface ContactSupportCardProps {
  options: ContactChannel[]
  onContact: (label: string) => void
}

export default function ContactSupportCard({ options, onContact }: ContactSupportCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col hover:border-slate-700 transition-colors text-left space-y-4">
      <div>
        <h2 className="text-sm font-bold text-white leading-none">Contact Support</h2>
        <span className="text-[10px] text-slate-500 mt-1 block">We're here to help! Choose the best way to reach us.</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {options.map((opt) => {
          const Icon = iconMap[opt.iconName] || MessageSquare

          return (
            <div
              key={opt.id}
              onClick={() => onContact(opt.label)}
              className="p-4 rounded-lg border border-slate-855 bg-slate-950/20 hover:bg-slate-900 hover:border-slate-700 transition-all flex justify-between items-center cursor-pointer text-xs group"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="p-2.5 rounded bg-slate-900 border border-slate-850 text-slate-400">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-slate-205 block leading-none mb-1 group-hover:text-blue-400 transition-colors">
                    {opt.label}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium leading-none block">
                    {opt.desc}
                  </span>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
