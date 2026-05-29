"use client"

import { useSupabase } from "@/components/layout/SupabaseProvider"
import { useEffect, useState, useCallback } from "react"
import type { CAAGridSet, CAAGridSetBoard, CAAGridSetWithBoards } from "@/types/caa"

export function useGridSets() {
  const { supabase, user } = useSupabase()
  const [gridSets, setGridSets] = useState<CAAGridSetWithBoards[]>([])
  const [loading, setLoading] = useState(true)

  const fetchGridSets = useCallback(async () => {
    if (!user) { setLoading(false); return }
    setLoading(true)

    const { data: sets, error: setsError } = await supabase
      .from("caa_grid_sets")
      .select("*")
      .eq("profile_id", user.id)
      .order("order_index", { ascending: true })

    if (setsError || !sets) { setLoading(false); return }

    const ids = sets.map(s => s.id)
    const { data: links, error: linksError } = await supabase
      .from("caa_grid_set_boards")
      .select("*")
      .in("grid_set_id", ids.length > 0 ? ids : ["__none__"])
      .order("order_index", { ascending: true })

    if (linksError) { setLoading(false); return }

    const map = new Map<string, CAAGridSetBoard[]>()
    for (const link of links ?? []) {
      if (!map.has(link.grid_set_id)) map.set(link.grid_set_id, [])
      map.get(link.grid_set_id)!.push(link)
    }

    setGridSets((sets as CAAGridSet[]).map(s => ({
      ...s,
      boards: map.get(s.id) ?? [],
    })) as CAAGridSetWithBoards[])

    setLoading(false)
  }, [user, supabase])

  useEffect(() => { fetchGridSets() }, [fetchGridSets])

  return { gridSets, loading, refetch: fetchGridSets }
}

export function useBoardGridSet(boardId: string) {
  const { supabase, user } = useSupabase()
  const [gridSet, setGridSet] = useState<CAAGridSetWithBoards | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchBoardGridSet = useCallback(async () => {
    if (!boardId || !user) { setLoading(false); return }
    setLoading(true)

    const { data: links } = await supabase
      .from("caa_grid_set_boards")
      .select("grid_set_id")
      .eq("board_id", boardId)
      .limit(1)

    if (!links || links.length === 0) { setLoading(false); return }

    const { data: setData } = await supabase
      .from("caa_grid_sets")
      .select("*")
      .eq("id", links[0].grid_set_id)
      .single()

    if (!setData) { setLoading(false); return }

    const { data: boardLinks } = await supabase
      .from("caa_grid_set_boards")
      .select("*")
      .eq("grid_set_id", links[0].grid_set_id)
      .order("order_index", { ascending: true })

    setGridSet({
      ...(setData as CAAGridSet),
      boards: (boardLinks ?? []) as CAAGridSetBoard[],
    })
    setLoading(false)
  }, [boardId, supabase, user])

  useEffect(() => { fetchBoardGridSet() }, [fetchBoardGridSet])

  return { gridSet, loading, refetch: fetchBoardGridSet }
}
