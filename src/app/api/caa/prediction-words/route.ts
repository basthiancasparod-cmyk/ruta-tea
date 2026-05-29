import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const language = searchParams.get("language") ?? "es"
  const boardId = searchParams.get("board_id")
  const source = searchParams.get("source")

  let query = supabase
    .from("caa_prediction_words")
    .select("*")
    .or(`profile_id.is.null,profile_id.eq.${user.id}`)
    .eq("language", language)
    .order("frequency", { ascending: false })
    .limit(500)

  if (boardId) query = query.or(`board_id.is.null,board_id.eq.${boardId}`)
  if (source) query = query.eq("source", source)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await request.json()

  const words = Array.isArray(body) ? body : [body]
  const rows = words.map(w => ({
    word: w.word.toLowerCase().trim(),
    frequency: w.frequency ?? 1,
    language: w.language ?? "es",
    source: w.source ?? "custom",
    profile_id: user.id,
    board_id: w.board_id ?? null,
    child_id: w.child_id ?? null,
  }))

  const { data, error } = await supabase
    .from("caa_prediction_words")
    .insert(rows)
    .select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
