import { Check, Clock, AlertTriangle, Circle } from 'lucide-react'
import type { Milestone } from '@/lib/mock-data'

interface MilestoneTrackerProps {
  milestones: Milestone[]
}

const STATUS_CONFIG = {
  approved: { icon: Check, color: 'text-emerald-500', bg: 'bg-emerald-500', label: 'Approved' },
  submitted: { icon: Clock, color: 'text-[#dddddd]', bg: 'bg-white/20', label: 'Submitted' },
  active: { icon: Circle, color: 'text-[#dddddd]', bg: 'bg-white/10 border-2 border-[#dddddd]/50', label: 'Active' },
  disputed: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500', label: 'Disputed' },
  pending: { icon: Circle, color: 'text-slate-500', bg: 'bg-white/8', label: 'Pending' },
}

export function MilestoneTracker({ milestones }: MilestoneTrackerProps) {
  return (
    <div className="relative">
      {milestones.map((milestone, index) => {
        const config = STATUS_CONFIG[milestone.status]
        const Icon = config.icon
        const isLast = index === milestones.length - 1

        return (
          <div key={milestone.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                <Icon className={`w-4 h-4 ${milestone.status === 'active' ? 'text-[#dddddd]' : 'text-white'}`} />
              </div>
              {!isLast && <div className="w-0.5 bg-white/10 flex-1 my-1 min-h-[2rem]" />}
            </div>
            <div className={`pb-6 ${isLast ? '' : ''}`}>
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
              </div>
              <p className="text-slate-200 font-medium text-sm">{milestone.description}</p>
              <p className="text-[#dddddd] font-mono text-sm mt-0.5">{milestone.amount.toLocaleString()} XLM</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
