import { memo, useState, useCallback } from 'react'
import { Handle, Position } from '@xyflow/react'
import { motion } from 'motion/react'
import { cn } from '@/shared/lib/utils'
import { useWorkspaceStore } from '../stores/useWorkspaceStore'
import type { Agent, AgentStatus } from '../types/workspace.types'

const statusConfig: Record<
  AgentStatus,
  { label: string; borderColor: string; dotColor: string; glow: string; pulseColor: string; textColor: string }
> = {
  idle: {
    label: 'Idle',
    borderColor: 'border-white/20',
    dotColor: 'bg-zinc-400',
    glow: '',
    pulseColor: 'border-zinc-500/20',
    textColor: 'text-zinc-400',
  },
  thinking: {
    label: 'Thinking',
    borderColor: 'border-blue-500/50',
    dotColor: 'bg-blue-400',
    glow: 'shadow-[0_0_30px_rgba(59,130,246,0.3)]',
    pulseColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
  },
  responding: {
    label: 'Responding',
    borderColor: 'border-purple-500/50',
    dotColor: 'bg-purple-400',
    glow: 'shadow-[0_0_30px_rgba(168,85,247,0.3)]',
    pulseColor: 'border-purple-500/30',
    textColor: 'text-purple-400',
  },
  tool_use: {
    label: 'Using Tools',
    borderColor: 'border-cyan-500/50',
    dotColor: 'bg-cyan-400',
    glow: 'shadow-[0_0_30px_rgba(6,182,212,0.3)]',
    pulseColor: 'border-cyan-500/30',
    textColor: 'text-cyan-400',
  },
  error: {
    label: 'Error',
    borderColor: 'border-red-500/50',
    dotColor: 'bg-red-400',
    glow: 'shadow-[0_0_30px_rgba(239,68,68,0.4)]',
    pulseColor: 'border-red-500/30',
    textColor: 'text-red-400',
  },
}

const personalityColors: Record<string, string> = {
  orchestrator: '#3b82f6',
  coder: '#a855f7',
  researcher: '#06b6d4',
  designer: '#f97316',
  planner: '#10b981',
}

interface AgentNodeData extends Agent {
  onClick?: () => void
  onDoubleClick?: () => void
}

interface AgentNodeProps {
  data: AgentNodeData
  selected?: boolean
}

function AgentCardComponent({ data, selected }: AgentNodeProps) {
  const [hovered, setHovered] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const openChat = useWorkspaceStore((s) => s.openChat)
  const setFocused = useWorkspaceStore((s) => s.setFocusedAgent)

  const cfg = statusConfig[data.status]
  const accentColor = personalityColors[data.personality] || '#ffffff'
  const isActive = data.status !== 'idle' && data.status !== 'error'
  const isThinking = data.status === 'thinking' || data.status === 'responding'

  const handleClick = useCallback(() => {
    setExpanded((v) => !v)
    setFocused(data.id)
  }, [data.id, setFocused])

  const handleDoubleClick = useCallback(() => {
    openChat(data)
  }, [data, openChat])

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2 !w-2 !rounded-full !border-white/20 !bg-white/30"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !rounded-full !border-white/20 !bg-white/30"
      />

      <motion.div
        layout
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24, layout: { duration: 0.3 } }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        className={cn(
          'relative w-[200px] cursor-pointer rounded-2xl border-2 backdrop-blur-xl transition-all duration-300 select-none',
          'bg-[#0a0a12]/90',
          cfg.borderColor,
          cfg.glow,
          selected && 'ring-2 ring-white/30',
          hovered && !expanded && 'scale-[1.03]',
          expanded && 'scale-[1.05]'
        )}
        style={{
          borderColor: (selected || hovered) ? accentColor : undefined,
        }}
      >
        {/* Ambient glow */}
        <div
          className="absolute -inset-px rounded-2xl opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, ${accentColor}20 0%, transparent 70%)`,
          }}
        />

        {/* Pulse ring for active agents */}
        {isActive && (
          <div className="absolute -inset-px rounded-2xl pointer-events-none">
            <motion.div
              className={cn('absolute inset-0 rounded-2xl border-2', cfg.pulseColor)}
              animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        )}

        {/* Orbital ring for thinking agents */}
        {isThinking && (
          <div className="absolute -inset-2 pointer-events-none">
            <motion.div
              className="absolute inset-0 rounded-[1.5rem] border border-dashed"
              style={{ borderColor: `${accentColor}30` }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        )}

        <div className="relative p-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <motion.div
              className="relative shrink-0"
              animate={isThinking ? { y: [0, -3, 0] } : {}}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div
                className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl border border-white/10"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}05)`,
                  boxShadow: `0 0 20px ${accentColor}20`,
                }}
              >
                {data.avatar}
              </div>
              {/* Status dot */}
              <span
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-[#0a0a12]',
                  cfg.dotColor
                )}
              >
                {isActive && (
                  <motion.span
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: cfg.dotColor.replace('bg-', '#') }}
                    animate={{ scale: [1, 2], opacity: [0.7, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </span>
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white/90 truncate">{data.label}</p>
                <span
                  className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded uppercase tracking-wider"
                  style={{ color: accentColor, background: `${accentColor}15` }}
                >
                  {data.personality}
                </span>
              </div>
              <p className="text-[10px] text-white/40 mt-0.5 truncate">{data.description}</p>

              {/* Status badge */}
              <div className="flex items-center gap-1.5 mt-2">
                <span className={cn('text-[10px] font-medium', cfg.textColor)}>
                  {cfg.label}
                </span>
                {data.currentTask && (
                  <span className="text-[9px] text-white/30 truncate max-w-[80px]">
                    · {data.currentTask}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Metrics on hover/expand */}
          {(hovered || expanded) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="border-t border-white/[0.06] mt-3 pt-3 space-y-2">
                {/* Metrics row */}
                <div className="flex items-center justify-between">
                  <Metric label="Tokens" value={data.metrics.tokensUsed.toLocaleString()} />
                  <Metric label="Tasks" value={String(data.metrics.tasksDone)} />
                  <Metric label="Rate" value={`${data.metrics.successRate}%`} />
                </div>

                {/* Brain / tools */}
                <div className="flex flex-wrap gap-1">
                  {data.brain.slice(0, 4).map((b: string) => (
                    <span
                      key={b}
                      className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-white/40 font-mono"
                    >
                      {b}
                    </span>
                  ))}
                  {data.brain.length > 4 && (
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-white/30">
                      +{data.brain.length - 4}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      openChat(data)
                    }}
                    className="flex-1 text-[10px] font-medium py-1.5 px-3 rounded-lg transition-colors"
                    style={{
                      background: `${accentColor}20`,
                      color: accentColor,
                    }}
                  >
                    Chat
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDoubleClick()
                    }}
                    className="flex-1 text-[10px] font-medium py-1.5 px-3 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 transition-colors"
                  >
                    Focus
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] font-bold text-white/80">{value}</p>
      <p className="text-[8px] text-white/30">{label}</p>
    </div>
  )
}

export const AgentCard = memo(AgentCardComponent)
