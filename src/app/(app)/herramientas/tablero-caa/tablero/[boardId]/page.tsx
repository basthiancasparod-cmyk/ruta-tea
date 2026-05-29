"use client"

import { use, useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { Pictogram } from "@/components/ui/Pictogram"
import { playSound, vibrate } from "@/lib/sounds"
import { useCAABoard, useCAABoardMutations } from "@/lib/hooks/useCAA"
import { useChildren } from "@/lib/hooks/useData"
import { FITZGERALD_COLORS } from "@/types/caa"
import { Lumi } from "@/components/lumi/Lumi"
import { getDefaultActions, type CAACell, type CAABoardSettings, type FitzgeraldKey } from "@/types/caa"
import { useCollectBar, speakText } from "@/lib/caa/collectBar"
import type { SpeakOptions } from "@/lib/caa/speechService"
import { resolveCellColors } from "@/types/colors"
import { useScanner } from "@/lib/caa/useScanner"
import { useGlobalGrid } from "@/lib/caa/useGlobalGrid"
import { CAAGlobalBar } from "@/components/caa/CAAGlobalBar"
import { useWordForms } from "@/lib/caa/useWordForms"
import { useVocabLevel } from "@/lib/caa/useVocabLevel"
import { useBoardGridSet } from "@/lib/hooks/useGridSets"
import { useCAAEngine } from "@/lib/caa/useCAAEngine"
import { CAASearchOverlay } from "@/components/caa/CAASearchOverlay"
import { CAASpeechSettings } from "@/components/caa/CAASpeechSettings"
import { CAAScanSettings } from "@/components/caa/CAAScanSettings"
import { CAAColorSettings } from "@/components/caa/CAAColorSettings"
import { CAAHistoryPanel } from "@/components/caa/CAAHistoryPanel"
import { useCAAUsageHistory } from "@/lib/hooks/useCAA"
import CAAStrip from "@/components/caa/CAAStrip"

const GAP = 6

function Cell({ cell, px, onTap, highlight, scanFocus, scanInactive, gridCol, gridRow, boardSettings, displayLabel }: {
  cell: CAACell; px: number; onTap: (c: CAACell) => void; highlight?: boolean; scanFocus?: boolean; scanInactive?: boolean; gridCol?: string; gridRow?: string; boardSettings?: CAABoardSettings; displayLabel?: string
}) {
  const cr = resolveCellColors(cell, boardSettings)
  const pic = Math.round(px * 0.54)
  const fs  = Math.max(9, Math.round(px * 0.112))
  return (
    <motion.button
      layout
      whileTap={{ scale: 0.88 }}
      onClick={() => { playSound("click"); vibrate("click"); onTap(cell) }}
      className={`relative flex flex-col items-center justify-between rounded-2xl border-[3px] select-none overflow-hidden transition-all
        ${scanInactive ? "opacity-40 grayscale" : ""}
        ${scanFocus ? "ring-[6px] ring-red-500/60 ring-offset-2 z-10" : ""}`}
      style={{
        gridColumn: gridCol, gridRow: gridRow,
        backgroundColor: cr.bg,
        borderColor: cr.border,
        boxShadow: highlight ? `0 0 0 3px ${cr.border}80, 0 0 16px ${cr.border}40` : undefined,
        padding: `${Math.max(4, Math.round(px * 0.05))}px`,
      }}
      aria-label={cell.label}
    >
      {cell.fitzgerald_key && (
        <span className="absolute top-1 left-1 w-2 h-2 rounded-full opacity-70"
          style={{ backgroundColor: cr.border }} />
      )}
      {(boardSettings?.highlightOnPress !== false) && highlight && (
        <motion.span initial={{ opacity: 0.5 }} animate={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ backgroundColor: `${cr.border}20` }} />
      )}
      {scanFocus && (
        <motion.span
          animate={{ opacity: [0.4, 0.15, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ backgroundColor: cr.border, boxShadow: `inset 0 0 20px ${cr.border}60` }} />
      )}
      <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
        <Pictogram keyword={cell.pictogram_keyword ?? ""} size={pic} />
      </div>
      {(boardSettings?.showLabels ?? true) && (
        <span
          className="font-extrabold text-center leading-tight line-clamp-1 w-full"
          style={{ fontSize: fs, color: cr.text }}
        >
          {displayLabel ?? cell.label}
        </span>
      )}
    </motion.button>
  )
}

export default function TableroPage({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = use(params)
  const router = useRouter()
  const { board, cells, loading } = useCAABoard(boardId)
  const { gridSet: boardGridSet } = useBoardGridSet(boardId)
  const { children } = useChildren()
  const childId = children[0]?.id
  const { updateBoard, logUsage } = useCAABoardMutations()

  const [showLeg, setShowLeg] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [cellPx, setCellPx] = useState(88)
  const [tappedId, setTappedId] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState("")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [boardSettings, setBoardSettings] = useState<CAABoardSettings>(() => ({}))
  const [settingsInit, setSettingsInit] = useState(false)
  const topbarRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const globalBarRef = useRef<HTMLDivElement>(null)
  const kbInputRef = useRef<HTMLInputElement>(null)

  // Sync board settings from DB once
  useEffect(() => {
    if (board?.settings && !settingsInit) {
      setBoardSettings(board.settings)
      setSettingsInit(true)
    }
  }, [board?.settings, settingsInit])

  // Persist settings to DB
  const updateSettings = useCallback((updates: Record<string, unknown>) => {
    setBoardSettings(s => {
      const next = { ...s, ...updates }
      updateBoard(boardId, { settings: next }).catch(() => {})
      return next
    })
  }, [boardId, updateBoard])

  // ── Global Grid ────────────────────────────────────────────
  const globalGridActive = boardSettings.globalGridActive ?? false
  const { globalCells, loading: globalLoading } = useGlobalGrid({ enabled: globalGridActive })

  // ── Lock state ──────────────────────────────────────────────
  const [isLocked, setIsLocked] = useState(board?.locked ?? false)
  const [unlockCounter, setUnlockCounter] = useState(5)
  const unlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (board) setIsLocked(board.locked ?? false)
  }, [board?.locked])

  const handleLockToggle = useCallback(() => {
    if (!isLocked) {
      setIsLocked(true)
      updateBoard(boardId, { locked: true }).catch(() => {})
    } else {
      const next = unlockCounter - 1
      setUnlockCounter(next)
      playSound("click")
      if (next <= 0) {
        setIsLocked(false)
        setUnlockCounter(5)
        updateBoard(boardId, { locked: false }).catch(() => {})
        if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current)
      } else {
        if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current)
        unlockTimerRef.current = setTimeout(() => setUnlockCounter(5), 3000)
      }
    }
  }, [isLocked, unlockCounter, boardId, updateBoard])

  const cols = board?.columns ?? 6
  const rows = board?.rows ?? 6

  // Filter out hidden cells
  const visibleCells = cells.filter(c => !c.hidden)
  const vl = useVocabLevel(visibleCells)
  const displayCells = vl.filterCells(visibleCells)

  // ── Scanning ───────────────────────────────────────────────
  const handleTapRef = useRef<(cell: CAACell) => void>(undefined)
  const { isScanning, phase, isActive, start: startScan, stop: stopScan } = useScanner(
    displayCells,
    {
      enabled: boardSettings.scanEnabled ?? false,
      autoScan: boardSettings.scanAuto ?? false,
      timeoutMs: boardSettings.scanTimeoutMs ?? 1000,
      timeoutFirstElementFactor: boardSettings.scanTimeoutFirstElementFactor,
      vertical: boardSettings.scanVertical,
      binary: boardSettings.scanBinary,
      dualSwitch: boardSettings.scanDualSwitch,
      startWithAction: boardSettings.scanStartWithAction,
      roundsUntilBack: boardSettings.scanRoundsUntilBack ?? 3,
      beepFeedback: boardSettings.scanBeepFeedback,
      readActive: boardSettings.scanReadActive,
      readActiveRate: boardSettings.scanReadActiveRate,
    },
    (cell) => handleTapRef.current?.(cell)
  )

  const voiceOpts = (): SpeakOptions => ({
    voice: boardSettings.preferredVoice,
    rate: boardSettings.voiceRate,
    pitch: boardSettings.voicePitch,
  })

  const {
    tokens, speaking, keyboardMode, collectMode, autoSpeak,
    addCell, removeWord, removeChar, clear, removeAt, speakAll, stop, initFromGrid,
    setAutoSpeak, setCollectMode, setKeyboardMode, reapplyWordForms,
  } = useCollectBar()

  // Init from grid when cells load
  useEffect(() => {
    if (cells.length) initFromGrid(cells, board?.settings)
  }, [cells, board?.settings, initFromGrid])

  // ── Word Forms ──────────────────────────────────────────────
  const wf = useWordForms()

  // ── History ────────────────────────────────────────────────
  const { history, loading: historyLoading } = useCAAUsageHistory(childId)

  // ── Keyboard input handling ────────────────────────────────
  const handleKbKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      speakAll()
      setInputValue("")
    } else if (e.key === "Backspace" && !inputValue) {
      removeWord()
    }
  }, [inputValue, speakAll, removeWord])

  // Auto-focus keyboard input when mode activated
  useEffect(() => {
    if (keyboardMode) {
      setTimeout(() => kbInputRef.current?.focus(), 100)
    }
  }, [keyboardMode])

  // ── Sync fullscreen state ───────────────────────────────────
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", handler)
    return () => document.removeEventListener("fullscreenchange", handler)
  }, [])

  useEffect(() => {
    if (!tappedId) return
    const t = setTimeout(() => setTappedId(null), 300)
    return () => clearTimeout(t)
  }, [tappedId])

  useEffect(() => {
    const calc = () => {
      requestAnimationFrame(() => {
        if (!gridRef.current || !topbarRef.current || !stripRef.current) return
        const topH = topbarRef.current.offsetHeight
        const stripH = stripRef.current.offsetHeight
        const globalH = globalBarRef.current?.offsetHeight ?? 0
        const availW = gridRef.current.clientWidth - 24
        const availH = window.innerHeight - topH - stripH - globalH - 24
        const byW = Math.floor((availW - (cols - 1) * GAP) / cols)
        const byH = Math.floor((availH - (rows - 1) * GAP) / rows)
        setCellPx(Math.max(Math.min(byW, byH), 52))
      })
    }
    calc()
    const ro = new ResizeObserver(calc)
    if (gridRef.current) ro.observe(gridRef.current)
    return () => ro.disconnect()
  }, [cols, rows, showLeg, globalGridActive, globalCells.length])

  // Compute occupied positions for filler elements (skip hidden)
  const occupied = new Set(visibleCells.map(c => `${c.position_row},${c.position_col}`))
  for (const c of visibleCells) {
    const cw = c.width ?? 1; const ch = c.height ?? 1
    const cx = c.x ?? c.position_col; const cy = c.y ?? c.position_row
    for (let dy = 0; dy < ch; dy++)
      for (let dx = 0; dx < cw; dx++)
        occupied.add(`${cy + dy},${cx + dx}`)
  }
  const fillerPositions: { r: number; c: number }[] = []
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (!occupied.has(`${r},${c}`)) fillerPositions.push({ r, c })

  const logAndSpeak = () => {
    if (!tokens.length) return
    speakAll(voiceOpts())
    if (childId) logUsage({
      child_id: childId, board_id: boardId,
      message_text: tokens.map(t => t.vocalization ?? t.label).join(" "),
      timestamp: new Date().toISOString(),
    })
  }

  // ── Engine ───────────────────────────────────────────────────
  const logAndSpeakRef = useRef<() => void>(null!)
  logAndSpeakRef.current = logAndSpeak
  const engine = useCAAEngine({
    homeboardId: "hub",
    onNavigate: useCallback((id: string) => router.push(`/herramientas/tablero-caa/tablero/${id}`), [router]),
    onCollectAdd: addCell,
    onCollectClear: clear,
    onCollectRemoveWord: removeWord,
    onCollectRemoveChar: removeChar,
    onCollectSpeakAll: useCallback(() => logAndSpeakRef.current(), []),
    onSearch: useCallback(() => setShowSearch(true), []),
    onVocabLevelChange: useCallback((level: number) => vl.setLevel(level), [vl]),
    onWordFormReset: useCallback(() => wf.resetForms(), [wf]),
    onWordFormCycle: useCallback((id: string) => wf.cycleNext(id), [wf]),
    onWordFormAddTags: useCallback((tags: string[], toggle?: boolean) => wf.addTags(tags, toggle), [wf]),
    onWordFormChangeElements: useCallback((tags: string[], toggle?: boolean) => {
      wf.addTags(tags, toggle)
      reapplyWordForms((label, vocalization, wordForms) => {
        if (!wordForms?.length) return vocalization ?? label
        const preferred = wf.getPreferredWordForm(wordForms)
        return preferred?.value ?? vocalization ?? label
      })
    }, [wf, reapplyWordForms]),
    onWordFormChangeBar: useCallback((tags: string[], toggle?: boolean) => {
      wf.addTags(tags, toggle)
      reapplyWordForms((label, vocalization, wordForms) => {
        if (!wordForms?.length) return vocalization ?? label
        const preferred = wf.getPreferredWordForm(wordForms)
        return preferred?.value ?? vocalization ?? label
      })
    }, [wf, reapplyWordForms]),
    onWordFormChangeEverywhere: useCallback((tags: string[], toggle?: boolean) => wf.addTags(tags, toggle), [wf]),
    onPredictionRefresh: useCallback(() => {}, []),
    onFullscreen: useCallback((enter: boolean) => {
      if (enter) document.documentElement.requestFullscreen?.()
      else document.exitFullscreen?.()
    }, []),
    onLanguageChange: useCallback((lang: string) => {
      document.cookie = `NEXT_LOCALE=${lang};path=/;max-age=31536000`
      window.location.reload()
    }, []),
    onSpeak: useCallback((text: string, lang?: string) => {
      speakText(text, lang ? { ...voiceOpts(), lang } : voiceOpts())
    }, [boardSettings]),
  })

  const handleTap = (cell: CAACell) => {
    setTappedId(cell.id)
    const actions = cell.actions?.length ? cell.actions : getDefaultActions(cell)
    const hasWfAction = actions.some(a => a.modelName === "GridActionWordForm")
    if (!hasWfAction && !cell.wordForms?.length) {
      wf.resetForms()
    }
    // Añadir a la barra de frase (mismo patrón que tablero rápido)
    addCell(cell)
    engine.handleCellPress(cell, boardId, board?.name)
    if (childId) logUsage({
      child_id: childId, board_id: boardId,
      cell_id: cell.id, timestamp: new Date().toISOString(),
    })
  }
  handleTapRef.current = handleTap

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Lumi mood="thinking" size="lg" message="Cargando tablero..." />
    </div>
  )
  if (!board) return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <Lumi mood="sad" size="lg" message="Tablero no encontrado" />
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        ← Volver
      </Button>
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-surface">

      <div className="sticky top-0 z-10 bg-white border-b border-border">

        {/* Topbar — botones grandes para niños */}
        <div ref={topbarRef} className="flex items-center gap-2 px-2 py-2 overflow-x-auto no-scrollbar">
          <button onClick={() => router.back()}
            className="text-sm font-bold text-text-secondary hover:text-brand transition-colors px-3 py-2 rounded-lg hover:bg-brand-bg min-h-[44px] shrink-0">
            ← Atrás
          </button>
          {engine.navHistory.length > 0 && (
            <div className="flex items-center gap-0.5 text-[9px] text-text-secondary max-w-[30%] overflow-hidden mr-0.5">
              {engine.navHistory.map((entry, i) => (
                <button key={i} onClick={() => engine.navigateToHistoryEntry(i)}
                  className="truncate min-w-0 shrink hover:text-brand transition-colors">
                  {i > 0 && <span className="mx-0.5 opacity-50 pointer-events-none">›</span>}
                  <span className="opacity-60">{entry.boardName || entry.boardId}</span>
                </button>
              ))}
            </div>
          )}
          <span className="text-sm font-extrabold text-text-primary flex-1 truncate shrink-0">
            {board.name}
          </span>
          {/* Grid set badge */}
          {boardGridSet && (
            <span className="text-xs font-semibold text-text-secondary bg-brand-bg rounded-lg px-2.5 py-1.5 border border-brand/20 truncate max-w-[120px] shrink-0 min-h-[44px] flex items-center"
              title={boardGridSet.name}>
              {boardGridSet.name}
            </span>
          )}
          {/* Vocab level toggle */}
          {vl.maxLevel > 0 && (
            <button onClick={() => vl.cycleLevel()}
              className={`text-sm font-bold border-2 border-border rounded-lg px-3 py-2 transition-all whitespace-nowrap min-h-[44px] shrink-0
                ${vl.isFilterActive
                  ? "bg-green-100 border-green-400 text-green-700"
                  : "hover:border-brand hover:text-brand"}`}>
              {vl.isFilterActive ? `Nvl ${vl.currentLevel}` : "Nvl ∞"}
            </button>
          )}
          <button onClick={() => setShowSearch(true)}
            className="text-base border-2 border-border rounded-lg px-3 py-2 transition-all whitespace-nowrap min-h-[44px] shrink-0
              hover:border-brand hover:text-brand">
            🔍
          </button>
          <button onClick={() => setKeyboardMode(p => !p)}
            className={`text-base border-2 border-border rounded-lg px-3 py-2 transition-all whitespace-nowrap min-h-[44px] shrink-0
              ${keyboardMode ? 'border-brand bg-brand/10 text-brand' : 'hover:border-brand hover:text-brand'}`}>
            ⌨️
          </button>
          <button onClick={() => setShowHistory(true)}
            className="text-base border-2 border-border rounded-lg px-3 py-2 transition-all whitespace-nowrap min-h-[44px] shrink-0
              hover:border-brand hover:text-brand">
            📊
          </button>
          <button onClick={() => setShowSettings(true)}
            className="text-base border-2 border-border rounded-lg px-3 py-2 transition-all whitespace-nowrap min-h-[44px] shrink-0
              hover:border-brand hover:text-brand">
            ⚙️
          </button>
          {isScanning ? (
            <button onClick={stopScan}
              className="text-sm font-bold border-2 border-accent bg-accent/10 text-accent rounded-lg px-3 py-2 transition-all whitespace-nowrap min-h-[44px] shrink-0">
              🟢 Detener
            </button>
          ) : (
            <button onClick={startScan}
              className="text-sm font-bold border-2 border-border rounded-lg px-3 py-2 transition-all whitespace-nowrap min-h-[44px] shrink-0
                hover:border-accent hover:text-accent">
              🔘 Scan
            </button>
          )}
          {/* Lock/unlock */}
          <button onClick={handleLockToggle}
            className={`text-sm font-bold border-2 rounded-lg px-3 py-2 transition-all whitespace-nowrap min-h-[44px] shrink-0
              ${isLocked ? "bg-amber-100 border-amber-400 text-amber-700" : "border-border hover:border-brand hover:text-brand"}`}>
            {isLocked ? `🔒 ${unlockCounter < 5 ? unlockCounter : ""}` : "🔓"}
          </button>
          {/* Edit link — hidden when locked */}
          {!isLocked && (
            <button onClick={() => router.push(`/herramientas/tablero-caa/editor/${boardId}`)}
              className="text-base border-2 border-border rounded-lg px-3 py-2 transition-all whitespace-nowrap min-h-[44px] shrink-0
                hover:border-brand hover:text-brand">
              ✏️
            </button>
          )}
          <button onClick={() => {
            if (document.fullscreenElement) { document.exitFullscreen?.() }
            else { document.documentElement.requestFullscreen?.() }
          }}
            className="text-base border-2 border-border rounded-lg px-3 py-2 transition-all whitespace-nowrap min-h-[44px] shrink-0
              hover:border-brand hover:text-brand">
            ⛶
          </button>
          <button onClick={() => setShowLeg(p => !p)}
            className="text-base border-2 border-border rounded-lg px-3 py-2 transition-all whitespace-nowrap min-h-[44px] shrink-0
              hover:border-brand hover:text-brand">
            🎨
          </button>
        </div>

        {/* Leyenda */}
        {showLeg && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.12 }}
            className="overflow-hidden border-b border-border">
            <div className="flex gap-2 px-3 py-2 overflow-x-auto no-scrollbar">
              {(Object.entries(FITZGERALD_COLORS) as [FitzgeraldKey, typeof FITZGERALD_COLORS[FitzgeraldKey]][]).map(([k, v]) => (
                <span key={k}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-bold border whitespace-nowrap"
                  style={{ backgroundColor: v.bg, borderColor: v.hex, color: v.text }}>
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: v.hex }} />
                  {v.label}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        <CAAStrip
          tokens={tokens}
          speaking={speaking}
          keyboardMode={keyboardMode}
          collectMode={collectMode}
          autoSpeak={boardSettings.autoSpeak ?? false}
          onSpeakAll={logAndSpeak}
          onStop={stop}
          onClear={clear}
          onRemoveAt={removeAt}
          onRemoveWord={removeWord}
          onRemoveChar={removeChar}
          onToggleCollectMode={() => setCollectMode(collectMode === "text" ? "separated" : "text")}
          onToggleAutoSpeak={() => {
            const next = !(boardSettings.autoSpeak ?? false)
            setAutoSpeak(next)
            updateSettings({ autoSpeak: next })
          }}
          stripRef={stripRef as React.RefObject<HTMLDivElement | null>}
        />

        {/* Input para teclado virtual */}
        {keyboardMode && (
          <div className="px-2 pb-2">
            <input ref={kbInputRef}
              type="text"
              inputMode="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKbKeyDown}
              placeholder="Escribe aquí y presiona Enter para hablar..."
              className="w-full px-4 py-3 rounded-xl border-2 border-brand/40 bg-white text-base font-bold text-text-primary
                placeholder:text-text-muted placeholder:font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/20
                min-h-[48px]"
              autoComplete="off"
              autoCorrect="on"
              autoCapitalize="sentences"
              enterKeyHint="send"
            />
          </div>
        )}
      </div>

      {/* Global bar */}
      {globalGridActive && globalCells.length > 0 && (
        <div ref={globalBarRef}>
          <CAAGlobalBar cells={globalCells} onCellTap={handleTap} />
        </div>
      )}

      {/* Grid multi-span */}
      <div ref={gridRef} className="flex-1 flex items-center justify-center px-2 py-2">
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, ${cellPx}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellPx}px)`,
          gap: GAP,
        }}>
          {displayCells.map((cell, i) => {
            const cw = cell.width ?? 1; const ch = cell.height ?? 1
            const cx = cell.x ?? cell.position_col; const cy = cell.y ?? cell.position_row
            return (
              <Cell key={cell.id} cell={cell} px={cellPx} onTap={handleTap}
                highlight={tappedId === cell.id}
                scanFocus={isActive(i)}
                scanInactive={isScanning && !isActive(i)}
                boardSettings={boardSettings}
                displayLabel={wf.resolveDisplayText(cell)}
                gridCol={`${cx + 1} / span ${cw}`}
                gridRow={`${cy + 1} / span ${ch}`} />
            )
          })}
          {fillerPositions.map(({ r, c }) => (
            <div key={`e-${r}-${c}`}
              className="rounded-2xl border-2 border-dashed border-border/30 bg-white/40"
              style={{ gridColumn: `${c + 1} / span 1`, gridRow: `${r + 1} / span 1` }} />
          ))}
        </div>
      </div>

      {/* ─── Settings Panel ───────────────────────────────────── */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-black/85" onClick={() => setShowSettings(false)} />
            <motion.div
              initial={{ scale: 0.92, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 10, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl shadow-lg"
              style={{ background: 'linear-gradient(145deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)' }}
            >
              <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.2) 100%)',
                border: '1px solid rgba(255,255,255,0.8)',
              }} />
              <div className="relative p-5 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h2 className="heading-section">⚙️ Configuración</h2>
                  <button onClick={() => setShowSettings(false)}
                    className="w-9 h-9 rounded-xl hover:bg-black/5 flex items-center justify-center text-text-muted text-lg font-bold transition-colors">✕</button>
                </div>

                {/* Voice */}
                <div className="pb-4 border-b border-border/60">
                  <h3 className="heading-card mb-3">🗣️ Voz</h3>
                  <CAASpeechSettings
                    preferredVoice={boardSettings.preferredVoice}
                    voiceRate={boardSettings.voiceRate}
                    voicePitch={boardSettings.voicePitch}
                    autoSpeak={boardSettings.autoSpeak ?? false}
                    onChange={(updates) => {
                      updateSettings(updates)
                      if ('autoSpeak' in updates) setAutoSpeak(!!updates.autoSpeak)
                    }}
                  />
                </div>

                {/* Scanning */}
                <div className="pb-4 border-b border-border/60">
                  <h3 className="heading-card mb-3">🔄 Exploración</h3>
                  <CAAScanSettings
                    scanEnabled={boardSettings.scanEnabled}
                    scanAuto={boardSettings.scanAuto}
                    scanTimeoutMs={boardSettings.scanTimeoutMs}
                    scanTimeoutFirstElementFactor={boardSettings.scanTimeoutFirstElementFactor}
                    scanVertical={boardSettings.scanVertical}
                    scanBinary={boardSettings.scanBinary}
                    scanDualSwitch={boardSettings.scanDualSwitch}
                    scanStartWithAction={boardSettings.scanStartWithAction}
                    scanRoundsUntilBack={boardSettings.scanRoundsUntilBack}
                    scanBeepFeedback={boardSettings.scanBeepFeedback}
                    scanReadActive={boardSettings.scanReadActive}
                    scanReadActiveRate={boardSettings.scanReadActiveRate}
                    onChange={(updates) => updateSettings(updates)}
                  />
                </div>

                {/* Color scheme */}
                <div className="pb-4 border-b border-border/60">
                  <h3 className="heading-card mb-3">🎨 Colores</h3>
                  <CAAColorSettings
                    colorScheme={boardSettings.colorScheme}
                    colorIntensity={boardSettings.colorIntensity}
                    colorSchemesActivated={boardSettings.colorSchemesActivated}
                    colorMode={boardSettings.colorMode}
                    onChange={(updates) => updateSettings(updates)}
                  />
                </div>

                {/* Toggles */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-text-primary block">Mostrar etiquetas</span>
                      <span className="text-xs text-text-muted">Texto debajo de los pictogramas</span>
                    </div>
                    <button onClick={() => updateSettings({ showLabels: !(boardSettings.showLabels ?? true) })}
                      className={`w-12 h-6 rounded-full transition-colors ${boardSettings.showLabels !== false ? 'bg-brand' : 'bg-border/60'} relative`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${boardSettings.showLabels !== false ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-text-primary block">Auto-pronunciar</span>
                      <span className="text-xs text-text-muted">Hablar al tocar cada celda</span>
                    </div>
                    <button onClick={() => {
                      const next = !(boardSettings.autoSpeak ?? false)
                      setAutoSpeak(next)
                      updateSettings({ autoSpeak: next })
                    }}
                      className={`w-12 h-6 rounded-full transition-colors ${boardSettings.autoSpeak ?? false ? 'bg-brand' : 'bg-border/60'} relative`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${boardSettings.autoSpeak ?? false ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── History Panel ────────────────────────────────────── */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-black/85" onClick={() => setShowHistory(false)} />
            <motion.div
              initial={{ scale: 0.92, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 10, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl shadow-lg"
              style={{ background: 'linear-gradient(145deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)' }}
            >
              <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.2) 100%)',
                border: '1px solid rgba(255,255,255,0.8)',
              }} />
              <div className="relative">
                {historyLoading ? (
                  <div className="p-8 text-center heading-card">Cargando historial...</div>
                ) : (
                  <CAAHistoryPanel history={history} onClose={() => setShowHistory(false)} />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Search Overlay ──────────────────────────────────── */}
      {showSearch && (
        <CAASearchOverlay
          onNavigate={(id) => {
            setShowSearch(false)
            router.push(`/herramientas/tablero-caa/tablero/${id}`)
          }}
          onClose={() => setShowSearch(false)}
        />
      )}
    </div>
  )
}
