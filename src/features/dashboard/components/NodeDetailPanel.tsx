import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  X,
  RotateCcw,
  ScrollText,
  ExternalLink,
  Bot,
  Server,
  Database,
  Globe,
  GitBranch,
  Activity,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type {
  NexusNodeData,
  NodeCategory,
  NodeStatus,
} from '@/features/canvas/types/canvas.types'

const categoryIcons: Record<NodeCategory, React.ElementType> = {
  agent: Bot,
  service: Server,
  database: Database,
  api: Globe,
  workflow: GitBranch,
  monitor: Activity,
}

const statusConfig: Record<
  NodeStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  running: {
    label: 'Running',
    color: 'text-blue-400',
    bg: 'bg-blue-500/15',
    dot: 'bg-blue-500',
  },
  success: {
    label: 'Online',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    dot: 'bg-emerald-500',
  },
  error: {
    label: 'Error',
    color: 'text-red-400',
    bg: 'bg-red-500/15',
    dot: 'bg-red-500',
  },
  warning: {
    label: 'Warning',
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    dot: 'bg-amber-500',
  },
  idle: {
    label: 'Idle',
    color: 'text-violet-400',
    bg: 'bg-violet-500/15',
    dot: 'bg-violet-500',
  },
  queued: {
    label: 'Queued',
    color: 'text-zinc-400',
    bg: 'bg-zinc-500/15',
    dot: 'bg-zinc-500',
  },
}

const demoLogs = [
  '[19:20:01] INFO  Server started on port 3000',
  '[19:20:02] INFO  Connected to database',
  '[19:20:05] INFO  Health check: OK',
  '[19:21:12] INFO  Processing 12 requests',
  '[19:21:15] INFO  All tasks completed',
]

interface NodeDetailPanelProps {
  node: NexusNodeData | null
  onClose: () => void
}

export function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!node) return
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [node, onClose])

  return (
    <AnimatePresence>
      {node && (
        <motion.div
          ref={panelRef}
          initial={{ x: 340, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 340, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="absolute right-0 top-0 bottom-0 w-[320px] bg-white/[0.03] backdrop-blur-2xl border-l border-white/[0.06] z-50 flex flex-col"
        >
          <PanelHeader node={node} onClose={onClose} />
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            <p className="text-xs text-white/50">{node.description}</p>

            <StatusBar status={node.status} />

            {node.metrics && <MetricsSection metrics={node.metrics} />}

            <LogsSection logs={node.logs} />

            <ActionsSection url={node.url} />

            <InfoSection node={node} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function PanelHeader({
  node,
  onClose,
}: {
  node: NexusNodeData
  onClose: () => void
}) {
  const Icon = categoryIcons[node.category]
  const st = statusConfig[node.status]

  return (
    <div className="flex items-center gap-3 p-4 border-b border-white/[0.06]">
      <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center">
        <Icon className="w-5 h-5 text-white/60" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-white truncate">
          {node.label}
        </h3>
        <div
          className={cn(
            'inline-flex items-center gap-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-0.5',
            st.bg,
            st.color,
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', st.dot)} />
          {st.label}
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-1.5 rounded-lg hover:bg-white/[0.05] text-white/40 hover:text-white/70 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

function StatusBar({ status }: { status: NodeStatus }) {
  const st = statusConfig[status]
  return (
    <div className="space-y-1.5">
      <h4 className="text-[11px] font-semibold text-white/30 uppercase tracking-wider">
        Status
      </h4>
      <div className={cn('h-1.5 rounded-full', st.bg)}>
        <div className={cn('h-full w-full rounded-full', st.dot)} />
      </div>
    </div>
  )
}

function MetricsSection({
  metrics,
}: {
  metrics: NonNullable<NexusNodeData['metrics']>
}) {
  return (
    <div>
      <h4 className="text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-3">
        Metrics
      </h4>
      <div className="space-y-2.5">
        {metrics.cpu != null && (
          <MetricBar label="CPU" value={metrics.cpu} />
        )}
        {metrics.memory != null && (
          <MetricBar label="Memory" value={metrics.memory} />
        )}
        {metrics.requests != null && (
          <InfoRow
            label="Requests"
            value={`${metrics.requests.toLocaleString()}/min`}
          />
        )}
        {metrics.latency && (
          <InfoRow label="Latency" value={metrics.latency} />
        )}
        {metrics.uptime && <InfoRow label="Uptime" value={metrics.uptime} />}
      </div>
    </div>
  )
}

function MetricBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(value, 100)
  const color =
    pct > 80 ? 'bg-red-500' : pct > 60 ? 'bg-amber-500' : 'bg-emerald-500'
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[11px] text-white/40">{label}</span>
        <span className="text-xs text-white/70 font-mono">{value}%</span>
      </div>
      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn('h-full rounded-full', color)}
        />
      </div>
    </div>
  )
}

function LogsSection({ logs }: { logs?: string[] }) {
  const displayLogs =
    logs && logs.length > 0 ? logs.slice(-5) : demoLogs
  return (
    <div>
      <h4 className="text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-3">
        Recent Logs
      </h4>
      <div className="bg-black/40 rounded-lg p-3 font-mono text-[10px] leading-relaxed text-emerald-400/80 max-h-[140px] overflow-y-auto space-y-0.5">
        {displayLogs.map((log, i) => (
          <div key={i} className="whitespace-nowrap">
            {log}
          </div>
        ))}
      </div>
    </div>
  )
}

function ActionsSection({ url }: { url?: string }) {
  return (
    <div>
      <h4 className="text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-3">
        Actions
      </h4>
      <div className="flex gap-2 flex-wrap">
        <ActionBtn icon={RotateCcw} label="Restart" />
        <ActionBtn icon={ScrollText} label="View Logs" />
        {url && <ActionBtn icon={ExternalLink} label="Open URL" />}
      </div>
    </div>
  )
}

function ActionBtn({
  icon: Icon,
  label,
}: {
  icon: React.ElementType
  label: string
}) {
  return (
    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-colors text-[11px]">
      <Icon className="w-3 h-3" />
      {label}
    </button>
  )
}

function InfoSection({ node }: { node: NexusNodeData }) {
  const items = [
    { label: 'Category', value: node.category },
    node.port ? { label: 'Port', value: String(node.port) } : null,
    node.lastActivity
      ? { label: 'Last Activity', value: node.lastActivity }
      : null,
    node.url ? { label: 'URL', value: node.url } : null,
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <div>
      <h4 className="text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-3">
        Info
      </h4>
      <div className="space-y-1.5">
        {items.map((item) => (
          <InfoRow key={item.label} label={item.label} value={item.value} />
        ))}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[11px]">
      <span className="text-white/30">{label}</span>
      <span className="text-white/60 capitalize truncate max-w-[180px] text-right">
        {value}
      </span>
    </div>
  )
}
