'use client'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Lumi } from '@/components/lumi/Lumi'
import { useSupportGroups } from '@/lib/hooks/useData'

const focusLabels: Record<string, string> = {
  parents: 'Padres',
  siblings: 'Hermanos',
  new_parents: 'Nuevos padres',
  teens: 'Adolescentes',
  general: 'General',
}

export default function GruposPage() {
  const { groups } = useSupportGroups()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>← Atrás</Button>
        <h1 className="text-xl font-extrabold text-text-primary">Grupos de Apoyo</h1>
      </div>

      <Lumi mood="happy" message="Encuentra tu grupo de apoyo" size="sm" />

      <div className="flex flex-col gap-3">
        {groups.map((g) => (
          <Card key={g.id} variant="default" padding="lg">
            <div className="flex items-start gap-4">
              <span className="text-3xl">{g.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="heading-card">{g.name}</h3>
                <span className="inline-block mt-1 text-badge px-2 py-0.5 rounded-full bg-brand-bg/90 text-brand-dark">
                  {focusLabels[g.focus] ?? g.focus}
                </span>
                <p className="text-sm text-text-secondary mt-2 leading-relaxed">{g.description}</p>
                <div className="flex flex-wrap gap-3 mt-3 text-xs text-text-muted">
                  {g.schedule && <span>🕐 {g.schedule}</span>}
                  <span>📍 {g.location}</span>
                  <span>📧 {g.contact}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
