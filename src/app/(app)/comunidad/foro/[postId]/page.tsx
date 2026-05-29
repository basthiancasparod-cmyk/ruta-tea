'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Lumi } from '@/components/lumi/Lumi'
import { useSupabase } from '@/components/layout/SupabaseProvider'
import type { ForumPost, ForumReply } from '@/types'

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { supabase, profile } = useSupabase()
  const postId = params.postId as string

  const [post, setPost] = useState<ForumPost | null>(null)
  const [replies, setReplies] = useState<ForumReply[]>([])
  const [loading, setLoading] = useState(true)
  const [replyContent, setReplyContent] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('forum_posts').select('*').eq('id', postId).single(),
      supabase.from('forum_replies').select('*').eq('post_id', postId).order('created_at'),
    ]).then(([postRes, repliesRes]) => {
      setPost(postRes.data as ForumPost)
      setReplies(repliesRes.data as ForumReply[] ?? [])
      setLoading(false)
    })
  }, [postId])

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyContent.trim() || !profile) return
    setSaving(true)
    await supabase.from('forum_replies').insert({
      post_id: postId,
      author_id: profile.id,
      content: replyContent.trim(),
    })
    await supabase.from('forum_posts').update({ reply_count: replies.length + 1 }).eq('id', postId)
    const { data } = await supabase.from('forum_replies').select('*').eq('post_id', postId).order('created_at')
    setReplies(data as ForumReply[] ?? [])
    setReplyContent('')
    setSaving(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Lumi mood="thinking" message="Cargando..." /></div>
  }

  if (!post) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Lumi mood="sad" message="Tema no encontrado" /></div>
  }

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>← Volver al foro</Button>

      <Card variant="bordered" padding="md">
        <div className="flex items-center gap-2 mb-2">
          {post.is_pinned && <span className="text-xs">📌</span>}
          <h1 className="text-xl font-extrabold text-text-primary">{post.title}</h1>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">{post.content}</p>
        <p className="text-xs text-text-muted mt-3">{new Date(post.created_at).toLocaleDateString('es')} · {replies.length} respuestas</p>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="heading-section">Respuestas ({replies.length})</h2>
        {replies.length === 0 ? (
          <p className="text-sm text-text-muted">Sé el primero en responder</p>
        ) : (
          replies.map((reply, i) => (
            <motion.div key={reply.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card variant="default" padding="md">
                <p className="text-sm text-text-primary">{reply.content}</p>
                <p className="text-xs text-text-muted mt-2">{new Date(reply.created_at).toLocaleDateString('es')}</p>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {profile && (
        <form onSubmit={handleReply} className="flex flex-col gap-3">
          <textarea
            value={replyContent}
            onChange={e => setReplyContent(e.target.value)}
            placeholder="Escribe tu respuesta..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border-2 border-border bg-surface text-sm resize-none"
          />
          <Button variant="primary" type="submit" disabled={!replyContent.trim() || saving}>
            {saving ? 'Enviando...' : 'Responder'}
          </Button>
        </form>
      )}
    </div>
  )
}
