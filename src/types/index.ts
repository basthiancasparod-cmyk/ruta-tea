export type TeaLevel = 1 | 2 | 3

export type AgeRange = '0-2' | '3-5' | '6-10' | '11-14'

export type TherapyType =
  | 'aba'
  | 'teacch'
  | 'esdm'
  | 'speech'
  | 'occupational'
  | 'social'
  | 'cognitive'
  | 'play'
  | 'sensory'
  | 'pecs'

export type LessonStatus = 'locked' | 'available' | 'completed'

export interface ChildProfile {
  id: string
  profile_id: string
  name: string
  birth_date: string
  tea_level: TeaLevel
  age_range: AgeRange
  interests: string[]
  sensory_sensitivities: string[]
  avatar_pictogram: string
  avatar_url?: string | null
  speech_config?: Record<string, unknown>
  created_at: string
}

export interface Lesson {
  id: string
  title: string
  description: string
  age_range: AgeRange
  tea_level: TeaLevel
  therapy_type: TherapyType
  order_index: number
  content: LessonContent
  xp_reward: number
}

export interface LessonContent {
  instructions: string
  type: 'pictogram_match' | 'emotion_select' | 'imitation' | 'sequence' | 'attention' | 'vocabulary'
  data: Record<string, unknown>
}

export interface ChildProgress {
  id: string
  child_id: string
  lesson_id: string
  completed: boolean
  xp_earned: number
  attempts: number
  stars: number
  last_played_at: string
}

export interface FamilyResource {
  id: string
  category: 'understanding_tea' | 'daily_life' | 'emotional_support' | 'first_steps' | 'downloads'
  title: string
  content: string
  icon: string
  downloadable_url?: string
}

export type Profile = {
  id: string
  user_id: string
  name: string
  role: 'parent' | 'professional'
  avatar_url: string
}

// Community types
export interface ForumCategory {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  post_count: number
  order: number
  created_at: string
}

export interface ForumPost {
  id: string
  category_id: string
  author_id: string
  title: string
  content: string
  is_pinned: boolean
  reply_count: number
  created_at: string
  updated_at: string
}

export interface ForumReply {
  id: string
  post_id: string
  author_id: string
  content: string
  created_at: string
}

export interface CommunityEvent {
  id: string
  title: string
  description: string
  event_date: string
  event_time: string
  location: string
  is_online: boolean
  link: string
  organizer: string
  created_at: string
}

export interface SupportGroup {
  id: string
  name: string
  description: string
  schedule: string
  location: string
  contact: string
  focus: string
  icon: string
  created_at: string
}

// ... código existente ...
export * from './curriculum'
export * from './caa'

export * from './caa'
