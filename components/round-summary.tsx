"use client"

import type { GameState } from "@/lib/game-data"
import { Play, Trophy } from "lucide-react"

interface RoundSummaryProps {
  state: GameState
  onStartNextRound: () => void
}

function formatMana(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B"
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M"
  if (n >= 1_000) return (n / 1_000).toFixed(2) + "K"
  return n.toFixed(1)
}

export function RoundSummary({ state, onStartNextRound }: RoundSummaryProps) {
  return (
    <div className="flex flex-col items-center gap-4 p-6 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm w-full max-w-sm">
      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-glow-accent" />
        <h2 className="text-lg font-bold text-foreground">
          Round {state.round} Complete
        </h2>
      </div>

      <div className="flex flex-col items-center gap-1 w-full">
        <div className="flex justify-between w-full text-sm">
          <span className="text-muted-foreground font-mono">Mana earned</span>
          <span
            className="font-mono font-bold"
            style={{ color: "oklch(0.7 0.18 160)" }}
          >
            +{formatMana(state.roundMana)}
          </span>
        </div>
        <div className="flex justify-between w-full text-sm">
          <span className="text-muted-foreground font-mono">Total mana</span>
          <span className="font-mono font-semibold text-foreground">
            {formatMana(state.mana)}
          </span>
        </div>
      </div>

      <div className="w-full h-px bg-border/30" />

      <p className="text-xs text-muted-foreground text-center font-mono">
        Spend your mana on upgrades below, then start the next round.
      </p>

      <button
        onClick={onStartNextRound}
        className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm
          bg-glow/15 border border-glow/40 text-foreground
          hover:bg-glow/25 hover:border-glow/60 hover:shadow-[0_0_20px_oklch(0.65_0.2_200_/_0.2)]
          active:scale-95 transition-all duration-200 cursor-pointer"
      >
        <Play className="w-4 h-4" />
        Start Round {state.round + 1}
      </button>
    </div>
  )
}
