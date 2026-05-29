import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: sets, error: setsError } = await supabase
    .from("caa_grid_sets")
    .select("*")
    .eq("profile_id", user.id)
    .order("order_index", { ascending: true })
  if (setsError) return NextResponse.json({ error: setsError.message }, { status: 500 })

  const ids = (sets ?? []).map(s => s.id)
  const { data: links } = await supabase
    .from("caa_grid_set_boards")
    .select("*")
    .in("grid_set_id", ids.length > 0 ? ids : ["__none__"])
    .order("order_index", { ascending: true })

  const map = new Map<string, typeof links>()
  for (const link of links ?? []) {
    if (!map.has(link.grid_set_id)) map.set(link.grid_set_id, [])
    map.get(link.grid_set_id)!.push(link)
  }

  const result = (sets ?? []).map(s => ({
    ...s,
    boards: map.get(s.id) ?? [],
  }))

  return NextResponse.json(result)
}

export async function POST(request: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await request.json()

  const { data, error } = await supabase
    .from("caa_grid_sets")
    .insert({ ...body, profile_id: user.id, updated_at: new Date().toISOString() })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
