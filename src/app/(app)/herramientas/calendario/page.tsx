'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, addMonths, subMonths, isSameMonth, isToday,
  isSameDay, addWeeks, subWeeks, getHours, parseISO
} from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/Button'
import { useChildren } from '@/lib/hooks/useData'
import { useCalendario } from '@/lib/hooks/useCalendario'
import type { CalendarEvent, EventCategory, RepeatConfig, RepeatType } from '@/types'

type ViewMode = 'month' | 'week'

const CATEGORIES: { id: EventCategory; label: string; emoji: string; color: string }[] = [
  { id: 'general',  label: 'General',  emoji: '📌', color: '#44B39D' },
  { id: 'terapia',  label: 'Terapia',  emoji: '🧩', color: '#8B5CF6' },
  { id: 'escuela',  label: 'Escuela',  emoji: '📚', color: '#4FC3F7' },
  { id: 'medico',   label: 'Médico',   emoji: '🏥', color: '#FF6B6B' },
  { id: 'juego',    label: 'Juego',    emoji: '🎮', color: '#6BCB77' },
  { id: 'comida',   label: 'Comida',   emoji: '🍎', color: '#FFB347' },
  { id: 'social',   label: 'Social',   emoji: '👥', color: '#FF8A65' },
  { id: 'transporte', label: 'Viaje',  emoji: '🚗', color: '#AED581' },
]

const REPEAT_LABELS: Record<RepeatType, string> = {
  none: 'No repetir',
  daily: 'Cada día',
  weekly: 'Cada semana',
  biweekly: 'Cada 2 semanas',
  monthly: 'Cada mes',
}

const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7)

function CalendarPage() {
  const router = useRouter()
  const { children } = useChildren()
  const child = children[0]
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showEventModal, setShowEventModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [modalDate, setModalDate] = useState('')
  const [dragOverDate, setDragOverDate] = useState<string | null>(null)
  const [dragEventId, setDragEventId] = useState<string | null>(null)
  const [showYearPicker, setShowYearPicker] = useState(false)
  const [filterCategory, setFilterCategory] = useState<EventCategory | 'all'>('all')
  const gridRef = useRef<HTMLDivElement>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1
  const { events, loading, error, addEvent, updateEvent, deleteEvent, moveEvent } = useCalendario(child?.id ?? null, year, month)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const weekDays = eachDayOfInterval({ start: startOfWeek(currentDate, { weekStartsOn: 1 }), end: endOfWeek(currentDate, { weekStartsOn: 1 }) })

  const visibleEvents = viewMode === 'month'
    ? events.filter(e => {
        const d = parseISO(e.event_date)
        return d >= monthStart && d <= monthEnd
      })
    : events.filter(e => {
        const d = parseISO(e.event_date)
        return d >= weekDays[0] && d <= weekDays[weekDays.length - 1]
      })

  const filteredEvents = filterCategory === 'all'
    ? visibleEvents
    : visibleEvents.filter(e => e.category === filterCategory)

  const groupedEvents: Record<string, CalendarEvent[]> = {}
  filteredEvents.forEach(e => {
    if (!groupedEvents[e.event_date]) groupedEvents[e.event_date] = []
    groupedEvents[e.event_date].push(e)
  })
  const sortedDates = Object.keys(groupedEvents).sort()

  const nextEvent = filteredEvents
    .filter(e => parseISO(e.event_date) >= new Date(new Date().toDateString()))
    .sort((a, b) => parseISO(a.event_date).getTime() - parseISO(b.event_date).getTime())[0]
  const daysUntilNext = nextEvent
    ? Math.round((parseISO(nextEvent.event_date).getTime() - new Date(new Date().toDateString()).getTime()) / 86400000)
    : null

  const prevPeriod = () => {
    setCurrentDate(viewMode === 'month' ? subMonths(currentDate, 1) : subWeeks(currentDate, 1))
  }
  const nextPeriod = () => {
    setCurrentDate(viewMode === 'month' ? addMonths(currentDate, 1) : addWeeks(currentDate, 1))
  }
  const goToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const selectDay = (day: Date) => {
    setSelectedDate(day)
    openCreateEvent(day)
  }

  const openCreateEvent = (date: Date) => {
    setEditingEvent(null)
    setModalDate(format(date, 'yyyy-MM-dd'))
    setShowEventModal(true)
  }

  const openEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event)
    setModalDate(event.event_date)
    setShowEventModal(true)
  }

  const handleDragStart = (eid: string) => {
    setDragEventId(eid)
  }

  const handleDragOver = (dateStr: string) => {
    setDragOverDate(dateStr)
  }

  const handleDrop = async (targetDate: string) => {
    if (dragEventId && dragOverDate) {
      await moveEvent(dragEventId, targetDate)
    }
    setDragEventId(null)
    setDragOverDate(null)
  }

  const handleSaveEvent = async (data: {
    title: string; description: string;
    all_day: boolean; event_time: string | null;
    category: EventCategory; repeat_type: RepeatType; repeat_config?: RepeatConfig | null
  }) => {
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, {
          ...data,
          event_date: modalDate,
          event_time: data.event_time || null,
          end_time: null,
          repeat_config: data.repeat_config ?? null,
        })
      } else {
        await addEvent({
          child_id: child!.id,
          title: data.title,
          description: data.description,
          all_day: data.all_day,
          event_time: data.event_time || null,
          end_time: null,
          event_date: modalDate,
          repeat_type: data.repeat_type,
          category: data.category,
          repeat_config: data.repeat_config ?? null,
        })
      }
      setShowEventModal(false)
    } catch (err) {
      console.error('Error saving event:', err)
    }
  }

  const handleDeleteEvent = async () => {
    if (editingEvent) {
      await deleteEvent(editingEvent.id)
      setShowEventModal(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>← Atrás</Button>
        <div>
          <h1 className="heading-page">Calendario</h1>
          <p className="text-body">Organiza tus actividades del mes</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <img src="/assets/dino-modulo-calendario.png" alt="Dino calendario" className="w-16 h-16 object-contain" />
        <p className="text-base font-bold text-text-primary text-center">¿Qué hacemos hoy?</p>
        {!loading && nextEvent && (
          <p className="text-xs font-bold text-text-muted bg-brand-bg/50 px-3 py-1 rounded-full">
            {daysUntilNext === 0
              ? '🚀 ¡Hoy hay un evento!'
              : `⏳ Faltan ${daysUntilNext} ${daysUntilNext === 1 ? 'día' : 'días'} para: ${nextEvent.title}`
            }
          </p>
        )}
      </div>

      {!loading && !error && events.length === 0 ? (
        <div className="bg-surface rounded-2xl shadow-md border border-border p-8 text-center">
          <div className="text-5xl mb-3">🦕</div>
          <p className="heading-section mb-2">¡Bienvenido al calendario!</p>
          <p className="text-body mb-4">Aquí podrás organizar todas tus actividades, citas y rutinas.</p>
          <Button variant="primary" size="md" onClick={() => openCreateEvent(new Date())}>
            + Crear primer evento
          </Button>
        </div>
      ) : loading ? (
        <div className="bg-surface rounded-2xl shadow-md border border-border p-4">
          <div className="animate-pulse space-y-3">
            <div className="flex justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-surface-secondary rounded-lg" />
              <div className="w-8 h-8 bg-surface-secondary rounded-lg" />
              <div className="w-32 h-8 bg-surface-secondary rounded-lg" />
              <div className="w-8 h-8 bg-surface-secondary rounded-lg" />
              <div className="w-8 h-8 bg-surface-secondary rounded-lg" />
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-16 bg-surface-secondary rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
          <p className="text-sm font-bold text-red-600">Error al cargar eventos</p>
          <p className="text-xs text-red-500 mt-1">{error}</p>
          <button onClick={() => window.location.reload()}
            className="mt-2 px-4 py-1.5 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition-colors">
            Reintentar
          </button>
        </div>
      ) : (
      <div className="bg-surface rounded-2xl shadow-md overflow-hidden border border-border">
        <div className="bg-gradient-to-r from-brand/10 to-brand-bg/50 p-4 border-b border-border">
          {/* Fila principal: navegación entre meses */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={prevPeriod}>◀</Button>
            <span className="text-2xl">🦕</span>
            <div className="relative">
              <button onClick={() => setShowYearPicker(!showYearPicker)}
                className="heading-section capitalize hover:text-brand transition-colors">
                {format(currentDate, viewMode === 'month' ? 'MMMM yyyy' : "'Semana del' d 'de' MMMM", { locale: es })}
              </button>
              <AnimatePresence>
                {showYearPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-xl border-2 border-border shadow-lg p-3 z-[70] w-64"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <button type="button" onClick={() => setCurrentDate(subMonths(currentDate, 12))}
                        className="text-xs font-bold text-text-secondary hover:text-brand transition-colors p-1">◀◀</button>
                      <div className="flex items-center gap-1">
                        <input type="text" inputMode="numeric" value={currentDate.getFullYear()}
                          onChange={(e) => { const v = e.target.value; if (/^\d{0,4}$/.test(v)) { const y = parseInt(v); if (v.length === 4 && y >= 2024 && y <= 2099) setCurrentDate(new Date(y, currentDate.getMonth(), 1)) } }}
                          className="w-16 text-center text-sm font-extrabold text-text-primary bg-surface-secondary rounded-lg px-2 py-1 border border-border focus:border-brand focus:outline-none" />
                      </div>
                      <button type="button" onClick={() => setCurrentDate(addMonths(currentDate, 12))}
                        className="text-xs font-bold text-text-secondary hover:text-brand transition-colors p-1">▶▶</button>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {Array.from({ length: 12 }, (_, i) => {
                        const mDate = new Date(currentDate.getFullYear(), i, 1)
                        const isCurrent = i === currentDate.getMonth()
                        const hasEvent = events.some(e => parseISO(e.event_date).getMonth() === i && parseISO(e.event_date).getFullYear() === currentDate.getFullYear())
                        return (
                          <button key={i} type="button" onClick={() => { setCurrentDate(mDate); setShowYearPicker(false) }}
                            className={`relative px-2 py-1.5 rounded-lg text-xs font-bold transition-colors ${isCurrent ? 'bg-brand text-white' : 'text-text-secondary hover:bg-brand-bg hover:text-brand'}`}>
                            {format(mDate, 'MMM', { locale: es })}
                            {hasEvent && !isCurrent && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-brand" />}
                          </button>
                        )
                      })}
                    </div>
                    {/* Mini-calendario del mes actual */}
                    <div className="mt-3 pt-2 border-t border-border">
                      <div className="grid grid-cols-7 gap-0 mb-1">
                        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                          <div key={d} className="text-center text-[9px] font-bold text-text-muted">{d}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-0">
                        {(() => {
                          const mcStart = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 })
                          const mcEnd = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 })
                          return eachDayOfInterval({ start: mcStart, end: mcEnd }).map((d, i) => {
                            const isCurrentMonth = d.getMonth() === currentDate.getMonth()
                            const isSelected = isSameDay(d, currentDate)
                            const isTodayDate = isToday(d)
                            return (
                              <button key={i} type="button" onClick={() => { setCurrentDate(d); setShowYearPicker(false) }}
                                className={`text-center py-0.5 text-[10px] font-bold rounded-sm transition-colors
                                  ${isSelected ? 'bg-brand text-white' : isTodayDate ? 'text-brand' : isCurrentMonth ? 'text-text-primary' : 'text-text-muted'}
                                  ${!isSelected && isCurrentMonth ? 'hover:bg-brand-bg' : ''}`}>
                                {format(d, 'd')}
                              </button>
                            )
                          })
                        })()}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Button variant="ghost" size="sm" onClick={nextPeriod}>▶</Button>
          </div>

          {/* Fila secundaria: acciones y vista */}
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={goToday}>📅 Hoy</Button>
            <div className="flex bg-surface-secondary rounded-xl p-0.5">
              <button onClick={() => setViewMode('month')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'month' ? 'bg-brand text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>
                Mes
              </button>
              <button onClick={() => setViewMode('week')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'week' ? 'bg-brand text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>
                Semana
              </button>
            </div>
          </div>

          {/* Filtro por categoría */}
          <div className="overflow-x-auto mt-3 -mx-4 px-4">
            <div className="flex gap-1.5 w-max">
            <button onClick={() => setFilterCategory('all')}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${filterCategory === 'all' ? 'bg-brand text-white shadow-sm' : 'bg-white/50 text-text-secondary hover:bg-white/80'}`}>
              Todas
            </button>
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setFilterCategory(cat.id)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 ${filterCategory === cat.id ? 'ring-2 ring-offset-1 text-white' : 'bg-white/50 text-text-secondary hover:bg-white/80'}`}
                style={filterCategory === cat.id ? { backgroundColor: cat.color } : undefined}>
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
        </div>

        {viewMode === 'month' ? (
          <div className="p-3">
            <div className="grid grid-cols-7 mb-1">
              {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map(d => (
                <div key={d} className="text-center text-xs font-bold text-text-muted py-1">{d}</div>
              ))}
            </div>
            <div ref={gridRef} className="grid grid-cols-7 gap-px bg-border/30 rounded-xl overflow-hidden">
              {days.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd')
                const dayEvents = events.filter(e => e.event_date === dateStr)
                const isCurrentMonth = isSameMonth(day, currentDate)
                const isTodayDate = isToday(day)
                const isSelected = isSameDay(day, selectedDate)
                const isDragOver = dragOverDate === dateStr

                return (
                  <div
                    key={dateStr}
                    tabIndex={0}
                    role="gridcell"
                    aria-label={format(day, "EEEE d 'de' MMMM yyyy", { locale: es })}
                    onClick={() => selectDay(day)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectDay(day) } }}
                    onDragOver={(e) => { e.preventDefault(); handleDragOver(dateStr) }}
                    onDragLeave={() => setDragOverDate(null)}
                    onDrop={(e) => { e.preventDefault(); handleDrop(dateStr) }}
                    className={`min-h-[80px] p-1.5 cursor-pointer transition-all relative
                      ${isCurrentMonth ? 'bg-surface' : 'bg-surface-secondary/50'}
                      ${isTodayDate ? 'ring-2 ring-brand ring-inset' : ''}
                      ${isSelected ? 'bg-brand-bg/30' : ''}
                      ${isDragOver ? 'bg-brand/10 scale-[1.02]' : ''}
                      hover:bg-brand-bg/20`
                    }
                  >
                    <span className={`text-xs font-bold ${isTodayDate ? 'text-brand' : isCurrentMonth ? 'text-text-primary' : 'text-text-muted'}`}>
                      {format(day, 'd')}
                    </span>
                    <div className="flex flex-col gap-0.5 mt-0.5">
                      {dayEvents.slice(0, 2).map(ev => (
                        <div
                          key={ev.id}
                          draggable
                          onDragStart={() => handleDragStart(ev.id)}
                          onClick={(e) => { e.stopPropagation(); openEditEvent(ev) }}
                          className="flex items-center gap-0.5 rounded-md px-1 py-0.5 cursor-grab active:cursor-grabbing truncate text-[10px] font-bold text-white leading-tight hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: CATEGORIES.find(c=>c.id===ev.category)?.color??'#44B39D' }}
                          title={ev.title}
                        >
                          <span className="shrink-0">{CATEGORIES.find(c=>c.id===ev.category)?.emoji??'📅'}</span>
                          <span className="truncate">{ev.title}</span>
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-[10px] font-bold text-text-muted pl-1">+{dayEvents.length - 2} más</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[700px] p-3">
              <div className="grid grid-cols-8 gap-px bg-border/30 rounded-xl overflow-hidden">
                <div className="bg-surface-secondary/50 p-1" />
                {weekDays.map(day => {
                  const dateStr = format(day, 'yyyy-MM-dd')
                  const isTodayDate = isToday(day)
                  return (
                    <div key={dateStr} className="bg-surface-secondary/50 p-1.5 text-center">
                      <div className="text-[10px] font-bold text-text-muted">{format(day, 'EEE', { locale: es })}</div>
                      <div className={`text-sm font-extrabold ${isTodayDate ? 'text-brand' : 'text-text-primary'}`}>
                        {format(day, 'd')}
                      </div>
                    </div>
                  )
                })}
                {HOURS.map(hour => (
                  <div key={hour} className="contents">
                    <div className="bg-surface-secondary/30 p-1 text-right pr-2 text-[10px] font-bold text-text-muted border-t border-border/20">
                      {`${hour.toString().padStart(2, '0')}:00`}
                    </div>
                    {weekDays.map(day => {
                      const dateStr = format(day, 'yyyy-MM-dd')
                      const cellEvents = events.filter(e =>
                        e.event_date === dateStr &&
                        !e.all_day &&
                        e.event_time &&
                        getHours(parseISO(`2000-01-01T${e.event_time}`)) === hour
                      )
                      const allDay = events.filter(e => e.event_date === dateStr && e.all_day)

                      const isCellDragOver = dragOverDate === dateStr
                      return (
                        <div
                          key={`${dateStr}-${hour}`}
                          onClick={() => { setModalDate(dateStr); setShowEventModal(true) }}
                          onDragOver={(e) => { e.preventDefault(); handleDragOver(dateStr) }}
                          onDragLeave={() => setDragOverDate(null)}
                          onDrop={(e) => { e.preventDefault(); handleDrop(dateStr) }}
                          className={`min-h-[44px] p-0.5 border-t border-border/20 bg-surface hover:bg-brand-bg/10 cursor-pointer transition-colors relative ${isCellDragOver ? 'bg-brand/10 ring-2 ring-brand ring-inset' : ''}`}
                        >
                          {hour === 7 && allDay.length > 0 && (
                            <div className="absolute -top-4 left-0 right-0 flex gap-0.5 flex-wrap px-0.5">
                              {allDay.slice(0, 2).map(ev => (
                                <div key={ev.id}
                                  onClick={(e) => { e.stopPropagation(); openEditEvent(ev) }}
                                  className="text-[8px] font-bold truncate rounded px-0.5 text-white cursor-pointer"
                                  style={{ backgroundColor: CATEGORIES.find(c=>c.id===ev.category)?.color??'#44B39D' }}>
                                  {CATEGORIES.find(c=>c.id===ev.category)?.emoji??'📅'}{ev.title}
                                </div>
                              ))}
                            </div>
                          )}
                          {cellEvents.map(ev => (
                            <div key={ev.id}
                              onClick={(e) => { e.stopPropagation(); openEditEvent(ev) }}
                              draggable
                              onDragStart={() => handleDragStart(ev.id)}
                              className="text-[10px] font-bold truncate rounded px-1 py-0.5 text-white cursor-grab active:cursor-grabbing mb-0.5"
                              style={{ backgroundColor: CATEGORIES.find(c=>c.id===ev.category)?.color??'#44B39D' }}>
                              {CATEGORIES.find(c=>c.id===ev.category)?.emoji??'📅'} {ev.title}
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      )}

      <AnimatePresence>
        {showEventModal && (
          <EventModal
            event={editingEvent}
            date={modalDate}
            onSave={handleSaveEvent}
            onDelete={editingEvent ? handleDeleteEvent : undefined}
            onClose={() => setShowEventModal(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!showEventModal && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-surface rounded-2xl shadow-md border border-border p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="heading-section">
                {viewMode === 'month'
                  ? format(monthStart, "MMMM 'de' yyyy", { locale: es })
                  : `Semana del ${format(weekDays[0], "d 'de' MMMM", { locale: es })}`}
              </h3>
              <button onClick={() => openCreateEvent(viewMode === 'month' ? monthStart : weekDays[0])}
                className="text-sm font-bold text-brand hover:text-brand-dark transition-colors">
                + Añadir
              </button>
            </div>
            <div className="space-y-4">
              {sortedDates.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-4">
                  No hay eventos en este periodo
                </p>
              ) : sortedDates.map((dateStr, groupIdx) => (
                <motion.div key={dateStr}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: groupIdx * 0.05 }}>
                  <h4 className="text-sm font-bold text-text-secondary mb-2 border-b border-border pb-1">
                    {format(parseISO(dateStr), "EEEE d 'de' MMMM", { locale: es })}
                  </h4>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {groupedEvents[dateStr].map((ev, idx) => (
                        <motion.div
                          key={ev.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 30 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 28, delay: idx * 0.03 }}
                          onClick={() => openEditEvent(ev)}
                          className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-brand-bg/20 transition-colors border border-border/40"
                        >
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
                            style={{ backgroundColor: CATEGORIES.find(c=>c.id===ev.category)?.color??'#44B39D' + '20' }}>
                            {CATEGORIES.find(c=>c.id===ev.category)?.emoji??'📅'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-text-primary truncate">{ev.title}</p>
                            <p className="text-xs text-text-muted">
                              {ev.all_day ? 'Todo el día' : ev.event_time ? format(parseISO(`2000-01-01T${ev.event_time}`), 'HH:mm') : ''}
                              {ev.description ? ` · ${ev.description}` : ''}
                            </p>
                          </div>
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: CATEGORIES.find(c=>c.id===ev.category)?.color??'#44B39D' }} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function EventModal({ event, date, onSave, onDelete, onClose }: {
  event: CalendarEvent | null
  date: string
    onSave: (data: {
      title: string; description: string;
      all_day: boolean; event_time: string | null;
      category: EventCategory; repeat_type: RepeatType; repeat_config?: RepeatConfig | null
    }) => void
  onDelete?: () => void
  onClose: () => void
}) {
  const [title, setTitle] = useState(event?.title ?? '')
  const [description, setDescription] = useState(event?.description ?? '')
  const [allDay, setAllDay] = useState(event?.all_day ?? true)
  const [eventTime, setEventTime] = useState(event?.event_time?.slice(0, 5) ?? '10:00')
  const [category, setCategory] = useState<EventCategory>(event?.category ?? 'general')
  const [repeatType, setRepeatType] = useState<RepeatType>(event?.repeat_type ?? 'none')
  const [repeatWeekDays, setRepeatWeekDays] = useState<number[]>(event?.repeat_config?.days ?? [1, 3, 5])
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  const pickCategory = (cat: EventCategory) => {
    setCategory(cat)
  }

  const toggleWeekDay = (d: number) => {
    setRepeatWeekDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSave({
      title: title.trim(),
      description: description.trim(),
      all_day: allDay,
      event_time: allDay ? null : eventTime,
      category,
      repeat_type: repeatType,
      repeat_config: repeatType === 'weekly' || repeatType === 'biweekly'
        ? { days: repeatWeekDays, interval: repeatType === 'biweekly' ? 2 : 1 }
        : null,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-surface rounded-2xl shadow-xl w-full max-w-sm p-5 border border-border max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🦕</span>
          <h3 className="heading-section">{event ? 'Editar evento' : 'Nuevo evento'}</h3>
        </div>

        {confirmingDelete ? (
          <div className="text-center py-4">
            <p className="text-sm font-bold text-text-primary mb-4">¿Eliminar este evento?</p>
            <div className="flex gap-2 justify-center">
              <button type="button" onClick={() => setConfirmingDelete(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-text-secondary hover:bg-surface-secondary transition-colors">
                Cancelar
              </button>
              <button type="button" onClick={() => { setConfirmingDelete(false); onDelete?.() }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition-colors">
                Sí, eliminar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">Título</label>
              <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-border bg-white text-sm font-medium focus:border-brand focus:outline-none"
                placeholder="¿Qué actividad?" />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">Descripción</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-border bg-white text-sm font-medium focus:border-brand focus:outline-none"
                placeholder="Opcional" />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-text-secondary">Todo el día</label>
              <button type="button" onClick={() => setAllDay(!allDay)}
                className={`w-10 h-5 rounded-full transition-colors ${allDay ? 'bg-brand' : 'bg-border'} relative`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow absolute top-0.5 transition-transform ${allDay ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {!allDay && (
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Hora</label>
                <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-border bg-white text-sm font-medium focus:border-brand focus:outline-none" />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">Categoría</label>
              <button type="button" onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full px-3 py-2 rounded-xl border-2 border-border bg-white text-sm font-medium text-left flex items-center gap-2 hover:border-brand transition-colors">
                <span>{CATEGORIES.find(c => c.id === category)?.emoji}</span>
                <span className="flex-1">{CATEGORIES.find(c => c.id === category)?.label}</span>
                <svg className={`w-4 h-4 text-text-muted transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              <AnimatePresence>
                {showCategoryDropdown && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                    className="mt-1 bg-white rounded-xl border-2 border-border shadow-lg p-1">
                    {CATEGORIES.map(cat => (
                      <button key={cat.id} type="button" onClick={() => { pickCategory(cat.id); setShowCategoryDropdown(false) }}
                        className="w-full px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-surface-secondary transition-colors text-left">
                        <span>{cat.emoji}</span>
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Repetición */}
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">Repetir</label>
              <div className="flex flex-wrap gap-1.5">
                {(Object.entries(REPEAT_LABELS) as [RepeatType, string][]).map(([key, label]) => (
                  <button key={key} type="button" onClick={() => setRepeatType(key)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${repeatType === key ? 'bg-brand text-white shadow-sm' : 'bg-surface-secondary text-text-secondary hover:bg-border'}`}>
                    {label}
                  </button>
                ))}
              </div>
              {(repeatType === 'weekly' || repeatType === 'biweekly') && (
                <div className="flex gap-1 mt-2">
                  {WEEKDAY_LABELS.map((label, i) => (
                    <button key={i} type="button" onClick={() => toggleWeekDay(i)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${repeatWeekDays.includes(i) ? 'bg-brand text-white' : 'bg-surface-secondary text-text-secondary hover:bg-border'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              {onDelete && (
                <button type="button" onClick={() => setConfirmingDelete(true)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-colors">
                  Eliminar
                </button>
              )}
              <div className="flex-1" />
              <button type="button" onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-text-secondary hover:bg-surface-secondary transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={!title.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-brand text-white hover:bg-brand-dark transition-colors disabled:opacity-50">
                {event ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  )
}

export default CalendarPage