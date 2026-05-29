'use client'

import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Dino } from '@/components/dino'
import { useCurriculumModules, useChildren, useModuleProgress } from '@/lib/hooks/useData'

export default function AreaPage() {
  const params = useParams()
  const router = useRouter()
  const ageRange = params.ageRange as string
  const areaId = params.areaId as string
  
  const { children } = useChildren()
  const child = children[0]
  const { modules, loading } = useCurriculumModules(areaId)
  const { moduleProgress } = useModuleProgress(child?.id)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Dino mood="idle" message="Cargando módulos..." />
      </div>
    )
  }

  const getModuleStatus = (moduleId: string, index: number) => {
    const progress = moduleProgress.find(p => p.module_id === moduleId)
    if (progress?.completed) return 'completed'
    if (index === 0) return 'available'
    const prevModuleId = modules[index - 1]?.id
    const prevCompleted = moduleProgress.some(p => p.module_id === prevModuleId && p.completed)
    return prevCompleted ? 'available' : 'locked'
  }

  return (
    <div className="flex flex-col gap-6 pb-8 min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="flex items-center gap-3 px-4 pt-4">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/ruta/nivel/${ageRange}`)}>
          ← Volver
        </Button>
      </div>

      <div className="px-4">
        <Dino mood="excited" size="md" message="¡Vamos a aprender juntos!" childName={child?.name} />
      </div>

      {/* Camino serpiente tipo Duolingo */}
      <div className="relative px-8 py-8">
        {modules.map((module, index) => {
          const status = getModuleStatus(module.id, index)
          const isLeft = index % 2 === 0
          const progress = moduleProgress.find(p => p.module_id === module.id)
          const completionPercent = progress 
            ? Math.round((progress.exercises_completed / module.total_exercises) * 100)
            : 0

          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.15 }}
              className={`relative mb-16 ${isLeft ? 'ml-0' : 'ml-auto'} w-[85%]`}
            >
              {/* Línea conectora */}
              {index < modules.length - 1 && (
                <div
                  className={`absolute top-full left-1/2 w-1 h-16 -translate-x-1/2 ${
                    status === 'completed' ? 'bg-success' : 'bg-border'
                  }`}
                  style={{
                    height: '64px',
                    transform: `translateX(${isLeft ? '100%' : '-100%'})`,
                  }}
                />
              )}

              {status === 'locked' ? (
                <div className="relative">
                  <div className="bg-gray-200 rounded-3xl p-6 border-4 border-gray-300 opacity-60">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-20 h-20 rounded-full bg-gray-400 flex items-center justify-center text-4xl">
                        🔒
                      </div>
                      <h3 className="font-bold text-text-secondary text-center">{module.name}</h3>
                      <p className="text-xs text-text-muted text-center">
                        Completa el módulo anterior
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <Link href={`/ruta/nivel/${ageRange}/modulo/${module.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative"
                  >
                    <div
                      className={`rounded-3xl p-6 border-4 shadow-lg ${
                        status === 'completed'
                          ? 'bg-gradient-to-br from-green-100 to-green-200 border-success'
                          : 'bg-gradient-to-br from-purple-100 to-purple-200 border-brand'
                      }`}
                    >
                      {/* Badge de estrellas si está completado */}
                      {status === 'completed' && progress && progress.stars > 0 && (
                        <div className="absolute -top-3 -right-3 bg-yellow-400 rounded-full w-12 h-12 flex items-center justify-center border-4 border-white shadow-lg">
                          <span className="text-xl">{'⭐'.repeat(progress.stars)}</span>
                        </div>
                      )}

                      <div className="flex flex-col items-center gap-3">
                        <div
                          className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${
                            status === 'completed' ? 'bg-success' : 'bg-brand'
                          } shadow-lg`}
                        >
                          {status === 'completed' ? '✅' : '🎯'}
                        </div>
                        
                        <h3 className="heading-section text-center">
                          {module.name}
                        </h3>
                        
                        <p className="text-xs text-text-secondary text-center">
                          {module.therapeutic_goal}
                        </p>

                        {/* Barra de progreso */}
                        {status === 'available' && completionPercent > 0 && completionPercent < 100 && (
                          <div className="w-full bg-white rounded-full h-2 mt-2">
                            <div
                              className="bg-brand h-2 rounded-full transition-all"
                              style={{ width: `${completionPercent}%` }}
                            />
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-xs font-bold text-text-muted mt-2">
                          <span>📝 {module.total_exercises} ejercicios</span>
                          {progress && (
                            <span>✨ {progress.total_xp_earned} XP</span>
                          )}
                        </div>

                        {status === 'available' && (
                          <div className="mt-2 bg-brand text-white font-bold px-4 py-2 rounded-full text-sm">
                            {completionPercent > 0 ? 'Continuar →' : 'Comenzar →'}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}