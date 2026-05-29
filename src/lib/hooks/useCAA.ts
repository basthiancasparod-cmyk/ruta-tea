"use client"

import { useSupabase } from "@/components/layout/SupabaseProvider"
import { useEffect, useState, useCallback } from "react"
import type { CAABoard, CAACell, CAAUsageRecord } from "@/types/caa"

export function useCAABoards(childId?: string) {
  const { supabase, user } = useSupabase()
  const [boards, setBoards] = useState<CAABoard[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBoards = useCallback(async () => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    let query = supabase
      .from("caa_boards")
      .select("*")
      .eq("profile_id", user.id)
      .order("updated_at", { ascending: false })
    if (childId) query = query.eq("child_id", childId)
    const { data, error } = await query
    if (!error && data) setBoards(data as CAABoard[])
    setLoading(false)
  }, [user, childId, supabase])

  useEffect(() => { fetchBoards() }, [fetchBoards])

  return { boards, loading, refetch: fetchBoards }
}

export function useCAABoard(boardId?: string) {
  const { supabase, user } = useSupabase()
  const [board, setBoard] = useState<CAABoard | null>(null)
  const [cells, setCells] = useState<CAACell[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBoard = useCallback(async () => {
    if (!boardId || !user) { setLoading(false); return }
    setLoading(true)
    const { data: boardData, error: boardError } = await supabase
      .from("caa_boards")
      .select("*")
      .eq("id", boardId)
      .single()
    if (boardError || !boardData) { setLoading(false); return }
    setBoard(boardData as CAABoard)

    const { data: cellData } = await supabase
      .from("caa_cells")
      .select("*")
      .eq("board_id", boardId)
    setCells((cellData ?? []) as CAACell[])
    setLoading(false)
  }, [boardId, supabase, user])

  useEffect(() => { fetchBoard() }, [fetchBoard])

  return { board, cells, loading, refetch: fetchBoard }
}

export function useCAAUsageHistory(childId?: string, limit = 50) {
  const { supabase } = useSupabase()
  const [history, setHistory] = useState<CAAUsageRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!childId) { setLoading(false); return }
    supabase
      .from("caa_usage_history")
      .select("*")
      .eq("child_id", childId)
      .order("timestamp", { ascending: false })
      .limit(limit)
      .then(({ data }) => {
        setHistory((data as CAAUsageRecord[]) ?? [])
        setLoading(false)
      })
  }, [childId, limit, supabase])

  return { history, loading }
}

export function useCAABoardMutations() {
  const createBoard = async (board: Partial<CAABoard>): Promise<CAABoard> => {
    const res = await fetch("/api/caa/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(board),
    })
    const body = await res.json()
    if (!res.ok) throw new Error(`Failed to create board: ${body.error}`)
    return body
  }

  const updateBoard = async (boardId: string, updates: Partial<CAABoard>): Promise<CAABoard> => {
    const res = await fetch(`/api/caa/boards/${boardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
    if (!res.ok) throw new Error("Failed to update board")
    return res.json()
  }

  const deleteBoard = async (boardId: string): Promise<void> => {
    const res = await fetch(`/api/caa/boards/${boardId}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Failed to delete board")
  }

  const createCell = async (cell: Partial<CAACell>): Promise<CAACell> => {
    const res = await fetch("/api/caa/cells", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cell),
    })
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      throw new Error(errBody.error ?? `Failed to create cell (${res.status})`)
    }
    return res.json()
  }

  const updateCell = async (cellId: string, updates: Partial<CAACell>): Promise<CAACell> => {
    const res = await fetch("/api/caa/cells", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: cellId, ...updates }),
    })
    if (!res.ok) throw new Error("Failed to update cell")
    return res.json()
  }

  const deleteCell = async (cellId: string): Promise<void> => {
    const res = await fetch(`/api/caa/cells?id=${cellId}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Failed to delete cell")
  }

  const logUsage = async (record: Partial<CAAUsageRecord>): Promise<void> => {
    try {
      await fetch("/api/caa/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      })
    } catch { /* silent */ }
  }

  const saveCells = async (
    boardId: string,
    cells: CAACell[],
    supabase: ReturnType<typeof useSupabase>['supabase']
  ): Promise<void> => {
    // 1. Obtener IDs existentes en DB
    const { data: existing } = await supabase
      .from('caa_cells')
      .select('id')
      .eq('board_id', boardId)

    const existingIds = new Set((existing ?? []).map((r: { id: string }) => r.id))
    const incomingIds = new Set(cells.map(c => c.id).filter(Boolean))

    // 2. Determinar qué eliminar
    const toDelete = [...existingIds].filter(id => !incomingIds.has(id))

    // 3. Preparar payload para upsert
    const now = new Date().toISOString()
    const payload = cells.map(cell => ({
      ...cell,
      board_id: boardId,
      updated_at: now,
    }))

    // 4. Ejecutar operaciones atómicas
    try {
      const [upsertResult, deleteResult] = await Promise.all([
        payload.length > 0
          ? supabase
            .from('caa_cells')
            .upsert(payload, { onConflict: 'id' })
          : Promise.resolve({ error: null }),

        toDelete.length > 0
          ? supabase
            .from('caa_cells')
            .delete()
            .in('id', toDelete)
          : Promise.resolve({ error: null })
      ])

      if (upsertResult.error) {
        throw new Error(upsertResult.error.message)
      }
      if (deleteResult.error) {
        throw new Error(deleteResult.error.message)
      }
    } catch (error) {
      console.error("Error guardando celdas:", error)
      // Añadir notificación en UI si es necesario
      // await showModal({ ... }) // Si showModal está disponible
    }
  }

  return {
    createBoard,
    updateBoard,
    deleteBoard,
    createCell,
    updateCell,
    deleteCell,
    logUsage,
    saveCells // Nuevo método añadido
  }
}