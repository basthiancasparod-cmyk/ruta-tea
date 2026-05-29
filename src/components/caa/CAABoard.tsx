"use client"

import { useState, useCallback, useEffect } from "react"
import { CAACellComponent } from "./CAACell"
import { CAASentenceStrip } from "./CAASentenceStrip"
import { FITZGERALD_COLORS, getDefaultActions } from "@/types/caa"
import type { CAACell, MessageToken, FitzgeraldKey, CAABoardSettings, CAAAction } from "@/types/caa"
import { useCAABoardMutations } from "@/lib/hooks/useCAA"
import { speakText as svcSpeak, stopSpeaking as svcStop, SPEAK_EV } from "@/lib/caa/speechService"
import { resolveCellColors } from "@/types/colors"

function speak(text: string, cfg: CAABoardSettings = {}) {
  svcSpeak(text, { voice: cfg.preferredVoice, rate: cfg.voiceRate, pitch: cfg.voicePitch })
}

function stopSpeak() {
  svcStop()
}

interface Props {
  boardId: string
  childId?: string
  cells: CAACell[]
  columns: number
  rows: number
  settings?: CAABoardSettings
  isEditing?: boolean
  onNavigate?: (boardId: string) => void
}

export function CAABoard({
  boardId,
  childId,
  cells,
  columns,
  rows,
  settings = {},
  isEditing,
  onNavigate,
}: Props) {
  const [tokens, setTokens] = useState<MessageToken[]>([])
  const [speaking, setSpeaking] = useState(false)
  const { logUsage } = useCAABoardMutations()

  useEffect(() => {
    const h = (e: Event) => setSpeaking((e as CustomEvent<boolean>).detail)
    window.addEventListener(SPEAK_EV, h)
    return () => window.removeEventListener(SPEAK_EV, h)
  }, [])

  // Build grid
  const grid: (CAACell | null)[][] = Array.from(
    { length: rows },
    () => Array(columns).fill(null)
  )
  cells.forEach((c) => {
    if (c.position_row < rows && c.position_col < columns) {
      grid[c.position_row][c.position_col] = c
    }
  })

  const handleCell = useCallback(
    (cell: CAACell) => {
      if (isEditing) return
      if (childId) {
        logUsage({
          child_id: childId,
          board_id: boardId,
          cell_id: cell.id,
          timestamp: new Date().toISOString(),
        })
      }

      const actions = cell.actions ?? getDefaultActions(cell)
      for (const a of actions) {
        switch (a.modelName) {
          case "GridActionCollectElement":
            setTokens((p) => [...p, {
              id: cell.id, label: cell.label, vocalization: cell.vocalization,
              fitzgerald_key: cell.fitzgerald_key,
              color: resolveCellColors(cell, settings).border,
            }])
            if (settings.autoSpeak) speak(cell.vocalization ?? cell.label, settings)
            break
          case "GridActionSpeak":
          case "GridActionSpeakCustom":
            speak(a.speakText ?? cell.vocalization ?? cell.label, settings)
            break
          case "GridActionNavigate":
            if (a.navType === "TO_LAST") onNavigate?.("__back__")
            else if (a.navType === "TO_HOME") onNavigate?.("__home__")
            else if (a.toGridId) onNavigate?.(a.toGridId)
            break
          case "GridActionAudio":
            if (a.dataBase64) {
              const audio = new Audio(a.dataBase64)
              audio.play().catch(() => {})
            }
            break
          case "GridActionOpenWebpage":
            if (a.openURL) window.open(a.openURL, "_blank", "noopener")
            break
          case "GridActionYoutube":
            if (a.data) {
              window.open(
                a.playType === "YT_PLAY_SEARCH"
                  ? `https://www.youtube.com/results?search_query=${encodeURIComponent(a.data)}`
                  : `https://www.youtube.com/watch?v=${a.data}`,
                "_blank", "noopener"
              )
            }
            break
          case "GridActionHTTP":
            if (a.restUrl) {
              fetch(a.restUrl, { method: a.method ?? "POST", headers: { "Content-Type": a.contentType ?? "text/plain" }, body: a.body }).catch(() => {})
            }
            break
          case "GridActionChangeLang":
            if (a.language) {
              document.cookie = `NEXT_LOCALE=${a.language};path=/;max-age=31536000`
              window.location.reload()
            }
            break
          case "GridActionSystem":
            if (a.action === "SYS_ENTER_FULLSCREEN") document.documentElement.requestFullscreen?.()
            else if (a.action === "SYS_LEAVE_FULLSCREEN") document.exitFullscreen?.()
            break
          case "GridActionWordForm":
          case "GridActionVocabLevelToggle":
          case "GridActionPredict":
          case "GridActionPredefined":
          case "GridActionWebradio":
          case "GridActionPodcast":
            break
        }
      }
    },
    [isEditing, childId, boardId, settings, onNavigate, logUsage]
  )

  const speakAll = useCallback(() => {
    if (!tokens.length) return
    const txt = tokens.map((t) => t.vocalization ?? t.label).join(" ")
    speak(txt, settings)
    if (childId) {
      logUsage({
        child_id: childId,
        board_id: boardId,
        message_text: txt,
        timestamp: new Date().toISOString(),
      })
    }
  }, [tokens, settings, childId, boardId, logUsage])

  const cs = settings.cellSize ?? "md"
  const labels = settings.showLabels ?? true

  const EMPTY_DIM: Record<string, string> = {
    sm: "w-[88px] h-[88px]",
    md: "w-[108px] h-[108px]",
    lg: "w-[132px] h-[132px]",
    xl: "w-[156px] h-[156px]",
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Sentence strip */}
      <CAASentenceStrip
        tokens={tokens}
        onRemove={(i) => setTokens((p) => p.filter((_, idx) => idx !== i))}
        onClear={() => setTokens([])}
        onSpeak={speakAll}
        isSpeaking={speaking}
        onStop={stopSpeak}
      />

      {/* Fitzgerald legend */}
      <div className="flex flex-wrap gap-1.5">
        {(Object.entries(FITZGERALD_COLORS) as [FitzgeraldKey, typeof FITZGERALD_COLORS[FitzgeraldKey]][]).map(
          ([k, v]) => (
            <span
              key={k}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
              style={{ backgroundColor: v.bg, borderColor: v.hex, color: v.text }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: v.hex }} />
              {v.label}
            </span>
          )
        )}
      </div>

      {/* Grid */}
      <div className="overflow-x-auto pb-2">
        <div
          className="grid gap-2 w-fit mx-auto"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {grid.map((row, ri) =>
            row.map((cell, ci) =>
              cell ? (
                <CAACellComponent
                  key={cell.id}
                  cell={cell}
                  size={cs}
                  showLabels={labels}
                  onClick={handleCell}
                  isEditing={isEditing}
                />
              ) : (
                <div
                  key={`e-${ri}-${ci}`}
                  className={`rounded-2xl border-2 border-dashed border-border bg-surface-secondary/30 ${EMPTY_DIM[cs]}`}
                />
              )
            )
          )}
        </div>
      </div>
    </div>
  )
}