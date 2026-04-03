import { memo, useState } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { motion } from 'motion/react'
import {
  Bot,
  Server,
  Database,
  Globe,
  GitBranch,
  Activity,
  Cpu,
  MemoryStick,
  Zap,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { NexusNodeData, NodeCategory, NodeStatus } from '../types/canvas.types'
import { STATUS_LABELS } from '../types/canvas.types'

const categoryIcons: Record<NodeCategory, React.ElementType> = {
  agent: Bot,
  service: Server,
  database: Database,
  api: Globe,
  workflow: GitBranch,
  monitor: Activity,
}

const statusBorderColor: Record<NodeStatus, string> = {
  idle: 'border-violet-500/40',
  running: 'border-blue-500/60',
  success: 'border-emerald-500/40',
  error: 'border-red-500/40',
  warning: 'border-amber-500/40',
  queued: 'border-zinc-400/30',
}

const statusDotColor: Record<NodeStatus, string> = {
  idle: 'bg-violet-500',
  running: 'bg-blue-500',
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  warning: 'bg-amber-500',
  queued: 'bg-zinc-400',
}

const statusGlow: Record<NodeStatus, string> = {
  idle: '',
  running: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
  success: '',
  error: 'shadow-[0_0_15px_rgba(239,68,68,0.2)]',
  warning: '',
  queued: '',
}

type NexusNode = Node<NexusNodeData, 'nexusNode'>

function NexusNodeComponent({ data, selected }: NodeProps<NexusNode>) {
  const [hovered, setHovered] = useState(false)
  const Icon = categoryIcons[data.category]
  const isRunning = data.status === 'running'

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'relative w-[180px] rounded-xl border backdrop-blur-xl transition-all duration-300',
        'bg-white/[0.03]',
        statusBorderColor[data.status],
        statusGlow[data.status],
        selected && 'ring-1 ring-white/20',
        hovered && 'scale-[1.03] bg-white/[0.05]'
      )}
    >
      {isRunning && (
        <div className="pointer-events-none absolute -inset-px rounded-xl">
          <div className="absolute inset-0 animate-pulse rounded-xl border border-blue-500/30" />
        </div>
      )}

      <Handle
        type="target"
        position={Position.Left}
        className="!h-2 !w-2 !rounded-full !border-white/10 !bg-white/20"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !rounded-full !border-white/10 !bg-white/20"
      />

      <div className="p-3">
        <div className="flex items-start gap-2.5">
          <div
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
              'bg-white/[0.06] border border-white/[0.08]'
            )}
          >
            <Icon className="h-4 w-4 text-white/70" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium leading-tight text-white/90">
              {data.label}
            </p>
            <p className="mt-0.5 truncate text-[10px] leading-tight text-white/40">
              {data.description}
            </p>
          </div>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            {isRunning && (
              <span
                className={cn(
                  'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
                  statusDotColor[data.status]
                )}
              />
            )}
            <span
              className={cn(
                'relative inline-flex h-2 w-2 rounded-full',
                statusDotColor[data.status]
              )}
            />
          </span>
          <span className="text-[10px] font-medium text-white/50">
            {STATUS_LABELS[data.status]}
          </span>
          {data.metrics?.latency && (
            <span className="ml-auto text-[9px] text-white/30">{data.metrics?.latency}</span>
          )}
        </div>

        {hovered && data.metrics && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 overflow-hidden border-t border-white/[0.06] pt-2"
          >
            <div className="flex items-center gap-3 text-[9px] text-white/40">
              {data.metrics.cpu !== undefined && (
                <span className="flex items-center gap-1">
                  <Cpu className="h-2.5 w-2.5" />
                  {data.metrics.cpu}%
                </span>
              )}
              {data.metrics.memory !== undefined && (
                <span className="flex items-center gap-1">
                  <MemoryStick className="h-2.5 w-2.5" />
                  {data.metrics.memory}%
                </span>
              )}
              {data.metrics.requests !== undefined && (
                <span className="flex items-center gap-1">
                  <Zap className="h-2.5 w-2.5" />
                  {data.metrics.requests}
                </span>
              )}
            </div>
            {data.metrics.uptime && (
              <p className="mt-1 text-[9px] text-white/30">
                Uptime: {data.metrics.uptime}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export const NexusNode = memo(NexusNodeComponent)
