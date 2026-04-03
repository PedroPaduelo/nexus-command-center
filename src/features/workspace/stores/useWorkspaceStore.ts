import { create } from 'zustand'
import type {
  Agent,
  WorkspaceMessage,
  WorkspaceEvent,
  FloatingPanel,
  WorkspaceView,
  AgentStatus,
} from '../types/workspace.types'

const AVATARS = ['🤖', '🔮', '🧠', '🎨', '⚡']

const PERSONALITY_TRAITS: Record<string, string> = {
  orchestrator: 'Masters complex multi-step workflows with precision',
  coder: 'Writes clean, efficient code at lightning speed',
  researcher: 'Digs deep into problems, finds novel solutions',
  designer: 'Creates intuitive, beautiful user experiences',
  planner: 'Breaks down complexity into actionable steps',
}

const INITIAL_AGENTS: Agent[] = [
  {
    id: 'nexus-prime',
    label: 'Nexus Prime',
    personality: 'orchestrator',
    description: 'Chief orchestrator agent',
    status: 'thinking',
    position: { x: 500, y: 320 },
    avatar: AVATARS[0],
    color: '#3b82f6',
    metrics: { tokensUsed: 84200, tasksDone: 47, successRate: 94, avgResponseTime: '1.2s' },
    currentTask: 'Analyzing project architecture...',
    brain: ['task-decomposition', 'agent-coordination', 'quality-gate'],
    tools: ['read_file', 'write_file', 'bash', 'mcp_tools', 'web_search'],
    lastActivity: 'Coordinating 4 sub-agents',
    isOnline: true,
    personalityTrait: PERSONALITY_TRAITS['orchestrator'],
  },
  {
    id: 'code-artisan',
    label: 'Code Artisan',
    personality: 'coder',
    description: 'Expert code generation',
    status: 'responding',
    position: { x: 180, y: 140 },
    avatar: AVATARS[1],
    color: '#a855f7',
    metrics: { tokensUsed: 128400, tasksDone: 83, successRate: 97, avgResponseTime: '0.8s' },
    currentTask: 'Implementing API endpoints',
    brain: ['typescript', 'react', 'nodejs', 'prisma', 'fastify'],
    tools: ['read_file', 'write_file', 'bash', 'git'],
    lastActivity: 'Refactoring auth module',
    isOnline: true,
    personalityTrait: PERSONALITY_TRAITS['coder'],
  },
  {
    id: 'deep-search',
    label: 'Deep Search',
    personality: 'researcher',
    description: 'Research & analysis engine',
    status: 'idle',
    position: { x: 820, y: 140 },
    avatar: AVATARS[2],
    color: '#06b6d4',
    metrics: { tokensUsed: 45600, tasksDone: 31, successRate: 91, avgResponseTime: '2.1s' },
    currentTask: undefined,
    brain: ['web_search', 'code_analysis', 'documentation', 'context7'],
    tools: ['web_search', 'context7', 'read_file'],
    lastActivity: 'Researched React 19 patterns',
    isOnline: true,
    personalityTrait: PERSONALITY_TRAITS['researcher'],
  },
  {
    id: 'pixel-wizard',
    label: 'Pixel Wizard',
    personality: 'designer',
    description: 'UI/UX & visual design',
    status: 'idle',
    position: { x: 180, y: 500 },
    avatar: AVATARS[3],
    color: '#f97316',
    metrics: { tokensUsed: 32400, tasksDone: 28, successRate: 98, avgResponseTime: '1.5s' },
    currentTask: undefined,
    brain: ['tailwind', 'shadcn', 'motion', 'ux-principles'],
    tools: ['read_file', 'write_file', 'design_systems'],
    lastActivity: 'Designed metrics dashboard',
    isOnline: true,
    personalityTrait: PERSONALITY_TRAITS['designer'],
  },
  {
    id: 'task-architect',
    label: 'Task Architect',
    personality: 'planner',
    description: 'Strategic task planning',
    status: 'tool_use',
    position: { x: 820, y: 500 },
    avatar: AVATARS[4],
    color: '#10b981',
    metrics: { tokensUsed: 28900, tasksDone: 52, successRate: 96, avgResponseTime: '0.6s' },
    currentTask: 'Planning sprint milestones',
    brain: ['task-decomposition', 'prioritization', 'risk-analysis'],
    tools: ['task_planning', 'read_file', 'analytics'],
    lastActivity: 'Generated sprint backlog',
    isOnline: true,
    personalityTrait: PERSONALITY_TRAITS['planner'],
  },
]

const INITIAL_EVENTS: WorkspaceEvent[] = [
  {
    id: 'evt-1',
    type: 'task_dispatch',
    agentId: 'nexus-prime',
    message: 'Dispatched: Analyze codebase architecture',
    timestamp: new Date(Date.now() - 30000),
    severity: 'info',
  },
  {
    id: 'evt-2',
    type: 'tool_call',
    agentId: 'code-artisan',
    message: 'Tool: read_file (src/App.tsx)',
    timestamp: new Date(Date.now() - 24000),
    severity: 'info',
  },
  {
    id: 'evt-3',
    type: 'api_request',
    message: 'POST /api/deploy → 200 OK',
    timestamp: new Date(Date.now() - 18000),
    severity: 'success',
  },
  {
    id: 'evt-4',
    type: 'agent_status',
    agentId: 'nexus-prime',
    message: 'Status: thinking',
    timestamp: new Date(Date.now() - 12000),
    severity: 'info',
  },
  {
    id: 'evt-5',
    type: 'tool_call',
    agentId: 'task-architect',
    message: 'Tool: task_planning (5 tasks generated)',
    timestamp: new Date(Date.now() - 6000),
    severity: 'info',
  },
]

const INITIAL_MESSAGES: WorkspaceMessage[] = [
  {
    id: 'msg-1',
    agentId: 'nexus-prime',
    role: 'system',
    content: 'Session started. 5 agents online.',
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: 'msg-2',
    agentId: 'nexus-prime',
    role: 'user',
    content: 'Create a new feature: user notification system with real-time updates',
    timestamp: new Date(Date.now() - 55000),
  },
  {
    id: 'msg-3',
    agentId: 'nexus-prime',
    role: 'agent',
    content:
      'Understood. Decomposing into sub-tasks:\n\n1. **Code Artisan** → Create notification schema & API routes\n2. **Task Architect** → Plan implementation phases\n3. **Pixel Wizard** → Design notification UI components\n4. **Deep Search** → Research WebSocket best practices\n\nDispatching now...',
    timestamp: new Date(Date.now() - 48000),
    metadata: { tokens: 342, model: 'claude-sonnet-4', duration: '1.2s' },
  },
  {
    id: 'msg-4',
    agentId: 'code-artisan',
    role: 'tool',
    content: 'Created: src/domains/notifications/notification.service.ts',
    timestamp: new Date(Date.now() - 30000),
    metadata: { tool: 'write_file', duration: '0.3s' },
  },
  {
    id: 'msg-5',
    agentId: 'nexus-prime',
    role: 'agent',
    content: 'Code Artisan completed notification service. Deep Search is researching WebSocket patterns. Task Architect generating implementation timeline.',
    timestamp: new Date(Date.now() - 15000),
    metadata: { tokens: 128, model: 'claude-sonnet-4', duration: '0.8s' },
  },
]

interface WorkspaceStore {
  view: WorkspaceView
  floatingPanels: FloatingPanel[]
  activeChatAgent: Agent | null
  messages: WorkspaceMessage[]
  events: WorkspaceEvent[]
  isChatOpen: boolean
  selectedAgentId: string | null
  timeRange: '1h' | '6h' | '24h' | '7d'
  autoRefresh: boolean
  agents: Agent[]
  activeEventStream: boolean
  focusedAgentId: string | null

  setView: (view: WorkspaceView) => void
  openChat: (agent: Agent) => void
  closeChat: () => void
  sendMessage: (content: string) => void
  addEvent: (event: Omit<WorkspaceEvent, 'id' | 'timestamp'>) => void
  updateAgentStatus: (agentId: string, status: AgentStatus) => void
  updateAgentTask: (agentId: string, task: string | undefined) => void
  setFloatingPanel: (panel: FloatingPanel) => void
  updateFloatingPanel: (id: string, updates: Partial<FloatingPanel>) => void
  removeFloatingPanel: (id: string) => void
  setFocusedAgent: (agentId: string | null) => void
  setTimeRange: (range: '1h' | '6h' | '24h' | '7d') => void
  setAutoRefresh: (value: boolean) => void
}

let eventCounter = INITIAL_EVENTS.length
let messageCounter = INITIAL_MESSAGES.length

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  view: 'canvas',
  floatingPanels: [],
  activeChatAgent: null,
  messages: INITIAL_MESSAGES,
  events: INITIAL_EVENTS,
  isChatOpen: false,
  selectedAgentId: null,
  timeRange: '1h',
  autoRefresh: true,
  agents: INITIAL_AGENTS,
  activeEventStream: true,
  focusedAgentId: null,

  setView: (view) => set({ view }),

  openChat: (agent) => set({ isChatOpen: true, activeChatAgent: agent }),

  closeChat: () => set({ isChatOpen: false, activeChatAgent: null }),

  sendMessage: (content) => {
    const { activeChatAgent, messages } = get()
    if (!activeChatAgent) return

    const userMsg: WorkspaceMessage = {
      id: `msg-${++messageCounter}`,
      agentId: activeChatAgent.id,
      role: 'user',
      content,
      timestamp: new Date(),
    }

    const agentResponses = [
      `Analyzing your request... Let me coordinate the best approach.`,
      `Interesting task! I'm thinking through the optimal implementation path.`,
      `Got it. Dispatching to specialized agents for parallel execution.`,
      `I've identified 3 sub-tasks. Starting execution now.`,
      `Understood. This aligns with our current sprint goals.`,
    ]

    const response: WorkspaceMessage = {
      id: `msg-${++messageCounter}`,
      agentId: activeChatAgent.id,
      role: 'agent',
      content: agentResponses[Math.floor(Math.random() * agentResponses.length)],
      timestamp: new Date(Date.now() + 2000),
      metadata: {
        tokens: Math.floor(Math.random() * 400) + 100,
        model: 'claude-sonnet-4',
        duration: `${(Math.random() * 2 + 0.5).toFixed(1)}s`,
      },
    }

    set({ messages: [...messages, userMsg, response] })

    get().updateAgentStatus(activeChatAgent.id, 'thinking')
    setTimeout(() => {
      get().updateAgentStatus(activeChatAgent.id, 'responding')
    }, 1500)
    setTimeout(() => {
      get().updateAgentStatus(activeChatAgent.id, 'idle')
    }, 4000)
  },

  addEvent: (eventData) => {
    const event: WorkspaceEvent = {
      ...eventData,
      id: `evt-${++eventCounter}`,
      timestamp: new Date(),
    }
    set({ events: [event, ...get().events].slice(0, 50) })
  },

  updateAgentStatus: (agentId, status) => {
    set({
      agents: get().agents.map((a) =>
        a.id === agentId ? { ...a, status } : a
      ),
    })
  },

  updateAgentTask: (agentId, task) => {
    set({
      agents: get().agents.map((a) =>
        a.id === agentId ? { ...a, currentTask: task } : a
      ),
    })
  },

  setFloatingPanel: (panel) => {
    const existing = get().floatingPanels.find((p) => p.id === panel.id)
    if (existing) {
      set({
        floatingPanels: get().floatingPanels.map((p) =>
          p.id === panel.id ? { ...p, isMinimized: false } : p
        ),
      })
    } else {
      set({ floatingPanels: [...get().floatingPanels, panel] })
    }
  },

  updateFloatingPanel: (id, updates) => {
    set({
      floatingPanels: get().floatingPanels.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })
  },

  removeFloatingPanel: (id) => {
    set({ floatingPanels: get().floatingPanels.filter((p) => p.id !== id) })
  },

  setFocusedAgent: (agentId) => set({ focusedAgentId: agentId }),

  setTimeRange: (range) => set({ timeRange: range }),

  setAutoRefresh: (value) => set({ autoRefresh: value }),
}))
