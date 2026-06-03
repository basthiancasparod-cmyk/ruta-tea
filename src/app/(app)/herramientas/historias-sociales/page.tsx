'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Pictogram } from '@/components/ui/Pictogram'
import { playSound } from '@/lib/sounds'
import { useChildren } from '@/lib/hooks/useData'

type CategoryId = 'daily' | 'medical' | 'social' | 'emotions' | 'school' | 'community'

interface StoryPage {
  text: string
  keyword: string
  emoji?: string
}

interface SocialStory {
  id: string
  title: string
  description: string
  emoji: string
  category: CategoryId
  pages: StoryPage[]
  color: string
  progress?: { current_page: number; is_completed: boolean; completed_at: string | null } | null
}

const CATEGORIES: Record<CategoryId, { label: string; emoji: string }> = {
  daily: { label: 'Rutinas diarias', emoji: '🌅' },
  medical: { label: 'Salud y médico', emoji: '🏥' },
  social: { label: 'Habilidades sociales', emoji: '🤝' },
  emotions: { label: 'Emociones', emoji: '💖' },
  school: { label: 'Escuela', emoji: '📚' },
  community: { label: 'Comunidad', emoji: '🏘️' },
}

const CONFETTI_COLORS = ['#44B39D', '#FFB347', '#6BCB77', '#8B5CF6', '#FF6B6B', '#FFC800', '#FF6B00']

function ConfettiBurst() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => {
        const x = Math.random() * 100
        const drift = (Math.random() - 0.5) * 200
        const fall = 300 + Math.random() * 400
        const delay = Math.random() * 0.5
        const size = 6 + Math.random() * 8
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length]
        const rotate = Math.random() * 720
        return (
          <motion.div key={i} className="absolute rounded-sm"
            style={{ left: `${x}%`, top: -20, width: size, height: size * 0.6, backgroundColor: color }}
            initial={{ y: -20, rotate: 0, opacity: 1 }}
            animate={{ y: fall, x: drift, rotate, opacity: [1, 0.8, 0] }}
            transition={{ duration: 1.5 + Math.random(), delay, ease: 'easeIn' }}
          />
        )
      })}
    </div>
  )
}

export default function HistoriasSocialesPage() {
  const { children, loading: childrenLoading } = useChildren()
  const child = children[0]
  const [stories, setStories] = useState<SocialStory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStory, setSelectedStory] = useState<SocialStory | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [activeCategory, setActiveCategory] = useState<CategoryId | 'all'>('all')
  const [showConfetti, setShowConfetti] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [ttsEnabled, setTtsEnabled] = useState(true)
  const [showCompletion, setShowCompletion] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [listPage, setListPage] = useState(1)
  const confettiTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    return () => { if (confettiTimer.current) clearTimeout(confettiTimer.current) }
  }, [])

  useEffect(() => {
    if (!child?.id || childrenLoading) return
    setLoading(true)
    fetch(`/api/historias-sociales?childId=${child.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.stories) setStories(data.stories)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [child?.id, childrenLoading])

  const markCompleted = useCallback(async (storyId: string) => {
    if (!child?.id) return
    try {
      await fetch('/api/historias-sociales/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId, childId: child.id }),
      })
      setStories(prev => prev.map(s =>
        s.id === storyId ? { ...s, progress: { current_page: 0, is_completed: true, completed_at: new Date().toISOString() } } : s
      ))
    } catch { /* empty */ }
  }, [child?.id])

  const sortedStories = useMemo(() => {
    return [...stories].sort((a, b) => {
      const aRead = a.progress?.is_completed ? 1 : 0
      const bRead = b.progress?.is_completed ? 1 : 0
      return aRead - bRead
    })
  }, [stories])

  const filteredStories = useMemo(() => {
    const byCategory = activeCategory === 'all'
      ? sortedStories
      : sortedStories.filter(s => s.category === activeCategory)
    if (!searchQuery.trim()) return byCategory
    const q = searchQuery.toLowerCase()
    return byCategory.filter(s => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
  }, [sortedStories, activeCategory, searchQuery])

  const listTotalPages = Math.max(1, Math.ceil(filteredStories.length / ITEMS_PER_PAGE))
  const safePage = Math.min(listPage, listTotalPages)
  const pageStories = filteredStories.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)

  useEffect(() => { setListPage(1) }, [activeCategory, searchQuery])

  const completedCount = stories.filter(s => s.progress?.is_completed).length

  const ps = useCallback((name: 'click' | 'celebration' | 'correct') => {
    if (soundEnabled) playSound(name)
  }, [soundEnabled])

  const speakText = useCallback((text: string) => {
    if (!ttsEnabled) return
    try {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'es-ES'
      u.rate = 0.85
      u.pitch = 1.1
      window.speechSynthesis.speak(u)
    } catch { /* empty */ }
  }, [ttsEnabled])

  const openStory = useCallback((story: SocialStory) => {
    setSelectedStory(story)
    setPageIndex(0)
    setShowCompletion(false)
    ps('click')
  }, [ps])

  const goNextPage = useCallback(() => {
    if (!selectedStory) return
    if (pageIndex < selectedStory.pages.length - 1) {
      setPageIndex(p => p + 1)
      ps('click')
    } else {
      setShowCompletion(true)
      ps('celebration')
      setShowConfetti(true)
      confettiTimer.current = setTimeout(() => setShowConfetti(false), 2500)
      markCompleted(selectedStory.id)
    }
  }, [selectedStory, pageIndex, ps, markCompleted])

  const goPrevPage = useCallback(() => {
    if (pageIndex > 0) {
      setPageIndex(p => p - 1)
      ps('click')
    }
  }, [pageIndex, ps])

  const closeStory = useCallback(() => {
    setSelectedStory(null)
    setPageIndex(0)
    setShowCompletion(false)
    window.speechSynthesis.cancel()
  }, [])

  const currentPage = selectedStory?.pages[pageIndex]
  const totalPages = selectedStory?.pages.length ?? 0
  const progress = totalPages > 0 ? ((pageIndex + 1) / totalPages) * 100 : 0

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
    if (!selectedStory) return
    if (e.key === 'Escape') closeStory()
    if (e.key === 'ArrowRight') goNextPage()
    if (e.key === 'ArrowLeft') goPrevPage()
  }, [selectedStory, closeStory, goNextPage, goPrevPage])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    if (currentPage && !showCompletion) {
      const t = setTimeout(() => speakText(currentPage.text), 400)
      return () => { clearTimeout(t); window.speechSynthesis.cancel() }
    }
  }, [pageIndex, selectedStory?.id, showCompletion])

  if (selectedStory && !showCompletion) {
    return (
      <div className="flex flex-col gap-4 pb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={closeStory}>← Atrás</Button>
          <div className="flex-1 min-w-0">
            <h1 className="heading-page truncate">{selectedStory.emoji} {selectedStory.title}</h1>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setSoundEnabled(v => !v)}
              className="text-lg shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              title={soundEnabled ? 'Silenciar' : 'Activar sonido'}
              aria-label={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
            >{soundEnabled ? '🔊' : '🔇'}</button>
            <button onClick={() => setTtsEnabled(v => !v)}
              className={`text-sm shrink-0 transition-opacity ${ttsEnabled ? 'opacity-80' : 'opacity-40'}`}
              title={ttsEnabled ? 'Desactivar voz' : 'Activar voz'}
              aria-label={ttsEnabled ? 'Desactivar lectura en voz alta' : 'Activar lectura en voz alta'}
            >{ttsEnabled ? '🗣️' : '🔇'}</button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-surface-secondary rounded-full overflow-hidden">
            <motion.div className="h-full bg-brand rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-badge text-text-muted shrink-0">{pageIndex + 1}/{totalPages}</span>
        </div>

        <motion.div key={pageIndex} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex flex-col items-center gap-6 py-4"
        >
          <Card variant="premium" padding="lg" className="w-full max-w-md text-center">
            <div className="flex flex-col items-center gap-5">
              {currentPage?.emoji && (
                <motion.span key={`emoji-${pageIndex}`} initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
                  className="text-6xl block">{currentPage.emoji}</motion.span>
              )}
              <Pictogram keyword={currentPage?.keyword ?? ''} size={100} />
              <p className="text-xl font-bold text-text-primary leading-relaxed max-w-sm">
                {currentPage?.text}
              </p>
            </div>
          </Card>

          <div className="flex items-center gap-4">
            <button onClick={goPrevPage} disabled={pageIndex === 0}
              className="flex items-center justify-center w-14 h-14 rounded-xl bg-white border-2 border-border text-2xl hover:border-brand hover:text-brand transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              aria-label="Página anterior"
            >◀</button>

            <button onClick={() => speakText(currentPage?.text ?? '')}
              className="flex items-center justify-center w-14 h-14 rounded-xl bg-brand text-white text-xl hover:bg-brand-dark transition-all active:scale-95"
              aria-label="Escuchar esta página"
            >🔊</button>

            <button onClick={goNextPage}
              className="flex items-center justify-center w-14 h-14 rounded-xl bg-white border-2 border-border text-2xl hover:border-brand hover:text-brand transition-all active:scale-95"
              aria-label={pageIndex < totalPages - 1 ? 'Siguiente página' : 'Terminar historia'}
            >{pageIndex < totalPages - 1 ? '▶' : '✅'}</button>
          </div>

          <p className="text-badge text-text-muted">
            Usa las flechas del teclado ← →
          </p>
        </motion.div>
      </div>
    )
  }

  if (selectedStory && showCompletion) {
    return (
      <div className="flex flex-col gap-6 pb-8">
        {showConfetti && <ConfettiBurst />}
        <div className="flex flex-col items-center gap-6 py-8 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
            <img src="/assets/dino-historias-sociales.png" alt="" width={130} height={150} className="object-contain"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <p className="text-2xl font-extrabold text-text-primary mb-2">¡Historia completada! 🎉</p>
            <p className="text-body">{selectedStory.emoji} {selectedStory.title}</p>
          </motion.div>
          <div className="flex gap-3 mt-4">
            <Button variant="primary" size="lg" onClick={() => { setPageIndex(0); setShowCompletion(false) }}>
              🔄 Leer de nuevo
            </Button>
            <Button variant="outline" size="lg" onClick={closeStory}>
              📚 Más historias
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>← Atrás</Button>
        <div className="flex-1">
          <h1 className="heading-page">Historias Sociales</h1>
          <p className="text-body">Aprende situaciones nuevas paso a paso con pictogramas</p>
        </div>
        <button onClick={() => setSoundEnabled(v => !v)}
          className="text-lg shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          title={soundEnabled ? 'Silenciar' : 'Activar sonido'}
          aria-label={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
        >{soundEnabled ? '🔊' : '🔇'}</button>
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <img src="/assets/dino-historias-sociales.png" alt="" width={138} height={161} className="object-contain"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        <p className="text-base font-bold text-text-primary">
          {completedCount > 0 ? '¡Sigue aprendiendo! Elige una historia' : 'Elige una historia para aprender'}
        </p>
      </div>

      {completedCount > 0 && (
        <Card variant="default" padding="sm" className="bg-purple-50 border-purple-200">
          <div className="flex items-center gap-2 justify-center">
            <span className="text-lg">🏆</span>
            <span className="text-sm font-extrabold text-text-primary">{completedCount} historias leídas</span>
            <span className="text-xs text-text-muted">· {completedCount}/{stories.length}</span>
          </div>
        </Card>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setActiveCategory('all')}
          className={`shrink-0 px-4 py-1.5 rounded-full font-bold text-xs transition-all whitespace-nowrap ${
            activeCategory === 'all' ? 'bg-brand text-white shadow-sm' : 'bg-surface border border-border text-text-secondary hover:border-brand hover:text-brand'
          }`}
        >Todas <span className="font-normal opacity-70">({stories.length})</span></button>
        {(Object.entries(CATEGORIES) as [CategoryId, { label: string; emoji: string }][]).map(([id, cat]) => {
          const count = stories.filter(s => s.category === id).length
          return (
            <button key={id} onClick={() => setActiveCategory(id)}
              className={`shrink-0 px-4 py-1.5 rounded-full font-bold text-xs transition-all whitespace-nowrap ${
                activeCategory === id ? 'bg-brand text-white shadow-sm' : 'bg-surface border border-border text-text-secondary hover:border-brand hover:text-brand'
              }`}
            >{cat.emoji} {cat.label} ({count})</button>
          )
        })}
      </div>

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg opacity-50">🔍</span>
        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar historias..."
          className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-border bg-white text-sm font-semibold text-text-primary placeholder:text-text-muted outline-none focus:border-brand transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout">
          {pageStories.map(story => {
            return (
              <motion.div key={story.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
              >
                <button onClick={() => openStory(story)}
                  className="w-full text-left h-full"
                  aria-label={`Leer ${story.title}`}
                >
                  <Card variant="default" padding="md"
                    className={`h-full bg-gradient-to-br ${story.color} border-2 border-transparent hover:border-brand transition-all active:scale-[0.98] cursor-pointer relative overflow-hidden`}
                  >
                    {story.progress?.is_completed && (
                      <span className="absolute top-2 right-2 text-xs text-brand font-bold">✅ Leída</span>
                    )}
                    <div className="flex items-center gap-4">
                      <span className="text-4xl shrink-0">{story.emoji}</span>
                      <div className="min-w-0">
                        <p className="heading-card mb-0.5">{story.title}</p>
                        <p className="text-badge text-text-muted font-semibold">{CATEGORIES[story.category].emoji} {story.category === 'daily' ? 'Rutinas' : story.category === 'medical' ? 'Salud' : story.category === 'social' ? 'Social' : story.category === 'emotions' ? 'Emociones' : story.category === 'school' ? 'Escuela' : 'Comunidad'} · {story.pages.length} páginas</p>
                      </div>
                    </div>
                  </Card>
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {loading && (
        <div className="text-center py-10">
          <span className="text-4xl block mb-2">⏳</span>
          <p className="heading-card text-text-muted">Cargando historias...</p>
        </div>
      )}
      {!loading && filteredStories.length === 0 && (
        <div className="text-center py-10">
          <span className="text-4xl block mb-2">📖</span>
          <p className="heading-card text-text-muted">{searchQuery ? 'No hay historias que coincidan con tu búsqueda' : 'No hay historias en esta categoría'}</p>
        </div>
      )}

      {!loading && filteredStories.length > ITEMS_PER_PAGE && (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5">
            <button onClick={() => setListPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
              className="flex items-center justify-center w-9 h-9 rounded-lg border border-border text-sm font-bold hover:border-brand hover:text-brand transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Página anterior">◀</button>
            {(() => {
              const pages: (number | string)[] = []
              const total = listTotalPages
              const cur = safePage
              pages.push(1)
              if (cur > 3) pages.push('...')
              const start = Math.max(2, cur - 1)
              const end = Math.min(total - 1, cur + 1)
              for (let i = start; i <= end; i++) pages.push(i)
              if (cur < total - 2) pages.push('...')
              if (total > 1) pages.push(total)
              return pages.map((p, i) =>
                p === '...' ? (
                  <span key={`e${i}`} className="w-4 text-center text-text-muted text-xs">···</span>
                ) : (
                  <button key={p} onClick={() => setListPage(p as number)}
                    className={`flex items-center justify-center w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                      p === cur ? 'bg-brand text-white shadow-sm' : 'border border-border hover:border-brand hover:text-brand'
                    }`}
                    aria-label={`Ir a página ${p}`}>{p}</button>
                )
              )
            })()}
            <button onClick={() => setListPage(p => Math.min(listTotalPages, p + 1))} disabled={safePage === listTotalPages}
              className="flex items-center justify-center w-9 h-9 rounded-lg border border-border text-sm font-bold hover:border-brand hover:text-brand transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Página siguiente">▶</button>
          </div>
          <span className="text-xs text-text-muted">Página {safePage} de {listTotalPages}</span>
        </div>
      )}

      <Card variant="default" padding="md" className="bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <span className="text-2xl shrink-0">💡</span>
          <div className="flex-1">
            <h3 className="heading-card mb-1">Consejos útiles</h3>
            <p className="text-meta leading-relaxed">
              Las historias sociales ayudan a los niños a entender situaciones nuevas o desafiantes.
              Léelas juntos, señala los pictogramas y conversa sobre cada página.
              La repetición crea predictibilidad y reduce la ansiedad ante lo desconocido.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
