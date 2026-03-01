"use client"

import { useCallback, useRef, useState } from "react"
import type { ActiveTarget } from "@/hooks/use-game-state"
import type { GameState } from "@/lib/game-data"

interface FloatingHit {
  id: number
  x: number
  y: number
  value: string
  isCrit: boolean
  isKill: boolean
}

interface TargetArenaProps {
  targets: ActiveTarget[]
  state: GameState
  onHitTarget: (id: number) => {
    isCrit: boolean
    damage: number
    killed: boolean
    manaGain: number
  }
}

export function TargetArena({ targets, state, onHitTarget }: TargetArenaProps) {
  const [hits, setHits] = useState<FloatingHit[]>([])
  const hitIdRef = useRef(0)
  const arenaRef = useRef<HTMLDivElement>(null)

  const handleTargetClick = useCallback(
    (targetId: number, e: React.MouseEvent) => {
      e.stopPropagation()
      const result = onHitTarget(targetId)
      const rect = arenaRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const id = ++hitIdRef.current
      const value = result.killed
        ? `+${formatNumber(result.manaGain)} mana`
        : `-${formatNumber(result.damage)}`

      setHits((prev) => [
        ...prev,
        { id, x, y, value, isCrit: result.isCrit, isKill: result.killed },
      ])
      setTimeout(() => {
        setHits((prev) => prev.filter((h) => h.id !== id))
      }, 1000)
    },
    [onHitTarget]
  )

  return (
    <div
      ref={arenaRef}
      className="relative w-full aspect-[3/2] rounded-xl border border-border/40 bg-secondary/10 overflow-hidden"
    >
      {/* Arena background pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: "radial-gradient(circle, oklch(0.65 0.2 200) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }} />

      {/* Targets */}
      {targets.map((target) => {
        const elapsed = (Date.now() - target.spawnTime) / 1000
        const remaining = target.duration - elapsed
        const fadeOpacity = Math.min(1, remaining / 1.5)
        const healthPct = (target.health / target.maxHealth) * 100

        return (
          <button
            key={target.id}
            onClick={(e) => handleTargetClick(target.id, e)}
            className="absolute cursor-crosshair transition-opacity duration-300 group focus:outline-none"
            style={{
              left: `${target.x}%`,
              top: `${target.y}%`,
              transform: "translate(-50%, -50%)",
              opacity: fadeOpacity,
            }}
            aria-label={`${target.type.name} - ${target.health} HP - Click to attack`}
          >
            {/* Glow */}
            <div
              className="absolute inset-[-8px] rounded-full blur-md transition-transform duration-150 group-hover:scale-110"
              style={{ background: target.type.glowColor }}
            />

            {/* Target body */}
            <div
              className="relative rounded-full flex items-center justify-center transition-transform duration-100 active:scale-90 group-hover:scale-105"
              style={{
                width: target.type.size,
                height: target.type.size,
                background: `radial-gradient(circle at 35% 35%, ${target.type.color}, oklch(0.2 0.02 280))`,
                boxShadow: `0 0 20px ${target.type.glowColor}`,
              }}
            >
              <span
                className="text-xs font-bold font-mono"
                style={{ color: target.type.color, filter: "brightness(1.5)" }}
              >
                {target.type.symbol}
              </span>
            </div>

            {/* HP bar */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[calc(100%+8px)] h-1 rounded-full bg-background/60 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-150"
                style={{
                  width: `${healthPct}%`,
                  background: healthPct > 50
                    ? target.type.color
                    : healthPct > 25
                      ? "oklch(0.7 0.18 80)"
                      : "oklch(0.6 0.22 25)",
                }}
              />
            </div>

            {/* Name tag */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-[9px] font-mono text-muted-foreground">
                {target.type.name}
              </span>
            </div>
          </button>
        )
      })}

      {/* Empty state */}
      {targets.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-xs text-muted-foreground/40 font-mono">
            Waiting for targets to appear...
          </p>
        </div>
      )}

      {/* Floating hit numbers */}
      {hits.map((h) => (
        <span
          key={h.id}
          className={`absolute pointer-events-none font-mono font-bold animate-float-up z-20 ${
            h.isKill
              ? "text-glow-accent text-sm"
              : h.isCrit
                ? "text-chart-5 text-sm"
                : "text-foreground text-xs"
          }`}
          style={{
            left: h.x,
            top: h.y,
            textShadow: h.isKill
              ? "0 0 10px oklch(0.7 0.18 160)"
              : h.isCrit
                ? "0 0 10px oklch(0.65 0.2 340)"
                : "0 0 6px oklch(0.5 0.1 200)",
          }}
        >
          {h.isCrit && !h.isKill && "CRIT "}
          {h.value}
        </span>
      ))}
    </div>
  )
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M"
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K"
  return n.toFixed(1)
}
