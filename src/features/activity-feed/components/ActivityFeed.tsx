import { motion, AnimatePresence } from 'motion/react'
import {
  Rocket,
  Bot,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'

type ActivityType = 'deploy' | 'agent' | 'error' | 'success' | 'info' | 'warning'

interface ActivityEntry {
  id: string
  type: ActivityType
  title: string
  description?: string
  timestamp: string
}

const typeConfig: Record<
  ActivityType,
  { icon: React.ElementType; color: string; bg: string }
> = {
  deploy: { icon: Rocket, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  agent: { icon: Bot, color: 'text-violet-400', bg: 'bg-violet-500/20' },
  error: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/20' },
  success: {
    icon: CheckCircle,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/20',
  },
  info: { icon: Info, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/20',
  },
}

const demoActivities: ActivityEntry[] = [
  {
    id: '1',
    type: 'success',
    title: 'Claude Agent completed task analysis',
    description: 'Workflow #847 finished in 3.2s',
    timestamp: '2s ago',
  },
  {
    id: '2',
    type: 'deploy',
    title: 'Deploying frontend v2.4.1...',
    description: 'Build passed, pushing to production',
    timestamp: '14s ago',
  },
  {
    id: '3',
    type: 'info',
    title: 'API Gateway: 2,847 requests/min',
    description: 'Traffic within normal range',
    timestamp: '32s ago',
  },
  {
    id: '4',
    type: 'success',
    title: 'Database backup completed',
    description: 'Full snapshot saved (2.4 GB)',
    timestamp: '1m ago',
  },
  {
    id: '5',
    type: 'info',
    title: 'Task Queue: 12 jobs processing',
    description: 'Avg processing time: 1.8s',
    timestamp: '2m ago',
  },
  {
    id: '6',
    type: 'warning',
    title: 'Memory usage above 80% on worker-3',
    description: 'Consider scaling or restarting',
    timestamp: '3m ago',
  },
  {
    id: '7',
    type: 'agent',
    title: 'New workflow triggered: data-pipeline',
    description: 'Agent orchestrating 4 sub-tasks',
    timestamp: '5m ago',
  },
  {
    id: '8',
    type: 'success',
    title: 'SSL certificate renewed',
    description: 'Valid until 2027-04-03',
    timestamp: '8m ago',
  },
]

interface ActivityFeedProps {
  maxItems?: number
  className?: string
}

export function ActivityFeed({ maxItems = 10, className }: ActivityFeedProps) {
  const entries = demoActivities.slice(0, maxItems)

  return (
    <div
      className={cn(
        'bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl flex flex-col overflow-hidden',
        className,
      )}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
        <h2 className="text-sm font-semibold text-white/90">Activity</h2>
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span className="text-[10px] text-white/40 uppercase tracking-wider">
          Live
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="relative">
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-white/[0.06]" />

          <AnimatePresence initial={false}>
            {entries.map((entry, i) => {
              const config = typeConfig[entry.type]
              const Icon = config.icon

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: -12, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="relative flex gap-3 pb-4 last:pb-0"
                >
                  <div
                    className={cn(
                      'relative z-10 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full',
                      config.bg,
                    )}
                  >
                    <Icon className={cn('h-3.5 w-3.5', config.color)} />
                  </div>

                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-xs font-medium text-white/85 leading-snug truncate">
                      {entry.title}
                    </p>
                    {entry.description && (
                      <p className="text-[11px] text-white/40 mt-0.5 truncate">
                        {entry.description}
                      </p>
                    )}
                  </div>

                  <span className="text-[10px] text-white/30 shrink-0 pt-1 tabular-nums">
                    {entry.timestamp}
                  </span>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
