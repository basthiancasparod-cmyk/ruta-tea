import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

async function checkChildAccess(supabase: Awaited<ReturnType<typeof createServerSupabase>>, childId: string, userId: string) {
  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", userId).maybeSingle()
  if (!profile) return false
  const { data: child } = await supabase.from("children").select("id").eq("id", childId).eq("profile_id", profile.id).maybeSingle()
  return !!child
}

export async function POST(req: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { storyId, childId } = body
  if (!storyId || !childId) {
    return NextResponse.json({ error: "storyId and childId required" }, { status: 400 })
  }

  if (!(await checkChildAccess(supabase, childId, user.id))) {
    return NextResponse.json({ error: "Child not found or access denied" }, { status: 404 })
  }

  // Resolve slug to UUID
  const { data: story } = await supabase
    .from("social_stories")
    .select("id")
    .eq("slug", storyId)
    .maybeSingle()

  if (!story) {
    return NextResponse.json({ error: "Story not found" }, { status: 404 })
  }

  // Upsert progress (mark as completed)
  const { data, error } = await supabase
    .from("story_progress")
    .upsert({
      story_id: story.id,
      child_id: childId,
      is_completed: true,
      completed_at: new Date().toISOString(),
    }, {
      onConflict: "story_id, child_id",
      ignoreDuplicates: false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
