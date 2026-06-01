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
      .then(async r => {
        if (!r.ok) throw new Error(`Error ${r.status}`)
        return r.json()
      })
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
    let prev: AgendaTask[] = []
    setTasks(current => { prev = current; return current.map(t => t.id === taskId ? { ...t, done: newDone } : t) })
    try {
      const res = await fetch('/api/agenda/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, done: newDone }),
      })
      if (!res.ok) throw new Error('Error al actualizar tarea')
    } catch (e) {
      setTasks(prev)
      console.error('toggleDone failed:', e)
    }
  }, [tasks])

  const addTask = useCallback(async (newTask: Pick<AgendaTask, 'label' | 'keyword' | 'category'> & { timer_seconds?: number; reward?: string }) => {
    if (!agenda) return
    const order_index = tasks.length
    try {
      const res = await fetch('/api/agenda/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agendaId: agenda.id, ...newTask, order_index }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Error ${res.status}`)
      }
      const data = await res.json()
      setTasks(prev => [...prev, data])
    } catch (e) {
      console.error('addTask failed:', e)
    }
  }, [agenda, tasks.length])

  const deleteTask = useCallback(async (taskId: string) => {
    let prev: AgendaTask[] = []
    setTasks(current => { prev = current; return current.filter(t => t.id !== taskId) })
    try {
      const res = await fetch(`/api/agenda/tasks?taskId=${taskId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar tarea')
    } catch (e) {
      setTasks(prev)
      console.error('deleteTask failed:', e)
    }
  }, [])

  const reorderTasks = useCallback(async (newTasks: AgendaTask[]) => {
    const reindexed = newTasks.map((t, i) => ({ ...t, order_index: i }))
    let prev: AgendaTask[] = []
    setTasks(current => { prev = current; return reindexed })
    try {
      const res = await fetch('/api/agenda/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: reindexed.map(({ id, order_index }) => ({ id, order_index })) }),
      })
      if (!res.ok) throw new Error('Error al reordenar')
    } catch (e) {
      setTasks(prev)
      console.error('reorderTasks failed:', e)
    }
  }, [])

  const resetAll = useCallback(async () => {
    if (!agenda) return
    let prev: AgendaTask[] = []
    setTasks(current => { prev = current; return current.map(t => ({ ...t, done: false, done_at: null, timer_seconds: 0 })) })
    try {
      const res = await fetch('/api/agenda/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agendaId: agenda.id }),
      })
      if (!res.ok) throw new Error('Error al reiniciar')
    } catch (e) {
      setTasks(prev)
      console.error('resetAll failed:', e)
    }
  }, [agenda])

  const updateTimerDuration = useCallback(async (taskId: string, seconds: number) => {
    let prev: AgendaTask[] = []
    setTasks(current => { prev = current; return current.map(t => t.id === taskId ? { ...t, timer_seconds: seconds } : t) })
    try {
      const res = await fetch('/api/agenda/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, timer_seconds: seconds }),
      })
      if (!res.ok) throw new Error('Error al actualizar tiempo')
    } catch (e) {
      setTasks(prev)
      console.error('updateTimerDuration failed:', e)
    }
  }, [])

  const updateReward = useCallback(async (taskId: string, reward: string) => {
    let prev: AgendaTask[] = []
    setTasks(current => { prev = current; return current.map(t => t.id === taskId ? { ...t, reward } : t) })
    try {
      const res = await fetch('/api/agenda/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, reward }),
      })
      if (!res.ok) throw new Error('Error al actualizar recompensa')
    } catch (e) {
      setTasks(prev)
      console.error('updateReward failed:', e)
    }
  }, [])

  const updateAudio = useCallback(async (taskId: string, audio_data: string | null) => {
    let prev: AgendaTask[] = []
    setTasks(current => { prev = current; return current.map(t => t.id === taskId ? { ...t, audio_data, use_tts: false } : t) })
    try {
      const res = await fetch('/api/agenda/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, audio_data, use_tts: false }),
      })
      if (!res.ok) throw new Error('Error al actualizar audio')
    } catch (e) {
      setTasks(prev)
      console.error('updateAudio failed:', e)
    }
  }, [])

  const updateUseTts = useCallback(async (taskId: string, use_tts: boolean) => {
    let prev: AgendaTask[] = []
    setTasks(current => { prev = current; return current.map(t => t.id === taskId ? { ...t, use_tts, audio_data: null } : t) })
    try {
      const res = await fetch('/api/agenda/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, use_tts, audio_data: null }),
      })
      if (!res.ok) throw new Error('Error al actualizar TTS')
    } catch (e) {
      setTasks(prev)
      console.error('updateUseTts failed:', e)
    }
  }, [])

  const updateAudioLabel = useCallback(async (taskId: string, label: string) => {
    let prev: AgendaTask[] = []
    setTasks(current => { prev = current; return current.map(t => t.id === taskId ? { ...t, audio_label: label } : t) })
    try {
      const res = await fetch('/api/agenda/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, audio_label: label }),
      })
      if (!res.ok) throw new Error('Error al actualizar etiqueta')
    } catch (e) {
      setTasks(prev)
      console.error('updateAudioLabel failed:', e)
    }
  }, [])

  return { agenda, tasks, loading, error, toggleDone, addTask, deleteTask, reorderTasks, resetAll, updateTimerDuration, updateReward, updateAudio, updateUseTts, updateAudioLabel }
}
