import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

export async function GET(_req: Request, { params }: { params: Promise<{ boardId: string }> }) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { boardId } = await params
  const { data, error } = await supabase
    .from("caa_boards")
    .select("*, caa_cells(*)")
    .eq("id", boardId)
    .eq("profile_id", user.id)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ boardId: string }> }) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { boardId } = await params
  const body = await request.json()
  const { data, error } = await supabase
    .from("caa_boards")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", boardId)
    .eq("profile_id", user.id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ boardId: string }> }) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { boardId } = await params
  const { error } = await supabase
    .from("caa_boards")
    .delete()
    .eq("id", boardId)
    .eq("profile_id", user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}