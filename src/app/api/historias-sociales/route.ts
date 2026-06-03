import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

async function checkChildAccess(supabase: Awaited<ReturnType<typeof createServerSupabase>>, childId: string, userId: string) {
  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", userId).maybeSingle()
  if (!profile) return false
  const { data: child } = await supabase.from("children").select("id").eq("id", childId).eq("profile_id", profile.id).maybeSingle()
  return !!child
}

export async function GET(req: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const childId = searchParams.get("childId")

  // Get all public stories with their pages
  const { data: stories, error: storiesError } = await supabase
    .from("social_stories")
    .select("id, slug, title, emoji, category, color, description, sort_order")
    .eq("is_public", true)
    .order("sort_order", { ascending: true })

  if (storiesError) {
    return NextResponse.json({ error: storiesError.message }, { status: 500 })
  }

  // Get pages for all stories
  const storyIds = (stories ?? []).map(s => s.id)
  const { data: pages, error: pagesError } = await supabase
    .from("story_pages")
    .select("id, story_id, page_number, text, keyword, emoji")
    .in("story_id", storyIds)
    .order("page_number", { ascending: true })

  if (pagesError) {
    return NextResponse.json({ error: pagesError.message }, { status: 500 })
  }

  // Group pages by story_id
  const pagesByStory: Record<string, typeof pages> = {}
  for (const p of pages ?? []) {
    if (!pagesByStory[p.story_id]) pagesByStory[p.story_id] = []
    pagesByStory[p.story_id].push(p)
  }

  // Get progress if childId provided
  let progressMap: Record<string, { current_page: number; is_completed: boolean; completed_at: string | null }> = {}
  if (childId && (await checkChildAccess(supabase, childId, user.id))) {
    const { data: progress } = await supabase
      .from("story_progress")
      .select("story_id, current_page, is_completed, completed_at")
      .eq("child_id", childId)
      .in("story_id", storyIds)

    for (const p of progress ?? []) {
      progressMap[p.story_id] = { current_page: p.current_page, is_completed: p.is_completed, completed_at: p.completed_at }
    }
  }

  const result = (stories ?? []).map(story => ({
    id: story.slug,
    title: story.title,
    description: story.description,
    emoji: story.emoji,
    category: story.category,
    color: story.color,
    pages: (pagesByStory[story.id] ?? []).map(p => ({
      text: p.text,
      keyword: p.keyword,
      emoji: p.emoji,
    })),
    progress: progressMap[story.id] ?? null,
  }))

  return NextResponse.json({ stories: result })
}
