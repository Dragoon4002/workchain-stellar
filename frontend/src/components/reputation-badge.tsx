import { Star } from 'lucide-react'

interface ReputationBadgeProps {
  score: number
  count: number
  size?: 'sm' | 'md'
}

export function ReputationBadge({ score, count, size = 'md' }: ReputationBadgeProps) {
  const stars = Math.round(score)
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`${iconSize} ${i < stars ? 'text-[#dddddd] fill-[#dddddd]' : 'text-white/20'}`}
          />
        ))}
      </div>
      <span className={`${textSize} text-white/40`}>
        {score.toFixed(1)} ({count})
      </span>
    </div>
  )
}
