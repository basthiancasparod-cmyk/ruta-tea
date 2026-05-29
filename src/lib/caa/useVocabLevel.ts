"use client"

import { useState, useMemo, useCallback } from "react"
import type { CAACell } from "@/types/caa"

export interface UseVocabLevelReturn {
  currentLevel: number
  maxLevel: number
  isFilterActive: boolean
  setLevel: (level: number) => void
  cycleLevel: () => void
  resetLevel: () => void
  isCellVisible: (cell: CAACell) => boolean
  filterCells: (cells: CAACell[]) => CAACell[]
}

export function useVocabLevel(allCells: CAACell[]): UseVocabLevelReturn {
  const [currentLevel, setCurrentLevel] = useState(0)

  const maxLevel = useMemo(() => {
    let max = 0
    for (const cell of allCells) {
      const vl = cell.vocabulary_level
      if (vl !== undefined && vl !== null && vl > max && vl !== -1) {
        max = vl
      }
    }
    return max
  }, [allCells])

  const isFilterActive = currentLevel > 0

  const setLevel = useCallback((level: number) => {
    setCurrentLevel(Math.max(0, Math.min(level, maxLevel)))
  }, [maxLevel])

  const cycleLevel = useCallback(() => {
    setCurrentLevel(prev => {
      if (prev >= maxLevel) return 0
      return prev + 1
    })
  }, [maxLevel])

  const resetLevel = useCallback(() => {
    setCurrentLevel(0)
  }, [])

  const isCellVisible = useCallback((cell: CAACell): boolean => {
    if (currentLevel === 0) return true
    const vl = cell.vocabulary_level
    if (vl === undefined || vl === null || vl === -1) return true
    return vl <= currentLevel
  }, [currentLevel])

  const filterCells = useCallback((cells: CAACell[]): CAACell[] => {
    if (currentLevel === 0) return cells
    return cells.filter(isCellVisible)
  }, [currentLevel, isCellVisible])

  return {
    currentLevel,
    maxLevel,
    isFilterActive,
    setLevel,
    cycleLevel,
    resetLevel,
    isCellVisible,
    filterCells,
  }
}
