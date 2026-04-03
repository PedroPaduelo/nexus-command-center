import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type NodeTypes,
  type EdgeTypes,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useCanvasStore } from '../hooks/useCanvasStore'
import { NexusNode } from './NexusNode'
import { NexusEdge } from './NexusEdge'
import type { NexusNodeData } from '../types/canvas.types'

const nodeTypes: NodeTypes = {
  nexusNode: NexusNode,
}

const edgeTypes: EdgeTypes = {
  nexusEdge: NexusEdge,
}

const proOptions = { hideAttribution: true }

const defaultEdgeOptions = {
  type: 'nexusEdge',
  animated: false,
}

const miniMapStyle = {
  backgroundColor: 'rgba(0,0,0,0.6)',
  maskColor: 'rgba(0,0,0,0.7)',
}

const miniMapNodeColor = () => 'rgba(255,255,255,0.15)'

function Canvas() {
  const nodes = useCanvasStore((s) => s.nodes)
  const edges = useCanvasStore((s) => s.edges)
  const onNodesChange = useCanvasStore((s) => s.onNodesChange)
  const onEdgesChange = useCanvasStore((s) => s.onEdgesChange)
  const onConnect = useCanvasStore((s) => s.onConnect)
  const setSelectedNode = useCanvasStore((s) => s.setSelectedNode)

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node as Node<NexusNodeData>)
    },
    [setSelectedNode]
  )

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [setSelectedNode])

  const fitViewOptions = useMemo(() => ({ padding: 0.2, duration: 800 }), [])

  return (
    <div className="h-full w-full bg-[#08090a]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        proOptions={proOptions}
        fitView
        fitViewOptions={fitViewOptions}
        minZoom={0.3}
        maxZoom={2}
        snapToGrid
        snapGrid={[20, 20]}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(255,255,255,0.04)"
        />
        <Controls
          className="!rounded-xl !border !border-white/[0.06] !bg-white/[0.03] !shadow-none [&>button]:!border-white/[0.06] [&>button]:!bg-transparent [&>button]:!text-white/50 [&>button:hover]:!bg-white/[0.06]"
          showInteractive={false}
        />
        <MiniMap
          style={miniMapStyle}
          nodeColor={miniMapNodeColor}
          pannable
          zoomable
          className="!rounded-xl !border !border-white/[0.06]"
        />
      </ReactFlow>
    </div>
  )
}

export function CanvasView() {
  return (
    <ReactFlowProvider>
      <Canvas />
    </ReactFlowProvider>
  )
}
