"use client"

import { calculateAutoMana } from "@/lib/game-data"
import type { GameState } from "@/lib/game-data"
import { Swords, Wind, Eye, Sparkles, TrendingUp, Radar, Clock, Timer, Hourglass } from "lucide-react"

interface StatsPanelProps {
  state: GameState
}

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B"
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M"
  if (n >= 1_000) return (n / 1_000).toFixed(2) + "K"
  return n.toFixed(1)
}

export function StatsPanel({ state }: StatsPanelProps) {
  const autoMana = calculateAutoMana(state)

  return (
    <aside className="flex flex-col gap-1.5 w-full" aria-label="Player stats">
      <h2 className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-1 px-1">
        Stats
      </h2>
      <StatRow
        icon={<Swords className="w-3.5 h-3.5" />}
        label="Damage"
        value={formatNumber(state.damage)}
      />
      <StatRow
        icon={<Wind className="w-3.5 h-3.5" />}
        label="Auto Mana"
        value={`${formatNumber(autoMana)}/s`}
      />
      <StatRow
        icon={<Eye className="w-3.5 h-3.5" />}
        label="Crit Chance"
        value={`${(state.critChance * 100).toFixed(0)}%`}
      />
      <StatRow
        icon={<Sparkles className="w-3.5 h-3.5" />}
        label="Crit Damage"
        value={`${state.critMultiplier.toFixed(1)}x`}
      />
      <StatRow
        icon={<TrendingUp className="w-3.5 h-3.5" />}
        label="Multiplier"
        value={`${state.manaMultiplier.toFixed(2)}x`}
      />
      <StatRow
        icon={<Radar className="w-3.5 h-3.5" />}
        label="Spawn Rate"
        value={`${state.targetSpawnRate.toFixed(1)}x`}
      />
      <StatRow
        icon={<Clock className="w-3.5 h-3.5" />}
        label="Target Time"
        value={`${state.targetDuration.toFixed(1)}s`}
      />
      <StatRow
        icon={<Hourglass className="w-3.5 h-3.5" />}
        label="Round Time"
        value={`${state.roundDuration.toFixed(0)}s`}
      />
    </aside>
  )
}

function StatRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-secondary/30 border border-border/30 px-3 py-2">
      <span className="text-glow shrink-0">{icon}</span>
      <span className="text-[10px] text-muted-foreground flex-1 truncate">
        {label}
      </span>
      <span className="text-xs font-mono font-semibold text-foreground tabular-nums">
        {value}
      </span>
    </div>
  )
}
