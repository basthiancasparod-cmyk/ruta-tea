'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Pictogram } from '@/components/ui/Pictogram'

interface StoryPage {
  text: string
  keyword: string
}

interface SocialStory {
  id: string
  title: string
  pages: StoryPage[]
}

const SAMPLE_STORIES: SocialStory[] = [
  {
    id: 'doctor',
    title: 'Ir al medico',
    pages: [
      { text: 'A veces necesito ir al medico.', keyword: 'medico' },
      { text: 'El medico me ayuda a estar sano.', keyword: 'doctor' },
      { text: 'Puede usar instrumentos para revisarme.', keyword: 'revision' },
      { text: 'Cuando termino, puedo volver a casa.', keyword: 'casa' },
    ],
  },
]

export default function HistoriasSocialesPage() {
  const [selectedStory, setSelectedStory] = useState<SocialStory | null>(null)
  const [pageIndex, setPageIndex] = useState(0)

  if (selectedStory) {
    const page = selectedStory.pages[pageIndex]

    return (
      <div className="flex flex-col gap-6 pb-8">
        <Button variant="ghost" size="sm" onClick={() => {
          setSelectedStory(null)
          setPageIndex(0)
        }}>
          Volver
        </Button>

        <motion.div
          key={pageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center gap-6"
        >
          <Pictogram keyword={page.keyword} size={120} />
          <p className="text-xl font-bold">
            {page.text}
          </p>
        </motion.div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            size="md"
            disabled={pageIndex === 0}
            onClick={() => setPageIndex(p => p - 1)}
          >
            Anterior
          </Button>

          <Button
            variant="primary"
            size="md"
            disabled={pageIndex === selectedStory.pages.length - 1}
            onClick={() => setPageIndex(p => p + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <h1 className="heading-page">Historias Sociales</h1>

      <div
        className="bg-gradient-to-br from-purple-100 to-pink-50 rounded-2xl shadow-md p-6 cursor-pointer"
        onClick={() => setSelectedStory(SAMPLE_STORIES[0])}
      >
        <h3 className="heading-section">Ir al medico</h3>
        <p className="text-meta">Historia sencilla de ejemplo</p>
      </div>
    </div>
  )
}