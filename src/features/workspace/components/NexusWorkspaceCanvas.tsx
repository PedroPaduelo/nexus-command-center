import { useCallback, useMemo, useEffect, useState } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type NodeTypes,
  type EdgeTypes,
  type Node,
  applyNodeChanges,
  applyEdgeChanges,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  addEdge,
  Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { motion } from 'motion/react'
import {
  LayoutGrid,
  CircleDot,
  Clock,
  Focus,
  Sparkles,
} from 'lucide-react'

import { useWorkspaceStore } from '../stores/useWorkspaceStore'
import { AgentCard } from './AgentCard'
import { NexusEdgeAnimated } from './NexusEdgeAnimated'
import type { WorkspaceView } from '../types/workspace.types'
import { cn } from '@/shared/lib/utils'

const nodeTypes: NodeTypes = {
  agentNode: AgentCard,
}

const edgeTypes: EdgeTypes = {
  nexusEdgeAnimated: NexusEdgeAnimated,
}

const AGENT_CONNECTIONS: Array<{ source: string; target: string; label?: string; color: string }> = [
  { source: 'nexus-prime', target: 'code-artisan', label: 'dispatch', color: '#3b82f6' },
  { source: 'nexus-prime', target: 'deep-search', label: 'research', color: '#3b82f6' },
  { source: 'nexus-prime', target: 'pixel-wizard', label: 'design', color: '#3b82f6' },
  { source: 'nexus-prime', target: 'task-architect', label: 'plan', color: '#3b82f6' },
  { source: 'code-artisan', target: 'deep-search', color: '#a855f7' },
  { source: 'code-artisan', target: 'pixel-wizard', color: '#a855f7' },
  { source: 'task-architect', target: 'nexus-prime', label: 'report', color: '#10b981' },
  { source: 'deep-search', target: 'code-artisan', color: '#06b6d4' },
  { source: 'pixel-wizard', target: 'code-artisan', color: '#f97316' },
  { source: 'nexus-prime', target: 'task-architect', color: '#3b82f6' },
]

const miniMapStyle = {
  backgroundColor: 'rgba(0,0,0,0.7)',
  maskColor: 'rgba(0,0,0,0.8)',
}

const personalityColors: Record<string, string> = {
  orchestrator: '#3b82f6',
  coder: '#a855f7',
  researcher: '#06b6d4',
  designer: '#f97316',
  planner: '#10b981',
}

const miniMapNodeColor = (node: Node) => {
  const data = node.data as Record<string, unknown>
  const personality = data.personality as string
  return personalityColors[personality] || '#ffffff'
}

const viewIcons: Record<WorkspaceView, React.ElementType> = {
  canvas: LayoutGrid,
  grid: LayoutGrid,
  radial: CircleDot,
  timeline: Clock,
}

function WorkspaceCanvasInner() {
  const agents = useWorkspaceStore((s) => s.agents)
  const view = useWorkspaceStore((s) => s.view)
  const setView = useWorkspaceStore((s) => s.setView)
  const focusedAgentId = useWorkspaceStore((s) => s.focusedAgentId)
  const setFocusedAgent = useWorkspaceStore((s) => s.setFocusedAgent)
  const openChat = useWorkspaceStore((s) => s.openChat)

  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<ReturnType<typeof createEdgesFromConnections>>([])

  // Convert agents to React Flow nodes
  useEffect(() => {
    const flowNodes: Node[] = agents.map((agent) => ({
      id: agent.id,
      type: 'agentNode',
      position: agent.position,
      data: { ...agent } as Record<string, unknown>,
      selected: agent.id === focusedAgentId,
    }))
    setNodes(flowNodes)
  }, [agents, focusedAgentId])

  // Create edges from connections
  function createEdgesFromConnections() {
    return AGENT_CONNECTIONS.map((conn, i) => ({
      id: `e-${conn.source}-${conn.target}-${i}`,
      source: conn.source,
      target: conn.target,
      type: 'nexusEdgeAnimated' as const,
      animated: true,
      data: {
        color: conn.color,
        label: conn.label,
        flowSpeed: 2.5 + Math.random() * 2,
      },
    }))
  }

  useEffect(() => {
    setEdges(createEdgesFromConnections())
  }, [])

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds) as Node[])
    },
    []
  )

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => applyEdgeChanges(changes, eds) as ReturnType<typeof createEdgesFromConnections>)
    },
    []
  )

  const onConnect: OnConnect = useCallback(
    (connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: 'nexusEdgeAnimated',
            data: { color: '#3b82f6', label: undefined, flowSpeed: 3 },
          },
          eds
        ) as ReturnType<typeof createEdgesFromConnections>
      )
    },
    []
  )

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setFocusedAgent(node.id === focusedAgentId ? null : node.id)
    },
    [focusedAgentId, setFocusedAgent]
  )

  const onPaneClick = useCallback(() => {
    setFocusedAgent(null)
  }, [setFocusedAgent])

  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const agent = agents.find((a) => a.id === node.id)
      if (agent) openChat(agent)
    },
    [agents, openChat]
  )

  const fitViewOptions = useMemo(() => ({ padding: 0.3, duration: 800 }), [])

  // Compute which agents are highlighted (connected to focused agent)
  const highlightedIds = useMemo(() => {
    if (!focusedAgentId) return new Set<string>()
    const connected = new Set<string>([focusedAgentId])
    AGENT_CONNECTIONS.forEach((conn) => {
      if (conn.source === focusedAgentId) connected.add(conn.target)
      if (conn.target === focusedAgentId) connected.add(conn.source)
    })
    return connected
  }, [focusedAgentId])

  return (
    <div className="h-full w-full bg-[#06060a] relative overflow-hidden">
      {/* Ambient grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(59,130,246,0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(168,85,247,0.03) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(6,182,212,0.02) 0%, transparent 70%)
          `,
        }}
      />

      <ReactFlow
        nodes={nodes.map((n) => ({
          ...n,
          style: {
            opacity: focusedAgentId
              ? highlightedIds.has(n.id)
                ? 1
                : 0.25
              : 1,
            transition: 'opacity 0.4s ease',
          },
        }))}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{
          type: 'nexusEdgeAnimated',
          animated: true,
        }}
        proOptions={{ hideAttribution: true }}
        fitView
        fitViewOptions={fitViewOptions}
        minZoom={0.3}
        maxZoom={1.5}
        snapToGrid
        snapGrid={[20, 20]}
        nodesDraggable
        nodesConnectable
        elementsSelectable
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="rgba(255,255,255,0.03)"
        />

        {/* Controls panel */}
        <Controls
          className="!rounded-xl !border !border-white/[0.08] !bg-black/60 !backdrop-blur-xl !shadow-none [&>button]:!border-white/[0.08] [&>button]:!bg-transparent [&>button]:!text-white/40 [&>button:hover]:!bg-white/[0.08] [&>button:hover]:!text-white/80"
          showInteractive={false}
        />

        {/* MiniMap */}
        <MiniMap
          style={miniMapStyle}
          nodeColor={miniMapNodeColor}
          pannable
          zoomable
          className="!rounded-xl !border !border-white/[0.08]"
          maskColor="rgba(0,0,0,0.6)"
        />

        {/* Top-right view switcher */}
        <Panel position="top-right" className="flex flex-col gap-2">
          {/* Status bar */}
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl rounded-xl border border-white/[0.08] px-3 py-2">
            <div className="flex items-center gap-1.5">
              <motion.div
                className="w-2 h-2 rounded-full bg-emerald-400"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-[10px] font-mono text-white/40">
                {agents.filter((a) => a.status !== 'idle').length} active
              </span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-blue-400" />
              <span className="text-[10px] font-mono text-white/40">
                {agents.length} agents
              </span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <button
              onClick={() => setFocusedAgent(null)}
              className="flex items-center gap-1 text-[10px] font-mono text-white/30 hover:text-white/60 transition-colors"
            >
              <Focus className="h-3 w-3" />
              Clear
            </button>
          </div>

          {/* View switcher */}
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-xl rounded-xl border border-white/[0.08] p-1">
            {(['canvas', 'grid', 'radial', 'timeline'] as WorkspaceView[]).map((v) => {
              const Icon = viewIcons[v]
              return (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all',
                    view === v
                      ? 'bg-white/10 text-white'
                      : 'text-white/30 hover:text-white/60 hover:bg-white/[0.03]'
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              )
            })}
          </div>
        </Panel>

        {/* Bottom-left: hint */}
        <Panel position="bottom-left">
          <div className="text-[10px] text-white/20 font-mono bg-black/40 backdrop-blur px-3 py-1.5 rounded-lg border border-white/[0.06]">
            Double-click agent to chat · Drag to move · Scroll to zoom
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}

export function NexusWorkspaceCanvas() {
  return (
    <ReactFlowProvider>
      <WorkspaceCanvasInner />
    </ReactFlowProvider>
  )
}
