import { memo } from 'react'
import { BaseEdge, getBezierPath, EdgeLabelRenderer, type EdgeProps } from '@xyflow/react'

interface NexusEdgeData {
  animated?: boolean
  flowSpeed?: number
  color?: string
  label?: string
}

function NexusEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const edgeData = data as NexusEdgeData | undefined
  const animated = edgeData?.animated !== false
  const color = edgeData?.color ?? '#3b82f6'
  const label = edgeData?.label

  return (
    <>
      {/* Glow path for selected */}
      {selected && (
        <path
          d={edgePath}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeOpacity={0.15}
          strokeLinecap="round"
        />
      )}

      {/* Main edge path */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? color : `${color}80`,
          strokeWidth: selected ? 2.5 : 1.5,
          strokeLinecap: 'round',
          transition: 'stroke 0.3s, stroke-width 0.3s',
        }}
        markerEnd={markerEnd}
      />

      {/* Animated particle dot */}
      {animated && (
        <AnimatedDot
          path={edgePath}
          color={color}
          speed={edgeData?.flowSpeed ?? 3}
          count={selected ? 4 : 2}
        />
      )}

      {/* Label */}
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="px-2 py-0.5 rounded text-[9px] font-mono text-white/50 bg-black/60 border border-white/10"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

function AnimatedDot({
  path,
  color,
  speed,
  count,
}: {
  path: string
  color: string
  speed: number
  count: number
}) {
  return (
    <g>
      {Array.from({ length: count }).map((_, i) => {
        const delay = (i / count) * speed
        return (
          <circle
            key={i}
            r={2.5}
            fill={color}
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          >
            <animateMotion
              dur={`${speed}s`}
              repeatCount={Infinity}
              path={path}
              begin={`${delay}s`}
            />
          </circle>
        )
      })}
    </g>
  )
}

export const NexusEdgeAnimated = memo(NexusEdgeComponent)
