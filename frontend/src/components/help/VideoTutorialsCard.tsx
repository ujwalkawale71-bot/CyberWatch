import { Play, Clock } from 'lucide-react'
import type { VideoItem } from '../../types/help'

interface VideoTutorialsCardProps {
  videos: VideoItem[]
  onWatch: (title: string) => void
}

export default function VideoTutorialsCard({ videos, onWatch }: VideoTutorialsCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col hover:border-slate-700 transition-colors text-left justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-white leading-none">Video Tutorials</h2>
          <span className="text-[10px] text-slate-500 mt-1 block">Watch short tutorials about workspace setup</span>
        </div>
        <button
          type="button"
          onClick={() => onWatch('All Platform Tutorial Videos')}
          className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors"
        >
          View All Videos
        </button>
      </div>

      {/* Videos list */}
      <div className="space-y-3 flex-1">
        {videos.map((vid) => (
          <div
            key={vid.id}
            onClick={() => onWatch(vid.title)}
            className="group cursor-pointer p-2.5 rounded-lg border border-slate-850 bg-slate-955/15 hover:bg-slate-900 transition-all flex gap-3 text-xs"
          >
            {/* Left: Thumbnail placeholder */}
            <div className="relative w-24 h-14 bg-slate-950 border border-slate-850 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
              {/* Play symbol watermark */}
              <div className="p-1.5 rounded-full bg-slate-900 border border-slate-800 text-blue-500 group-hover:scale-110 transition-transform">
                <Play className="w-3.5 h-3.5 fill-blue-500" />
              </div>
              <span className="absolute bottom-1 right-1 flex items-center space-x-0.5 bg-slate-900/90 border border-slate-850 px-1 py-0.2 rounded text-[7.5px] font-mono text-slate-450 font-bold leading-none">
                <Clock className="w-2 h-2" />
                <span>{vid.duration}</span>
              </span>
            </div>

            {/* Right: details */}
            <div className="flex-1 min-w-0 space-y-0.5">
              <h3 className="font-bold text-slate-200 truncate group-hover:text-blue-400 transition-colors">
                {vid.title}
              </h3>
              <p className="text-[10.5px] text-slate-500 font-medium leading-relaxed line-clamp-2">
                {vid.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
