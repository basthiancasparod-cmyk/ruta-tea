import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

async function checkChildAccess(supabase: Awaited<ReturnType<typeof createServerSupabase>>, childId: string, userId: string) {
  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", userId).maybeSingle()
  if (!profile) return false
  const { data: child } = await supabase.from("children").select("id").eq("id", childId).eq("profile_id", profile.id).maybeSingle()
  return !!child
}

export async function GET(req: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const childId = searchParams.get("childId")

  if (!childId) {
    return NextResponse.json({ error: "childId required" }, { status: 400 })
  }

  if (!(await checkChildAccess(supabase, childId, user.id))) {
    return NextResponse.json({ error: "Child not found or access denied" }, { status: 404 })
  }

  const { data: sessions } = await supabase
    .from("primero_despues_sessions")
    .select("*")
    .eq("child_id", childId)
    .order("completed_at", { ascending: false })

  return NextResponse.json({ sessions: sessions ?? [] })
}

export async function POST(req: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { boardId, childId, firstDuration, thenDuration } = body
  if (!boardId || !childId) {
    return NextResponse.json({ error: "boardId and childId required" }, { status: 400 })
  }

  if (!(await checkChildAccess(supabase, childId, user.id))) {
    return NextResponse.json({ error: "Child not found or access denied" }, { status: 404 })
  }

  const [sessionResult, boardResult] = await Promise.all([
    supabase.from("primero_despues_sessions").insert({
      board_id: boardId,
      child_id: childId,
      first_duration_seconds: firstDuration ?? null,
      then_duration_seconds: thenDuration ?? null,
    }).select().single(),
    supabase.from("primero_despues_boards").update({ last_used_at: new Date().toISOString() }).eq("id", boardId).eq("child_id", childId),
  ])

  if (sessionResult.error) return NextResponse.json({ error: sessionResult.error.message }, { status: 500 })
  return NextResponse.json(sessionResult.data)
}
