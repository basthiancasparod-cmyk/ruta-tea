'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { useForumCategories, useEvents, useSupportGroups } from '@/lib/hooks/useData'
import { useSupabase } from '@/components/layout/SupabaseProvider'

export default function ComunidadPage() {
  const { categories } = useForumCategories()
  const { events } = useEvents()
  const { groups } = useSupportGroups()

  const upcomingEvents = events.slice(0, 3)
  const focusLabels: Record<string, string> = {
    parents: 'Padres', siblings: 'Hermanos', new_parents: 'Nuevos padres', teens: 'Adolescentes', general: 'General',
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
<img src="/assets/dino-comunidad.png" alt="Dino" className="w-[110px] h-[129px] object-contain drop-shadow-xl" />
        <div>
          <h1 className="heading-page">Dino Comunidad</h1>
          <p className="text-body">Conecta con otras familias y terapeutas</p>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="heading-section">💬 Foro</h2>
          <Link href="/comunidad/foro" className="text-xs font-bold text-brand">Ver todo →</Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat, idx) => {
            const imageMap = ['/assets/1.png', '/assets/3.png', '/assets/2.png', '/assets/4.png']
            const imgSrc = imageMap[idx] ?? null
            return (
            <Link key={cat.id} href={`/comunidad/foro?categoria=${cat.slug}`}>
              <motion.div
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.97 }}
                className="relative bg-white rounded-2xl shadow-md border border-border/60 p-5 overflow-hidden cursor-pointer group"
              >
                <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-brand-bg/40 blur-xl pointer-events-none" />
                <div className="absolute -bottom-3 -left-3 w-12 h-12 rounded-full bg-accent-light/15 blur-lg pointer-events-none" />
                <div className="relative text-center flex flex-col items-center">
                  {imgSrc ? (
                    <div className="w-12 h-12 mb-2 relative">
                      <Image src={imgSrc} alt={cat.name} width={48} height={48} className="object-contain" />
                    </div>
                  ) : (
                    <span className="text-3xl block mb-2">{cat.icon}</span>
                  )}
                  <span className="heading-card block group-hover:text-brand-dark transition-colors">{cat.name}</span>
                  <span className="text-meta block mt-1 leading-snug">{cat.description.slice(0, 35)}...</span>
                </div>
              </motion.div>
            </Link>
            )
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="heading-section">📅 Próximos Eventos</h2>
          <Link href="/comunidad/eventos" className="text-xs font-bold text-brand">Ver todo →</Link>
        </div>
        <div className="flex flex-col gap-2">
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-text-muted">No hay eventos próximos</p>
          ) : (
            upcomingEvents.map((ev) => (
              <Card key={ev.id} variant="bordered" padding="md">
                <div className="flex items-center gap-3">
                  <div className="text-center flex-shrink-0">
                    <div className="text-lg font-extrabold text-brand">{new Date(ev.event_date).getDate()}</div>
                    <div className="text-badge text-text-muted uppercase">
                      {new Date(ev.event_date).toLocaleDateString('es', { month: 'short' })}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-text-primary">{ev.title}</h3>
                    <p className="text-xs text-text-muted">{ev.event_time}{ev.is_online ? ' · Online' : ''}</p>
                  </div>
                  {ev.is_online && <span className="text-xs font-bold text-brand">💻</span>}
                </div>
              </Card>
            ))
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="heading-section">👥 Grupos de Apoyo</h2>
          <Link href="/comunidad/grupos" className="text-xs font-bold text-brand">Ver todo →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {groups.slice(0, 4).map((g, idx) => {
            const groupImages = ['/assets/5.png', '/assets/6.png', '/assets/7.png', '/assets/8.png']
            const imgSrc = groupImages[idx] ?? null
            return (
            <div
              key={g.id}
              className="relative bg-white rounded-2xl shadow-md border border-border/60 p-4 overflow-hidden"
            >
              <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-brand-bg/40 blur-xl pointer-events-none" />
              <div className="absolute -bottom-3 -left-3 w-12 h-12 rounded-full bg-accent-light/15 blur-lg pointer-events-none" />
              <div className="relative flex items-center gap-3">
                {imgSrc ? (
                  <div className="w-12 h-12 shrink-0 relative">
                    <Image src={imgSrc} alt={g.name} width={48} height={48} className="object-contain" />
                  </div>
                ) : (
                  <span className="text-2xl shrink-0">{g.icon}</span>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-text-primary">{g.name}</h3>
                  <span className="text-badge px-2 py-0.5 rounded-full bg-brand-bg/90 text-brand-dark inline-block mt-1">{focusLabels[g.focus] ?? g.focus}</span>
                </div>
              </div>
            </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
