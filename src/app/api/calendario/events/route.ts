import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

export async function PATCH(req: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { eventId, ...updates } = body
  if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 })

  const payload: Record<string, unknown> = { ...updates, updated_at: new Date().toISOString() }
  delete payload.icon
  delete payload.color

  const { data, error } = await supabase
    .from("calendar_events")
    .update(payload)
    .eq("id", eventId)
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
  const eventId = searchParams.get("eventId")
  if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 })

  const { error } = await supabase.from("calendar_events").delete().eq("id", eventId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
