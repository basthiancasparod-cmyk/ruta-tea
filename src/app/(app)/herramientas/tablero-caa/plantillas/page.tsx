'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Lumi } from '@/components/lumi/Lumi'
import { useCAABoardMutations } from '@/lib/hooks/useCAA'
import { useSupabase } from '@/components/layout/SupabaseProvider'
import { useChildren } from '@/lib/hooks/useData'
import type { CAABoard, CAACell, FitzgeraldKey } from '@/types/caa'
import { FITZGERALD_COLORS } from '@/types/caa'

// Plantillas predefinidas
const TEMPLATES = [
  {
    name: 'Comunicación Básica',
    description: 'Vocabulario esencial para comunicarse en el día a día',
    category: 'core',
    icon: '💬',
    gradient: 'from-green-100 to-emerald-50',
    grid_size: '4x6' as const,
    columns: 6,
    rows: 4,
  },
  {
    name: 'Emociones',
    description: 'Expresar cómo me siento',
    category: 'emotions',
    icon: '😊',
    gradient: 'from-yellow-100 to-amber-50',
    grid_size: '3x4' as const,
    columns: 4,
    rows: 3,
  },
  {
    name: 'Peticiones y Necesidades',
    description: 'Pedir lo que necesito',
    category: 'requests',
    icon: '🙋',
    gradient: 'from-blue-100 to-cyan-50',
    grid_size: '4x6' as const,
    columns: 6,
    rows: 4,
  },
  {
    name: 'Comidas y Bebidas',
    description: 'Vocabulario para la hora de comer',
    category: 'fringe',
    icon: '🍽️',
    gradient: 'from-orange-100 to-amber-50',
    grid_size: '4x6' as const,
    columns: 6,
    rows: 4,
  },
  {
    name: 'Rutina Escolar',
    description: 'Comunicación en el colegio',
    category: 'fringe',
    icon: '🎒',
    gradient: 'from-purple-100 to-violet-50',
    grid_size: '4x6' as const,
    columns: 6,
    rows: 4,
  },
  {
    name: 'Juego y Tiempo Libre',
    description: 'Actividades recreativas',
    category: 'fringe',
    icon: '🎮',
    gradient: 'from-pink-100 to-rose-50',
    grid_size: '4x6' as const,
    columns: 6,
    rows: 4,
  },
]

interface TemplateCellInput {
  position_row: number
  position_col: number
  label: string
  fitzgerald_key: FitzgeraldKey
  action_type?: string
}

const TEMPLATE_CELLS: Record<string, TemplateCellInput[]> = {
  'Comunicación Básica': [
    { position_row:0, position_col:0, label:'Yo', fitzgerald_key:'subject' },
    { position_row:0, position_col:1, label:'Tú', fitzgerald_key:'subject' },
    { position_row:0, position_col:2, label:'Él', fitzgerald_key:'subject' },
    { position_row:0, position_col:3, label:'Hola', fitzgerald_key:'social' },
    { position_row:0, position_col:4, label:'Adiós', fitzgerald_key:'social' },
    { position_row:0, position_col:5, label:'Sí', fitzgerald_key:'social' },
    { position_row:1, position_col:0, label:'No', fitzgerald_key:'social' },
    { position_row:1, position_col:1, label:'Gracias', fitzgerald_key:'social' },
    { position_row:1, position_col:2, label:'Por favor', fitzgerald_key:'social' },
    { position_row:1, position_col:3, label:'Quiero', fitzgerald_key:'verb' },
    { position_row:1, position_col:4, label:'Necesito', fitzgerald_key:'verb' },
    { position_row:1, position_col:5, label:'Ayuda', fitzgerald_key:'verb' },
    { position_row:2, position_col:0, label:'Comer', fitzgerald_key:'verb' },
    { position_row:2, position_col:1, label:'Beber', fitzgerald_key:'verb' },
    { position_row:2, position_col:2, label:'Ir', fitzgerald_key:'verb' },
    { position_row:2, position_col:3, label:'Jugar', fitzgerald_key:'verb' },
    { position_row:2, position_col:4, label:'Dormir', fitzgerald_key:'verb' },
    { position_row:2, position_col:5, label:'Ver', fitzgerald_key:'verb' },
    { position_row:3, position_col:0, label:'Agua', fitzgerald_key:'object' },
    { position_row:3, position_col:1, label:'Casa', fitzgerald_key:'object' },
    { position_row:3, position_col:2, label:'Bueno', fitzgerald_key:'descriptive' },
    { position_row:3, position_col:3, label:'Malo', fitzgerald_key:'descriptive' },
    { position_row:3, position_col:4, label:'Baño', fitzgerald_key:'place' },
    { position_row:3, position_col:5, label:'Más', fitzgerald_key:'descriptive' },
  ],
  Emociones: [
    { position_row:0, position_col:0, label:'Feliz', fitzgerald_key:'descriptive' },
    { position_row:0, position_col:1, label:'Triste', fitzgerald_key:'descriptive' },
    { position_row:0, position_col:2, label:'Enojado', fitzgerald_key:'descriptive' },
    { position_row:0, position_col:3, label:'Asustado', fitzgerald_key:'descriptive' },
    { position_row:1, position_col:0, label:'Cansado', fitzgerald_key:'descriptive' },
    { position_row:1, position_col:1, label:'Hambriento', fitzgerald_key:'descriptive' },
    { position_row:1, position_col:2, label:'Enfermo', fitzgerald_key:'descriptive' },
    { position_row:1, position_col:3, label:'Sorprendido', fitzgerald_key:'descriptive' },
    { position_row:2, position_col:0, label:'Quiero', fitzgerald_key:'verb' },
    { position_row:2, position_col:1, label:'Necesito', fitzgerald_key:'verb' },
    { position_row:2, position_col:2, label:'Ayuda', fitzgerald_key:'verb' },
    { position_row:2, position_col:3, label:'Abrazo', fitzgerald_key:'object' },
  ],
  'Peticiones y Necesidades': [
    { position_row:0, position_col:0, label:'Yo', fitzgerald_key:'subject' },
    { position_row:0, position_col:1, label:'Quiero', fitzgerald_key:'verb' },
    { position_row:0, position_col:2, label:'Necesito', fitzgerald_key:'verb' },
    { position_row:0, position_col:3, label:'Dame', fitzgerald_key:'verb' },
    { position_row:0, position_col:4, label:'Ayuda', fitzgerald_key:'verb' },
    { position_row:0, position_col:5, label:'Para', fitzgerald_key:'verb' },
    { position_row:1, position_col:0, label:'Agua', fitzgerald_key:'object' },
    { position_row:1, position_col:1, label:'Comida', fitzgerald_key:'object' },
    { position_row:1, position_col:2, label:'Jugo', fitzgerald_key:'object' },
    { position_row:1, position_col:3, label:'Leche', fitzgerald_key:'object' },
    { position_row:1, position_col:4, label:'Galletas', fitzgerald_key:'object' },
    { position_row:1, position_col:5, label:'Fruta', fitzgerald_key:'object' },
    { position_row:2, position_col:0, label:'Baño', fitzgerald_key:'place' },
    { position_row:2, position_col:1, label:'Cama', fitzgerald_key:'object' },
    { position_row:2, position_col:2, label:'Casa', fitzgerald_key:'place' },
    { position_row:2, position_col:3, label:'Parque', fitzgerald_key:'place' },
    { position_row:2, position_col:4, label:'Colegio', fitzgerald_key:'place' },
    { position_row:2, position_col:5, label:'Médico', fitzgerald_key:'place' },
    { position_row:3, position_col:0, label:'Sí', fitzgerald_key:'social' },
    { position_row:3, position_col:1, label:'No', fitzgerald_key:'social' },
    { position_row:3, position_col:2, label:'Por favor', fitzgerald_key:'social' },
    { position_row:3, position_col:3, label:'Gracias', fitzgerald_key:'social' },
    { position_row:3, position_col:4, label:'Más', fitzgerald_key:'descriptive' },
    { position_row:3, position_col:5, label:'Ya', fitzgerald_key:'time' },
  ],
  'Comidas y Bebidas': [
    { position_row:0, position_col:0, label:'Desayuno', fitzgerald_key:'time' },
    { position_row:0, position_col:1, label:'Almuerzo', fitzgerald_key:'time' },
    { position_row:0, position_col:2, label:'Cena', fitzgerald_key:'time' },
    { position_row:0, position_col:3, label:'Merienda', fitzgerald_key:'time' },
    { position_row:0, position_col:4, label:'Quiero', fitzgerald_key:'verb' },
    { position_row:0, position_col:5, label:'No quiero', fitzgerald_key:'verb' },
    { position_row:1, position_col:0, label:'Pan', fitzgerald_key:'object' },
    { position_row:1, position_col:1, label:'Arroz', fitzgerald_key:'object' },
    { position_row:1, position_col:2, label:'Pollo', fitzgerald_key:'object' },
    { position_row:1, position_col:3, label:'Carne', fitzgerald_key:'object' },
    { position_row:1, position_col:4, label:'Pescado', fitzgerald_key:'object' },
    { position_row:1, position_col:5, label:'Huevos', fitzgerald_key:'object' },
    { position_row:2, position_col:0, label:'Fruta', fitzgerald_key:'object' },
    { position_row:2, position_col:1, label:'Verduras', fitzgerald_key:'object' },
    { position_row:2, position_col:2, label:'Sopa', fitzgerald_key:'object' },
    { position_row:2, position_col:3, label:'Leche', fitzgerald_key:'object' },
    { position_row:2, position_col:4, label:'Agua', fitzgerald_key:'object' },
    { position_row:2, position_col:5, label:'Jugo', fitzgerald_key:'object' },
    { position_row:3, position_col:0, label:'Pastel', fitzgerald_key:'object' },
    { position_row:3, position_col:1, label:'Helado', fitzgerald_key:'object' },
    { position_row:3, position_col:2, label:'Galletas', fitzgerald_key:'object' },
    { position_row:3, position_col:3, label:'Cuchara', fitzgerald_key:'object' },
    { position_row:3, position_col:4, label:'Tenedor', fitzgerald_key:'object' },
    { position_row:3, position_col:5, label:'Vaso', fitzgerald_key:'object' },
  ],
  'Rutina Escolar': [
    { position_row:0, position_col:0, label:'Yo', fitzgerald_key:'subject' },
    { position_row:0, position_col:1, label:'Maestro', fitzgerald_key:'subject' },
    { position_row:0, position_col:2, label:'Amigo', fitzgerald_key:'subject' },
    { position_row:0, position_col:3, label:'Compañero', fitzgerald_key:'subject' },
    { position_row:0, position_col:4, label:'Director', fitzgerald_key:'subject' },
    { position_row:0, position_col:5, label:'Hola', fitzgerald_key:'social' },
    { position_row:1, position_col:0, label:'Leer', fitzgerald_key:'verb' },
    { position_row:1, position_col:1, label:'Escribir', fitzgerald_key:'verb' },
    { position_row:1, position_col:2, label:'Dibujar', fitzgerald_key:'verb' },
    { position_row:1, position_col:3, label:'Cantar', fitzgerald_key:'verb' },
    { position_row:1, position_col:4, label:'Jugar', fitzgerald_key:'verb' },
    { position_row:1, position_col:5, label:'Correr', fitzgerald_key:'verb' },
    { position_row:2, position_col:0, label:'Lápiz', fitzgerald_key:'object' },
    { position_row:2, position_col:1, label:'Libro', fitzgerald_key:'object' },
    { position_row:2, position_col:2, label:'Colores', fitzgerald_key:'object' },
    { position_row:2, position_col:3, label:'Tijeras', fitzgerald_key:'object' },
    { position_row:2, position_col:4, label:'Pegamento', fitzgerald_key:'object' },
    { position_row:2, position_col:5, label:'Mochila', fitzgerald_key:'object' },
    { position_row:3, position_col:0, label:'Salón', fitzgerald_key:'place' },
    { position_row:3, position_col:1, label:'Patio', fitzgerald_key:'place' },
    { position_row:3, position_col:2, label:'Biblioteca', fitzgerald_key:'place' },
    { position_row:3, position_col:3, label:'Comedor', fitzgerald_key:'place' },
    { position_row:3, position_col:4, label:'Recreo', fitzgerald_key:'time' },
    { position_row:3, position_col:5, label:'Casa', fitzgerald_key:'place' },
  ],
  'Juego y Tiempo Libre': [
    { position_row:0, position_col:0, label:'Quiero', fitzgerald_key:'verb' },
    { position_row:0, position_col:1, label:'Jugar', fitzgerald_key:'verb' },
    { position_row:0, position_col:2, label:'Salir', fitzgerald_key:'verb' },
    { position_row:0, position_col:3, label:'Ver', fitzgerald_key:'verb' },
    { position_row:0, position_col:4, label:'Escuchar', fitzgerald_key:'verb' },
    { position_row:0, position_col:5, label:'Compartir', fitzgerald_key:'verb' },
    { position_row:1, position_col:0, label:'Pelota', fitzgerald_key:'object' },
    { position_row:1, position_col:1, label:'Muñeco', fitzgerald_key:'object' },
    { position_row:1, position_col:2, label:'Carro', fitzgerald_key:'object' },
    { position_row:1, position_col:3, label:'Bloques', fitzgerald_key:'object' },
    { position_row:1, position_col:4, label:'Rompecabezas', fitzgerald_key:'object' },
    { position_row:1, position_col:5, label:'Columpio', fitzgerald_key:'object' },
    { position_row:2, position_col:0, label:'Parque', fitzgerald_key:'place' },
    { position_row:2, position_col:1, label:'Playa', fitzgerald_key:'place' },
    { position_row:2, position_col:2, label:'Piscina', fitzgerald_key:'place' },
    { position_row:2, position_col:3, label:'Casa', fitzgerald_key:'place' },
    { position_row:2, position_col:4, label:'Jardín', fitzgerald_key:'place' },
    { position_row:2, position_col:5, label:'Fiesta', fitzgerald_key:'object' },
    { position_row:3, position_col:0, label:'Amigo', fitzgerald_key:'subject' },
    { position_row:3, position_col:1, label:'Familia', fitzgerald_key:'subject' },
    { position_row:3, position_col:2, label:'Juntos', fitzgerald_key:'social' },
    { position_row:3, position_col:3, label:'Hoy', fitzgerald_key:'time' },
    { position_row:3, position_col:4, label:'Mañana', fitzgerald_key:'time' },
    { position_row:3, position_col:5, label:'Sí', fitzgerald_key:'social' },
  ],
}

export default function PlantillasPage() {
  const router = useRouter()
  const { children } = useChildren()
  const childId = children[0]?.id
  const { supabase } = useSupabase()
  const { createBoard } = useCAABoardMutations()
  const [creating, setCreating] = useState<string | null>(null)

  const handleUseTemplate = async (template: typeof TEMPLATES[0]) => {
    if (!childId) {
      alert('Necesitas tener un perfil de niño configurado')
      return
    }

    setCreating(template.name)
    
    try {
      const newBoard = await createBoard({
        name: template.name,
        description: template.description,
        category: template.category,
        grid_size: template.grid_size,
        columns: template.columns,
        rows: template.rows,
        child_id: childId,
        is_template: false,
        is_favorite: false,
        settings: {
          cellSize: 'md',
          showLabels: true,
          voiceRate: 0.85,
          voicePitch: 1.0,
          autoSpeak: false,
        },
      })

      const cells = TEMPLATE_CELLS[template.name]
      if (cells) {
        const batch = cells.map(c => {
          const fc = FITZGERALD_COLORS[c.fitzgerald_key]
          return {
            id: crypto.randomUUID(),
            board_id: newBoard.id,
            position_row: c.position_row,
            position_col: c.position_col,
            label: c.label,
            pictogram_keyword: c.label.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(),
            background_color: fc.bg,
            border_color: fc.border,
            text_color: fc.text,
            fitzgerald_key: c.fitzgerald_key,
            is_folder: false,
            action_type: 'add_to_message',
            order_index: c.position_row * template.columns + c.position_col,
          }
        })
        const { error: batchErr } = await supabase.from("caa_cells").insert(batch)
        if (batchErr) throw new Error(`Error creando celdas: ${batchErr.message}`)
      }

      router.push(`/herramientas/tablero-caa/editor/${newBoard.id}`)
    } catch (error) {
      console.error('Error creating from template:', error)
      alert('Error al crear el tablero')
    } finally {
      setCreating(null)
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          ← Atrás
        </Button>
        <div className="flex-1">
          <h1 className="heading-page">
            Plantillas
          </h1>
          <p className="text-body">
            Comienza con tableros prediseñados
          </p>
        </div>
      </div>

      <Lumi
        mood="excited"
        message="Elige una plantilla y personalízala como quieras"
        size="sm"
      />

      {/* Info banner */}
      <Card variant="default" padding="md" className="bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <span className="text-2xl">💡</span>
          <div className="flex-1">
            <h3 className="heading-card mb-1">
              Personalización completa
            </h3>
            <p className="text-meta leading-relaxed">
              Todas las plantillas se pueden editar completamente. Úsalas como
              punto de partida y ajústalas a las necesidades específicas.
            </p>
          </div>
        </div>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEMPLATES.map((template, i) => (
          <motion.div
            key={template.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div
              className={`
                relative h-full bg-gradient-to-br ${template.gradient}
                rounded-2xl shadow-md p-6 overflow-hidden
                border border-border
                min-h-[220px] flex flex-col
              `}
            >
              {/* Decorative elements */}
              <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/30 blur-2xl" />
              <div className="absolute bottom-4 -left-4 w-16 h-16 rounded-full bg-white/20 blur-xl" />

              <div className="relative flex-1 flex flex-col">
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                  className="w-16 h-16 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center text-3xl shadow-sm mb-4"
                >
                  {template.icon}
                </motion.div>

                {/* Content */}
                <h3 className="heading-section mb-2">
                  {template.name}
                </h3>
                <p className="text-body leading-relaxed mb-4 flex-1">
                  {template.description}
                </p>

                {/* Metadata */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold bg-white/60 backdrop-blur-sm px-2 py-1 rounded-full text-text-secondary">
                    {template.grid_size}
                  </span>
                  <span className="text-xs font-bold bg-white/60 backdrop-blur-sm px-2 py-1 rounded-full text-text-secondary">
                    {template.category}
                  </span>
                </div>

                {/* Button */}
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => handleUseTemplate(template)}
                  disabled={creating === template.name}
                >
                  {creating === template.name ? '⏳ Creando...' : '✨ Usar plantilla'}
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Custom template CTA */}
      <Card variant="highlight" padding="lg">
        <div className="text-center">
          <div className="text-4xl mb-3">🎨</div>
          <h3 className="heading-section mb-2">
            ¿Necesitas algo diferente?
          </h3>
          <p className="text-body mb-4 max-w-md mx-auto">
            Crea un tablero completamente personalizado desde cero con el
            editor visual.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => router.push('/herramientas/tablero-caa/editor/nuevo')}
          >
            Crear desde cero
          </Button>
        </div>
      </Card>
    </div>
  )
}