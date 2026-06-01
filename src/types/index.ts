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
export type RepeatType = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly'

export interface RepeatConfig {
  days?: number[]        // 0=Sun..6=Sat for weekly
  interval?: number      // every N weeks (biweekly = 2)
  monthDay?: number      // day of month for monthly
  endDate?: string       // optional end date YYYY-MM-DD
  occurrences?: number   // optional max occurrences
}

export type EventCategory = 'general' | 'terapia' | 'escuela' | 'medico' | 'juego' | 'comida' | 'social' | 'transporte'

export interface CalendarEvent {
  id: string
  child_id: string
  title: string
  description?: string
  event_date: string
  event_time?: string | null
  end_time?: string | null
  all_day: boolean
  repeat_type: RepeatType
  category: EventCategory
  repeat_config?: RepeatConfig | null
  created_at: string
  updated_at: string
}

export interface TokenSession {
  id: string
  child_id: string
  reward_text: string
  reward_emoji: string
  total_tokens: number
  earned_tokens: number
  is_completed: boolean
  session_date: string
  created_at: string
  updated_at: string
}

export type BehaviorType = 'positive' | 'challenging' | 'neutral'

export interface BehaviorLog {
  id: string
  child_id: string
  behavior_type: BehaviorType
  category?: string
  intensity?: number | null
  description: string
  antecedent?: string
  consequence?: string
  mood_before?: number | null
  mood_after?: number | null
  image_url?: string | null
  logged_at: string
  created_at: string
}

export interface FirstThenSession {
  id: string
  board_id: string
  child_id: string
  first_duration_seconds: number | null
  then_duration_seconds: number | null
  completed_at: string
}

export interface FirstThenBoard {
  id: string
  child_id: string
  title: string
  first_label: string
  first_emoji: string
  first_minutes: number | null
  then_label: string
  then_emoji: string
  then_minutes: number | null
  sort_order: number
  is_favorite: boolean
  last_used_at: string | null
  created_at: string
  updated_at: string
}

export type BehaviorCategory = {
  id: string
  label: string
  emoji: string
  type: BehaviorType
  color: string
}

export * from './curriculum'
export * from './caa'
