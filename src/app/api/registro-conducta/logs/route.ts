import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

export async function GET(req: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const childId = searchParams.get("childId")
  const date = searchParams.get("date")
  const month = searchParams.get("month")

  if (!childId) return NextResponse.json({ error: "childId required" }, { status: 400 })

  if (month) {
    const [y, m] = month.split("-")
    const start = `${y}-${m}-01T00:00:00Z`
    const endY = Number(m) === 12 ? Number(y) + 1 : Number(y)
    const endM = Number(m) === 12 ? 1 : Number(m) + 1
    const end = `${endY}-${String(endM).padStart(2, "0")}-01T00:00:00Z`

    const { data: rows } = await supabase
      .from("behavior_logs")
      .select("logged_at")
      .eq("child_id", childId)
      .gte("logged_at", start)
      .lt("logged_at", end)

    const dates = [...new Set((rows ?? []).map(r => r.logged_at.split("T")[0]))]
    return NextResponse.json({ dates })
  }

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
      image_url: body.image_url ?? null,
      logged_at: body.logged_at ?? new Date().toISOString(),
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
  const { logId, ...updates } = body
  if (!logId) return NextResponse.json({ error: "logId required" }, { status: 400 })

  const { data, error } = await supabase
    .from("behavior_logs")
    .update(updates)
    .eq("id", logId)
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
  const logId = searchParams.get("logId")
  if (!logId) return NextResponse.json({ error: "logId required" }, { status: 400 })

  const { data: log } = await supabase.from("behavior_logs").select("image_url").eq("id", logId).single()
  if (log?.image_url) {
    const pathMatch = log.image_url.match(/conducta\/(.+)$/)
    if (pathMatch) {
      await supabase.storage.from("conducta").remove([pathMatch[1]])
    }
  }

  const { error } = await supabase.from("behavior_logs").delete().eq("id", logId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
