import { useState, useCallback, useEffect, useRef } from 'react'

export type TaskCategory = 'morning' | 'afternoon' | 'evening'

export interface AgendaTask {
  id: string
  agenda_id: string
  label: string
  keyword: string
  category: TaskCategory
  order_index: number
  done: boolean
  done_at: string | null
  timer_seconds: number
  reward: string
  audio_data: string | null
  use_tts: boolean
  audio_label: string
}

export interface Agenda {
  id: string
  child_id: string
  name: string
}

interface UseAgendaReturn {
  agenda: Agenda | null
  tasks: AgendaTask[]
  loading: boolean
  error: string | null
  toggleDone: (taskId: string) => Promise<void>
  addTask: (task: Pick<AgendaTask, 'label' | 'keyword' | 'category'> & { timer_seconds?: number; reward?: string }) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  reorderTasks: (newTasks: AgendaTask[]) => Promise<void>
  resetAll: () => Promise<void>
  updateTimerDuration: (taskId: string, seconds: number) => Promise<void>
  updateReward: (taskId: string, reward: string) => Promise<void>
  updateAudio: (taskId: string, audio_data: string | null) => Promise<void>
  updateUseTts: (taskId: string, use_tts: boolean) => Promise<void>
  updateAudioLabel: (taskId: string, label: string) => Promise<void>
}

export function useAgenda(childId: string | null): UseAgendaReturn {
  const [agenda, setAgenda] = useState<Agenda | null>(null)
  const [tasks, setTasks] = useState<AgendaTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!childId) { setLoading(false); return }
    fetch(`/api/agenda?childId=${childId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setAgenda(data.agenda)
        setTasks(data.tasks)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [childId])

  const toggleDone = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    const newDone = !task.done
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: newDone } : t))
    const res = await fetch('/api/agenda/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, done: newDone }),
    })
    if (!res.ok) console.error('toggleDone failed:', await res.text())
  }, [tasks])

  const addTask = useCallback(async (newTask: Pick<AgendaTask, 'label' | 'keyword' | 'category'> & { timer_seconds?: number; reward?: string }) => {
    if (!agenda) return
    const order_index = tasks.length
    const res = await fetch('/api/agenda/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agendaId: agenda.id, ...newTask, order_index }),
    })
    const data = await res.json()
    if (!data.error) setTasks(prev => [...prev, data])
  }, [agenda, tasks.length])

  const deleteTask = useCallback(async (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
    await fetch(`/api/agenda/tasks?taskId=${taskId}`, { method: 'DELETE' })
  }, [])

  const reorderTasks = useCallback(async (newTasks: AgendaTask[]) => {
    const reindexed = newTasks.map((t, i) => ({ ...t, order_index: i }))
    setTasks(reindexed)
    await fetch('/api/agenda/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks: reindexed.map(({ id, order_index }) => ({ id, order_index })) }),
    })
  }, [])

  const resetAll = useCallback(async () => {
    if (!agenda) return
    setTasks(prev => prev.map(t => ({ ...t, done: false, done_at: null, timer_seconds: 0 })))
    await fetch('/api/agenda/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agendaId: agenda.id }),
    })
  }, [agenda])

  const updateTimerDuration = useCallback(async (taskId: string, seconds: number) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, timer_seconds: seconds } : t))
    await fetch('/api/agenda/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, timer_seconds: seconds }),
    })
  }, [])

  const updateReward = useCallback(async (taskId: string, reward: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, reward } : t))
    const res = await fetch('/api/agenda/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, reward }),
    })
    if (!res.ok) console.error('updateReward failed:', await res.text())
  }, [])

  const updateAudio = useCallback(async (taskId: string, audio_data: string | null) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, audio_data, use_tts: false } : t))
    await fetch('/api/agenda/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, audio_data, use_tts: false }),
    })
  }, [])

  const updateUseTts = useCallback(async (taskId: string, use_tts: boolean) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, use_tts, audio_data: null } : t))
    await fetch('/api/agenda/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, use_tts, audio_data: null }),
    })
  }, [])

  const updateAudioLabel = useCallback(async (taskId: string, label: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, audio_label: label } : t))
    await fetch('/api/agenda/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, audio_label: label }),
    })
  }, [])

  return { agenda, tasks, loading, error, toggleDone, addTask, deleteTask, reorderTasks, resetAll, updateTimerDuration, updateReward, updateAudio, updateUseTts, updateAudioLabel }
}
