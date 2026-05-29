// use client

/**
 * useGlobalGrid
 *
 * Carga el tablero marcado como is_global_grid=true para el usuario.
 * Sus celdas se superponen en TODOS los tableros (vocabulario core permanente).
 *
 * Regla de Asterics-AAC: el global grid NO reemplaza celdas del tablero actual
 * que ocupen la misma posición — el tablero principal tiene prioridad.
 *
 * Configuración: board.settings.globalGridId apunta al boardId del global grid.
 * Si no está configurado, se busca el primero con is_global_grid=true.
 */

import { useState, useEffect, useCallback } from "react"
import { useSupabase } from "@/components/layout/SupabaseProvider"
import type { CAACell } from "@/types/caa"

interface UseGlobalGridOptions {
  /** boardId del tablero global (de settings.globalGridId) */
  globalGridId?: string
  enabled?: boolean
}

export function useGlobalGrid({ globalGridId, enabled = true }: UseGlobalGridOptions) {
  const { supabase, user } = useSupabase()
  const [globalCells, setGlobalCells] = useState<CAACell[]>([])
  const [globalBoardId, setGlobalBoardId] = useState<string | null>(globalGridId ?? null)
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async () => {
    if (!user || !enabled) return
    setLoading(true)

    let targetId = globalGridId

    // Si no está explicito, buscar el primero marcado como global
    if (!targetId) {
      const { data } = await supabase
        .from("caa_boards")
        .select("id")
        .eq("profile_id", user.id)
        .eq("is_global_grid", true)
        .limit(1)
        .single()
      targetId = data?.id
    }

    if (!targetId) {
      setGlobalCells([])
      setLoading(false)
      return
    }

    setGlobalBoardId(targetId)

    const { data: cells } = await supabase
      .from("caa_cells")
      .select("*")
      .eq("board_id", targetId)
      .order("order_index")

    setGlobalCells((cells ?? []) as CAACell[])
    setLoading(false)
  }, [user, globalGridId, enabled, supabase])

  useEffect(() => { fetch() }, [fetch])

  /**
   * Combina celdas del tablero actual con las del global grid.
   * Las posiciones del tablero principal tienen prioridad.
   */
  const mergeWithBoard = useCallback(
    (boardCells: CAACell[], boardCols: number, boardRows: number): CAACell[] => {
      if (!globalCells.length) return boardCells

      // Set de posiciones ocupadas por el tablero principal
      const occupied = new Set(
        boardCells.map(c => `${c.position_row}-${c.position_col}`)
      )

      // Filtrar celdas del global grid que no colisionen
      const nonColliding = globalCells.filter(gc => {
        const key = `${gc.position_row}-${gc.position_col}`
        // También filtrar las que estén fuera del grid actual
        const inBounds =
          gc.position_row < boardRows && gc.position_col < boardCols
        return !occupied.has(key) && inBounds
      })

      return [...boardCells, ...nonColliding]
    },
    [globalCells]
  )

  return { globalCells, globalBoardId, loading, mergeWithBoard, refetch: fetch }
}