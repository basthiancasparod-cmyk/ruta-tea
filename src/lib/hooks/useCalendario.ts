'use client'

import { useState, useCallback, useEffect } from 'react'
import type { CalendarEvent } from '@/types'

interface UseCalendarioReturn {
  events: CalendarEvent[]
  loading: boolean
  error: string | null
  addEvent: (data: Partial<CalendarEvent> & { title: string }) => Promise<void>
  updateEvent: (eventId: string, updates: Partial<CalendarEvent>) => Promise<void>
  deleteEvent: (eventId: string) => Promise<void>
  moveEvent: (eventId: string, newDate: string) => Promise<void>
}

export function useCalendario(childId: string | null, year?: number, month?: number): UseCalendarioReturn {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!childId || !year || !month) {
      setLoading(false)
      return
    }
    setLoading(true)
    fetch(`/api/calendario?childId=${childId}&year=${year}&month=${month}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setEvents(data.events)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [childId, year, month])

  const addEvent = useCallback(async (data: Partial<CalendarEvent> & { title: string }) => {
    const res = await fetch('/api/calendario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = await res.json()
    if (result.error) throw new Error(result.error)
    setEvents(prev => [...prev, result])
  }, [])

  const updateEvent = useCallback(async (eventId: string, updates: Partial<CalendarEvent>) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, ...updates } : e))
    const res = await fetch('/api/calendario/events', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, ...updates }),
    })
    if (!res.ok) console.error('updateEvent failed:', await res.text())
  }, [])

  const deleteEvent = useCallback(async (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId))
    await fetch(`/api/calendario/events?eventId=${eventId}`, { method: 'DELETE' })
  }, [])

  const moveEvent = useCallback(async (eventId: string, newDate: string) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, event_date: newDate } : e))
    const res = await fetch('/api/calendario/events', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, event_date: newDate }),
    })
    if (!res.ok) console.error('moveEvent failed:', await res.text())
  }, [])

  return { events, loading, error, addEvent, updateEvent, deleteEvent, moveEvent }
}
