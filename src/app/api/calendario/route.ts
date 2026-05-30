import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

export async function GET(req: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const childId = searchParams.get("childId")
  const year = searchParams.get("year")
  const month = searchParams.get("month")

  if (!childId || !year || !month) {
    return NextResponse.json({ error: "childId, year, and month required" }, { status: 400 })
  }

  const startDate = `${year}-${month.padStart(2, "0")}-01`
  const endYear = Number(month) === 12 ? Number(year) + 1 : Number(year)
  const endMonth = Number(month) === 12 ? 1 : Number(month) + 1
  const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`

  const { data: events } = await supabase
    .from("calendar_events")
    .select("*")
    .eq("child_id", childId)
    .gte("event_date", startDate)
    .lt("event_date", endDate)
    .order("event_date")
    .order("event_time")

  return NextResponse.json({ events: events ?? [] })
}

export async function POST(req: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { childId, title } = body
  if (!childId || !title) {
    return NextResponse.json({ error: "childId and title required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("calendar_events")
    .insert({
      child_id: childId,
      title,
      event_date: body.event_date ?? new Date().toISOString().split("T")[0],
      description: body.description ?? "",
      event_time: body.event_time ?? null,
      end_time: body.end_time ?? null,
      all_day: body.all_day ?? true,
      repeat_type: body.repeat_type ?? "none",
      category: body.category ?? "general",
      repeat_config: body.repeat_config ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
