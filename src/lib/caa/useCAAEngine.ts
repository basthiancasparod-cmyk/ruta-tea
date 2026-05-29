"use client"

import { useCallback, useRef, useState } from "react"
import type { CAACell, CAAAction } from "@/types/caa"
import { getDefaultActions } from "@/types/caa"

export interface NavEntry {
  boardId: string
  boardName: string
}

export interface EngineCallbacks {
  onNavigate: (boardId: string) => void
  onSearch?: () => void
  onVocabLevelChange?: (level: number) => void
  onCollectAdd: (cell: CAACell) => void
  onCollectClear: () => void
  onCollectRemoveWord: () => void
  onCollectRemoveChar: () => void
  onCollectSpeakAll: () => void
  onWordFormReset: () => void
  onWordFormCycle: (cellId: string) => void
  onWordFormAddTags: (tags: string[], toggle?: boolean) => void
  onWordFormChangeElements?: (tags: string[], toggle?: boolean) => void
  onWordFormChangeBar?: (tags: string[], toggle?: boolean) => void
  onWordFormChangeEverywhere?: (tags: string[], toggle?: boolean) => void
  onPredictionRefresh: () => void
  onFullscreen: (enter: boolean) => void
  onLanguageChange: (lang: string) => void
  onSpeak: (text: string, lang?: string) => void
}

export function useCAAEngine({
  homeboardId,
  onNavigate,
  onSearch,
  onVocabLevelChange,
  onCollectAdd,
  onCollectClear,
  onCollectRemoveWord,
  onCollectRemoveChar,
  onCollectSpeakAll,
  onWordFormReset,
  onWordFormCycle,
  onWordFormAddTags,
  onWordFormChangeElements,
  onWordFormChangeBar,
  onWordFormChangeEverywhere,
  onPredictionRefresh,
  onFullscreen,
  onLanguageChange,
  onSpeak,
}: EngineCallbacks & { homeboardId: string }) {
  const navStackRef = useRef<NavEntry[]>([])
  const [navHistory, setNavHistory] = useState<NavEntry[]>([])

  const syncHistory = () => setNavHistory([...navStackRef.current])

  const navigateTo = useCallback((targetId: string, currentId: string, currentName?: string) => {
    navStackRef.current.push({ boardId: currentId, boardName: currentName ?? "" })
    syncHistory()
    onNavigate(targetId)
  }, [onNavigate])

  const navigateBack = useCallback(() => {
    navStackRef.current.pop()
    syncHistory()
    const prev = navStackRef.current[navStackRef.current.length - 1]
    onNavigate(prev?.boardId ?? homeboardId)
  }, [onNavigate, homeboardId])

  const navigateHome = useCallback(() => {
    navStackRef.current = []
    syncHistory()
    onNavigate(homeboardId)
  }, [onNavigate, homeboardId])

  const canGoBack = () => navStackRef.current.length > 0

  const navigateToHistoryEntry = useCallback((index: number) => {
    const target = navStackRef.current[index]
    if (!target) return
    navStackRef.current = navStackRef.current.slice(0, index)
    syncHistory()
    onNavigate(target.boardId)
  }, [onNavigate])

  const executeAction = useCallback((
    action: CAAAction,
    cell: CAACell,
    currentBoardId: string,
    currentBoardName?: string,
  ) => {
    const { modelName } = action

    switch (modelName) {

      case "GridActionCollectElement": {
        const act = action.action
        if (act === "COLLECT_ACTION_CLEAR") {
          onCollectClear()
        } else if (act === "COLLECT_ACTION_REMOVE_WORD") {
          onCollectRemoveWord()
        } else if (act === "COLLECT_ACTION_REMOVE_CHAR") {
          onCollectRemoveChar()
        } else if (act === "COLLECT_ACTION_SPEAK" || act === "COLLECT_ACTION_SPEAK_CONTINUOUS") {
          onCollectSpeakAll()
        } else {
          onCollectAdd(cell)
        }
        break
      }

      case "GridActionSpeak":
        onSpeak(cell.vocalization ?? cell.label, action.speakLanguage)
        break

      case "GridActionSpeakCustom":
        if (action.speakText) onSpeak(action.speakText, action.speakLanguage)
        break

      case "GridActionNavigate": {
        switch (action.navType) {
          case "TO_GRID":
            if (action.toGridId) navigateTo(action.toGridId, currentBoardId, currentBoardName)
            break
          case "TO_LAST":
            navigateBack()
            break
          case "TO_HOME":
            navigateHome()
            break
          case "OPEN_SEARCH":
            onSearch?.()
            break
        }
        break
      }

      case "GridActionAudio":
        if (action.dataBase64) {
          new Audio(action.dataBase64).play().catch(() => {})
        }
        break

      case "GridActionOpenWebpage":
        if (action.openURL) {
          window.open(action.openURL, "_blank", "noopener")
        }
        break

      case "GridActionHTTP":
        if (action.restUrl) {
          fetch(action.restUrl, {
            method: action.method ?? "POST",
            headers: {
              "Content-Type": action.contentType ?? "text/plain",
              ...(action.acceptHeader ? { Accept: action.acceptHeader } : {}),
            },
            body: action.body || undefined,
            mode: action.noCorsMode ? "no-cors" : "cors",
            credentials: action.authUser ? "include" : "same-origin",
          }).catch(() => {})
        }
        break

      case "GridActionYoutube":
        if (action.data) {
          window.open(
            action.playType === "YT_PLAY_SEARCH"
              ? `https://www.youtube.com/results?search_query=${encodeURIComponent(action.data)}`
              : `https://www.youtube.com/watch?v=${action.data}`,
            "_blank", "noopener"
          )
        }
        break

      case "GridActionWebradio":
        if (action.radioId) {
          window.open(`https://radio-browser.info/handle/${action.radioId}`, "_blank", "noopener")
        }
        break

      case "GridActionPodcast":
        if (action.podcastGuid) {
          window.open(`https://podcastindex.org/podcast/${action.podcastGuid}`, "_blank", "noopener")
        }
        break

      case "GridActionChangeLang":
        if (action.language) {
          onLanguageChange(action.language)
        }
        break

      case "GridActionSystem":
        if (action.actionValue === 1) {
          onFullscreen(true)
        } else if (action.actionValue === 2) {
          onFullscreen(false)
        }
        break

      case "GridActionWordForm": {
        const mode = action.wordFormMode
        const tags = action.wordFormTags ?? []
        if (mode === "WORDFORM_MODE_RESET_FORMS") {
          onWordFormReset()
        } else if (mode === "WORDFORM_MODE_NEXT_FORM") {
          onWordFormCycle(cell.id)
        } else if (mode === "WORDFORM_MODE_CHANGE_ELEMENTS") {
          onWordFormChangeElements?.(tags, action.toggle ?? false)
        } else if (mode === "WORDFORM_MODE_CHANGE_BAR") {
          onWordFormChangeBar?.(tags, action.toggle ?? false)
        } else if (mode === "WORDFORM_MODE_CHANGE_EVERYWHERE") {
          onWordFormChangeEverywhere?.(tags, action.toggle ?? false)
        } else if (tags.length > 0) {
          onWordFormAddTags(tags, action.toggle ?? false)
        }
        break
      }

      case "GridActionPredict":
        onPredictionRefresh()
        break

      case "GridActionVocabLevelToggle": {
        const targetLevel = action.vocabularyLevel
        if (targetLevel !== undefined) {
          onVocabLevelChange?.(targetLevel)
        } else {
          onVocabLevelChange?.(1)
        }
        break
      }

      case "GridActionOpenHAB":
        if (action.restUrl) {
          fetch(action.restUrl, {
            method: action.method ?? "POST",
            headers: { "Content-Type": "text/plain" },
            body: action.body || undefined,
          }).catch(() => {})
        }
        break

      case "GridActionARE":
      case "GridActionUART":
      case "GridActionPredefined":
      case "GridActionMatrix":
        break
    }
  }, [
    onCollectAdd, onCollectClear, onCollectRemoveWord, onCollectRemoveChar, onCollectSpeakAll,
    onSpeak, onNavigate, navigateTo, navigateBack, navigateHome,
    onLanguageChange, onFullscreen, onWordFormReset, onWordFormCycle, onWordFormAddTags,
    onPredictionRefresh, onSearch, onVocabLevelChange,
  ])

  const handleCellPress = useCallback((cell: CAACell, currentBoardId: string, currentBoardName?: string) => {
    if (cell.hidden) return
    const actions = cell.actions?.length ? cell.actions : getDefaultActions(cell)
    for (const a of actions) {
      executeAction(a, cell, currentBoardId, currentBoardName)
    }
  }, [executeAction])

  return {
    handleCellPress,
    navigateTo,
    navigateBack,
    navigateHome,
    navigateToHistoryEntry,
    canGoBack,
    navHistory,
  }
}
