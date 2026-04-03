import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  X,
  Terminal as TerminalIcon,
  ScrollText,
  Sparkles,
  Maximize2,
  Minimize2,
  ChevronRight,
  GripHorizontal,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useWorkspaceStore } from '../stores/useWorkspaceStore'
import type { FloatingPanel } from '../types/workspace.types'

const LOG_ENTRIES = [
  { time: '14:32:01', level: 'info', msg: '[nexus-prime] Task dispatched to Code Artisan' },
  { time: '14:32:02', level: 'info', msg: '[code-artisan] Received task: implement API endpoint' },
  { time: '14:32:03', level: 'tool', msg: '[code-artisan] Tool: read_file (src/api/users.ts)' },
  { time: '14:32:05', level: 'success', msg: '[code-artisan] write_file → 200 OK (42ms)' },
  { time: '14:32:06', level: 'info', msg: '[deep-search] WebSocket research: 12 patterns found' },
  { time: '14:32:08', level: 'info', msg: '[task-architect] Sprint backlog updated (5 tasks)' },
  { time: '14:32:10', level: 'success', msg: '[nexus-prime] Sub-task completed by code-artisan' },
  { time: '14:32:12', level: 'tool', msg: '[nexus-prime] Tool: mcp_easypanel_deploy_service' },
  { time: '14:32:14', level: 'info', msg: '[pixel-wizard] Design tokens exported (18 tokens)' },
  { time: '14:32:16', level: 'success', msg: '[deploy] Service lab-myke-2 → 200 OK' },
]

const PLAYGROUND_COMMANDS = [
  { cmd: 'nexus.deploy({ service: "api-gateway" })', desc: 'Deploy API Gateway', agent: 'nexus-prime' },
  { cmd: 'code.generate({ component: "DataTable" })', desc: 'Generate DataTable component', agent: 'code-artisan' },
  { cmd: 'search.analyze({ query: "React 19 patterns" })', desc: 'Analyze React 19 patterns', agent: 'deep-search' },
  { cmd: 'design.export({ tokens: "all" })', desc: 'Export design tokens', agent: 'pixel-wizard' },
  { cmd: 'plan.sprint({ name: "v2.1" })', desc: 'Create v2.1 sprint plan', agent: 'task-architect' },
]

const TERMINAL_LINES = [
  { type: 'prompt', text: 'nexus@workspace:~$', color: 'text-emerald-400' },
  { type: 'output', text: 'Nexus Command Center v2.0.0 — 5 agents online', color: 'text-white/40' },
  { type: 'prompt', text: 'nexus@workspace:~$ status', color: 'text-emerald-400' },
  { type: 'output', text: 'nexus-prime    ● running   CPU 24%  Mem 38%', color: 'text-blue-400' },
  { type: 'output', text: 'code-artisan  ● running   CPU 62%  Mem 71%', color: 'text-purple-400' },
  { type: 'output', text: 'deep-search   ○ idle      CPU 8%   Mem 22%', color: 'text-white/40' },
  { type: 'output', text: 'pixel-wizard  ○ idle      CPU 5%   Mem 18%', color: 'text-white/40' },
  { type: 'output', text: 'task-architect ● tool_use CPU 34%  Mem 29%', color: 'text-cyan-400' },
  { type: 'prompt', text: 'nexus@workspace:~$', color: 'text-emerald-400' },
]

function TerminalContent() {
  const [lines] = useState(TERMINAL_LINES)
  const [input, setInput] = useState('')
  const outputRef = { current: null as HTMLDivElement | null }

  return (
    <div className="h-full flex flex-col bg-black/80">
      <div
        className="flex-1 overflow-y-auto font-mono text-[11px] p-3 space-y-0.5"
        ref={outputRef}
      >
        {lines.map((line, i) => (
          <div key={i} className={cn('leading-5', line.color)}>
            {line.text}
          </div>
        ))}
      </div>
      <div className="shrink-0 border-t border-white/[0.06] p-2 flex items-center gap-2">
        <span className="text-emerald-400 text-[11px] font-mono">nexus@workspace:~$</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent text-white/60 font-mono text-[11px] outline-none placeholder:text-white/20"
          placeholder="type a command..."
        />
      </div>
    </div>
  )
}

function LogsContent() {
  const [filter, setFilter] = useState<'all' | 'info' | 'tool' | 'success'>('all')
  const filtered = filter === 'all' ? LOG_ENTRIES : LOG_ENTRIES.filter((l) => l.level === filter)
  const levelColors: Record<string, string> = {
    info: 'text-blue-400',
    tool: 'text-cyan-400',
    success: 'text-emerald-400',
    error: 'text-red-400',
  }

  return (
    <div className="h-full flex flex-col bg-[#08080a]">
      <div className="shrink-0 flex items-center gap-1 p-2 border-b border-white/[0.06]">
        {(['all', 'info', 'tool', 'success'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-2 py-1 rounded text-[10px] font-mono uppercase transition-colors',
              filter === f ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/50'
            )}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto font-mono text-[10px] p-2 space-y-0.5">
        {filtered.map((entry, i) => (
          <div key={i} className="flex items-start gap-2 leading-5">
            <span className="text-white/20 shrink-0">{entry.time}</span>
            <span className={cn('shrink-0 uppercase w-12', levelColors[entry.level])}>
              {entry.level}
            </span>
            <span className="text-white/50">{entry.msg}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PlaygroundContent() {
  const [selected, setSelected] = useState(0)
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState(false)

  const runCommand = (index: number) => {
    setSelected(index)
    setRunning(true)
    setOutput('')
    const outputs = [
      'Executing: ' + PLAYGROUND_COMMANDS[index].cmd + '\n\n⏳ Agent ' + PLAYGROUND_COMMANDS[index].agent + ' is thinking...\n\n✅ Completed in 1.2s\n📊 Tokens used: 342\n🎯 Status: success',
      'Executing: ' + PLAYGROUND_COMMANDS[index].cmd + '\n\n⏳ Generating component...\n\n✅ DataTable.tsx created (48 lines)\n📊 Tokens used: 218\n🎯 Status: success',
      'Executing: ' + PLAYGROUND_COMMANDS[index].cmd + '\n\n⏳ Searching...\n\n🔬 Found 12 relevant patterns\n📊 Tokens used: 156\n🎯 Status: success',
      'Executing: ' + PLAYGROUND_COMMANDS[index].cmd + '\n\n⏳ Exporting...\n\n🎨 18 design tokens exported to tokens.json\n📊 Tokens used: 89\n🎯 Status: success',
      'Executing: ' + PLAYGROUND_COMMANDS[index].cmd + '\n\n⏳ Planning sprint...\n\n📋 Sprint v2.1 created with 23 tasks\n📊 Tokens used: 201\n🎯 Status: success',
    ]
    setTimeout(() => {
      setOutput(outputs[index])
      setRunning(false)
    }, 1500)
  }

  return (
    <div className="h-full flex flex-col bg-[#08080a]">
      <div className="shrink-0 divide-y divide-white/[0.05]">
        {PLAYGROUND_COMMANDS.map((cmd, i) => (
          <button
            key={i}
            onClick={() => runCommand(i)}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors',
              selected === i ? 'bg-white/[0.05]' : 'hover:bg-white/[0.03]'
            )}
          >
            <ChevronRight
              className={cn(
                'h-3 w-3 shrink-0 transition-colors',
                selected === i ? 'text-white/60' : 'text-white/20'
              )}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-mono text-white/70 truncate">{cmd.cmd}</p>
              <p className="text-[10px] text-white/30 mt-0.5 truncate">{cmd.desc}</p>
            </div>
            <span className="text-[9px] font-mono text-white/20 shrink-0">{cmd.agent}</span>
          </button>
        ))}
      </div>
      <div className="flex-1 border-t border-white/[0.06] overflow-y-auto">
        <div className="p-3 font-mono text-[11px] leading-5">
          {running && (
            <div className="space-y-1">
              <span className="text-white/40">Executing command...</span>
              <motion.div
                className="flex items-center gap-1 mt-1"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-blue-400 text-[10px]">Processing</span>
              </motion.div>
            </div>
          )}
          {output && (
            <motion.pre
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-white/60 whitespace-pre-wrap"
            >
              {output}
            </motion.pre>
          )}
          {!running && !output && (
            <span className="text-white/20">Select a command to execute...</span>
          )}
        </div>
      </div>
    </div>
  )
}

type PanelType = 'terminal' | 'logs' | 'playground'

const panelMeta: Record<PanelType, { title: string; icon: React.ElementType }> = {
  terminal: { title: 'Terminal', icon: TerminalIcon },
  logs: { title: 'Logs', icon: ScrollText },
  playground: { title: 'Playground', icon: Sparkles },
}

const panelContent: Record<PanelType, React.FC> = {
  terminal: TerminalContent,
  logs: LogsContent,
  playground: PlaygroundContent,
}

interface FloatingPanelLayerProps {
  panel: FloatingPanel
  onClose: () => void
  onMinimize: () => void
  onDrag: (dx: number, dy: number) => void
}

function FloatingPanelLayer({ panel, onClose, onMinimize, onDrag }: FloatingPanelLayerProps) {
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const meta = panelMeta[panel.type]
  const Content = panelContent[panel.type]
  const Icon = meta.icon

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('.panel-actions')) return
    setDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  useEffect(() => {
    if (!dragging) return
    const handleMouseMove = (e: MouseEvent) => {
      onDrag(e.clientX - dragStart.x, e.clientY - dragStart.y)
      setDragStart({ x: e.clientX, y: e.clientY })
    }
    const handleMouseUp = () => setDragging(false)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragging, dragStart, onDrag])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="absolute rounded-xl overflow-hidden border border-white/[0.08] shadow-2xl"
      style={{
        left: panel.position.x,
        top: panel.position.y,
        width: panel.isMinimized ? 200 : panel.size.width,
        height: panel.isMinimized ? 40 : panel.size.height,
        background: 'rgba(10,10,15,0.95)',
        backdropFilter: 'blur(20px)',
        zIndex: panel.zIndex,
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-3 h-10 shrink-0 border-b border-white/[0.06] cursor-move select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="h-3 w-3 text-white/20" />
          <Icon className="h-3.5 w-3.5 text-white/40" />
          <span className="text-[11px] font-medium text-white/60">{meta.title}</span>
        </div>
        <div className="flex items-center gap-1 panel-actions">
          <button
            onClick={onMinimize}
            className="p-1 rounded text-white/30 hover:text-white/60 transition-colors"
          >
            {panel.isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Content */}
      {!panel.isMinimized && (
        <div style={{ height: panel.size.height - 40 }}>
          <Content />
        </div>
      )}
    </motion.div>
  )
}

export function FloatingPanelsLayer() {
  const floatingPanels = useWorkspaceStore((s) => s.floatingPanels)
  const updatePanel = useWorkspaceStore((s) => s.updateFloatingPanel)
  const removePanel = useWorkspaceStore((s) => s.removeFloatingPanel)
  const setFloatingPanel = useWorkspaceStore((s) => s.setFloatingPanel)

  const togglePanel = (type: PanelType) => {
    const existing = floatingPanels.find((p) => p.id === type)
    if (existing) {
      removePanel(type)
    } else {
      setFloatingPanel({
        id: type,
        type,
        position: { x: 200 + floatingPanels.length * 30, y: 100 + floatingPanels.length * 30 },
        size: { width: 400, height: 300 },
        isMinimized: false,
        zIndex: 10,
      })
    }
  }

  const allTypes: PanelType[] = ['terminal', 'logs', 'playground']

  return (
    <>
      {/* Floating panel toolbar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-black/80 backdrop-blur-xl rounded-xl border border-white/[0.08] p-1">
        {allTypes.map((type) => {
          const meta = panelMeta[type]
          const Icon = meta.icon
          const isOpen = floatingPanels.some((p) => p.id === type)
          return (
            <button
              key={type}
              onClick={() => togglePanel(type)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-all',
                isOpen
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {meta.title}
            </button>
          )
        })}
      </div>

      {/* Floating panels */}
      <AnimatePresence>
        {floatingPanels.map((panel) => (
          <FloatingPanelLayer
            key={panel.id}
            panel={panel}
            onClose={() => removePanel(panel.id)}
            onMinimize={() =>
              updatePanel(panel.id, { isMinimized: !panel.isMinimized })
            }
            onDrag={(dx, dy) =>
              updatePanel(panel.id, {
                position: {
                  x: panel.position.x + dx,
                  y: panel.position.y + dy,
                },
              })
            }
          />
        ))}
      </AnimatePresence>
    </>
  )
}
