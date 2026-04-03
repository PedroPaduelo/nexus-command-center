import { Command } from 'cmdk'
import { motion, AnimatePresence } from 'motion/react'
import {
  Rocket,
  RotateCcw,
  Scaling,
  Bot,
  Play,
  LayoutDashboard,
  Server,
  BarChart3,
  Terminal,
  ScrollText,
  Clock,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useNavStore } from '@/features/sidebar/components/NavStore'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

const actions = [
  { id: 'deploy', icon: Rocket, label: 'Deploy', description: 'Deploy all services', shortcut: '⌘D' },
  { id: 'restart', icon: RotateCcw, label: 'Restart', description: 'Restart selected service', shortcut: '⌘R' },
  { id: 'scale', icon: Scaling, label: 'Scale', description: 'Scale agent replicas', shortcut: '⌘S' },
  { id: 'create-agent', icon: Bot, label: 'Create Agent', description: 'Create a new AI agent', shortcut: '⌘N' },
  { id: 'run-workflow', icon: Play, label: 'Run Workflow', description: 'Execute a workflow', shortcut: '⌘E' },
]

const navigation = [
  { id: 'workspace', icon: Bot, label: 'Workspace', description: 'Interactive AI agents workspace' },
  { id: 'canvas', icon: LayoutDashboard, label: 'Canvas', description: 'Main orchestration view' },
  { id: 'agents', icon: Bot, label: 'Agents', description: 'Manage AI agents' },
  { id: 'services', icon: Server, label: 'Services', description: 'Service management' },
  { id: 'metrics', icon: BarChart3, label: 'Metrics', description: 'Performance metrics' },
  { id: 'terminal', icon: Terminal, label: 'Terminal', description: 'Terminal access' },
  { id: 'logs', icon: ScrollText, label: 'Logs', description: 'View system logs' },
]

const recent = [
  { id: 'recent-1', icon: Clock, label: 'Deployed orchestrator-v2', description: '2 minutes ago' },
  { id: 'recent-2', icon: Clock, label: 'Scaled agent-pool to 5', description: '15 minutes ago' },
  { id: 'recent-3', icon: Clock, label: 'Restarted gateway', description: '1 hour ago' },
]

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const setActiveView = useNavStore((s) => s.setActiveView)

  function handleSelect(id: string, group: 'navigation' | 'action' | 'recent') {
    if (group === 'navigation') {
      setActiveView(id)
    }
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-[20vh] backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[640px]"
          >
            <Command
              className={cn(
                'overflow-hidden rounded-xl border border-white/[0.06]',
                'bg-white/[0.03] shadow-2xl backdrop-blur-xl'
              )}
              onKeyDown={(e) => {
                if (e.key === 'Escape') onClose()
              }}
            >
              <Command.Input
                autoFocus
                placeholder="Type a command or search..."
                className={cn(
                  'h-12 w-full border-b border-white/[0.06] bg-transparent px-4',
                  'text-sm text-white/90 placeholder:text-white/30 outline-none'
                )}
              />

              <Command.List className="max-h-[320px] overflow-y-auto p-2">
                <Command.Empty className="py-8 text-center text-sm text-white/30">
                  No results found.
                </Command.Empty>

                <Command.Group
                  heading="Actions"
                  className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-white/30"
                >
                  {actions.map((item) => (
                    <CommandItem
                      key={item.id}
                      item={item}
                      shortcut={item.shortcut}
                      onSelect={() => handleSelect(item.id, 'action')}
                    />
                  ))}
                </Command.Group>

                <Command.Separator className="my-1 h-px bg-white/[0.06]" />

                <Command.Group
                  heading="Navigation"
                  className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-white/30"
                >
                  {navigation.map((item) => (
                    <CommandItem
                      key={item.id}
                      item={item}
                      onSelect={() => handleSelect(item.id, 'navigation')}
                    />
                  ))}
                </Command.Group>

                <Command.Separator className="my-1 h-px bg-white/[0.06]" />

                <Command.Group
                  heading="Recent"
                  className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-white/30"
                >
                  {recent.map((item) => (
                    <CommandItem
                      key={item.id}
                      item={item}
                      onSelect={() => handleSelect(item.id, 'recent')}
                    />
                  ))}
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function CommandItem({
  item,
  shortcut,
  onSelect,
}: {
  item: { icon: React.ElementType; label: string; description: string }
  shortcut?: string
  onSelect: () => void
}) {
  const Icon = item.icon
  return (
    <Command.Item
      onSelect={onSelect}
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm',
        'text-white/60 transition-colors',
        'data-[selected=true]:bg-white/[0.05] data-[selected=true]:text-white'
      )}
    >
      <Icon className="h-4 w-4 shrink-0 text-white/40" />
      <div className="flex-1">
        <div className="text-sm">{item.label}</div>
        <div className="text-xs text-white/30">{item.description}</div>
      </div>
      {shortcut && (
        <kbd className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-white/30">
          {shortcut}
        </kbd>
      )}
    </Command.Item>
  )
}
