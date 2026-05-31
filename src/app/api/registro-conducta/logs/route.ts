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

  let query = supabase.from("behavior_logs").select("*").eq("child_id", childId)

  if (date) {
    const start = `${date}T00:00:00Z`
    const end = `${date}T23:59:59Z`
    query = query.gte("logged_at", start).lte("logged_at", end)
  }

  query = query.order("logged_at", { ascending: false })

  const { data: logs } = await query
  return NextResponse.json({ logs: logs ?? [] })
}

export async function POST(req: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { childId, behavior_type } = body
  if (!childId || !behavior_type) {
    return NextResponse.json({ error: "childId and behavior_type required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("behavior_logs")
    .insert({
      child_id: childId,
      behavior_type,
      category: body.category ?? "other",
      intensity: body.intensity ?? null,
      description: body.description ?? "",
      antecedent: body.antecedent ?? "",
      consequence: body.consequence ?? "",
      mood_before: body.mood_before ?? null,
      mood_after: body.mood_after ?? null,
      logged_at: body.logged_at ?? new Date().toISOString(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
