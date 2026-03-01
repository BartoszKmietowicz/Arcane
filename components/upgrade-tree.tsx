"use client"

import { UPGRADES, getUpgradeCost } from "@/lib/game-data"
import type { GameState, Upgrade } from "@/lib/game-data"
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
import { useCallback } from "react"

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

const TIERS = Array.from(new Set(UPGRADES.map((u) => u.tier))).sort()

export function UpgradeTree({
  state,
  buyUpgrade,
  canAfford,
  isUnlocked,
}: UpgradeTreeProps) {
  return (
    <div className="w-full">
      <div className="flex flex-col items-center gap-3">
        {TIERS.map((tier) => {
          const tierUpgrades = UPGRADES.filter((u) => u.tier === tier)
          return (
            <div key={tier} className="w-full">
              {tier > 0 && (
                <div className="flex justify-center py-0.5">
                  <div className="w-px h-4 bg-border/50" />
                </div>
              )}

              <div className="flex justify-center mb-2">
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-mono px-2.5 py-0.5 rounded-full border border-border/40 bg-secondary/20">
                  {TIER_NAMES[tier] ?? `Tier ${tier}`}
                </span>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                {tierUpgrades.map((upgrade) => {
                  const level = state.upgradeLevels[upgrade.id] || 0
                  const unlocked = isUnlocked(upgrade.id)
                  const affordable = canAfford(upgrade.id)
                  const hasPoints = level > 0

                  return (
                    <UpgradeCard
                      key={upgrade.id}
                      upgrade={upgrade}
                      level={level}
                      affordable={affordable}
                      unlocked={unlocked}
                      hasPoints={hasPoints}
                      onBuy={() => buyUpgrade(upgrade.id)}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function UpgradeCard({
  upgrade,
  level,
  affordable,
  unlocked,
  hasPoints,
  onBuy,
}: {
  upgrade: Upgrade
  level: number
  affordable: boolean
  unlocked: boolean
  hasPoints: boolean
  onBuy: () => void
}) {
  const cost = getUpgradeCost(upgrade, level)
  const isMaxed = level >= upgrade.maxLevel
  const icon = ICON_MAP[upgrade.icon] ?? <Zap className="w-5 h-5" />

  const handleClick = useCallback(() => {
    if (unlocked && affordable && !isMaxed) onBuy()
  }, [unlocked, affordable, isMaxed, onBuy])

  // Show which skills this unlocks
  const unlocksText = upgrade.unlocks?.length
    ? `Unlocks: ${upgrade.unlocks
        .map((uid) => UPGRADES.find((u) => u.id === uid)?.name ?? uid)
        .join(", ")}`
    : ""

  return (
    <button
      onClick={handleClick}
      disabled={!unlocked || !affordable || isMaxed}
      className={`group relative flex flex-col items-center gap-1.5 rounded-xl border p-3 w-[120px] transition-all duration-200 text-left
        ${
          isMaxed
            ? "border-glow-accent/40 bg-glow-accent/5"
            : !unlocked
              ? "border-border/20 bg-secondary/10 opacity-35 cursor-not-allowed"
              : affordable
                ? "border-glow/40 bg-glow/5 hover:bg-glow/10 hover:border-glow/60 hover:shadow-[0_0_20px_oklch(0.65_0.2_200_/_0.15)] cursor-pointer"
                : "border-border/40 bg-secondary/20 cursor-not-allowed"
        }
      `}
      title={unlocksText}
      aria-label={`${upgrade.name}, Level ${level}/${upgrade.maxLevel}. Cost: ${formatCost(cost)} mana. ${upgrade.description}. ${unlocksText}`}
    >
      {/* Unlock indicator badge */}
      {hasPoints && !isMaxed && upgrade.unlocks && upgrade.unlocks.length > 0 && (
        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-glow-accent border border-background" />
      )}

      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center
          ${
            isMaxed
              ? "bg-glow-accent/20 text-glow-accent"
              : !unlocked
                ? "bg-secondary/30 text-muted-foreground"
                : affordable
                  ? "bg-glow/15 text-glow"
                  : "bg-secondary/40 text-muted-foreground"
          }
        `}
      >
        {!unlocked ? <Lock className="w-4 h-4" /> : icon}
      </div>

      <span
        className={`text-[10px] font-semibold text-center leading-tight ${
          !unlocked ? "text-muted-foreground" : "text-foreground"
        }`}
      >
        {upgrade.name}
      </span>

      <span className="text-[9px] text-muted-foreground text-center leading-tight line-clamp-2">
        {upgrade.description}
      </span>

      {/* Level bar */}
      <div className="w-full h-0.5 rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isMaxed ? "bg-glow-accent" : "bg-glow"
          }`}
          style={{ width: `${(level / upgrade.maxLevel) * 100}%` }}
        />
      </div>

      <div className="flex items-center justify-between w-full">
        <span className="text-[9px] font-mono text-muted-foreground">
          {level}/{upgrade.maxLevel}
        </span>
        {!isMaxed && unlocked && (
          <span
            className={`text-[9px] font-mono ${
              affordable ? "text-glow" : "text-muted-foreground"
            }`}
          >
            {formatCost(cost)}
          </span>
        )}
        {isMaxed && (
          <span className="text-[9px] font-mono text-glow-accent">MAX</span>
        )}
      </div>
    </button>
  )
}
