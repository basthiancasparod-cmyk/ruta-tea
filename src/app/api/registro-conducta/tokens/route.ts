import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

export async function GET(req: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const childId = searchParams.get("childId")
  const date = searchParams.get("date")

  if (!childId) return NextResponse.json({ error: "childId required" }, { status: 400 })

  let query = supabase.from("token_sessions").select("*").eq("child_id", childId)
  if (date) query = query.eq("session_date", date)
  query = query.order("created_at", { ascending: false }).limit(1)

  const { data: sessions } = await query
  return NextResponse.json({ session: sessions?.[0] ?? null })
}

export async function POST(req: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { childId } = body
  if (!childId) return NextResponse.json({ error: "childId required" }, { status: 400 })

  const { data, error } = await supabase
    .from("token_sessions")
    .insert({
      child_id: childId,
      reward_text: body.reward_text ?? "Mi recompensa",
      reward_emoji: body.reward_emoji ?? "🎁",
      total_tokens: body.total_tokens ?? 10,
      earned_tokens: body.earned_tokens ?? 0,
      session_date: body.session_date ?? new Date().toISOString().split("T")[0],
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { sessionId, ...updates } = body
  if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 })

  const payload: Record<string, unknown> = { ...updates, updated_at: new Date().toISOString() }

  const { data, error } = await supabase
    .from("token_sessions")
    .update(payload)
    .eq("id", sessionId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get("sessionId")
  if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 })

  const { error } = await supabase.from("token_sessions").delete().eq("id", sessionId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
