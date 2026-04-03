import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import {
  Bot,
  Zap,
  Cpu,
  ListChecks,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0)
  const rafRef = useRef(0)

  useEffect(() => {
    const start = performance.now()
    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return value
}

const sparkAgents = [3, 4, 3, 5, 4, 6, 5, 6, 5, 7, 6, 6].map((v, i) => ({
  i,
  v,
}))
const sparkRequests = [
  1800, 2100, 2400, 2200, 2600, 2500, 2900, 2700, 3000, 2800, 2847, 2900,
].map((v, i) => ({ i, v }))
const sparkTasks = [
  800, 850, 920, 960, 1010, 1050, 1090, 1140, 1180, 1220, 1260, 1284,
].map((v, i) => ({ i, v }))

interface MetricCardProps {
  icon: React.ElementType
  label: string
  value: number
  formatted?: string
  suffix?: string
  trend: 'up' | 'down'
  trendValue: string
  color: string
  gradientId: string
  sparkData?: { i: number; v: number }[]
  cpuPercent?: number
  index: number
}

const colorMap: Record<
  string,
  {
    stroke: string
    fill: string
    iconBg: string
    iconText: string
    ring: string
  }
> = {
  blue: {
    stroke: '#3b82f6',
    fill: '#3b82f6',
    iconBg: 'bg-blue-500/15',
    iconText: 'text-blue-400',
    ring: 'stroke-blue-500',
  },
  cyan: {
    stroke: '#06b6d4',
    fill: '#06b6d4',
    iconBg: 'bg-cyan-500/15',
    iconText: 'text-cyan-400',
    ring: 'stroke-cyan-500',
  },
  emerald: {
    stroke: '#10b981',
    fill: '#10b981',
    iconBg: 'bg-emerald-500/15',
    iconText: 'text-emerald-400',
    ring: 'stroke-emerald-500',
  },
  violet: {
    stroke: '#8b5cf6',
    fill: '#8b5cf6',
    iconBg: 'bg-violet-500/15',
    iconText: 'text-violet-400',
    ring: 'stroke-violet-500',
  },
}

function MetricCard({
  icon: Icon,
  label,
  value,
  formatted,
  suffix,
  trend,
  trendValue,
  color,
  gradientId,
  sparkData,
  cpuPercent,
  index,
}: MetricCardProps) {
  const animatedValue = useCountUp(value)
  const display = formatted
    ? formatted.replace(String(value), animatedValue.toLocaleString())
    : `${animatedValue.toLocaleString()}${suffix || ''}`

  const c = colorMap[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl p-4 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            c.iconBg,
          )}
        >
          <Icon className={cn('h-4 w-4', c.iconText)} />
        </div>
        <div
          className={cn(
            'flex items-center gap-1 text-[11px] font-medium rounded-full px-2 py-0.5',
            trend === 'up'
              ? 'text-emerald-400 bg-emerald-500/10'
              : 'text-red-400 bg-red-500/10',
          )}
        >
          {trend === 'up' ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {trendValue}
        </div>
      </div>

      <div>
        <p className="text-2xl font-bold text-white tracking-tight">
          {display}
        </p>
        <p className="text-[11px] text-white/40 mt-0.5">{label}</p>
      </div>

      {sparkData && (
        <div className="h-[60px] -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c.fill} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={c.fill} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={c.stroke}
                strokeWidth={1.5}
                fill={`url(#${gradientId})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {cpuPercent != null && (
        <div className="flex items-center justify-center h-[60px]">
          <svg viewBox="0 0 80 80" className="h-[60px] w-[60px]">
            <circle
              cx="40"
              cy="40"
              r="32"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="6"
            />
            <circle
              cx="40"
              cy="40"
              r="32"
              fill="none"
              className={c.ring}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(cpuPercent / 100) * 201} 201`}
              transform="rotate(-90 40 40)"
            />
            <text
              x="40"
              y="44"
              textAnchor="middle"
              className="fill-white text-[14px] font-bold"
            >
              {cpuPercent}%
            </text>
          </svg>
        </div>
      )}
    </motion.div>
  )
}

interface MetricsPanelProps {
  className?: string
}

export function MetricsPanel({ className }: MetricsPanelProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-3', className)}>
      <MetricCard
        icon={Bot}
        label="Active Agents"
        value={6}
        trend="up"
        trendValue="+2"
        color="blue"
        gradientId="grad-agents"
        sparkData={sparkAgents}
        index={0}
      />
      <MetricCard
        icon={Zap}
        label="Requests / min"
        value={2847}
        formatted="2,847"
        trend="up"
        trendValue="+12%"
        color="cyan"
        gradientId="grad-requests"
        sparkData={sparkRequests}
        index={1}
      />
      <MetricCard
        icon={Cpu}
        label="CPU Usage"
        value={42}
        suffix="%"
        trend="down"
        trendValue="-5%"
        color="emerald"
        gradientId="grad-cpu"
        cpuPercent={42}
        index={2}
      />
      <MetricCard
        icon={ListChecks}
        label="Tasks Completed"
        value={1284}
        formatted="1,284"
        trend="up"
        trendValue="+18%"
        color="violet"
        gradientId="grad-tasks"
        sparkData={sparkTasks}
        index={3}
      />
    </div>
  )
}
