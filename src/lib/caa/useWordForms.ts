"use client"

import { useState, useCallback } from "react"
import type { CAACell, WordForm } from "@/types/caa"

export type WordFormMode =
  | "WORDFORM_MODE_CHANGE_ELEMENTS"
  | "WORDFORM_MODE_CHANGE_BAR"
  | "WORDFORM_MODE_CHANGE_EVERYWHERE"
  | "WORDFORM_MODE_NEXT_FORM"
  | "WORDFORM_MODE_RESET_FORMS"

const WORDFORM_TAGS = [
  "BASE", "NEGATION", "SINGULAR", "PLURAL",
  "1.PERS", "2.PERS", "3.PERS",
  "1.CASE", "2.CASE", "3.CASE", "4.CASE", "5.CASE", "6.CASE",
  "FEMININE", "MASCULINE", "NEUTRAL",
  "COMPARATIVE", "SUPERLATIVE",
  "PRESENT", "PAST", "FUTURE",
  "INDEFINITE", "DEFINITE",
] as const

export interface UseWordFormsReturn {
  currentTags: string[]
  addTags: (tags: string[], toggle?: boolean) => void
  resetForms: () => void
  resetTags: () => void
  resolveDisplayText: (cell: CAACell) => string
  getPreferredWordForm: (wordForms: WordForm[]) => WordForm | null
  nextForm: (cell: CAACell) => WordForm | null
  cycleNext: (cellId: string) => void
  formIds: Record<string, number>
}

export function useWordForms(): UseWordFormsReturn {
  const [currentTags, setCurrentTags] = useState<string[]>([])
  const [formIds, setFormIds] = useState<Record<string, number>>({})

  const addTags = useCallback((tags: string[], toggle = false) => {
    setCurrentTags(prev => {
      if (toggle) {
        const set = new Set(prev)
        for (const tag of tags) {
          if (set.has(tag)) set.delete(tag)
          else set.add(tag)
        }
        return Array.from(set)
      }
      // Merge: add new tags, keeping existing ones
      const merged = new Set([...prev, ...tags])
      return Array.from(merged)
    })
  }, [])

  const resetForms = useCallback(() => {
    setCurrentTags([])
    setFormIds({})
  }, [])

  const resetTags = useCallback(() => {
    setCurrentTags([])
  }, [])

  const getPreferredWordForm = useCallback(
    (wordForms: WordForm[]): WordForm | null => {
      if (!wordForms || wordForms.length === 0) return null
      if (currentTags.length === 0) return null
      if (wordForms.length === 1) return wordForms[0]

      // Find best match: try matching all tags, then progressively fewer
      for (let len = currentTags.length; len >= 1; len--) {
        const attempt = currentTags.slice(0, len)
        const match = wordForms.find(wf => {
          const wfTags = wf.tags ?? []
          return attempt.every(t => wfTags.includes(t))
        })
        if (match) return match
      }
      // If no tag match, try "BASE" tagged form
      return wordForms.find(wf => (wf.tags ?? []).includes("BASE")) ?? null
    },
    [currentTags]
  )

  const resolveDisplayText = useCallback(
    (cell: CAACell): string => {
      if (!cell.wordForms || cell.wordForms.length === 0) return cell.label
      // Check cycle-based form selection first
      const fid = formIds[cell.id]
      if (fid !== undefined) {
        const wf = cell.wordForms[fid % cell.wordForms.length]
        if (wf?.value) return wf.value
      }
      // Fall back to tag-based matching
      const preferred = getPreferredWordForm(cell.wordForms)
      return preferred?.value ?? cell.label
    },
    [getPreferredWordForm, formIds]
  )

  const nextForm = useCallback(
    (cell: CAACell): WordForm | null => {
      if (!cell.wordForms || cell.wordForms.length === 0) return null
      const currentId = formIds[cell.id] ?? -1
      const nextId = (currentId + 1) % cell.wordForms.length
      setFormIds(prev => ({ ...prev, [cell.id]: nextId }))
      return cell.wordForms[nextId]
    },
    [formIds]
  )

  const cycleNext = useCallback(
    (cellId: string) => {
      // Just advance the form ID counter (no access to cell here,
      // so this just increments; caller must resolve)
      setFormIds(prev => ({
        ...prev,
        [cellId]: (prev[cellId] ?? -1) + 1,
      }))
    },
    []
  )

  return {
    currentTags,
    addTags,
    resetForms,
    resetTags,
    resolveDisplayText,
    getPreferredWordForm,
    nextForm,
    cycleNext,
    formIds,
  }
}
