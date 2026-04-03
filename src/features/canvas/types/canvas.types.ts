export type NodeStatus = 'idle' | 'running' | 'success' | 'error' | 'warning' | 'queued'
export type NodeCategory = 'agent' | 'service' | 'database' | 'api' | 'workflow' | 'monitor'

export interface NexusNodeData {
  [key: string]: unknown
  label: string
  description: string
  status: NodeStatus
  category: NodeCategory
  icon: string
  metrics?: {
    cpu?: number
    memory?: number
    requests?: number
    uptime?: string
    latency?: string
  }
  logs?: string[]
  url?: string
  port?: number
  lastActivity?: string
}

export const STATUS_COLORS: Record<NodeStatus, string> = {
  idle: 'violet-500',
  running: 'blue-500',
  success: 'emerald-500',
  error: 'red-500',
  warning: 'amber-500',
  queued: 'zinc-400',
}

export const STATUS_LABELS: Record<NodeStatus, string> = {
  idle: 'Idle',
  running: 'Running',
  success: 'Online',
  error: 'Error',
  warning: 'Warning',
  queued: 'Queued',
}
