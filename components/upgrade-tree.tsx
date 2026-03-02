"use client"

import { UPGRADES, getUpgradeCost } from "@/lib/game-data"
import type { GameState, Upgrade } from "@/lib/game-data"
import { af } from "date-fns/locale"
import {
  Zap,
  Ghost,
  Eye,
  Flame,
  Sparkles,
  Cog,
  Sun,
  Wind,
  Crown,
  Lock,
  Swords,
  Radar,
  Shield,
  Clock,
  Timer,
} from "lucide-react"
import { useCallback, useMemo, useState } from "react"

const ICON_MAP: Record<string, React.ReactNode> = {
  Zap: <Zap className="w-5 h-5" />,
  Ghost: <Ghost className="w-5 h-5" />,
  Eye: <Eye className="w-5 h-5" />,
  Flame: <Flame className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Cog: <Cog className="w-5 h-5" />,
  Sun: <Sun className="w-5 h-5" />,
  Wind: <Wind className="w-5 h-5" />,
  Crown: <Crown className="w-5 h-5" />,
  Swords: <Swords className="w-5 h-5" />,
  Radar: <Radar className="w-5 h-5" />,
  Shield: <Shield className="w-5 h-5" />,
  Clock: <Clock className="w-5 h-5" />,
  Timer: <Timer className="w-5 h-5" />,
}

interface UpgradeTreeProps {
  state: GameState
  buyUpgrade: (id: string) => void
  canAfford: (id: string) => boolean
  isUnlocked: (id: string) => boolean
}

function formatCost(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B"
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M"
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K"
  return n.toFixed(0)
}

const TIER_NAMES: Record<number, string> = {
  0: "Foundation",
  1: "Empowerment",
  2: "Mastery",
  3: "Ascendancy",
  4: "Transcendence",
}

// Grid config
const CELL_SIZE = 80
const NODE_SIZE = 52
const COLS = 8 // 0-7 columns
const ROWS = 5 // 0-4 rows
const GRID_W = COLS * CELL_SIZE
const GRID_H = ROWS * CELL_SIZE

// Map tier -> row threshold for dashed lines
const TIER_THRESHOLDS: { row: number; label: string }[] = [
  { row: 1, label: "Tier 1 - Empowerment" },
  { row: 2, label: "Tier 2 - Mastery" },
  { row: 3, label: "Tier 3 - Ascendancy" },
  { row: 4, label: "Tier 4 - Transcendence" },
]

function getCellCenter(col: number, row: number) {
  return {
    x: col * CELL_SIZE + CELL_SIZE / 2,
    y: row * CELL_SIZE + CELL_SIZE / 2,
  }
}

// Build lookup for fast access
const UPGRADE_MAP = new Map(UPGRADES.map((u) => [u.id, u]))

export function UpgradeTree({
  state,
  buyUpgrade,
  canAfford,
  isUnlocked,
}: UpgradeTreeProps) {
  const [hovered, setHovered] = useState<string | null>(null)
  const hoveredUpgrade = hovered ? UPGRADE_MAP.get(hovered) : null
  const hoveredPos = hoveredUpgrade
    ? getCellCenter(hoveredUpgrade.col, hoveredUpgrade.row)
    : null

  // Pre-compute all connection lines
  const connections = useMemo(() => {
    const lines: {
      x1: number
      y1: number
      x2: number
      y2: number
      fromId: string
      toId: string
    }[] = []

    for (const upgrade of UPGRADES) {
      if (!upgrade.requires) continue
      const to = getCellCenter(upgrade.col, upgrade.row)
      for (const reqId of upgrade.requires) {
        const req = UPGRADE_MAP.get(reqId)
        if (!req) continue
        const from = getCellCenter(req.col, req.row)
        lines.push({
          x1: from.x,
          y1: from.y,
          x2: to.x,
          y2: to.y,
          fromId: reqId,
          toId: upgrade.id,
        })
      }
    }
    return lines
  }, [])

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {/* Grid container */}
      <div
        className="relative mx-auto"
        style={{ width: GRID_W, height: GRID_H }}
      >
        {/* SVG layer for connection lines */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={GRID_W}
          height={GRID_H}
          aria-hidden="true"
        >
          {/* Tier divider dashed lines */}
          {TIER_THRESHOLDS.map((t) => {
            const y = t.row * CELL_SIZE
            return (
              <line
                key={`tier-${t.row}`}
                x1={0}
                y1={y}
                x2={GRID_W}
                y2={y}
                stroke="oklch(0.35 0.03 280)"
                strokeWidth={1}
                strokeDasharray="6 4"
              />
            )
          })}

          {/* Connection lines between prerequisite nodes */}
          {connections.map((c, i) => {
            const fromLevel = state.upgradeLevels[c.fromId] || 0
            const toLevel = state.upgradeLevels[c.toId] || 0
            const active = fromLevel > 0 && toLevel > 0
            const available = fromLevel > 0 && toLevel === 0

            return (
              <line
                key={i}
                x1={c.x1}
                y1={c.y1}
                x2={c.x2}
                y2={c.y2}
                stroke={
                  active
                    ? "oklch(0.7 0.18 160)"
                    : available
                      ? "oklch(0.65 0.2 200 / 0.5)"
                      : "oklch(0.3 0.03 280 / 0.5)"
                }
                strokeWidth={active ? 2.5 : 1.5}
                strokeLinecap="round"
              />
            )
          })}
        </svg>

        {/* Tier labels */}
        {TIER_THRESHOLDS.map((t) => (
          <div
            key={`label-${t.row}`}
            className="absolute left-0 flex items-center pointer-events-none"
            style={{ top: t.row * CELL_SIZE - 10 }}
          >
            <span
              className="text-[8px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-background/80"
              style={{ color: "oklch(0.5 0.03 280)" }}
            >
              {t.label}
            </span>
          </div>
        ))}

        {/* Upgrade nodes */}
        {UPGRADES.map((upgrade) => {
          const level = state.upgradeLevels[upgrade.id] || 0
          const unlocked = isUnlocked(upgrade.id)
          const affordable = canAfford(upgrade.id)
          const isMaxed = level >= upgrade.maxLevel
          const pos = getCellCenter(upgrade.col, upgrade.row)

          return (
            <UpgradeNode
              key={upgrade.id}
              upgrade={upgrade}
              level={level}
              unlocked={unlocked}
              affordable={affordable}
              isMaxed={isMaxed}
              x={pos.x}
              y={pos.y}
              onBuy={() => buyUpgrade(upgrade.id)}
              onHover={setHovered}
              isHovered={hovered === upgrade.id}
            />
          )
        })}
        {/* Flyout tooltip anchored to hovered node */}
        {hoveredUpgrade && hoveredPos && (() => {
          const flyoutW = 220
          const flyoutH = 160
          const gap = 8

          // Position to the right of the node by default
          let left = hoveredPos.x + NODE_SIZE / 2 + gap
          let top = hoveredPos.y - flyoutH / 2

          // If flyout would overflow right, position to the left
          if (left + flyoutW > GRID_W) {
            left = hoveredPos.x - NODE_SIZE / 2 - gap - flyoutW
          }

          // Clamp vertical
          if (top < 0) top = 4
          if (top + flyoutH > GRID_H) top = GRID_H - flyoutH - 4

          const level = state.upgradeLevels[hoveredUpgrade.id] || 0
          const cost = getUpgradeCost(hoveredUpgrade, level)
          const isMaxed = level >= hoveredUpgrade.maxLevel

          return (
            <div
              className="absolute z-30 rounded-lg border border-border/60 bg-card/95 backdrop-blur-md p-3 flex flex-col gap-1.5 pointer-events-none animate-in fade-in zoom-in-95 duration-150"
              style={{
                left,
                top,
                width: flyoutW,
                boxShadow: "0 4px 24px oklch(0 0 0 / 0.5), 0 0 12px oklch(0.65 0.2 200 / 0.1)",
              }}
            >
              {/* Title row */}
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded flex items-center justify-center shrink-0"
                  style={{ background: "oklch(0.2 0.04 200)", color: "oklch(0.8 0.15 200)" }}
                >
                  {ICON_MAP[hoveredUpgrade.icon] ?? <Zap className="w-4 h-4" />}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {hoveredUpgrade.name}
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    {TIER_NAMES[hoveredUpgrade.tier]}
                  </span>
                </div>
                <span className="ml-auto text-[10px] font-mono text-muted-foreground shrink-0">
                  {level}/{hoveredUpgrade.maxLevel}
                </span>
              </div>

              {/* Description */}
              <p className="text-[10px] text-muted-foreground/90 leading-relaxed">
                {hoveredUpgrade.description}
              </p>

              {/* Effect per level */}
              <span className="text-[10px] font-mono" style={{ color: "oklch(0.7 0.18 160)" }}>
                +{hoveredUpgrade.effectValue} {hoveredUpgrade.effect} per level
              </span>

              {/* Cost */}
              {!isMaxed ? (
                <span className="text-[10px] font-mono" style={{ color: "oklch(0.65 0.2 200)"}}>
                  Next level: {formatCost(cost)} mana
                </span>
              ) : (
                <span className="text-[10px] font-mono font-bold" style={{ color: "oklch(0.7 0.18 160)" }}>
                  MAX RANK
                </span>
              )}

              {/* Requires */}
              {hoveredUpgrade.requires && hoveredUpgrade.requires.length > 0 && (
                <span className="text-[9px] text-muted-foreground/60">
                  Requires:{" "}
                  {hoveredUpgrade.requires
                    .map((r) => UPGRADE_MAP.get(r)?.name ?? r)
                    .join(", ")}
                </span>
              )}

              {/* Unlocks */}
              {hoveredUpgrade.unlocks && hoveredUpgrade.unlocks.length > 0 && (
                <span className="text-[9px] text-muted-foreground/60">
                  Unlocks:{" "}
                  {hoveredUpgrade.unlocks
                    .map((r) => UPGRADE_MAP.get(r)?.name ?? r)
                    .join(", ")}
                </span>
              )}
            </div>
          )
        })()}
      </div>
    </div>
  )
}

function UpgradeNode({
  upgrade,
  level,
  unlocked,
  affordable,
  isMaxed,
  x,
  y,
  onBuy,
  onHover,
  isHovered,
}: {
  upgrade: Upgrade
  level: number
  unlocked: boolean
  affordable: boolean
  isMaxed: boolean
  x: number
  y: number
  onBuy: () => void
  onHover: (id: string | null) => void
  isHovered: boolean
}) {
  const icon = ICON_MAP[upgrade.icon] ?? <Zap className="w-5 h-5" />
  const half = NODE_SIZE / 2

  const handleClick = useCallback(() => {
    if (unlocked && affordable && !isMaxed) onBuy()
  }, [unlocked, affordable, isMaxed, onBuy])

  // Node border + bg colors
  let borderColor = "oklch(0.28 0.04 280)"
  let bgColor = "oklch(0.15 0.02 280)"
  let iconColor = "oklch(0.45 0.03 280)"
  let shadow = "none"

  if (isMaxed) {
    borderColor = "oklch(0.7 0.18 160)"
    bgColor = "oklch(0.2 0.06 160)"
    iconColor = "oklch(0.85 0.15 160)"
    shadow = "0 0 12px oklch(0.7 0.18 160 / 0.3)"
  } else if (!unlocked) {
    borderColor = "oklch(0.4 0.02 240)"
    bgColor = "oklch(0.3 0.015 240)"
    iconColor = "oklch(0.5 0.02 240)"
  } else if (affordable) {
    borderColor = "oklch(0.65 0.2 200)"
    bgColor = level > 0 ? "oklch(0.2 0.05 200)" : "oklch(0.17 0.03 200)"
    iconColor = "oklch(0.85 0.15 200)"
    shadow = "0 0 14px oklch(0.65 0.2 200 / 0.25)"
  } else if (level > 0) {
    borderColor = "oklch(0.5 0.12 200)"
    bgColor = "oklch(0.18 0.04 200)"
    iconColor = "oklch(0.7 0.12 200)"
    shadow = "0 0 8px oklch(0.5 0.12 200 / 0.15)"
  }

  if (isHovered && unlocked) {
    shadow = isMaxed
      ? "0 0 20px oklch(0.7 0.18 160 / 0.5)"
      : "0 0 20px oklch(0.65 0.2 200 / 0.4)"
  }

  return (
    <button
      className="absolute flex flex-col items-center justify-center transition-all duration-150"
      style={{
        left: x - half,
        top: y - half,
        width: NODE_SIZE,
        height: NODE_SIZE,
        borderRadius: 8,
        border: `2px solid ${borderColor}`,
        background: bgColor,
        color: iconColor,
        boxShadow: shadow,
        cursor: !unlocked || !affordable ? "help" : isMaxed ? "default" : "pointer",
        opacity: !unlocked ? 0.6 : 1,
      }}
      onClick={handleClick}
      onMouseEnter={() => onHover(upgrade.id)}
      onMouseLeave={() => onHover(null)}
      // disabled={!affordable || isMaxed}
      aria-label={`${upgrade.name}, Level ${level}/${upgrade.maxLevel}`}
    >
      {/*cost*/}
      <div className="absolute z-10 -top-2.5 -right-2.5 text-[10px] text-black rounded-full font-mono uppercase tracking-widest px-1.5 py-0.5 " style={{background: affordable ? "oklch(0.65 0.2 200" : "oklch(0.25 0.2 200)" }}>
        {getUpgradeCost(upgrade, level)}
      </div>
      {/* Icon */}
      <div className="flex items-center justify-center">{icon}</div>

      {/* Level badge */}
      <span
        className="absolute -bottom-2.5 text-[9px] font-mono font-bold px-1.5 py-px rounded-sm"
        style={{
          background: isMaxed
            ? "oklch(0.7 0.18 160)"
            : level > 0
              ? "oklch(0.55 0.15 200)"
              : "oklch(0.22 0.03 280)",
          color: isMaxed || level > 0 ? "oklch(0.1 0.02 280)" : "oklch(0.55 0.03 280)",
        }}
      >
        {level}/{upgrade.maxLevel}
      </span>

      {/* Lock overlay */}
      {!unlocked && (
        <div className="absolute inset-0 flex items-center justify-center rounded-md bg-background/50">
          <Lock className="w-3.5 h-3.5" style={{ color: "oklch(0.35 0.02 280)" }} />
        </div>
      )}
    </button>
  )
}
