import { memo } from 'react'
import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react'
import { useCanvasStore } from '../hooks/useCanvasStore'
import type { NodeStatus } from '../types/canvas.types'

const statusStrokeColor: Record<NodeStatus, string> = {
  idle: '#8b5cf6',
  running: '#3b82f6',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  queued: '#a1a1aa',
}

function NexusEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  source,
  style,
}: EdgeProps) {
  const nodes = useCanvasStore((s) => s.nodes)
  const sourceNode = nodes.find((n) => n.id === source)
  const status = sourceNode?.data?.status ?? 'idle'
  const color = statusStrokeColor[status]
  const isRunning = status === 'running'

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })

  return (
    <>
      {isRunning && (
        <BaseEdge
          id={`${id}-glow`}
          path={edgePath}
          style={{
            stroke: color,
            strokeWidth: 6,
            strokeOpacity: 0.15,
            fill: 'none',
            filter: `drop-shadow(0 0 6px ${color})`,
          }}
        />
      )}

      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          stroke: color,
          strokeWidth: 1.5,
          strokeOpacity: isRunning ? 0.8 : 0.3,
          fill: 'none',
        }}
      />

      <path
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray="6 4"
        strokeOpacity={isRunning ? 0.9 : 0.4}
        className={isRunning ? 'nexus-edge-flow' : ''}
      />

      <style>{`
        @keyframes nexusDashFlow {
          to { stroke-dashoffset: -20; }
        }
        .nexus-edge-flow {
          animation: nexusDashFlow 1s linear infinite;
        }
      `}</style>
    </>
  )
}

export const NexusEdge = memo(NexusEdgeComponent)
