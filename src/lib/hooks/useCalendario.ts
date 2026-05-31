'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { CalendarEvent } from '@/types'

interface UseCalendarioReturn {
  events: CalendarEvent[]
  loading: boolean
  error: string | null
  addEvent: (data: Partial<CalendarEvent> & { title: string }) => Promise<string | null>
  updateEvent: (eventId: string, childId: string, updates: Partial<CalendarEvent>) => Promise<string | null>
  deleteEvent: (eventId: string, childId: string) => Promise<string | null>
  moveEvent: (eventId: string, childId: string, newDate: string) => Promise<string | null>
  clearError: () => void
}

export function useCalendario(childId: string | null, year?: number, month?: number): UseCalendarioReturn {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!childId || !year || !month) {
      setLoading(false)
      setEvents([])
      return
    }
    setError(null)
    setLoading(true)
    const abort = new AbortController()
    fetch(`/api/calendario?childId=${childId}&year=${year}&month=${month}`, { signal: abort.signal })
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setEvents(data.events)
      })
      .catch(e => {
        if (e.name !== 'AbortError') setError(e.message)
      })
      .finally(() => setLoading(false))
    return () => abort.abort()
  }, [childId, year, month])

  const addEvent = useCallback(async (data: Partial<CalendarEvent> & { title: string }) => {
    setError(null)
    const res = await fetch('/api/calendario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = await res.json()
    if (result.error) { setError(result.error); return null }
    setEvents(prev => [...prev, result])
    return result.id
  }, [])

  const updateEvent = useCallback(async (eventId: string, childId: string, updates: Partial<CalendarEvent>) => {
    setError(null)
    const prev = events.find(e => e.id === eventId)
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, ...updates } : e))
    const res = await fetch('/api/calendario/events', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, childId, ...updates }),
    })
    if (!res.ok) {
      if (prev) setEvents(events => events.map(e => e.id === eventId ? prev : e))
      const text = await res.text()
      setError(text)
      return text
    }
    return null
  }, [events])

  const deleteEvent = useCallback(async (eventId: string, childId: string) => {
    setError(null)
    const prev = events.find(e => e.id === eventId)
    setEvents(prev => prev.filter(e => e.id !== eventId))
    const res = await fetch(`/api/calendario/events?eventId=${eventId}&childId=${childId}`, { method: 'DELETE' })
    if (!res.ok) {
      if (prev) setEvents(events => [...events, prev])
      const text = await res.text()
      setError(text)
      return text
    }
    return null
  }, [events])

  const moveEvent = useCallback(async (eventId: string, childId: string, newDate: string) => {
    setError(null)
    const prev = events.find(e => e.id === eventId)
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, event_date: newDate } : e))
    const res = await fetch('/api/calendario/events', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, childId, event_date: newDate }),
    })
    if (!res.ok) {
      if (prev) setEvents(events => events.map(e => e.id === eventId ? prev : e))
      const text = await res.text()
      setError(text)
      return text
    }
    return null
  }, [events])

  const clearError = useCallback(() => setError(null), [])

  return { events, loading, error, addEvent, updateEvent, deleteEvent, moveEvent, clearError }
}
