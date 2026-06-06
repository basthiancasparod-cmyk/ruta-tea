'use client'

import { useState, useEffect, useCallback } from 'react'

export interface GameStats {
  played: number
  bestScore: number
  totalCorrect: number
  totalQuestions: number
}

const STATS_PREFIX = 'emo-stats-'

export function useGameStats(gameId: string) {
  const key = STATS_PREFIX + gameId
  const [stats, setStats] = useState<GameStats>({ played: 0, bestScore: 0, totalCorrect: 0, totalQuestions: 0 })

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored) setStats(JSON.parse(stored))
    } catch { /* empty */ }
  }, [key])

  const persist = useCallback((score: number, total: number) => {
    setStats(prev => {
      const newStats: GameStats = {
        played: prev.played + 1,
        bestScore: Math.max(prev.bestScore, score),
        totalCorrect: prev.totalCorrect + score,
        totalQuestions: prev.totalQuestions + total,
      }
      localStorage.setItem(key, JSON.stringify(newStats))
      return newStats
    })
  }, [key])

  return { stats, persist, setStats }
}
