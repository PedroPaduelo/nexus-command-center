import { Search, Bell, Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/shared/lib/utils'
import { useNavStore } from '@/features/sidebar/components/NavStore'

const viewLabels: Record<string, string> = {
  canvas: 'Canvas',
  agents: 'Agents',
  services: 'Services',
  workflows: 'Workflows',
  metrics: 'Metrics',
  terminal: 'Terminal',
  logs: 'Logs',
  settings: 'Settings',
}

const statusDots = [
  { color: 'bg-emerald-500', label: 'Systems', count: 12 },
  { color: 'bg-blue-500', label: 'Agents', count: 5 },
  { color: 'bg-amber-500', label: 'Tasks', count: 3 },
]

interface TopbarProps {
  onOpenCommand: () => void
}

export function Topbar({ onOpenCommand }: TopbarProps) {
  const activeView = useNavStore((s) => s.activeView)
  const [darkMode, setDarkMode] = useState(true)

  return (
    <header
      className={cn(
        'flex h-12 items-center justify-between px-4',
        'bg-white/[0.03] border-b border-white/[0.06] backdrop-blur-xl'
      )}
    >
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-white/40">Nexus</span>
        <span className="text-white/20">/</span>
        <span className="text-white/80">
          {viewLabels[activeView] ?? activeView}
        </span>
      </div>

      <button
        onClick={onOpenCommand}
        className={cn(
          'flex items-center gap-2 rounded-lg border border-white/[0.06] px-3 py-1.5',
          'text-sm text-white/40 transition-colors hover:bg-white/[0.03] hover:text-white/60'
        )}
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search or command...</span>
        <kbd className="ml-2 rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-white/30">
          ⌘K
        </kbd>
      </button>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {statusDots.map((dot) => (
            <div key={dot.label} className="flex items-center gap-1.5">
              <span className={cn('h-2 w-2 rounded-full', dot.color)} />
              <span className="text-xs text-white/40">{dot.count}</span>
            </div>
          ))}
        </div>

        <div className="h-4 w-px bg-white/[0.06]" />

        <button className="relative text-white/40 transition-colors hover:text-white/70">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-500 text-[9px] font-bold text-white">
            4
          </span>
        </button>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="text-white/40 transition-colors hover:text-white/70"
        >
          {darkMode ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </button>
      </div>
    </header>
  )
}
