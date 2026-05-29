'use client'

import type { CurriculumArea, CurriculumModule, CurriculumExercise, ChildModuleProgress, ChildExerciseProgress } from '@/types/curriculum'
import { useSupabase } from '@/components/layout/SupabaseProvider'
import { useEffect, useState } from 'react'
import type { Lesson, FamilyResource, ChildProgress, ChildProfile, ForumCategory, ForumPost, ForumReply, CommunityEvent, SupportGroup } from '@/types'


export function useLessons(ageRange?: string, teaLevel?: number) {
  const { supabase } = useSupabase()
  const [data, setData] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let query = supabase.from('lessons').select('*')
    if (ageRange) query = query.eq('age_range', ageRange)
    if (teaLevel) query = query.eq('tea_level', teaLevel)
    query.order('order_index').then(({ data }) => {
      setData(data as Lesson[] ?? [])
      setLoading(false)
    })
  }, [ageRange, teaLevel])

  return { lessons: data, loading }
}

export function useResources() {
  const { supabase } = useSupabase()
  const [data, setData] = useState<FamilyResource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('family_resources').select('*').order('order').then(({ data }) => {
      setData(data as FamilyResource[] ?? [])
      setLoading(false)
    })
  }, [])

  return { resources: data, loading }
}

export function useChildren() {
  const { supabase, profile } = useSupabase()
  const [data, setData] = useState<ChildProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    supabase.from('children').select('*').eq('profile_id', profile.id).then(({ data }) => {
      setData(data as ChildProfile[] ?? [])
      setLoading(false)
    })
  }, [profile])

  return { children: data, loading }
}

export function useProgress(childId?: string) {
  const { supabase } = useSupabase()
  const [data, setData] = useState<ChildProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!childId) return
    supabase.from('child_progress').select('*').eq('child_id', childId).then(({ data }) => {
      setData(data as ChildProgress[] ?? [])
      setLoading(false)
    })
  }, [childId])

  return { progress: data, loading }
}

export function useStreak(childId?: string) {
  const { supabase } = useSupabase()
  const [streak, setStreak] = useState({ current: 0, longest: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!childId) return
    supabase.from('streaks').select('current_streak, longest_streak').eq('child_id', childId).maybeSingle().then(({ data }) => {
      if (data) setStreak({ current: data.current_streak, longest: data.longest_streak })
      setLoading(false)
    })
  }, [childId])

  return { streak, loading }
}

export function useForumCategories() {
  const { supabase } = useSupabase()
  const [data, setData] = useState<ForumCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('forum_categories').select('*').order('order').then(({ data }) => {
      setData(data as ForumCategory[] ?? [])
      setLoading(false)
    })
  }, [])

  return { categories: data, loading }
}

export function useForumPosts(categorySlug?: string) {
  const { supabase } = useSupabase()
  const [data, setData] = useState<ForumPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let query = supabase.from('forum_posts').select('*')
    if (categorySlug) {
      query = query.eq('forum_categories.slug', categorySlug)
    }
    query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).then(({ data }) => {
      setData(data as ForumPost[] ?? [])
      setLoading(false)
    })
  }, [categorySlug])

  return { posts: data, loading }
}

export function useForumReplies(postId?: string) {
  const { supabase } = useSupabase()
  const [data, setData] = useState<ForumReply[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!postId) return
    supabase.from('forum_replies').select('*').eq('post_id', postId).order('created_at').then(({ data }) => {
      setData(data as ForumReply[] ?? [])
      setLoading(false)
    })
  }, [postId])

  return { replies: data, loading }
}

export function useEvents() {
  const { supabase } = useSupabase()
  const [data, setData] = useState<CommunityEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('community_events').select('*').gte('event_date', new Date().toISOString().split('T')[0]).order('event_date').then(({ data }) => {
      setData(data as CommunityEvent[] ?? [])
      setLoading(false)
    })
  }, [])

  return { events: data, loading }
}

export function useSupportGroups() {
  const { supabase } = useSupabase()
  const [data, setData] = useState<SupportGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('support_groups').select('*').order('name').then(({ data }) => {
      setData(data as SupportGroup[] ?? [])
      setLoading(false)
    })
  }, [])

  return { groups: data, loading }
}

export function useTotalXp(childId?: string) {
  const { supabase } = useSupabase()
  const [xp, setXp] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!childId) return
    supabase.from('child_progress').select('xp_earned').eq('child_id', childId).then(({ data }) => {
      const total = (data ?? []).reduce((sum, p) => sum + (p.xp_earned ?? 0), 0)
      setXp(total)
      setLoading(false)
    })
  }, [childId])

  return { xp, loading }
}

// Hook para Ã¡reas del currÃ­culo
export function useCurriculumAreas(ageRange?: string) {
  const { supabase } = useSupabase()
  const [data, setData] = useState<CurriculumArea[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let query = supabase.from('curriculum_areas').select('*')
    if (ageRange) query = query.eq('age_range', ageRange)
    query.order('order_index').then(({ data }) => {
      setData(data as CurriculumArea[] ?? [])
      setLoading(false)
    })
  }, [ageRange, supabase])

  return { areas: data, loading }
}

// Hook para mÃ³dulos de un Ã¡rea
export function useCurriculumModules(areaId?: string) {
  const { supabase } = useSupabase()
  const [data, setData] = useState<CurriculumModule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!areaId) return
    supabase
      .from('curriculum_modules')
      .select('*')
      .eq('area_id', areaId)
      .order('order_index')
      .then(({ data }) => {
        setData(data as CurriculumModule[] ?? [])
        setLoading(false)
      })
  }, [areaId, supabase])

  return { modules: data, loading }
}

// Hook para ejercicios de un mÃ³dulo
export function useCurriculumExercises(moduleId?: string) {
  const { supabase } = useSupabase()
  const [data, setData] = useState<CurriculumExercise[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!moduleId) return
    supabase
      .from('curriculum_exercises')
      .select('*')
      .eq('module_id', moduleId)
      .order('order_index')
      .then(({ data }) => {
        setData(data as CurriculumExercise[] ?? [])
        setLoading(false)
      })
  }, [moduleId, supabase])

  return { exercises: data, loading }
}

// Hook para progreso de mÃ³dulos
export function useModuleProgress(childId?: string, moduleId?: string) {
  const { supabase } = useSupabase()
  const [data, setData] = useState<ChildModuleProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!childId) return
    let query = supabase.from('child_module_progress').select('*').eq('child_id', childId)
    if (moduleId) query = query.eq('module_id', moduleId)
    query.then(({ data }) => {
      setData(data as ChildModuleProgress[] ?? [])
      setLoading(false)
    })
  }, [childId, moduleId, supabase])

  return { moduleProgress: data, loading }
}

// Hook para progreso de ejercicios
export function useExerciseProgress(childId?: string, exerciseId?: string) {
  const { supabase } = useSupabase()
  const [data, setData] = useState<ChildExerciseProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!childId) return
    let query = supabase.from('child_exercise_progress').select('*').eq('child_id', childId)
    if (exerciseId) query = query.eq('exercise_id', exerciseId)
    query.then(({ data }) => {
      setData(data as ChildExerciseProgress[] ?? [])
      setLoading(false)
    })
  }, [childId, exerciseId, supabase])

  return { exerciseProgress: data, loading }
}


// Hook para modulos por age_range (vista Duolingo)
export function useCurriculumModulesByAge(ageRange?: string) {
  const { supabase } = useSupabase()
  const [data, setData] = useState<CurriculumModule[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!ageRange) return
    supabase
      .from('curriculum_modules')
      .select('*')
      .eq('age_range', ageRange)
      .order('order_index')
      .then(({ data }) => {
        setData(data as CurriculumModule[] ?? [])
        setLoading(false)
      })
  }, [ageRange, supabase])
  return { modules: data, loading }
}

export function useCurriculumAreasFull(ageRange?: string) {
  const { supabase } = useSupabase()
  const [areas, setAreas] = useState<CurriculumArea[]>([])
  const [modulesByArea, setModulesByArea] = useState<Record<string, CurriculumModule[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ageRange) return
    supabase
      .from('curriculum_areas')
      .select('*, curriculum_modules(*)')
      .eq('age_range', ageRange)
      .order('order_index')
      .then(({ data, error }) => {
        if (error || !data) {
          setLoading(false)
          return
        }
        const map: Record<string, CurriculumModule[]> = {}
        data.forEach((area: any) => {
          map[area.id] = (area.curriculum_modules ?? []).sort(
            (a: CurriculumModule, b: CurriculumModule) => a.order_index - b.order_index
          )
        })
        setAreas(data)
        setModulesByArea(map)
        setLoading(false)
      })
  }, [ageRange, supabase])

  return { areas, modulesByArea, loading }
}