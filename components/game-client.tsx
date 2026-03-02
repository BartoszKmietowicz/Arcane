"use client"

import { useGameState } from "@/hooks/use-game-state"
import { StatsPanel } from "@/components/stats-panel"
import { UpgradeTree } from "@/components/upgrade-tree"
import { TargetArena } from "@/components/target-arena"
import { RoundSummary } from "@/components/round-summary"
import { getRoundDuration } from "@/lib/game-data"

function formatMana(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B"
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M"
  if (n >= 1_000) return (n / 1_000).toFixed(2) + "K"
  return n.toFixed(1)
}

export function GameClient() {
  const {
    state,
    targets,
    roundTimeLeft,
    hitTarget,
    buyUpgrade,
    canAfford,
    isUnlocked,
    startNextRound,
  } = useGameState()

  const roundDuration = getRoundDuration(state)
  const timerPct = state.roundActive
    ? (roundTimeLeft / roundDuration) * 100
    : 0

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-[0.07]"
          style={{ background: "oklch(0.65 0.2 200)" }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-[0.05]"
          style={{ background: "oklch(0.7 0.18 160)" }}
        />
      </div>

      {/* ===== ACTIVE ROUND: only timer + arena, centered ===== */}
      {state.roundActive ? (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-6 gap-4">
          {/* Timer HUD */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono px-2.5 py-0.5 rounded-full border border-border/40 bg-secondary/20">
                Round {state.round}
              </span>
              <span
                className="text-lg font-mono font-bold tabular-nums"
                style={{
                  color:
                    roundTimeLeft <= 5
                      ? "oklch(0.65 0.22 25)"
                      : "oklch(0.75 0.2 200)",
                }}
              >
                {roundTimeLeft.toFixed(1)}s
              </span>
            </div>
            <div className="w-64 h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-100"
                style={{
                  width: `${timerPct}%`,
                  background:
                    roundTimeLeft <= 5
                      ? "oklch(0.65 0.22 25)"
                      : "oklch(0.65 0.2 200)",
                }}
              />
            </div>
            {/* Minimal mana counter */}
            <span
              className="text-sm font-mono tabular-nums absolute top-4 right-4 border border-border/40 bg-secondary/10 overflow-hidden p-4 rounded-lg"
              style={{ color: "oklch(0.65 0.18 200 / 0.7)" }}
            >
              +{formatMana(state.roundMana)} mana
            </span>
          </div>

          {/* Arena */}
          <div className="w-full max-w-3xl">
            <TargetArena
              targets={targets}
              state={state}
              onHitTarget={hitTarget}
            />
          </div>
        </div>
      ) : (
        /* ===== BETWEEN ROUNDS: full UI ===== */
        <div className="relative z-10 flex flex-col w-full max-w-7xl mx-auto px-4 py-6 gap-6">
          {/* Header */}
          <header className="flex flex-col items-center gap-1">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground text-balance text-center">
              Arcane Ascent
            </h1>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
              Incremental Magic
            </p>
          </header>

          {/* Mana display */}
          <div className="flex flex-col items-center gap-0.5">
            <span
              className="text-3xl md:text-4xl font-bold font-mono tabular-nums tracking-tight"
              style={{
                color: "oklch(0.75 0.2 200)",
                textShadow: "0 0 30px oklch(0.65 0.2 200 / 0.4)",
              }}
            >
              {formatMana(state.mana)}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              mana ({formatMana(state.totalMana)} total)
            </span>
          </div>

          {/* Main area */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Center: Summary + Upgrades */}
            <div className="flex-1 flex flex-col items-center gap-4 min-w-0">
              <RoundSummary
                state={state}
                onStartNextRound={startNextRound}
              />

              <div className="w-full flex items-center gap-2 mt-2">
                <div className="flex-1 h-px bg-border/40" />
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-mono">
                  Upgrade Tree
                </span>
                <div className="flex-1 h-px bg-border/40" />
              </div>

              <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                <UpgradeTree
                  state={state}
                  buyUpgrade={buyUpgrade}
                  canAfford={canAfford}
                  isUnlocked={isUnlocked}
                />
              </div>
            </div>

            {/* Right: Stats sidebar */}
            <div className="lg:w-52 shrink-0">
              <StatsPanel state={state} />
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-2 pb-4">
            <p className="text-[9px] text-muted-foreground/40 font-mono text-center">
              Destroy targets for mana. Upgrade between rounds. Ascend.
            </p>
          </footer>
        </div>
      )}
    </main>
  )
}
