import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

export async function PATCH(req: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { eventId, childId, ...updates } = body
  if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 })

  const payload: Record<string, unknown> = { ...updates, updated_at: new Date().toISOString() }
  delete payload.icon
  delete payload.color

  const { data, error } = await supabase
    .from("calendar_events")
    .update(payload)
    .eq("id", eventId)
    .eq("child_id", childId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Event not found or access denied" }, { status: 404 })
  return NextResponse.json(data)
}

export async function DELETE(req: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const eventId = searchParams.get("eventId")
  const childId = searchParams.get("childId")
  if (!eventId || !childId) return NextResponse.json({ error: "eventId and childId required" }, { status: 400 })

  const { data, error } = await supabase.from("calendar_events").delete().eq("id", eventId).eq("child_id", childId).select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data || data.length === 0) return NextResponse.json({ error: "Event not found or access denied" }, { status: 404 })
  return NextResponse.json({ ok: true })
}
