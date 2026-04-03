import {
  LayoutDashboard,
  Bot,
  Server,
  GitBranch,
  BarChart3,
  Terminal,
  ScrollText,
  Settings,
} from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '@/shared/lib/utils'
import { useNavStore } from './NavStore'

const navItems = [
  { id: 'canvas', label: 'Canvas', icon: LayoutDashboard },
  { id: 'agents', label: 'Agents', icon: Bot },
  { id: 'services', label: 'Services', icon: Server },
  { id: 'workflows', label: 'Workflows', icon: GitBranch },
  { id: 'metrics', label: 'Metrics', icon: BarChart3 },
  { id: 'terminal', label: 'Terminal', icon: Terminal },
  { id: 'logs', label: 'Logs', icon: ScrollText },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const

export function Sidebar() {
  const { activeView, setActiveView, sidebarExpanded, setSidebarExpanded } =
    useNavStore()

  return (
    <motion.aside
      animate={{ width: sidebarExpanded ? 240 : 64 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      onMouseEnter={() => setSidebarExpanded(true)}
      onMouseLeave={() => setSidebarExpanded(false)}
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col overflow-hidden',
        'bg-white/[0.03] border-r border-white/[0.06] backdrop-blur-xl'
      )}
    >
      <div className="flex h-14 items-center gap-3 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-bold text-white">
          N
        </div>
        {sidebarExpanded && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
            className="text-sm font-semibold tracking-wider text-white/90"
          >
            NEXUS
          </motion.span>
        )}
      </div>

      <nav className="mt-2 flex flex-1 flex-col gap-1 px-2">
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = activeView === id
          return (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={cn(
                'relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm text-white/60 transition-colors',
                'hover:bg-white/[0.03] hover:text-white/80',
                active && 'bg-white/[0.05] text-white'
              )}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-blue-500"
                  transition={{ duration: 0.2 }}
                />
              )}
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {sidebarExpanded && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="whitespace-nowrap"
                >
                  {label}
                </motion.span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="mb-4 flex items-center gap-3 px-4">
        <div className="relative h-8 w-8 shrink-0">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700" />
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#0a0a0f] bg-emerald-500" />
        </div>
        {sidebarExpanded && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="truncate text-xs text-white/50"
          >
            Online
          </motion.span>
        )}
      </div>
    </motion.aside>
  )
}
