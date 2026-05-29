"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { Scanner, beep, setupScannerKeyboard } from "./scanner"
import type { ScannerOptions, ScanPhase } from "./scanner"
import type { CAACell } from "@/types/caa"
import { speakText } from "./collectBar"

export interface UseScannerOptions extends ScannerOptions {
  enabled?: boolean
}

export function useScanner(
  cells: CAACell[],
  options: UseScannerOptions,
  onCellSelect?: (cell: CAACell) => void
) {
  const [activeIndices, setActiveIndices] = useState<number[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [phase, setPhase] = useState<ScanPhase>("idle")
  const scannerRef = useRef<Scanner | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!options.enabled || cells.length === 0) return () => {}

    const scanner = new Scanner(
      {
        autoScan: options.autoScan,
        timeoutMs: options.timeoutMs,
        timeoutFirstElementFactor: options.timeoutFirstElementFactor,
        vertical: options.vertical,
        binary: options.binary,
        startWithAction: options.startWithAction,
        roundsUntilBack: options.roundsUntilBack,
        beepFeedback: options.beepFeedback,
        readActive: options.readActive,
        readActiveRate: options.readActiveRate,
        dualSwitch: options.dualSwitch,
      },
      {
        onActiveIndices: (indices) => {
          setActiveIndices(indices)
          setPhase(scanner.getPhase())
        },
        onSelect: (idx) => {
          void beep(600, 60)
          if (onCellSelect && cells[idx]) {
            onCellSelect(cells[idx])
          }
          setActiveIndices([])
        },
        onAdvance: () => {
          if (options.beepFeedback) void beep(800, 50)
        },
        onWrap: () => {
          if (options.beepFeedback) void beep(1600, 80)
        },
        onRestart: () => {
          if (options.beepFeedback) { void beep(1600, 60); void setTimeout(() => beep(1600, 60), 100) }
        },
        onStop: () => {
          setIsScanning(false)
          setActiveIndices([])
          setPhase("idle")
        },
        onReadActive: (cell) => {
          if (options.readActive && cell.label) {
            void speakText(cell.label, { rate: options.readActiveRate ?? 1.0, dontStop: true })
          }
        },
      }
    )
    scanner.init(cells)
    scannerRef.current = scanner
    setPhase("idle")

    const cleanup = setupScannerKeyboard(scanner, options.dualSwitch ?? false)
    cleanupRef.current = cleanup

    setIsScanning(true)
    if (!options.startWithAction) {
      scanner.start()
    }

    return () => {
      scanner.destroy()
      cleanup()
      scannerRef.current = null
      cleanupRef.current = null
      setIsScanning(false)
      setActiveIndices([])
      setPhase("idle")
    }
  }, [
    options.enabled, options.autoScan, options.timeoutMs,
    options.timeoutFirstElementFactor, options.vertical, options.binary,
    options.startWithAction, options.roundsUntilBack, options.beepFeedback,
    options.readActive, options.readActiveRate, options.dualSwitch,
    cells, onCellSelect,
  ])

  const start = useCallback(() => {
    scannerRef.current?.start()
    setIsScanning(true)
    setPhase(scannerRef.current?.getPhase() ?? "row")
  }, [])

  const stop = useCallback(() => {
    scannerRef.current?.stop()
    setIsScanning(false)
    setActiveIndices([])
    setPhase("idle")
  }, [])

  const isActive = useCallback(
    (index: number) => activeIndices.includes(index),
    [activeIndices]
  )

  const isRowActive = useCallback(
    (row: number, cellsArr: { position_row: number }[]) => {
      return activeIndices.length > 1 &&
        activeIndices.some(i => cellsArr[i]?.position_row === row)
    },
    [activeIndices]
  )

  return { activeIndices, isScanning, phase, isActive, isRowActive, start, stop }
}
