import { NexusWorkspaceCanvas } from './NexusWorkspaceCanvas'
import { EventStreamTicker } from './EventStreamTicker'
import { AgentChatPanel } from './AgentChatPanel'
import { FloatingPanelsLayer } from './FloatingPanel'
import { useWorkspaceStore } from '../stores/useWorkspaceStore'
import { motion } from 'motion/react'
import { Bot, Zap, Clock, Activity } from 'lucide-react'

function AgentStatusBar() {
  const agents = useWorkspaceStore((s) => s.agents)

  const active = agents.filter((a) => a.status !== 'idle' && a.status !== 'error')

  return (
    <div className="flex items-center gap-4 px-4 py-2 border-b border-white/[0.04] bg-black/20">
      {/* Agent status indicators */}
      <div className="flex items-center gap-3">
        {agents.map((agent) => {
          const isActive = agent.status !== 'idle'
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5"
            >
              <span className="text-base">{agent.avatar}</span>
              <div className="flex flex-col">
                <span className="text-[9px] font-medium text-white/50 leading-none">
                  {agent.label.split(' ')[0]}
                </span>
                <motion.span
                  className="w-1.5 h-1.5 rounded-full mt-0.5"
                  style={{ backgroundColor: isActive ? '#10b981' : '#4b5563' }}
                  animate={isActive ? { opacity: [1, 0.3, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="flex-1" />

      {/* Quick stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Bot className="h-3 w-3 text-emerald-400" />
          <span className="text-[10px] font-mono text-white/50">
            <span className="text-emerald-400">{active.length}</span>/{agents.length} active
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Activity className="h-3 w-3 text-blue-400" />
          <span className="text-[10px] font-mono text-white/50">
            <span className="text-blue-400">
              {agents.reduce((acc, a) => acc + a.metrics.tasksDone, 0)}
            </span>{' '}
            tasks
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="h-3 w-3 text-amber-400" />
          <span className="text-[10px] font-mono text-white/50">
            <span className="text-amber-400">
              {agents.reduce((acc, a) => acc + a.metrics.tokensUsed, 0).toLocaleString()}
            </span>{' '}
            tokens
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-white/30" />
          <span className="text-[10px] font-mono text-white/30">live</span>
        </div>
      </div>
    </div>
  )
}

export function WorkspaceView() {
  return (
    <div className="h-full w-full flex flex-col bg-[#06060a]">
      {/* Live event stream ticker */}
      <EventStreamTicker />

      {/* Agent status bar */}
      <AgentStatusBar />

      {/* Main canvas */}
      <div className="flex-1 min-h-0 relative">
        <NexusWorkspaceCanvas />
      </div>

      {/* Floating panels (terminal, logs, playground) */}
      <FloatingPanelsLayer />

      {/* Chat panel overlay */}
      <AgentChatPanel />
    </div>
  )
}
