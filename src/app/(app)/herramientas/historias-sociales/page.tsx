'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Pictogram } from '@/components/ui/Pictogram'
import { playSound } from '@/lib/sounds'

type CategoryId = 'daily' | 'medical' | 'social' | 'emotions' | 'school' | 'community'

interface StoryPage {
  text: string
  keyword: string
  emoji?: string
}

interface SocialStory {
  id: string
  title: string
  emoji: string
  category: CategoryId
  pages: StoryPage[]
  color: string
}

const CATEGORIES: Record<CategoryId, { label: string; emoji: string }> = {
  daily: { label: 'Rutinas diarias', emoji: '🌅' },
  medical: { label: 'Salud y médico', emoji: '🏥' },
  social: { label: 'Habilidades sociales', emoji: '🤝' },
  emotions: { label: 'Emociones', emoji: '💖' },
  school: { label: 'Escuela', emoji: '📚' },
  community: { label: 'Comunidad', emoji: '🏘️' },
}

const STORIES: SocialStory[] = [
  {
    id: 'doctor', title: 'Ir al médico', emoji: '🩺', category: 'medical',
    color: 'from-blue-100 to-cyan-50',
    pages: [
      { text: 'A veces me duele algo o necesito un chequeo.', keyword: 'medico', emoji: '🏥' },
      { text: 'Voy a la consulta con mamá o papá.', keyword: 'consulta', emoji: '🚶' },
      { text: 'La doctora me saluda y me pregunta cómo estoy.', keyword: 'doctor', emoji: '👋' },
      { text: 'Puede revisar mis oídos, mi boca y mi corazón.', keyword: 'revision', emoji: '🩺' },
      { text: 'Si necesito una vacuna, duele solo un poquito.', keyword: 'inyeccion', emoji: '💉' },
      { text: 'Al terminar, puedo elegir una actividad favorita.', keyword: 'casa', emoji: '🎉' },
    ],
  },
  {
    id: 'dentist', title: 'Ir al dentista', emoji: '🦷', category: 'medical',
    color: 'from-teal-100 to-emerald-50',
    pages: [
      { text: 'Ir al dentista ayuda a mantener mis dientes sanos.', keyword: 'dentista', emoji: '🦷' },
      { text: 'Me siento en una silla especial que se mueve.', keyword: 'sentarse', emoji: '💺' },
      { text: 'El dentista mira mis dientes con un espejito.', keyword: 'boca', emoji: '🔦' },
      { text: 'A veces usan un cepillo que hace ruido, pero no duele.', keyword: 'cepillarse', emoji: '🪥' },
      { text: 'Si puedo quedarme quieto, todo termina más rápido.', keyword: 'tranquilo', emoji: '🧘' },
    ],
  },
  {
    id: 'first-day-school', title: 'Primer día de clases', emoji: '🎒', category: 'school',
    color: 'from-yellow-100 to-amber-50',
    pages: [
      { text: 'Hoy es mi primer día en la escuela.', keyword: 'escuela', emoji: '🏫' },
      { text: 'Mamá o papá me llevan y me dicen que volverán.', keyword: 'familia', emoji: '👨‍👩‍👦' },
      { text: 'Mi maestra me recibe con una sonrisa.', keyword: 'maestro', emoji: '👩‍🏫' },
      { text: 'Hay otros niños en mi salón, todos están conociéndose.', keyword: 'amigos', emoji: '👋' },
      { text: 'Vamos a jugar, cantar y aprender cosas nuevas.', keyword: 'jugar', emoji: '🧩' },
      { text: 'Cuando termine el día, mamá o papá me recogen.', keyword: 'casa', emoji: '🤗' },
    ],
  },
  {
    id: 'bedtime', title: 'Hora de dormir', emoji: '🌙', category: 'daily',
    color: 'from-indigo-100 to-purple-50',
    pages: [
      { text: 'Cuando se hace de noche, es hora de prepararme para dormir.', keyword: 'noche', emoji: '🌆' },
      { text: 'Me pongo el pijama y lavo mis dientes.', keyword: 'pijama', emoji: '🪥' },
      { text: 'Mamá o papá me leen un cuento en la cama.', keyword: 'leer', emoji: '📖' },
      { text: 'Damos las buenas noches y apagamos la luz.', keyword: 'dormir', emoji: '🌙' },
      { text: 'Cierro los ojos y respiro hondo para descansar.', keyword: 'cama', emoji: '😴' },
    ],
  },
  {
    id: 'sharing', title: 'Compartir juguetes', emoji: '🧸', category: 'social',
    color: 'from-pink-100 to-rose-50',
    pages: [
      { text: 'Cuando un amigo viene a casa, podemos jugar juntos.', keyword: 'amigos', emoji: '🧸' },
      { text: 'A veces tengo que compartir mis juguetes favoritos.', keyword: 'compartir', emoji: '🤝' },
      { text: 'Compartir no significa perderlo, solo prestarlo un rato.', keyword: 'turno', emoji: '⏳' },
      { text: 'Después de jugar, mi amigo me devuelve el juguete.', keyword: 'guardar', emoji: '🔄' },
      { text: 'Compartir hace que jugar juntos sea más divertido.', keyword: 'jugar', emoji: '🎉' },
    ],
  },
  {
    id: 'waiting', title: 'Esperar mi turno', emoji: '⏳', category: 'social',
    color: 'from-orange-100 to-amber-50',
    pages: [
      { text: 'A veces hay que esperar para hacer algo divertido.', keyword: 'esperar', emoji: '⏳' },
      { text: 'Cuando otros hablan, espero a que terminen.', keyword: 'escuchar', emoji: '👂' },
      { text: 'Si quiero algo, puedo decir "¿Puedo hacerlo después?"', keyword: 'hablar', emoji: '🗣️' },
      { text: 'Mientras espero, puedo contar o respirar profundo.', keyword: 'tranquilo', emoji: '🧘' },
      { text: 'Cuando llega mi turno, lo disfruto mucho más.', keyword: 'feliz', emoji: '🌟' },
    ],
  },
  {
    id: 'shopping', title: 'Ir de compras', emoji: '🛒', category: 'community',
    color: 'from-green-100 to-teal-50',
    pages: [
      { text: 'A veces vamos al supermercado o a la tienda.', keyword: 'tienda', emoji: '🏪' },
      { text: 'Hay mucha gente y muchas cosas para ver.', keyword: 'gente', emoji: '👥' },
      { text: 'Puedo ayudar a buscar lo que necesitamos.', keyword: 'buscar', emoji: '🔍' },
      { text: 'Espero en la fila con mamá o papá hasta pagar.', keyword: 'esperar', emoji: '🛒' },
      { text: 'Cuando terminamos, volvemos a casa.', keyword: 'casa', emoji: '✅' },
    ],
  },
  {
    id: 'car-travel', title: 'Viajar en coche', emoji: '🚗', category: 'daily',
    color: 'from-sky-100 to-blue-50',
    pages: [
      { text: 'A veces viajamos en coche a lugares nuevos.', keyword: 'coche', emoji: '🚗' },
      { text: 'Me siento en mi silla y me pongo el cinturón.', keyword: 'sentarse', emoji: '🔒' },
      { text: 'El viaje puede ser corto o un poco largo.', keyword: 'viaje', emoji: '🛣️' },
      { text: 'Puedo mirar por la ventana o escuchar música.', keyword: 'ventana', emoji: '🌳' },
      { text: 'Respirar hondo me ayuda si me siento inquieto.', keyword: 'tranquilo', emoji: '🧘' },
      { text: 'Cuando llegamos, puedo estirar las piernas.', keyword: 'llegada', emoji: '🎉' },
    ],
  },
  {
    id: 'frustration', title: 'Manejar la frustración', emoji: '🌋', category: 'emotions',
    color: 'from-red-100 to-orange-50',
    pages: [
      { text: 'A veces las cosas no salen como yo quiero.', keyword: 'triste', emoji: '😟' },
      { text: 'Me siento frustrado y eso es normal.', keyword: 'enfadado', emoji: '😤' },
      { text: 'Puedo respirar profundo tres veces para calmarme.', keyword: 'respirar', emoji: '🫁' },
      { text: 'Puedo pedir ayuda a un adulto si la necesito.', keyword: 'ayuda', emoji: '🤝' },
      { text: 'Después de calmarme, puedo intentarlo de nuevo.', keyword: 'feliz', emoji: '💪' },
    ],
  },
  {
    id: 'new-people', title: 'Conocer gente nueva', emoji: '👋', category: 'social',
    color: 'from-purple-100 to-pink-50',
    pages: [
      { text: 'A veces conozco personas que no he visto antes.', keyword: 'gente', emoji: '👋' },
      { text: 'Puedo saludar con un hola o mover la mano.', keyword: 'saludar', emoji: '🖐️' },
      { text: 'No tengo que hablar mucho si no quiero.', keyword: 'hablar', emoji: '🤐' },
      { text: 'Puedo quedarme cerca de mamá o papá mientras me siento cómodo.', keyword: 'familia', emoji: '👨‍👩‍👦' },
      { text: 'Con el tiempo, conocer gente nueva es más fácil.', keyword: 'amigos', emoji: '🌟' },
    ],
  },
  {
    id: 'mealtime', title: 'La hora de comer', emoji: '🍽️', category: 'daily',
    color: 'from-amber-100 to-yellow-50',
    pages: [
      { text: 'Es hora de comer y toda la familia se sienta junta.', keyword: 'comer', emoji: '🍽️' },
      { text: 'Hay diferentes alimentos en la mesa.', keyword: 'fruta', emoji: '🥗' },
      { text: 'Puedo probar un poco de cada cosa.', keyword: 'comida', emoji: '👅' },
      { text: 'Si algo no me gusta, está bien dejarlo en el plato.', keyword: 'no', emoji: '👍' },
      { text: 'Cuando termino, ayudo a recoger mi plato.', keyword: 'recoger', emoji: '✅' },
    ],
  },
  {
    id: 'potty', title: 'Ir al baño', emoji: '🚽', category: 'daily',
    color: 'from-cyan-100 to-blue-50',
    pages: [
      { text: 'Cuando siento que necesito ir al baño, aviso a un adulto.', keyword: 'bano', emoji: '🚽' },
      { text: 'Voy al baño y me siento en la taza.', keyword: 'sentarse', emoji: '🚽' },
      { text: 'Hago lo que necesito y luego me limpio.', keyword: 'agua', emoji: '🧻' },
      { text: 'Me lavo las manos con agua y jabón.', keyword: 'lavarse', emoji: '🧼' },
      { text: '¡Lo logré! Cada vez es más fácil.', keyword: 'feliz', emoji: '🌟' },
    ],
  },
]

const HISTORY_KEY = 'historias-sociales-history'

interface ReadingRecord {
  storyId: string
  date: string
  completed: boolean
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
  const [selectedStory, setSelectedStory] = useState<SocialStory | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [activeCategory, setActiveCategory] = useState<CategoryId | 'all'>('all')
  const [showConfetti, setShowConfetti] = useState(false)
  const [history, setHistory] = useState<ReadingRecord[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [ttsEnabled, setTtsEnabled] = useState(true)
  const [showCompletion, setShowCompletion] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      if (raw) setHistory(JSON.parse(raw))
    } catch { /* empty */ }
  }, [])

  const saveHistory = useCallback((record: ReadingRecord) => {
    setHistory(prev => {
      const updated = [record, ...prev.filter(r => r.storyId !== record.storyId)].slice(0, 100)
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(updated)) } catch { /* empty */ }
      return updated
    })
  }, [])

  const sortedStories = useMemo(() => {
    const readIds = new Set(history.filter(r => r.completed).map(r => r.storyId))
    return [...STORIES].sort((a, b) => {
      const aRead = readIds.has(a.id) ? 1 : 0
      const bRead = readIds.has(b.id) ? 1 : 0
      return aRead - bRead
    })
  }, [history])

  const filteredStories = activeCategory === 'all'
    ? sortedStories
    : sortedStories.filter(s => s.category === activeCategory)

  const completedCount = history.filter(r => r.completed).length

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
      setTimeout(() => setShowConfetti(false), 2500)
      saveHistory({ storyId: selectedStory.id, date: new Date().toISOString(), completed: true })
    }
  }, [selectedStory, pageIndex, ps, saveHistory])

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
            >{ttsEnabled ? '🔊' : '🔇'}</button>
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
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex items-center gap-3">
        <img src="/assets/dino-historias-sociales.png" alt="" width={80} height={92} className="object-contain shrink-0"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
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

      {completedCount > 0 && (
        <Card variant="default" padding="sm" className="bg-purple-50 border-purple-200">
          <div className="flex items-center gap-2 justify-center">
            <span className="text-lg">🏆</span>
            <span className="text-sm font-extrabold text-text-primary">{completedCount} historias leídas</span>
            <span className="text-xs text-text-muted">· {history.filter(r => r.completed).length}/{STORIES.length}</span>
          </div>
        </Card>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setActiveCategory('all')}
          className={`shrink-0 px-4 py-1.5 rounded-full font-bold text-xs transition-all whitespace-nowrap ${
            activeCategory === 'all' ? 'bg-brand text-white shadow-sm' : 'bg-surface border border-border text-text-secondary hover:border-brand hover:text-brand'
          }`}
        >Todas ({STORIES.length})</button>
        {(Object.entries(CATEGORIES) as [CategoryId, { label: string; emoji: string }][]).map(([id, cat]) => {
          const count = STORIES.filter(s => s.category === id).length
          return (
            <button key={id} onClick={() => setActiveCategory(id)}
              className={`shrink-0 px-4 py-1.5 rounded-full font-bold text-xs transition-all whitespace-nowrap ${
                activeCategory === id ? 'bg-brand text-white shadow-sm' : 'bg-surface border border-border text-text-secondary hover:border-brand hover:text-brand'
              }`}
            >{cat.emoji} {cat.label} ({count})</button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout">
          {filteredStories.map(story => {
            const read = history.find(r => r.storyId === story.id)
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
                    {read && (
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

      {filteredStories.length === 0 && (
        <div className="text-center py-10">
          <span className="text-4xl block mb-2">📖</span>
          <p className="heading-card text-text-muted">No hay historias en esta categoría</p>
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
