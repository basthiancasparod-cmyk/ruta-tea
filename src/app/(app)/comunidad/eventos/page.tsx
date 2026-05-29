'use client'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Lumi } from '@/components/lumi/Lumi'
import { useEvents } from '@/lib/hooks/useData'

export default function EventosPage() {
  const { events } = useEvents()

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>← Atrás</Button>
        <h1 className="text-xl font-extrabold text-text-primary">Eventos</h1>
      </div>

      <Lumi mood="happy" message="Talleres, webinars y encuentros" size="sm" />

      <div className="flex flex-col gap-3">
        {events.length === 0 ? (
          <div className="text-center py-8 text-text-muted">
            <p>No hay eventos programados próximamente</p>
          </div>
        ) : (
          events.map((ev) => {
            const d = new Date(ev.event_date)
            return (
              <Card key={ev.id} variant="default" padding="md">
                <div className="flex gap-4">
                  <div className="text-center flex-shrink-0 w-16">
                    <div className="text-2xl font-extrabold text-brand">{d.getDate()}</div>
                    <div className="text-xs font-bold text-text-muted uppercase">{monthNames[d.getMonth()]}</div>
                    <div className="text-[10px] text-text-muted">{d.getFullYear()}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="heading-card">{ev.title}</h3>
                    <p className="text-sm text-text-secondary mt-1">{ev.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {ev.event_time && <span className="text-xs text-text-muted">🕐 {ev.event_time}</span>}
                      {ev.is_online ? (
                        <span className="text-xs font-bold text-brand">💻 Online</span>
                      ) : (
                        <span className="text-xs text-text-muted">📍 {ev.location}</span>
                      )}
                      {ev.organizer && <span className="text-xs text-text-muted">Organiza: {ev.organizer}</span>}
                    </div>
                    {ev.is_online && ev.link && (
                      <a href={ev.link} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-sm font-bold text-brand underline">
                        🔗 Unirse al evento
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
