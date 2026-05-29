"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { predictionService } from "./predictionService"
import type { CollectToken } from "./collectBar"

export interface Suggestion {
  word: string
  score: number
}

export function usePrediction(
  tokens: CollectToken[],
  active = true,
  boardVocab?: string[],
) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const prevLenRef = useRef(-1)
  const prevVocabRef = useRef<string[] | undefined>(undefined)

  const refresh = useCallback(() => {
    if (!active) {
      setSuggestions([])
      return
    }

    if (boardVocab && boardVocab !== prevVocabRef.current) {
      predictionService.loadBoardVocab(boardVocab)
      prevVocabRef.current = boardVocab
    }

    const text = tokens.map(t => t.vocalization ?? t.label).join(" ").trim()
    if (!text) {
      setSuggestions(predictionService.getNextWords("", 4).map(r => ({
        word: r.word,
        score: r.score,
      })))
      return
    }
    const results = predictionService.getNextWords(text, 4)
    setSuggestions(results.map(r => ({ word: r.word, score: r.score })))
  }, [tokens, active, boardVocab])

  useEffect(() => {
    if (tokens.length !== prevLenRef.current || boardVocab !== prevVocabRef.current) {
      prevLenRef.current = tokens.length
      refresh()
    }
  }, [tokens, boardVocab, refresh])

  const learn = useCallback((word: string) => {
    predictionService.learn(word)
  }, [])

  const apply = useCallback(
    (suggestion: string) => {
      learn(suggestion)
      refresh()
      return suggestion
    },
    [learn, refresh]
  )

  return { suggestions, refresh, learn, apply }
}
