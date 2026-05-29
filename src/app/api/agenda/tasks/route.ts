import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { agendaId, label, keyword, category, order_index, timer_seconds, reward } = body

  const insertData: Record<string, unknown> = {
    agenda_id: agendaId, label, keyword, category,
    order_index: order_index ?? 99,
  }
  if (typeof timer_seconds === "number") insertData.timer_seconds = timer_seconds
  if (reward) insertData.reward = reward

  const { data, error } = await supabase
    .from("agenda_tasks")
    .insert(insertData)
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
  const { taskId, ...updates } = body

  if (updates.done === true) updates.done_at = new Date().toISOString()
  if (updates.done === false) updates.done_at = null

  const { data, error } = await supabase
    .from("agenda_tasks")
    .update(updates)
    .eq("id", taskId)
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
  const taskId = searchParams.get("taskId")
  if (!taskId) return NextResponse.json({ error: "taskId required" }, { status: 400 })

  const { error } = await supabase.from("agenda_tasks").delete().eq("id", taskId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
