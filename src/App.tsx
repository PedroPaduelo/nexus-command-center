import { useState, useEffect, useCallback } from 'react'

import { Sidebar } from '@/features/sidebar/components/Sidebar'
import { Topbar } from '@/features/topbar/components/Topbar'
import { CanvasView } from '@/features/canvas/components/CanvasView'
import { CommandPalette } from '@/features/command-palette/components/CommandPalette'
import { ActivityFeed } from '@/features/activity-feed/components/ActivityFeed'
import { MetricsPanel } from '@/features/dashboard/components/MetricsPanel'
import { NodeDetailPanel } from '@/features/dashboard/components/NodeDetailPanel'
import { useNavStore } from '@/features/sidebar/components/NavStore'
import { useCanvasStore } from '@/features/canvas/hooks/useCanvasStore'

export default function App() {
  const [commandOpen, setCommandOpen] = useState(false)
  const { activeView } = useNavStore()
  const { selectedNode, setSelectedNode } = useCanvasStore()

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setCommandOpen(prev => !prev)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0a0a0f]">
      <Sidebar />

      <div className="flex flex-col min-w-0 h-full ml-16">
        <Topbar onOpenCommand={() => setCommandOpen(true)} />

        <main className="flex flex-1 min-h-0 relative">
          {activeView === 'canvas' && (
            <div className="flex-1 min-w-0">
              <CanvasView />
            </div>
          )}

          {activeView === 'metrics' && (
            <div className="flex-1 p-6 overflow-y-auto">
              <h2 className="text-xl font-semibold mb-6 text-white/80">System Metrics</h2>
              <MetricsPanel />
            </div>
          )}

          {activeView === 'activity' && (
            <div className="flex-1 p-6 overflow-y-auto">
              <ActivityFeed />
            </div>
          )}

          {activeView !== 'canvas' && activeView !== 'metrics' && activeView !== 'activity' && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                  <span className="text-3xl">🚀</span>
                </div>
                <h2 className="text-xl font-semibold text-white/60 mb-2 capitalize">{activeView}</h2>
                <p className="text-sm text-white/30">Em construção — volte ao Canvas (⌘K)</p>
              </div>
            </div>
          )}

          {/* Right sidebar - Activity + Metrics (visible on canvas view) */}
          {activeView === 'canvas' && (
            <div className="w-[320px] border-l border-white/[0.06] flex flex-col bg-white/[0.01]">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <MetricsPanel />
                <ActivityFeed maxItems={6} />
              </div>
            </div>
          )}

          {/* Node detail panel overlay */}
          {selectedNode && (
            <NodeDetailPanel
              node={selectedNode.data}
              onClose={() => setSelectedNode(null)}
            />
          )}
        </main>
      </div>

      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  )
}
