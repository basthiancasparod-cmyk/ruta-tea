// use client

/**
 * useCAAScanner
 *
 * Escaneo automático de celdas + soporte de switch/teclado.
 * Compatible con acceso por un pulsador (Space/Enter = seleccionar)
 * y dos pulsadores (← → = mover, Space = seleccionar).
 *
 */

import { useState, useEffect, useCallback, useRef } from "react"
import type { CAABoardSettings } from "@/types/caa"

interface UseCAAScannerOptions {
  cellCount: number
  settings: CAABoardSettings
  onSelect: (index: number) => void
}

export function useCAAScanner({
  cellCount,
  settings,
  onSelect
}: UseCAAScannerOptions) {
  const [scanIndex, setScanIndex] = useState(-1)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const roundsRef = useRef(0)
  const isActive = settings.scanEnabled && cellCount > 0

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
  }, [])

  const start = useCallback(() => {
    if (!isActive) return
    stop()
    setScanIndex(0)
    roundsRef.current = 0
    const ms = settings.scanTimeoutMs ?? 1000
    const maxRounds = settings.scanRoundsUntilBack ?? 3

    intervalRef.current = setInterval(() => {
      setScanIndex(prev => {
        const next = prev + 1
        if (next >= cellCount) {
          roundsRef.current++
          if (maxRounds > 0 && roundsRef.current >= maxRounds) {
            stop()
            return -1 // escaneo terminado
          }
          return 0
        }
        return next
      })

      if (settings.scanBeepFeedback) {
        // Beep simple via AudioContext
        try {
          const ctx = new AudioContext()
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.frequency.value = 880
          gain.gain.value = 0.1
          osc.start()
          osc.stop(ctx.currentTime + 0.05)
        } catch { /* sin audio ctx */ }
      }
    }, ms)
  }, [isActive, cellCount, settings, stop])

  // Auto-start si scanAuto
  useEffect(() => {
    if (settings.scanAuto) start()
    return stop
  }, [settings.scanAuto, start, stop])

  // Teclado/switch input
  useEffect(() => {
    if (!isActive) return

    const handler = (e: KeyboardEvent) => {
      // Ignorar cuando el foco está en un input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return

      switch (e.key) {
        case ' '://space
        case 'Enter':
          e.preventDefault()
          if (scanIndex >= 0) onSelect(scanIndex)
          break
        case 'ArrowRight':
          e.preventDefault()
          setScanIndex(i => Math.min(i + 1, cellCount - 1))
          break
        case 'ArrowLeft':
          e.preventDefault()
          setScanIndex(i => Math.max(i - 1, 0))
          break
        case 'ArrowDown':
          e.preventDefault()
          // Para escaneo vertical: saltar una fila completa
          // Se asume que el nümero de columnas se puede inferir externamente
          // Por ahora avanza cellCount/2 (heurístico)
          setScanIndex(i => Math.min(i + 3, cellCount - 1))
          break
        case 'Escape':
          stop()
          setScanIndex(-1)
          break
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isActive, scanIndex, cellCount, onSelect, stop])

  return {
    scanIndex,        // -1 = inactivo
    isScanning: isActive && scanIndex >= 0,
    start,
    stop,
  }
}
