import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createServerSupabase()
  const { searchParams } = new URL(request.url)
  const childId = searchParams.get('child_id')

  if (!childId) return NextResponse.json({ error: 'child_id required' }, { status: 400 })

  const { data, error } = await supabase
    .from('child_progress')
    .select('*')
    .eq('child_id', childId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createServerSupabase()
  const body = await request.json()

  const { data, error } = await supabase
    .from('child_progress')
    .upsert(body, { onConflict: 'child_id,lesson_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
