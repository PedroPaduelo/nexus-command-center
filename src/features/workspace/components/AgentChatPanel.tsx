import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  X,
  Send,
  Bot,
  User,
  Terminal,
  Zap,
  Sparkles,
  ChevronDown,
  Copy,
  CheckCheck,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useWorkspaceStore } from '../stores/useWorkspaceStore'
import type { WorkspaceMessage } from '../types/workspace.types'

const personalityColors: Record<string, string> = {
  orchestrator: '#3b82f6',
  coder: '#a855f7',
  researcher: '#06b6d4',
  designer: '#f97316',
  planner: '#10b981',
}

const brainEmojis: Record<string, string> = {
  orchestrator: '🧠',
  coder: '⚡',
  researcher: '🔬',
  designer: '🎨',
  planner: '📋',
}

function formatTimestamp(date: Date): string {
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return date.toLocaleDateString()
}

function MessageBubble({ message }: { message: WorkspaceMessage }) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'
  const isTool = message.role === 'tool'
  const isAgent = message.role === 'agent'

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isSystem) {
    return (
      <div className="flex items-center justify-center py-2">
        <span className="text-[10px] text-white/30 font-mono bg-white/[0.03] px-3 py-1 rounded-full border border-white/[0.06]">
          {message.content}
        </span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn('flex gap-2.5', isUser && 'flex-row-reverse')}
    >
      {/* Avatar */}
      <div
        className={cn(
          'shrink-0 h-7 w-7 rounded-lg flex items-center justify-center text-sm mt-0.5',
          isUser
            ? 'bg-white/10 border border-white/10'
            : 'border border-white/10',
          isTool && 'bg-cyan-500/10 border-cyan-500/20',
          !isUser && !isTool && 'bg-purple-500/10 border-purple-500/20'
        )}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5 text-white/60" />
        ) : isTool ? (
          <Terminal className="h-3.5 w-3.5 text-cyan-400" />
        ) : (
          <Bot className="h-3.5 w-3.5 text-purple-400" />
        )}
      </div>

      {/* Bubble */}
      <div className={cn('flex flex-col gap-1 max-w-[75%]', isUser && 'items-end')}>
        <div
          className={cn(
            'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed relative group',
            isUser
              ? 'bg-white/10 border border-white/10 text-white/90 rounded-tr-sm'
              : isTool
              ? 'bg-cyan-500/8 border border-cyan-500/15 text-cyan-200/80 text-[13px] font-mono rounded-tl-sm'
              : 'bg-white/[0.04] border border-white/[0.06] text-white/80 rounded-tl-sm'
          )}
        >
          {/* Role indicator for agent messages */}
          {!isUser && !isTool && (
            <div className="flex items-center gap-1 mb-1.5">
              <Sparkles className="h-2.5 w-2.5 text-purple-400/60" />
              <span className="text-[9px] font-mono text-purple-400/60 uppercase tracking-wider">
                {message.agentId}
              </span>
            </div>
          )}

          <p className="whitespace-pre-wrap">{message.content}</p>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/10"
          >
            {copied ? (
              <CheckCheck className="h-3 w-3 text-emerald-400" />
            ) : (
              <Copy className="h-3 w-3 text-white/30" />
            )}
          </button>
        </div>

        {/* Meta */}
        <div
          className={cn(
            'flex items-center gap-2 text-[10px] text-white/25',
            isUser && 'flex-row-reverse'
          )}
        >
          <span className="font-mono">{formatTimestamp(new Date(message.timestamp))}</span>
          {message.metadata?.tokens && (
            <span className="font-mono text-white/15">{message.metadata.tokens} tokens</span>
          )}
          {message.metadata?.duration && (
            <span className="font-mono text-white/15">{message.metadata.duration}</span>
          )}
          {message.metadata?.tool && (
            <span className="font-mono text-cyan-400/50 flex items-center gap-0.5">
              <Terminal className="h-2.5 w-2.5" />
              {message.metadata.tool}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export function AgentChatPanel() {
  const isOpen = useWorkspaceStore((s) => s.isChatOpen)
  const agent = useWorkspaceStore((s) => s.activeChatAgent)
  const messages = useWorkspaceStore((s) => s.messages)
  const closeChat = useWorkspaceStore((s) => s.closeChat)
  const sendMessage = useWorkspaceStore((s) => s.sendMessage)

  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const agentMessages = messages.filter(
    (m) => m.agentId === agent?.id || m.role === 'system'
  )

  const accentColor = agent ? personalityColors[agent.personality] || '#3b82f6' : '#3b82f6'
  const brainEmoji = agent ? brainEmojis[agent.personality] || '🧠' : '🧠'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [agentMessages])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const handleSend = () => {
    if (!input.trim() || !agent) return
    const text = input.trim()
    setInput('')
    setIsTyping(true)
    sendMessage(text)
    setTimeout(() => setIsTyping(false), 5000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && agent && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={closeChat}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-[420px] z-50 flex flex-col"
            style={{
              background: 'linear-gradient(180deg, rgba(15,15,20,0.98) 0%, rgba(10,10,15,0.99) 100%)',
              borderLeft: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* Header */}
            <div
              className="shrink-0 px-5 py-4 border-b border-white/[0.06]"
              style={{ borderBottomColor: `${accentColor}15` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Agent avatar */}
                  <motion.div
                    className="h-11 w-11 rounded-xl flex items-center justify-center text-xl border border-white/10"
                    animate={agent.status === 'thinking' || agent.status === 'responding' ? { y: [0, -3, 0] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{
                      background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}05)`,
                      boxShadow: `0 0 20px ${accentColor}15`,
                    }}
                  >
                    {agent.avatar}
                  </motion.div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">{agent.label}</h3>
                      <span
                        className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider"
                        style={{ color: accentColor, background: `${accentColor}15` }}
                      >
                        {agent.personality}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/40 mt-0.5">{agent.description}</p>

                    {/* Status indicator */}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <motion.span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: accentColor }}
                        animate={
                          agent.status !== 'idle'
                            ? { opacity: [1, 0.3, 1] }
                            : {}
                        }
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <span className="text-[10px] text-white/40 capitalize">
                        {agent.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={closeChat}
                  className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Agent brain / capabilities */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {agent.brain.map((b) => (
                  <span
                    key={b}
                    className="text-[9px] font-mono px-2 py-0.5 rounded-md border border-white/[0.06] text-white/40"
                  >
                    {brainEmoji} {b}
                  </span>
                ))}
              </div>

              {/* Quick stats */}
              <div className="mt-3 grid grid-cols-4 gap-2">
                {[
                  { label: 'Tokens', value: agent.metrics.tokensUsed.toLocaleString() },
                  { label: 'Tasks', value: String(agent.metrics.tasksDone) },
                  { label: 'Rate', value: `${agent.metrics.successRate}%` },
                  { label: 'Speed', value: agent.metrics.avgResponseTime },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="text-center py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05]"
                  >
                    <p className="text-[11px] font-bold text-white/80">{stat.value}</p>
                    <p className="text-[8px] text-white/30 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {agentMessages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2.5"
                >
                  <div className="shrink-0 h-7 w-7 rounded-lg flex items-center justify-center bg-purple-500/10 border border-purple-500/20">
                    <Bot className="h-3.5 w-3.5 text-purple-400" />
                  </div>
                  <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                    <motion.span
                      className="w-1.5 h-1.5 rounded-full bg-purple-400"
                      animate={{ opacity: [1, 0, 1], y: [0, -4, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                    />
                    <motion.span
                      className="w-1.5 h-1.5 rounded-full bg-purple-400"
                      animate={{ opacity: [1, 0, 1], y: [0, -4, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: 0.15 }}
                    />
                    <motion.span
                      className="w-1.5 h-1.5 rounded-full bg-purple-400"
                      animate={{ opacity: [1, 0, 1], y: [0, -4, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: 0.3 }}
                    />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="shrink-0 p-4 border-t border-white/[0.06]">
              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${agent.label}...`}
                  rows={1}
                  className={cn(
                    'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 pr-12 text-sm text-white/80 placeholder:text-white/25',
                    'resize-none outline-none transition-all focus:border-white/15',
                    'max-h-32 overflow-y-auto'
                  )}
                  style={{ fieldSizing: 'content' } as React.CSSProperties}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="absolute right-2 bottom-2 p-2 rounded-lg transition-all disabled:opacity-30"
                  style={{
                    background: input.trim() ? `${accentColor}30` : 'white/5',
                    color: input.trim() ? accentColor : 'white/30',
                  }}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[10px] text-white/20 mt-2 text-center font-mono">
                Press Enter to send · Shift+Enter for new line · Double-click agents to chat
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
