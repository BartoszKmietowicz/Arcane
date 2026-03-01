"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { GameState } from "@/lib/game-data"
import {
  UPGRADES,
  TARGET_TYPES,
  calculateAutoMana,
  createInitialState,
  getUpgradeCost,
  getRoundDuration,
} from "@/lib/game-data"
import type { TargetType } from "@/lib/game-data"

export interface ActiveTarget {
  id: number
  type: TargetType
  x: number
  y: number
  health: number
  maxHealth: number
  spawnTime: number
  duration: number
}

export function useGameState() {
  const [state, setState] = useState<GameState>(createInitialState)
  const [targets, setTargets] = useState<ActiveTarget[]>([])
  const [roundTimeLeft, setRoundTimeLeft] = useState(15)
  const stateRef = useRef(state)
  stateRef.current = state
  const idCounter = useRef(0)

  // Round timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      const s = stateRef.current
      if (!s.roundActive) return
      const duration = getRoundDuration(s)
      const elapsed = (Date.now() - s.roundStartTime) / 1000
      const left = Math.max(0, duration - elapsed)
      setRoundTimeLeft(left)

      if (left <= 0) {
        // End the round
        setState((prev) => ({ ...prev, roundActive: false }))
        setTargets([])
      }
    }, 100)
    return () => clearInterval(interval)
  }, [])

  // Auto-mana tick (only during rounds)
  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => {
        if (!prev.roundActive || prev.autoMana <= 0) return prev
        const gain = calculateAutoMana(prev) / 10
        return {
          ...prev,
          mana: prev.mana + gain,
          totalMana: prev.totalMana + gain,
          roundMana: prev.roundMana + gain,
        }
      })
    }, 100)
    return () => clearInterval(interval)
  }, [])

  // Spawn targets (only during rounds)
  useEffect(() => {
    const interval = setInterval(() => {
      const s = stateRef.current
      if (!s.roundActive) return

      const spawnChance = 0.12 * s.targetSpawnRate
      if (Math.random() < spawnChance) {
        const totalMana = s.totalMana
        let availableTypes = TARGET_TYPES.filter((_, i) => {
          const threshold = [0, 50, 300, 1500, 8000]
          return totalMana >= threshold[i]
        })
        if (availableTypes.length === 0) availableTypes = [TARGET_TYPES[0]]

        const type = availableTypes[Math.floor(Math.random() * availableTypes.length)]
        const healthScale = 1 + Math.floor(totalMana / 5000) * 0.3
        const id = ++idCounter.current

        setTargets((prev) => {
          if (prev.length >= 10) return prev
          return [
            ...prev,
            {
              id,
              type,
              x: 8 + Math.random() * 84,
              y: 8 + Math.random() * 84,
              health: Math.ceil(type.baseHealth * healthScale),
              maxHealth: Math.ceil(type.baseHealth * healthScale),
              spawnTime: Date.now(),
              duration: s.targetDuration,
            },
          ]
        })
      }
    }, 250)
    return () => clearInterval(interval)
  }, [])

  // Fade out expired targets
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setTargets((prev) =>
        prev.filter((t) => {
          const elapsed = (now - t.spawnTime) / 1000
          return elapsed < t.duration
        })
      )
    }, 200)
    return () => clearInterval(interval)
  }, [])

  // Start next round
  const startNextRound = useCallback(() => {
    setState((prev) => ({
      ...prev,
      round: prev.round + 1,
      roundStartTime: Date.now(),
      roundActive: true,
      roundMana: 0,
    }))
    setTargets([])
  }, [])

  // Keep a ref to targets so hitTarget can read them synchronously
  const targetsRef = useRef<ActiveTarget[]>([])
  targetsRef.current = targets

  const hitTarget = useCallback((targetId: number) => {
    const s = stateRef.current
    if (!s.roundActive) return { isCrit: false, damage: 0, killed: false, manaGain: 0 }

    const isCrit = Math.random() < s.critChance
    const baseDmg = s.damage
    const dmg = isCrit ? baseDmg * s.critMultiplier : baseDmg

    // Look up the target synchronously from the ref
    const target = targetsRef.current.find((t) => t.id === targetId)
    if (!target) return { isCrit: false, damage: dmg, killed: false, manaGain: 0 }

    const newHealth = target.health - dmg
    const killed = newHealth <= 0
    const manaGain = killed ? target.type.manaReward * s.manaMultiplier : 0

    // Update targets state
    setTargets((prev) =>
      killed
        ? prev.filter((t) => t.id !== targetId)
        : prev.map((t) => (t.id === targetId ? { ...t, health: newHealth } : t))
    )

    // Award mana on kill
    if (killed && manaGain > 0) {
      setState((prev) => ({
        ...prev,
        mana: prev.mana + manaGain,
        totalMana: prev.totalMana + manaGain,
        roundMana: prev.roundMana + manaGain,
      }))
    }

    return { isCrit, damage: dmg, killed, manaGain }
  }, [])

  const buyUpgrade = useCallback((upgradeId: string) => {
    setState((prev) => {
      const upgrade = UPGRADES.find((u) => u.id === upgradeId)
      if (!upgrade) return prev

      const currentLevel = prev.upgradeLevels[upgradeId] || 0
      if (currentLevel >= upgrade.maxLevel) return prev

      const cost = getUpgradeCost(upgrade, currentLevel)
      if (prev.mana < cost) return prev

      if (upgrade.requires) {
        for (const reqId of upgrade.requires) {
          if (!prev.upgradeLevels[reqId] || prev.upgradeLevels[reqId] <= 0) {
            return prev
          }
        }
      }

      const newState = {
        ...prev,
        mana: prev.mana - cost,
        upgradeLevels: {
          ...prev.upgradeLevels,
          [upgradeId]: currentLevel + 1,
        },
      }

      switch (upgrade.effect) {
        case "clickPower":
          newState.clickPower = prev.clickPower + upgrade.effectValue
          break
        case "autoMana":
          newState.autoMana = prev.autoMana + upgrade.effectValue
          break
        case "critChance":
          newState.critChance = Math.min(0.8, prev.critChance + upgrade.effectValue)
          break
        case "critMultiplier":
          newState.critMultiplier = prev.critMultiplier + upgrade.effectValue
          break
        case "manaMultiplier":
          newState.manaMultiplier = prev.manaMultiplier + upgrade.effectValue
          break
        case "autoClickSpeed":
          newState.autoClickSpeed = prev.autoClickSpeed + upgrade.effectValue
          break
        case "damage":
          newState.damage = prev.damage + upgrade.effectValue
          break
        case "targetSpawnRate":
          newState.targetSpawnRate = prev.targetSpawnRate + upgrade.effectValue
          break
        case "targetDuration":
          newState.targetDuration = prev.targetDuration + upgrade.effectValue
          break
        case "roundDuration":
          newState.roundDuration = prev.roundDuration + upgrade.effectValue
          break
      }

      return newState
    })
  }, [])

  const canAfford = useCallback(
    (upgradeId: string) => {
      const upgrade = UPGRADES.find((u) => u.id === upgradeId)
      if (!upgrade) return false
      const currentLevel = state.upgradeLevels[upgradeId] || 0
      if (currentLevel >= upgrade.maxLevel) return false
      const cost = getUpgradeCost(upgrade, currentLevel)
      return state.mana >= cost
    },
    [state.mana, state.upgradeLevels]
  )

  const isUnlocked = useCallback(
    (upgradeId: string) => {
      const upgrade = UPGRADES.find((u) => u.id === upgradeId)
      if (!upgrade) return false
      if (!upgrade.requires) return true
      return upgrade.requires.every(
        (reqId) => (state.upgradeLevels[reqId] || 0) > 0
      )
    },
    [state.upgradeLevels]
  )

  return {
    state,
    targets,
    roundTimeLeft,
    hitTarget,
    buyUpgrade,
    canAfford,
    isUnlocked,
    startNextRound,
  }
}
