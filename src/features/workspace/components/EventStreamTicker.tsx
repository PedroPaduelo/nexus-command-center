import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { Zap, Bot, Terminal, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import { useWorkspaceStore } from '../stores/useWorkspaceStore'
import type { WorkspaceEvent } from '../types/workspace.types'
import { cn } from '@/shared/lib/utils'

const severityConfig = {
  info: { icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  success: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  warning: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
}

const typeLabels: Record<WorkspaceEvent['type'], string> = {
  task_dispatch: 'DISPATCH',
  tool_call: 'TOOL',
  agent_status: 'STATUS',
  api_request: 'API',
  deploy: 'DEPLOY',
  error: 'ERROR',
}

function TickerItem({ event }: { event: WorkspaceEvent }) {
  const cfg = severityConfig[event.severity]
  const Icon = cfg.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-2 shrink-0"
    >
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider',
          cfg.color,
          cfg.bg
        )}
      >
        <Icon className="h-2.5 w-2.5" />
        {typeLabels[event.type]}
      </span>
      <span className="text-xs text-white/50">{event.message}</span>
      <span className="text-[10px] text-white/20 font-mono">
        {formatTime(event.timestamp)}
      </span>
      <span className="w-px h-3 bg-white/10 mx-2" />
    </motion.div>
  )
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function EventStreamTicker() {
  const events = useWorkspaceStore((s) => s.events)
  const isActive = useWorkspaceStore((s) => s.activeEventStream)
  const setActive = useWorkspaceStore((s) => s.setAutoRefresh)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive || events.length === 0) return
    const interval = setInterval(() => {
      // Simulate random events
      const types: WorkspaceEvent['type'][] = ['task_dispatch', 'tool_call', 'api_request', 'agent_status']
      const severities: WorkspaceEvent['severity'][] = ['info', 'info', 'info', 'success']
      const agentIds = ['nexus-prime', 'code-artisan', 'deep-search', 'pixel-wizard', 'task-architect']
      const messages = [
        'Analyzing code structure...',
        'Tool: read_file (schema.prisma)',
        'POST /api/agents → 200 OK',
        'Token usage: 12,450',
        'Tool: write_file (deploy.ts)',
        'Health check: all systems nominal',
        'Dispatched sub-task to Code Artisan',
        'Completed: API endpoint /deploy',
      ]

      const randomEvent: Omit<WorkspaceEvent, 'id' | 'timestamp'> = {
        type: types[Math.floor(Math.random() * types.length)],
        agentId: agentIds[Math.floor(Math.random() * agentIds.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
      }
      useWorkspaceStore.getState().addEvent(randomEvent)
    }, 4000)

    return () => clearInterval(interval)
  }, [isActive])

  const visibleEvents = events.slice(0, 8)

  return (
    <div className="h-9 bg-black/40 border-b border-white/[0.06] flex items-center overflow-hidden">
      <div className="flex items-center gap-2 px-3 border-r border-white/[0.06] shrink-0">
        <div
          className={cn(
            'w-2 h-2 rounded-full transition-colors',
            isActive ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'
          )}
        />
        <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">
          Live
        </span>
        <button
          onClick={() => setActive(!isActive)}
          className="text-[10px] text-white/30 hover:text-white/60 transition-colors ml-1"
        >
          {isActive ? '⏸' : '▶'}
        </button>
      </div>

      <div ref={containerRef} className="flex-1 overflow-hidden">
        <motion.div
          className="flex items-center gap-0"
          animate={isActive ? { x: [0, -200, 0] } : {}}
          transition={
            isActive
              ? {
                  duration: 30,
                  repeat: Infinity,
                  ease: 'linear',
                }
              : { duration: 0 }
          }
        >
          {visibleEvents.map((event) => (
            <TickerItem key={event.id} event={event} />
          ))}
        </motion.div>
      </div>

      <div className="flex items-center gap-1 px-3 border-l border-white/[0.06] shrink-0">
        <Bot className="h-3 w-3 text-white/20" />
        <span className="text-[10px] text-white/30 font-mono">
          {events.length} events
        </span>
      </div>
    </div>
  )
}
