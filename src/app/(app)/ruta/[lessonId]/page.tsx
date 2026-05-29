'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Lumi } from '@/components/lumi/Lumi'
import { useSupabase } from '@/components/layout/SupabaseProvider'
import { useChildren } from '@/lib/hooks/useData'
import { Pictogram } from '@/components/ui/Pictogram'
import { playSound, vibrate } from '@/lib/sounds'
import type { Lesson } from '@/types'

interface Question {
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
  pictogramKeyword?: string
}

function generateQuestions(lesson: Lesson): Question[] {
  const { type, data } = lesson.content
  const age = lesson.age_range

  const bigEmojis = age === '0-2' || (age === '3-5' && lesson.tea_level >= 2)

  switch (type) {
    case 'emotion_select': {
      const emotions = (data.emotions as string[]) ?? ['Alegre 😊', 'Triste 😢', 'Enojado 😠', 'Asustado 😨']
      function makeScenario(prompt: string, correctLabel: string) {
        return { prompt, options: emotions, correctIndex: emotions.indexOf(correctLabel), explanation: `¡${correctLabel}!` }
      }
      if (data.empathy) {
        return [
          makeScenario('Un amigo te regala un juguete. ¿Cómo se siente?', 'Alegre 😊'),
          makeScenario('A tu amigo se le perdió su peluche. ¿Cómo se siente?', 'Triste 😢'),
        ]
      }
      if (data.anxiety) {
        return [
          makeScenario('Tu corazón late muy rápido. ¿Cómo te sientes?', 'Ansioso 😰'),
          makeScenario('Estás temblando antes de hablar. ¿Qué emoción es?', 'Nervioso 😬'),
        ]
      }
      if (data.internet_safety) {
        const opts = ['Seguro ✅', 'No seguro ❌']
        return [
          { prompt: 'Un desconocido te pide tu dirección. ¿Es seguro?', options: opts, correctIndex: 1, explanation: '¡No seguro!' },
          { prompt: 'Tu mamá te pide tu contraseña. ¿Es seguro?', options: opts, correctIndex: 0, explanation: '¡Seguro!' },
        ]
      }
      if (data.regulation) {
        return [
          { prompt: 'Te sientes muy enojado. ¿Qué puedes hacer?', options: ['Respirar profundo 🌬️', 'Gritar muy fuerte', 'Tirar cosas', 'Ignorarlo'], correctIndex: 0, explanation: '¡Respirar!' },
        ]
      }
      if (data.problem_solving) {
        return [
          { prompt: 'Se cayó tu helado. ¿Qué haces?', options: ['Llorar 😭', 'Pedir otro 🍦', 'Enojarme 😤', 'Irme'], correctIndex: 1, explanation: '¡Pedir otro!' },
        ]
      }
      return [
        makeScenario('Lumi te da un regalo. ¿Cómo se siente Lumi?', 'Alegre 😊'),
        makeScenario('A Lumi se le rompió su juguete. ¿Cómo se siente?', 'Triste 😢'),
      ]
    }

    case 'pictogram_match': {
      const letters = data.letters as string[] | undefined
      const lettersData = letters ?? ['A', 'E', 'I', 'O', 'U']
      return lettersData.slice(0, 3).map(letter => ({
        prompt: `¿Cuál es la letra "${letter}"?`,
        options: lettersData.map(l => l),
        correctIndex: lettersData.indexOf(letter),
        explanation: `¡La letra ${letter}!`,
        pictogramKeyword: letter.toLowerCase(),
      }))
    }

    case 'attention': {
      if (data.sensory === 'visual' || data.sensory === 'lights') {
        return [
          { prompt: '¿De qué color es la luz?', options: ['🔴 Rojo', '🔵 Azul', '🟡 Amarillo', '🟢 Verde'], correctIndex: 0, explanation: '¡Es rojo!' },
          { prompt: '¿La luz se mueve?', options: ['Sí', 'No'], correctIndex: 0, explanation: '¡Se mueve!' },
        ]
      }
      if (data.breathing) {
        return [
          { prompt: 'Respira con Lumi. ¿Inhalas o exhalas?', options: ['Inhalo 🌬️', 'Exhalo 💨'], correctIndex: 0, explanation: '¡Inhala profundo!' },
          { prompt: '¿Sientes más calma?', options: ['Sí 😌', 'No 😫', 'Un poco 🤗'], correctIndex: 0, explanation: '¡La respiración ayuda!' },
        ]
      }
      if (data.joint_attention) {
        return [
          { prompt: '¿Ves a Lumi?', options: ['Sí 👀', 'No'], correctIndex: 0, explanation: '¡Lumi te ve!' },
          { prompt: 'Toca la pantalla donde mira Lumi', options: ['Aquí 👆', 'Allá 👉'], correctIndex: 0, explanation: '¡Bien!' },
        ]
      }
      if (data.special_interest) {
        return [
          { prompt: '¿Cuál es tu tema favorito?', options: ['🚗 Autos', '🐱 Animales', '🎵 Música', '🧩 Rompecabezas'], correctIndex: 0, explanation: '¡Comparte con Lumi!' },
        ]
      }
      if (data.story) {
        return [
          { prompt: 'El niño va a la escuela. ¿Qué necesita?', options: ['🎒 Mochila', '🧸 Juguete', '🍕 Comida', '🧩 Puzzle'], correctIndex: 0, explanation: '¡La mochila!' },
          { prompt: '¿Cómo se siente el niño?', options: ['😊 Feliz', '😢 Triste', '😠 Enojado', '😨 Asustado'], correctIndex: 0, explanation: '¡Feliz!' },
        ]
      }
      return [
        { prompt: '¿Dónde está Lumi?', options: ['Aquí 👆', 'Allá 👉', 'Arriba ☝️', 'Abajo 👇'], correctIndex: 0, explanation: '¡Aquí está Lumi!' },
        { prompt: '¿Sigues viendo a Lumi?', options: ['Sí 👀', 'No'], correctIndex: 0, explanation: '¡Sigue mirando!' },
      ]
    }

    case 'imitation': {
      const sounds = data.sounds as string[] | undefined
      if (sounds) {
        return sounds.slice(0, 3).map(sound => ({
          prompt: `Repite el sonido: "${sound}"`,
          options: ['¡Lo hice! 🎯', 'Todavía no 💪'],
          correctIndex: 0,
          explanation: `¡${sound}! ¡Muy bien!`,
        }))
      }
      if (data.conversation) {
        const turns = data.turns as number ?? 3
        const questions = [
          { prompt: 'Lumi dice: "¡Hola! ¿Cómo estás?"', options: ['¡Bien! 😊', 'Mal 😢', 'No sé 🤷', 'Adiós 👋'], correctIndex: 0, explanation: '¡Bien! ¡Buen saludo!' },
          { prompt: 'Lumi pregunta: "¿Qué te gusta hacer?"', options: ['🎮 Jugar', '📚 Leer', '🎨 Dibujar', '🏃 Correr'], correctIndex: 0, explanation: '¡Comparte lo que te gusta!' },
        ]
        return turns >= 3 ? questions : questions.slice(0, 2)
      }
      if (data.simple) {
        return [
          { prompt: 'Lumi levanta la mano. ¿Tú también?', options: ['Sí ✋', 'No'], correctIndex: 0, explanation: '¡Manos arriba!' },
          { prompt: 'Lumi dice "Hola" con la mano. ¿Tú?', options: ['Sí 👋', 'No'], correctIndex: 0, explanation: '¡Hola!' },
        ]
      }
      return [
        { prompt: 'Copia el gesto de Lumi. ¿Cuál es?', options: ['👋 Saludar', '✋ Detener', '👆 Señalar', '🤚 Las dos'], correctIndex: 0, explanation: '¡Saluda!' },
        { prompt: '¿Puedes hacerlo otra vez?', options: ['Sí 💪', 'No'], correctIndex: 0, explanation: '¡Sigue practicando!' },
      ]
    }

    case 'sequence': {
      const task = data.task as string ?? 'morning'
      if (task === 'dressing') {
        return [
          { prompt: '¿Qué te pones primero?', options: ['👕 Camiseta', '👖 Pantalón', '🧦 Calcetines', '👟 Zapatos'], correctIndex: 0, explanation: 'Primero la camiseta' },
          { prompt: '¿Qué va después de los calcetines?', options: ['👕 Camiseta', '👖 Pantalón', '🧦 Calcetines', '👟 Zapatos'], correctIndex: 3, explanation: '¡Los zapatos!' },
        ]
      }
      if (task === 'going_out') {
        return [
          { prompt: '¿Qué agarras primero para salir?', options: ['🔑 Llaves', '📱 Teléfono', '👟 Zapatos', '🧥 Chaqueta'], correctIndex: 3, explanation: '¡La chaqueta primero!' },
          { prompt: 'Antes de salir, ¿qué debes hacer?', options: ['Apagar luces 💡', 'Prender TV 📺', 'Abrir ventana', 'Llamar'], correctIndex: 0, explanation: '¡Apagar las luces!' },
        ]
      }
      return [
        { prompt: '¿Qué haces primero al despertar?', options: ['🛏️ Levantarme', '🍽️ Desayunar', '🪥 Lavarme dientes', '👕 Vestirme'], correctIndex: 0, explanation: '¡Levantarse es lo primero!' },
        { prompt: '¿Y después de desayunar?', options: ['🛏️ Acostarme', '🪥 Lavarme dientes', '👕 Vestirme', '🎮 Jugar'], correctIndex: 1, explanation: '¡Lavarse los dientes!' },
      ]
    }

    case 'vocabulary':
    default:
      return [
        { prompt: '¿Qué es esto? 🍎', options: ['🍎 Manzana', '🚗 Carro', '🧸 Oso', '⭐ Estrella'], correctIndex: 0, explanation: '¡Es una manzana!' },
        { prompt: '¿Dónde vive el pez?', options: ['🌊 Agua', '🌲 Bosque', '🏠 Casa', '☁️ Nube'], correctIndex: 0, explanation: '¡En el agua!' },
        { prompt: '¿Qué usas para escribir?', options: ['✏️ Lápiz', '🥄 Cuchara', '🧣 Bufanda', '🧴 Jabón'], correctIndex: 0, explanation: '¡El lápiz!' },
      ]
  }
}

function pickRandom(arr: Question[], count: number): Question[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const { supabase } = useSupabase()
  const { children } = useChildren()
  const lessonId = params.lessonId as string

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('lessons').select('*').eq('id', lessonId).single().then(({ data }) => {
      if (data) {
        const l = data as Lesson
        setLesson(l)
        const allQuestions = generateQuestions(l)
        setQuestions(pickRandom(allQuestions, Math.min(allQuestions.length, 3)))
      }
      setLoading(false)
    })
  }, [lessonId])

  const question = questions[currentQuestion]
  const total = questions.length
  const isCorrect = selected === question?.correctIndex

  const handleSelect = useCallback((index: number) => {
    if (showResult) return
    setSelected(index)
    setShowResult(true)
    if (index === question.correctIndex) {
      setScore((s) => s + 1)
      playSound('correct')
      vibrate('correct')
    } else {
      playSound('wrong')
      vibrate('wrong')
    }
  }, [showResult, question])

  const handleNext = useCallback(() => {
    if (currentQuestion < total - 1) {
      setCurrentQuestion((q) => q + 1)
      setSelected(null)
      setShowResult(false)
    } else {
      setFinished(true)
    }
  }, [currentQuestion, total])

  useEffect(() => {
    if (!finished || saving || !children[0]) return
    setSaving(true)

    const percent = Math.round((score / total) * 100)
    if (percent >= 60) {
      playSound('celebration')
      vibrate('celebration')
    } else {
      playSound('lumi_sad')
      vibrate('wrong')
    }

    const stars = score === total ? 3 : score >= total / 2 ? 2 : 1
    const xpMap = { 1: 25, 2: 50, 3: lesson?.xp_reward ?? 100 } as const

    supabase.from('child_progress').upsert({
      child_id: children[0].id,
      lesson_id: lessonId,
      completed: true,
      xp_earned: xpMap[stars as keyof typeof xpMap] ?? 25,
      attempts: 1,
      stars,
    }, { onConflict: 'child_id,lesson_id' }).then(() => setSaving(false))
  }, [finished])

  const handleRetry = () => {
    setCurrentQuestion(0)
    setSelected(null)
    setShowResult(false)
    setScore(0)
    setFinished(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Lumi mood="thinking" message="Preparando lección..." />
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Lumi mood="sad" message="Lección no encontrada" />
          <Button variant="primary" onClick={() => router.push('/ruta')} className="mt-4">
            Volver a la ruta
          </Button>
        </div>
      </div>
    )
  }

  if (finished) {
    const percent = Math.round((score / total) * 100)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <Lumi mood={percent >= 60 ? 'excited' : 'happy'} size="lg" />
        </motion.div>
        <h2 className="text-3xl font-extrabold">
          {percent >= 80 ? '¡Increíble! 🌟' : percent >= 60 ? '¡Buen trabajo! 👍' : '¡Sigue intentándolo! 💪'}
        </h2>
        <p className="text-text-secondary text-lg">
          Obtuviste {score} de {total} correctas
        </p>
        <div className="flex gap-3">
          <Button variant="primary" onClick={() => router.push('/ruta')}>
            Volver a la ruta
          </Button>
          <Button variant="outline" onClick={handleRetry}>
            Repetir
          </Button>
        </div>
      </div>
    )
  }

  if (total === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Lumi mood="thinking" message="¡Explora y juega con Lumi!" />
          <p className="text-text-secondary mt-2">Sigue las instrucciones de Lumi</p>
          <Button variant="primary" onClick={() => router.push('/ruta')} className="mt-4">
            Volver a la ruta
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/ruta')}>
          ← Volver
        </Button>
        <div className="flex-1">
          <ProgressBar value={currentQuestion + 1} max={total} />
        </div>
        <span className="text-sm font-bold text-text-secondary">
          {currentQuestion + 1}/{total}
        </span>
      </div>

      <div className="text-center">
        <h2 className="heading-section">{lesson.title}</h2>
        <p className="text-xs text-text-muted">{lesson.description}</p>
      </div>

      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="flex flex-col items-center gap-3">
          <Lumi mood={lesson.tea_level >= 3 ? 'happy' : 'thinking'} message={question.prompt} size={lesson.age_range === '0-2' ? 'lg' : 'md'} />
          {question.pictogramKeyword && (
            <Pictogram keyword={question.pictogramKeyword} size={120} className="border-2 border-border rounded-xl" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {question.options.map((opt, i) => (
            <Card
              key={i}
              variant="default"
              padding="lg"
              onClick={() => handleSelect(i)}
              className={`cursor-pointer text-center transition-all ${
                lesson.tea_level <= 1 ? 'hover:scale-105' : ''
              } ${
                showResult
                  ? i === question.correctIndex
                    ? 'border-success bg-success/10 border-[3px]'
                    : i === selected
                      ? 'border-error bg-error/10 border-[3px]'
                      : 'opacity-60'
                  : 'hover:border-brand hover:shadow-md'
              }`}
            >
              <span className={`font-bold ${lesson.age_range === '0-2' ? 'text-3xl' : lesson.age_range === '6-10' ? 'text-base' : 'text-base'}`}>
                {opt}
              </span>
            </Card>
          ))}
        </div>

        {showResult && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <p className={`text-lg font-extrabold ${isCorrect ? 'text-success' : 'text-error'}`}>
              {isCorrect ? '¡Correcto! 🎉' : '¡Casi! Sigue intentando 💪'}
            </p>
            <Button variant="primary" size="lg" onClick={handleNext} className="mt-3 animate-bounce">
              {currentQuestion < total - 1 ? 'Siguiente →' : 'Ver resultados'}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
