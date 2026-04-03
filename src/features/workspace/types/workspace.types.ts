export type AgentStatus = 'idle' | 'thinking' | 'responding' | 'tool_use' | 'error'
export type AgentPersonality = 'orchestrator' | 'coder' | 'researcher' | 'designer' | 'planner'

export interface Agent {
  id: string
  label: string
  personality: AgentPersonality
  description: string
  status: AgentStatus
  position: { x: number; y: number }
  avatar: string
  color: string
  metrics: {
    tokensUsed: number
    tasksDone: number
    successRate: number
    avgResponseTime: string
  }
  currentTask?: string
  brain: string[]
  tools: string[]
  lastActivity: string
  isOnline: boolean
  personalityTrait: string
}

export interface WorkspaceMessage {
  id: string
  agentId: string
  role: 'user' | 'agent' | 'system' | 'tool'
  content: string
  timestamp: Date
  metadata?: {
    tokens?: number
    model?: string
    tool?: string
    duration?: string
  }
}

export interface WorkspaceEvent {
  id: string
  type: 'task_dispatch' | 'tool_call' | 'agent_status' | 'api_request' | 'deploy' | 'error'
  agentId?: string
  message: string
  timestamp: Date
  severity: 'info' | 'success' | 'warning' | 'error'
}

export interface FloatingPanel {
  id: string
  type: 'terminal' | 'logs' | 'playground'
  position: { x: number; y: number }
  size: { width: number; height: number }
  isMinimized: boolean
  zIndex: number
}

export type WorkspaceView = 'canvas' | 'grid' | 'radial' | 'timeline'
