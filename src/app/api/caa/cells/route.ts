import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const body = await request.json()
    const { data: board } = await supabase.from("caa_boards").select("id").eq("id", body.board_id).eq("profile_id", user.id).single()
    if (!board) return NextResponse.json({ error: "Board not found" }, { status: 404 })
    const { data, error } = await supabase.from("caa_cells").insert(body).select().single()
    if (error) return NextResponse.json({ error: error.message, detail: error }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id, ...updates } = await request.json()
  const { data, error } = await supabase.from("caa_cells").update(updates).eq("id", id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const cellId = searchParams.get("id")
  if (!cellId) return NextResponse.json({ error: "Cell ID required" }, { status: 400 })
  const { error } = await supabase.from("caa_cells").delete().eq("id", cellId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
