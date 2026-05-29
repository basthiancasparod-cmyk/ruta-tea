import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.trim()
  if (!q || q.length < 1) return NextResponse.json([])

  const { data, error } = await supabase
    .from("caa_cells")
    .select(`
      id, board_id, label, pictogram_keyword, vocalization,
      boards!inner(name)
    `)
    .ilike("label", `%${q}%`)
    .in("board_id", (
      await supabase.from("caa_boards").select("id").eq("profile_id", user.id)
    ).data?.map(b => b.id) ?? [])
    .order("label", { ascending: true })
    .limit(30)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const results = (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id,
    board_id: r.board_id,
    label: r.label,
    pictogram_keyword: r.pictogram_keyword,
    vocalization: r.vocalization,
    board_name: (r.boards as Record<string, unknown>)?.name ?? "",
  }))

  return NextResponse.json(results)
}
