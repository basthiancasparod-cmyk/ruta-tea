"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { FITZGERALD_COLORS } from "@/types/caa"
import type { CAACell, FitzgeraldKey, CollectMode, CAAAction, WordForm } from "@/types/caa"
import {
  speakText as svcSpeakText,
  stopSpeaking as svcStopSpeaking,
  SPEAK_EV,
} from "./speechService"
import type { SpeakOptions } from "./speechService"

export interface CollectToken {
  id: string
  label: string
  vocalization?: string
  fitzgerald_key?: FitzgeraldKey
  color: string
  onlyText?: boolean
  pictogram_keyword?: string
  imageUrl?: string
  toggleInBar?: boolean
  pronunciation?: string
  wordForms?: WordForm[]
  sourceLabel?: string
  sourceVocalization?: string
}

const NOT_IGNORED_ACTIONS = new Set([
  "GridActionCollectElement", "GridActionSpeak", "GridActionSpeakCustom",
  "GridActionNavigate", "GridActionAudio", "GridActionWordForm",
])

function getColor(cell: { fitzgerald_key?: string; border_color: string }): string {
  return cell.fitzgerald_key
    ? FITZGERALD_COLORS[cell.fitzgerald_key as FitzgeraldKey]?.hex ?? cell.border_color
    : cell.border_color
}

function hasNonIgnoredAction(actions: CAAAction[]): boolean {
  return actions.some(a => NOT_IGNORED_ACTIONS.has(a.modelName))
}

/** speak text using the shared speech service (backward-compat signature) */
export function speakText(text: string, rateOrOptions?: number | SpeakOptions): void {
  svcSpeakText(text, rateOrOptions)
}

/** stop speaking via the shared speech service */
export function stopSpeaking(): void {
  svcStopSpeaking()
}

/**
 * Detect if a set of cells represents a keyboard grid
 * (most cells contain single characters)
 */
export function isKeyboardGrid(cells: CAACell[]): boolean {
  if (cells.length === 0) return false
  const singleChar = cells.filter(c => c.label.length === 1).length
  return singleChar / cells.length > 0.4
}

/**
 * Determine the effective collect mode for a set of tokens.
 * AUTO = show images if any token has an image, otherwise show text
 */
export function effectiveCollectMode(
  mode: CollectMode,
  tokens: CollectToken[]
): "text" | "separated" {
  if (mode === "text") return "text"
  if (mode === "separated") return "separated"
  // auto
  return tokens.some(t => t.pictogram_keyword || t.imageUrl) ? "separated" : "text"
}

export function useCollectBar() {
  const [tokens, setTokens] = useState<CollectToken[]>([])
  const [speaking, setSpeaking] = useState(false)
  const [keyboardMode, setKeyboardMode] = useState(false)
  const [collectMode, setCollectMode] = useState<CollectMode>("auto")
  const [autoSpeak, setAutoSpeak] = useState(false)
  const [collectConvertToLowercase, setCollectConvertToLowercase] = useState(false)
  const tokensRef = useRef(tokens)
  const collectConvertToLowercaseRef = useRef(collectConvertToLowercase)
  tokensRef.current = tokens
  collectConvertToLowercaseRef.current = collectConvertToLowercase

  useEffect(() => {
    const h = (e: Event) => setSpeaking((e as CustomEvent).detail === true)
    window.addEventListener(SPEAK_EV, h)
    return () => window.removeEventListener(SPEAK_EV, h)
  }, [])

  const initFromGrid = useCallback((cells: CAACell[], settings?: {
    collectMode?: CollectMode; collectConvertToLowercase?: boolean; autoSpeak?: boolean
  }) => {
    if (settings?.collectMode) setCollectMode(settings.collectMode)
    if (settings?.collectConvertToLowercase !== undefined) setCollectConvertToLowercase(settings.collectConvertToLowercase)
    if (settings?.autoSpeak !== undefined) setAutoSpeak(settings.autoSpeak)
    setKeyboardMode(isKeyboardGrid(cells))
  }, [])

  /**
   * Attempt to add a cell to the strip. Returns false if the cell should
   * NOT be collected (dontCollect, toggleInBar removal, filtering rules).
   */
  const addCell = useCallback((cell: {
    id: string; label: string; vocalization?: string;
    pronunciation?: string | Record<string, string>;
    fitzgerald_key?: string; border_color: string; background_color?: string;
    pictogram_keyword?: string; custom_image_url?: string;
    dontCollect?: boolean; toggleInBar?: boolean; actions?: CAAAction[];
    wordForms?: WordForm[];
  }): boolean => {
    // dontCollect → skip
    if (cell.dontCollect) return false

    // Filtering rules: if cell has ONLY ignored actions, don't collect
    const cellActions = cell.actions ?? []
    if (cellActions.length > 0 && !hasNonIgnoredAction(cellActions)) return false

    // Navigate rule: if cell has Navigate action and label is not single
    // char and addToCollectElem is not set, skip
    const navAction = cellActions.find(a => a.modelName === "GridActionNavigate")
    if (navAction && cell.label.length !== 1 && !navAction.addToCollectElem) return false

    // toggleInBar: if same-id as last token, remove instead
    if (cell.toggleInBar) {
      const last = tokensRef.current[tokensRef.current.length - 1]
      if (last && last.id === cell.id) {
        setTokens(prev => prev.slice(0, -1))
        return false
      }
    }

    if (keyboardMode) {
      setTokens(prev => {
        const last = prev[prev.length - 1]
        const label = cell.label.toLowerCase()
        if (last?.onlyText) {
          const copy = [...prev]
          copy[copy.length - 1] = {
            ...last,
            label: last.label + label,
            vocalization: last.vocalization + (cell.vocalization ?? label),
          }
          return copy
        }
          return [...prev, {
          id: cell.id, label, vocalization: cell.vocalization,
          color: getColor(cell), onlyText: true,
          pronunciation: typeof cell.pronunciation === "string" ? cell.pronunciation : undefined,
        }]
      })
    } else {
      const lower = collectConvertToLowercaseRef.current
      setTokens(prev => [...prev, {
        id: cell.id, label: lower ? cell.label.toLowerCase() : cell.label,
        vocalization: lower ? cell.vocalization?.toLowerCase() : cell.vocalization,
        fitzgerald_key: cell.fitzgerald_key as FitzgeraldKey,
        color: getColor(cell), pictogram_keyword: cell.pictogram_keyword,
        imageUrl: cell.custom_image_url, toggleInBar: cell.toggleInBar,
        pronunciation: typeof cell.pronunciation === "string" ? cell.pronunciation : undefined,
        wordForms: cell.wordForms,
        sourceLabel: cell.label,
        sourceVocalization: cell.vocalization,
      }])
    }
    if (autoSpeak) {
      const newText = cell.vocalization ?? (typeof cell.pronunciation === "string" ? cell.pronunciation : undefined) ?? cell.label
      const existingText = tokensRef.current.map(t => t.vocalization ?? t.pronunciation ?? t.label).join(" ")
      const fullText = existingText + (existingText ? " " : "") + newText
      if (fullText.trim()) speakText(fullText)
    }
    return true
  }, [keyboardMode, autoSpeak])

  const removeWord = useCallback(() => {
    setTokens(prev => {
      if (prev.length === 0) return prev
      const last = prev[prev.length - 1]
      if (last?.onlyText && last.label.trim().includes(" ")) {
        const parts = last.label.trim().split(" ")
        parts.pop()
        const copy = [...prev]
        copy[copy.length - 1] = { ...last, label: parts.join(" ") + " " }
        return copy
      }
      return prev.slice(0, -1)
    })
  }, [])

  const removeChar = useCallback(() => {
    setTokens(prev => {
      if (prev.length === 0) return prev
      const last = prev[prev.length - 1]
      if (last?.onlyText && last.label.length > 1) {
        const copy = [...prev]
        copy[copy.length - 1] = { ...last, label: last.label.slice(0, -1) }
        return copy
      }
      return prev.slice(0, -1)
    })
  }, [])

  const clear = useCallback(() => setTokens([]), [])
  const removeAt = useCallback((i: number) => setTokens(prev => prev.filter((_, idx) => idx !== i)), [])

  const speakAll = useCallback((options?: SpeakOptions) => {
    const cur = tokensRef.current
    if (!cur.length) return
    const txt = cur.map(t => t.vocalization ?? t.pronunciation ?? t.label).join(" ")
    speakText(txt, options)
  }, [])

  const stop = useCallback(() => stopSpeaking(), [])

  const collectText = useCallback(() => {
    return tokensRef.current.map(t => t.vocalization ?? t.pronunciation ?? t.label).join(" ").trim()
  }, [])

  const reapplyWordForms = useCallback((resolve: (label: string, vocalization: string | undefined, wordForms: WordForm[] | undefined) => string) => {
    setTokens(prev => prev.map(t => {
      if (!t.wordForms?.length) return t
      const newLabel = resolve(t.sourceLabel ?? t.label, t.sourceVocalization ?? t.vocalization, t.wordForms)
      return { ...t, label: newLabel, vocalization: newLabel }
    }))
  }, [])

  return {
    tokens, setTokens, speaking, keyboardMode, setKeyboardMode,
    collectMode, setCollectMode, autoSpeak, setAutoSpeak,
    collectConvertToLowercase, setCollectConvertToLowercase, initFromGrid,
    addCell, removeWord, removeChar, clear, removeAt,
    reapplyWordForms,
    speakAll, stop, collectText,
  }
}
