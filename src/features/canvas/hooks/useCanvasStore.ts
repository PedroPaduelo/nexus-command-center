import { create } from 'zustand'
import {
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react'
import type { NexusNodeData, NodeStatus } from '../types/canvas.types'

interface CanvasStore {
  nodes: Node<NexusNodeData>[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  selectedNode: Node<NexusNodeData> | null
  setSelectedNode: (node: Node<NexusNodeData> | null) => void
  addNode: (node: Node<NexusNodeData>) => void
  updateNodeStatus: (nodeId: string, status: NodeStatus) => void
  updateNodeMetrics: (nodeId: string, metrics: NexusNodeData['metrics']) => void
}

const initialNodes: Node<NexusNodeData>[] = [
  {
    id: 'orquestrador',
    type: 'nexusNode',
    position: { x: 100, y: 300 },
    data: {
      label: 'Orquestrador',
      description: 'Central orchestration agent',
      status: 'running',
      category: 'agent',
      icon: 'Bot',
      metrics: { cpu: 24, memory: 38, requests: 1420, uptime: '7d 14h', latency: '12ms' },
      lastActivity: 'Dispatching tasks',
    },
  },
  {
    id: 'claude-agent',
    type: 'nexusNode',
    position: { x: 420, y: 120 },
    data: {
      label: 'Claude Agent',
      description: 'AI reasoning & code gen',
      status: 'running',
      category: 'agent',
      icon: 'Bot',
      metrics: { cpu: 62, memory: 71, requests: 328, uptime: '7d 14h', latency: '840ms' },
      lastActivity: 'Processing prompt',
    },
  },
  {
    id: 'api-gateway',
    type: 'nexusNode',
    position: { x: 420, y: 340 },
    data: {
      label: 'API Gateway',
      description: 'Fastify HTTP server',
      status: 'success',
      category: 'api',
      icon: 'Globe',
      metrics: { cpu: 8, memory: 22, requests: 5840, uptime: '7d 14h', latency: '4ms' },
      port: 3333,
      url: 'https://api.serendiped.com',
    },
  },
  {
    id: 'postgresql',
    type: 'nexusNode',
    position: { x: 740, y: 220 },
    data: {
      label: 'PostgreSQL',
      description: 'Primary datastore',
      status: 'success',
      category: 'database',
      icon: 'Database',
      metrics: { cpu: 12, memory: 45, requests: 9200, uptime: '30d 2h', latency: '2ms' },
      port: 5432,
    },
  },
  {
    id: 'redis',
    type: 'nexusNode',
    position: { x: 740, y: 440 },
    data: {
      label: 'Redis Cache',
      description: 'In-memory cache & broker',
      status: 'success',
      category: 'database',
      icon: 'Database',
      metrics: { cpu: 3, memory: 18, requests: 24000, uptime: '30d 2h', latency: '<1ms' },
      port: 6379,
    },
  },
  {
    id: 'task-queue',
    type: 'nexusNode',
    position: { x: 420, y: 560 },
    data: {
      label: 'Task Queue',
      description: 'BullMQ job workers',
      status: 'running',
      category: 'service',
      icon: 'Server',
      metrics: { cpu: 34, memory: 29, requests: 870, uptime: '7d 14h' },
      lastActivity: 'Processing 3 jobs',
    },
  },
  {
    id: 'monitoring',
    type: 'nexusNode',
    position: { x: 1020, y: 100 },
    data: {
      label: 'Monitoring',
      description: 'Health checks & alerts',
      status: 'success',
      category: 'monitor',
      icon: 'Activity',
      metrics: { cpu: 2, memory: 8, uptime: '30d 2h' },
    },
  },
  {
    id: 'frontend',
    type: 'nexusNode',
    position: { x: 1020, y: 400 },
    data: {
      label: 'Frontend App',
      description: 'React dashboard UI',
      status: 'success',
      category: 'service',
      icon: 'Server',
      metrics: { cpu: 1, memory: 5, requests: 3200, uptime: '7d 14h', latency: '18ms' },
      port: 5173,
      url: 'https://nexus.serendiped.com',
    },
  },
]

const initialEdges: Edge[] = [
  { id: 'e-orq-claude', source: 'orquestrador', target: 'claude-agent', type: 'nexusEdge' },
  { id: 'e-orq-api', source: 'orquestrador', target: 'api-gateway', type: 'nexusEdge' },
  { id: 'e-orq-queue', source: 'orquestrador', target: 'task-queue', type: 'nexusEdge' },
  { id: 'e-api-pg', source: 'api-gateway', target: 'postgresql', type: 'nexusEdge' },
  { id: 'e-api-redis', source: 'api-gateway', target: 'redis', type: 'nexusEdge' },
  { id: 'e-queue-redis', source: 'task-queue', target: 'redis', type: 'nexusEdge' },
  { id: 'e-mon-api', source: 'monitoring', target: 'api-gateway', type: 'nexusEdge' },
  { id: 'e-mon-pg', source: 'monitoring', target: 'postgresql', type: 'nexusEdge' },
  { id: 'e-mon-redis', source: 'monitoring', target: 'redis', type: 'nexusEdge' },
  { id: 'e-mon-frontend', source: 'monitoring', target: 'frontend', type: 'nexusEdge' },
  { id: 'e-api-frontend', source: 'api-gateway', target: 'frontend', type: 'nexusEdge' },
]

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedNode: null,

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) as Node<NexusNodeData>[] })
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) })
  },

  onConnect: (connection) => {
    set({ edges: addEdge({ ...connection, type: 'nexusEdge' }, get().edges) })
  },

  setSelectedNode: (node) => set({ selectedNode: node }),

  addNode: (node) => {
    set({ nodes: [...get().nodes, node] })
  },

  updateNodeStatus: (nodeId, status) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, status } } : n
      ),
    })
  },

  updateNodeMetrics: (nodeId, metrics) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, metrics } } : n
      ),
    })
  },
}))
