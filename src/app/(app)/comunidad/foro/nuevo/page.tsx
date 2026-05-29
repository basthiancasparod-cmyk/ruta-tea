'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Lumi } from '@/components/lumi/Lumi'
import { useSupabase } from '@/components/layout/SupabaseProvider'
import { useForumCategories, useChildren } from '@/lib/hooks/useData'

export default function NuevoPostPage() {
  const router = useRouter()
  const { supabase, profile } = useSupabase()
  const { categories } = useForumCategories()
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || !profile) return
    setSaving(true)
    await supabase.from('forum_posts').insert({
      category_id: categoryId,
      author_id: profile.id,
      title: title.trim(),
      content: content.trim(),
    })
    router.push('/comunidad/foro')
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>← Atrás</Button>
        <h1 className="text-xl font-extrabold text-text-primary">Nuevo tema</h1>
      </div>

      <Lumi mood="thinking" message="Comparte con la comunidad" size="sm" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-bold text-text-secondary block mb-1">Categoría</label>
          <select
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-border bg-surface text-text-primary font-bold text-sm"
          >
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-bold text-text-secondary block mb-1">Título</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="¿Sobre qué quieres hablar?"
            className="w-full px-4 py-3 rounded-xl border-2 border-border bg-surface text-text-primary font-bold text-sm placeholder:text-text-muted"
            maxLength={200}
          />
        </div>

        <div>
          <label className="text-sm font-bold text-text-secondary block mb-1">Contenido</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Escribe tu mensaje aquí..."
            rows={6}
            className="w-full px-4 py-3 rounded-xl border-2 border-border bg-surface text-text-primary text-sm placeholder:text-text-muted resize-none"
          />
        </div>

        <Card variant="bordered" padding="sm" className="text-xs text-text-muted">
          💛 Sé respetuoso. Esta es una comunidad de apoyo. No compartas datos personales.
        </Card>

        <Button variant="primary" type="submit" disabled={!title.trim() || !content.trim() || saving}>
          {saving ? 'Publicando...' : 'Publicar tema'}
        </Button>
      </form>
    </div>
  )
}
