export type UpgradeEffect =
  | "clickPower"
  | "autoMana"
  | "critChance"
  | "critMultiplier"
  | "manaMultiplier"
  | "autoClickSpeed"
  | "damage"
  | "targetSpawnRate"
  | "targetDuration"
  | "roundDuration"

export interface Upgrade {
  id: string
  name: string
  description: string
  icon: string
  baseCost: number
  costMultiplier: number
  effect: UpgradeEffect
  effectValue: number
  maxLevel: number
  requires?: string[]
  tier: number
  unlocks?: string[]
}

export const UPGRADES: Upgrade[] = [
  // Tier 0 - Foundation
  {
    id: "spark",
    name: "Arcane Spark",
    description: "Increases base click damage",
    icon: "Zap",
    baseCost: 10,
    costMultiplier: 1.15,
    effect: "damage",
    effectValue: 1,
    maxLevel: 50,
    tier: 0,
    unlocks: ["focus", "strike"],
  },
  {
    id: "familiar",
    name: "Summon Familiar",
    description: "Generates mana automatically",
    icon: "Ghost",
    baseCost: 50,
    costMultiplier: 1.2,
    effect: "autoMana",
    effectValue: 0.5,
    maxLevel: 30,
    tier: 0,
    unlocks: ["amplify", "lure"],
  },
  // Tier 1 - Empowerment
  {
    id: "focus",
    name: "Mystic Focus",
    description: "Chance to critically strike",
    icon: "Eye",
    baseCost: 200,
    costMultiplier: 1.3,
    effect: "critChance",
    effectValue: 0.05,
    maxLevel: 15,
    requires: ["spark"],
    tier: 1,
    unlocks: ["surge"],
  },
  {
    id: "strike",
    name: "Arcane Strike",
    description: "Large damage boost per level",
    icon: "Swords",
    baseCost: 150,
    costMultiplier: 1.25,
    effect: "damage",
    effectValue: 2,
    maxLevel: 40,
    requires: ["spark"],
    tier: 1,
    unlocks: ["surge", "shatter"],
  },
  {
    id: "amplify",
    name: "Amplify Essence",
    description: "Multiplies all mana income",
    icon: "Flame",
    baseCost: 500,
    costMultiplier: 1.35,
    effect: "manaMultiplier",
    effectValue: 0.1,
    maxLevel: 20,
    requires: ["familiar"],
    tier: 1,
    unlocks: ["automaton"],
  },
  {
    id: "lure",
    name: "Ethereal Lure",
    description: "Targets appear more often",
    icon: "Radar",
    baseCost: 300,
    costMultiplier: 1.3,
    effect: "targetSpawnRate",
    effectValue: 0.15,
    maxLevel: 15,
    requires: ["familiar"],
    tier: 1,
    unlocks: ["automaton", "persist", "extend"],
  },
  // Tier 2 - Mastery
  {
    id: "surge",
    name: "Critical Surge",
    description: "Increases critical hit damage",
    icon: "Sparkles",
    baseCost: 2000,
    costMultiplier: 1.4,
    effect: "critMultiplier",
    effectValue: 0.25,
    maxLevel: 15,
    requires: ["focus", "strike"],
    tier: 2,
    unlocks: ["nexus"],
  },
  {
    id: "automaton",
    name: "Arcane Automaton",
    description: "Speeds up auto-generation ticks",
    icon: "Cog",
    baseCost: 3000,
    costMultiplier: 1.45,
    effect: "autoClickSpeed",
    effectValue: 0.1,
    maxLevel: 10,
    requires: ["amplify", "lure"],
    tier: 2,
    unlocks: ["nexus"],
  },
  {
    id: "shatter",
    name: "Shatter Armor",
    description: "Massive damage increase",
    icon: "Shield",
    baseCost: 2500,
    costMultiplier: 1.4,
    effect: "damage",
    effectValue: 5,
    maxLevel: 20,
    requires: ["strike"],
    tier: 2,
    unlocks: ["tempest"],
  },
  {
    id: "persist",
    name: "Time Warp",
    description: "Targets stay visible longer",
    icon: "Clock",
    baseCost: 1800,
    costMultiplier: 1.35,
    effect: "targetDuration",
    effectValue: 0.5,
    maxLevel: 10,
    requires: ["lure"],
    tier: 2,
    unlocks: ["tempest"],
  },
  {
    id: "extend",
    name: "Temporal Stretch",
    description: "Each round lasts longer (+3s)",
    icon: "Timer",
    baseCost: 2000,
    costMultiplier: 1.5,
    effect: "roundDuration",
    effectValue: 3,
    maxLevel: 10,
    requires: ["lure"],
    tier: 2,
    unlocks: ["tempest"],
  },
  // Tier 3 - Ascendancy
  {
    id: "nexus",
    name: "Mana Nexus",
    description: "Massively boosts all mana",
    icon: "Sun",
    baseCost: 15000,
    costMultiplier: 1.6,
    effect: "manaMultiplier",
    effectValue: 0.25,
    maxLevel: 10,
    requires: ["surge", "automaton"],
    tier: 3,
    unlocks: ["ascension"],
  },
  {
    id: "tempest",
    name: "Arcane Tempest",
    description: "Huge base damage boost",
    icon: "Wind",
    baseCost: 20000,
    costMultiplier: 1.55,
    effect: "damage",
    effectValue: 15,
    maxLevel: 15,
    requires: ["shatter", "persist"],
    tier: 3,
    unlocks: ["ascension"],
  },
  // Tier 4 - Transcendence
  {
    id: "ascension",
    name: "Arcane Ascension",
    description: "Ultimate power - multiplies everything",
    icon: "Crown",
    baseCost: 100000,
    costMultiplier: 2.0,
    effect: "manaMultiplier",
    effectValue: 0.5,
    maxLevel: 5,
    requires: ["nexus", "tempest"],
    tier: 4,
  },
]

export function getUpgradeCost(upgrade: Upgrade, level: number): number {
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level))
}

export interface GameState {
  mana: number
  totalMana: number
  clickPower: number
  autoMana: number
  critChance: number
  critMultiplier: number
  manaMultiplier: number
  autoClickSpeed: number
  damage: number
  targetSpawnRate: number
  targetDuration: number
  roundDuration: number
  upgradeLevels: Record<string, number>
  // Round tracking
  round: number
  roundStartTime: number
  roundActive: boolean
  roundMana: number
}

export function createInitialState(): GameState {
  return {
    mana: 0,
    totalMana: 0,
    clickPower: 1,
    autoMana: 0,
    critChance: 0,
    critMultiplier: 2,
    manaMultiplier: 1,
    autoClickSpeed: 1,
    damage: 1,
    targetSpawnRate: 1,
    targetDuration: 5,
    roundDuration: 15,
    upgradeLevels: {},
    round: 1,
    roundStartTime: Date.now(),
    roundActive: true,
    roundMana: 0,
  }
}

export function calculateAutoMana(state: GameState): number {
  return state.autoMana * state.manaMultiplier * state.autoClickSpeed
}

export function getRoundDuration(state: GameState): number {
  return state.roundDuration
}

// Target types
export interface TargetType {
  name: string
  color: string
  glowColor: string
  baseHealth: number
  manaReward: number
  size: number
  symbol: string
}

export const TARGET_TYPES: TargetType[] = [
  {
    name: "Wisp",
    color: "oklch(0.7 0.18 200)",
    glowColor: "oklch(0.7 0.18 200 / 0.4)",
    baseHealth: 3,
    manaReward: 5,
    size: 48,
    symbol: "W",
  },
  {
    name: "Sprite",
    color: "oklch(0.7 0.18 160)",
    glowColor: "oklch(0.7 0.18 160 / 0.4)",
    baseHealth: 8,
    manaReward: 15,
    size: 56,
    symbol: "S",
  },
  {
    name: "Shade",
    color: "oklch(0.6 0.2 280)",
    glowColor: "oklch(0.6 0.2 280 / 0.4)",
    baseHealth: 20,
    manaReward: 40,
    size: 64,
    symbol: "H",
  },
  {
    name: "Phantom",
    color: "oklch(0.65 0.22 340)",
    glowColor: "oklch(0.65 0.22 340 / 0.4)",
    baseHealth: 50,
    manaReward: 120,
    size: 72,
    symbol: "P",
  },
  {
    name: "Elemental",
    color: "oklch(0.75 0.15 80)",
    glowColor: "oklch(0.75 0.15 80 / 0.4)",
    baseHealth: 150,
    manaReward: 400,
    size: 80,
    symbol: "E",
  },
]
