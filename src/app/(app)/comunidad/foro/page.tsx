'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Lumi } from '@/components/lumi/Lumi'
import { useForumCategories, useForumPosts } from '@/lib/hooks/useData'

function ForoContent() {
  const searchParams = useSearchParams()
  const activeSlug = searchParams.get('categoria') ?? ''
  const { categories } = useForumCategories()
  const { posts } = useForumPosts(activeSlug || undefined)

  const activeCategory = categories.find(c => c.slug === activeSlug)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>← Atrás</Button>
        <h1 className="text-xl font-extrabold text-text-primary">Foro</h1>
      </div>

      <Lumi mood="happy" message="Comparte y aprende con la comunidad" size="sm" />

      <div className="flex gap-2 overflow-x-auto pb-2">
        <Link href="/comunidad/foro">
          <button className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${!activeSlug ? 'bg-brand text-white' : 'bg-surface border border-border text-text-secondary'}`}>
            Todos
          </button>
        </Link>
        {categories.map((cat) => (
          <Link key={cat.id} href={`/comunidad/foro?categoria=${cat.slug}`}>
            <button className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${activeSlug === cat.slug ? 'bg-brand text-white' : 'bg-surface border border-border text-text-secondary'}`}>
              {cat.icon} {cat.name}
            </button>
          </Link>
        ))}
      </div>

      <div className="flex justify-end">
        <Link href="/comunidad/foro/nuevo">
          <Button variant="primary" size="sm">+ Nuevo tema</Button>
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {posts.length === 0 ? (
          <div className="text-center py-8 text-text-muted">
            <p>No hay temas todavía. ¡Sé el primero en publicar!</p>
            <Link href="/comunidad/foro/nuevo"><Button variant="primary" size="sm" className="mt-3">Crear tema</Button></Link>
          </div>
        ) : (
          posts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Link href={`/comunidad/foro/${post.id}`}>
                <Card variant="default" padding="md" className="cursor-pointer hover:border-brand transition-colors">
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{post.is_pinned ? '📌' : '💬'}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-text-primary">{post.title}</h3>
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{post.content}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-text-muted">{new Date(post.created_at).toLocaleDateString('es')}</div>
                      <div className="text-[10px] text-text-muted mt-1">{post.reply_count} respuestas</div>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

export default function ForoPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Lumi mood="thinking" message="Cargando foro..." /></div>}>
      <ForoContent />
    </Suspense>
  )
}
