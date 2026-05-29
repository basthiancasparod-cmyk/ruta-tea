import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

const DEFAULT_TASKS = [
  { label: "Despertar",  keyword: "despertar",  category: "morning",   order_index: 0 },
  { label: "Lavarse",    keyword: "lavarse",     category: "morning",   order_index: 1 },
  { label: "Vestirse",   keyword: "vestirse",    category: "morning",   order_index: 2 },
  { label: "Desayunar",  keyword: "desayuno",    category: "morning",   order_index: 3 },
  { label: "Cepillarse", keyword: "cepillarse",  category: "morning",   order_index: 4 },
  { label: "Jugar",      keyword: "jugar",       category: "afternoon", order_index: 5 },
  { label: "Comer",      keyword: "comer",       category: "afternoon", order_index: 6 },
  { label: "Leer",       keyword: "leer",        category: "afternoon", order_index: 7 },
  { label: "Dibujar",    keyword: "dibujar",     category: "afternoon", order_index: 8 },
  { label: "Bañarse",    keyword: "ducharse",    category: "evening",   order_index: 9 },
  { label: "Cenar",      keyword: "comer",       category: "evening",   order_index: 10 },
  { label: "Dormir",     keyword: "dormir",      category: "evening",   order_index: 11 },
]

export async function GET(req: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const childId = searchParams.get("childId")
  if (!childId) return NextResponse.json({ error: "childId required" }, { status: 400 })

  let { data: agenda } = await supabase
    .from("visual_agendas")
    .select("*")
    .eq("child_id", childId)
    .eq("is_active", true)
    .single()

  if (!agenda) {
    const { data: newAgenda, error } = await supabase
      .from("visual_agendas")
      .insert({ child_id: childId, name: "Mi Agenda" })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    agenda = newAgenda

    await supabase.from("agenda_tasks").insert(
      DEFAULT_TASKS.map(t => ({ ...t, agenda_id: agenda!.id }))
    )
  }

  const { data: tasks } = await supabase
    .from("agenda_tasks")
    .select("*")
    .eq("agenda_id", agenda.id)
    .order("order_index")

  return NextResponse.json({ agenda, tasks: tasks ?? [] })
}

export async function POST(req: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { childId, name } = body

  const { data, error } = await supabase
    .from("visual_agendas")
    .insert({ child_id: childId, name: name ?? "Mi Agenda" })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
