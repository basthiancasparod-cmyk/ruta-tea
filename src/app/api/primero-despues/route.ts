import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

export async function GET(req: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const childId = searchParams.get("childId")

  if (!childId) {
    return NextResponse.json({ error: "childId required" }, { status: 400 })
  }

  const { data: child } = await supabase.from("children").select("id").eq("id", childId).eq("profile_id", user.id).maybeSingle()
  if (!child) return NextResponse.json({ error: "Child not found or access denied" }, { status: 404 })

  const { data: boards } = await supabase
    .from("primero_despues_boards")
    .select("*")
    .eq("child_id", childId)
    .order("created_at", { ascending: false })

  return NextResponse.json({ boards: boards ?? [] })
}

export async function POST(req: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { childId, first_label, then_label } = body
  if (!childId || !first_label || !then_label) {
    return NextResponse.json({ error: "childId, first_label, and then_label required" }, { status: 400 })
  }

  const { data: child } = await supabase.from("children").select("id").eq("id", childId).eq("profile_id", user.id).maybeSingle()
  if (!child) return NextResponse.json({ error: "Child not found or access denied" }, { status: 404 })

  const { data, error } = await supabase
    .from("primero_despues_boards")
    .insert({
      child_id: childId,
      title: body.title ?? "",
      first_label,
      first_emoji: body.first_emoji ?? "📋",
      first_minutes: body.first_minutes ?? null,
      then_label,
      then_emoji: body.then_emoji ?? "🎁",
      then_minutes: body.then_minutes ?? null,
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
  const { boardId, childId, ...updates } = body
  if (!boardId || !childId) {
    return NextResponse.json({ error: "boardId and childId required" }, { status: 400 })
  }

  const payload: Record<string, unknown> = { ...updates, updated_at: new Date().toISOString() }

  const { data, error } = await supabase
    .from("primero_despues_boards")
    .update(payload)
    .eq("id", boardId)
    .eq("child_id", childId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Board not found or access denied" }, { status: 404 })
  return NextResponse.json(data)
}

export async function DELETE(req: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const boardId = searchParams.get("boardId")
  const childId = searchParams.get("childId")
  if (!boardId || !childId) return NextResponse.json({ error: "boardId and childId required" }, { status: 400 })

  const { data, error } = await supabase.from("primero_despues_boards").delete().eq("id", boardId).eq("child_id", childId).select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data || data.length === 0) return NextResponse.json({ error: "Board not found or access denied" }, { status: 404 })
  return NextResponse.json({ ok: true })
}
