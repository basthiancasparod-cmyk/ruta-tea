import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { tasks } = await req.json() as { tasks: { id: string; order_index: number }[] }

  const updates = tasks.map(({ id, order_index }) =>
    supabase.from("agenda_tasks").update({ order_index }).eq("id", id)
  )

  await Promise.all(updates)
  return NextResponse.json({ ok: true })
}
