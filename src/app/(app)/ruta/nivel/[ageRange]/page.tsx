'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChildren, useModuleProgress, useCurriculumAreasFull } from '@/lib/hooks/useData'
import { useParams, useRouter } from 'next/navigation'
import { EggNode } from '@/components/ui/EggNode'
import { Nunito } from 'next/font/google'
import Image from 'next/image'
import { getEggState } from '@/lib/utils/eggState'
import type { CurriculumArea, CurriculumModule } from '@/types/curriculum'

const nunito = Nunito({ subsets: ['latin'], weight: ['700', '800'] })

const EGG_PREFIXES: Record<number, string> = {
  1: 'egg-comun',
  2: 'egg-social',
  3: 'egg-motor',
  4: 'egg-grueso',
  5: 'egg-cognitive',
  6: 'egg-autonomy',
  7: 'egg-sensory',
}

const ROW_PATTERN = [1, 2, 2, 3, 2, 1]

function buildRows<T>(items: T[], pattern: number[]): T[][] {
  const rows: T[][] = []
  let index = 0
  for (const count of pattern) {
    const row: T[] = []
    for (let i = 0; i < count && index < items.length; i++) row.push(items[index++])
    if (row.length) rows.push(row)
  }
  return rows
}

// ─── AreaSection ──────────────────────────────────────────────────────────────

interface AreaSectionProps {
  area: CurriculumArea
  modules: CurriculumModule[]
  completedIds: Set<string>
  ageRange: string
  nunitoClass: string
  dinoImage?: string
  onChestClick?: (area: CurriculumArea) => void
  prevAreaCompleted?: boolean
  isFirst?: boolean
}

function AreaCard({ area, percent, nunitoClass, topMargin }: { area: CurriculumArea; percent: number; nunitoClass: string; topMargin?: string }) {
  return (
    <div className={`mx-4 ${topMargin ?? 'mt-6'} mb-10 relative z-10`}>
      <div className="relative bg-white rounded-2xl shadow-lg border border-border/60 p-6 overflow-hidden">
        {/* Floating pastel decorative elements */}
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-brand-bg/40 blur-xl pointer-events-none" />
        <div className="absolute bottom-4 -left-4 w-16 h-16 rounded-full bg-accent-light/20 blur-lg pointer-events-none" />
        <div className="absolute top-1/2 right-8 w-8 h-8 rounded-full bg-pink-100/40 blur-md pointer-events-none" />

        <div className="relative flex items-start gap-5">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-brand-bg flex items-center justify-center text-2xl shrink-0 shadow-sm">
            {area.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="inline-block bg-brand-bg/90 backdrop-blur-sm rounded-full px-2.5 py-0.5 text-badge text-brand-dark uppercase tracking-wider mb-1">
              Área de desarrollo
            </div>
            <h2 className="text-xl font-extrabold text-text-primary">{area.name}</h2>
            <p className="text-sm text-text-secondary font-semibold mt-1.5 mb-4">{area.description}</p>
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-text-muted">Progreso del área</span>
                <span className="text-brand">{percent}%</span>
              </div>
              <div className="w-full h-2.5 bg-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-brand-light to-brand"
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AreaCardPremium({ area, percent, nunitoClass, dinoImage, dinoLeft = '-left-6', topMargin }: { area: CurriculumArea; percent: number; nunitoClass: string; dinoImage: string; dinoLeft?: string; topMargin?: string }) {
  return (
    <div className={`mx-4 ${topMargin ?? 'mt-6'} mb-10 relative z-10`}>
      <div className="relative bg-white rounded-2xl shadow-xl border border-border/40 p-6 overflow-hidden min-h-[180px]">
        {/* Floating pastel decorative elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-brand-bg/50 blur-2xl pointer-events-none" />
        <div className="absolute bottom-8 -left-6 w-24 h-24 rounded-full bg-accent-light/20 blur-xl pointer-events-none" />
        <div className="absolute top-1/3 right-12 w-12 h-12 rounded-full bg-pink-100/40 blur-lg pointer-events-none" />
        <div className="absolute bottom-4 right-16 w-6 h-6 rounded-full bg-purple-100/30 blur-md pointer-events-none" />

        <div className="relative">
          {/* Dinosaur teacher - absolute, no afecta el alto */}
          <div className={`absolute ${dinoLeft} -top-10 w-[204px] h-[234px] pointer-events-none z-10`}>
            <Image
              src={dinoImage}
              alt="Dino teacher"
              fill
              sizes="204px"
              className="object-contain drop-shadow-xl"
              priority
              unoptimized
            />
          </div>

          {/* Content with padding para no solaparse con el dino */}
          <div className="pl-[130px]">
            <div className="inline-block bg-brand-bg/90 backdrop-blur-sm rounded-full px-3 py-1 text-badge text-brand-dark uppercase tracking-wider mb-2">
              Área de desarrollo
            </div>
            <h2 className={`${nunitoClass} text-2xl font-extrabold text-text-primary leading-tight`}>
              {area.name}
            </h2>
            <p className="text-sm text-text-secondary font-semibold mt-2 mb-5 leading-relaxed">
              {area.description}
            </p>
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-text-muted">Progreso del área</span>
                <span className="text-brand">{percent}%</span>
              </div>
              <div className="w-full h-3 bg-border/60 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-brand-light via-brand to-brand-dark"
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AreaSection({ area, modules, completedIds, ageRange, nunitoClass, dinoImage, onChestClick, prevAreaCompleted, isFirst }: AreaSectionProps) {
  const router = useRouter()
  const eggPrefix = EGG_PREFIXES[area.order_index] ?? 'egg-comun'

  const completedInArea = modules.filter(m => completedIds.has(m.id)).length
  const percent = modules.length
    ? Math.round((completedInArea / modules.length) * 100)
    : 0

  // 10 módulos en ROW_PATTERN, luego cofre en fila extra
  const moduleRows = buildRows(modules, ROW_PATTERN)

  return (
    <>
      {dinoImage ? (
        <AreaCardPremium area={area} percent={percent} nunitoClass={nunitoClass} dinoImage={dinoImage} dinoLeft={dinoImage.includes('1') ? '-left-6' : '-left-10'} topMargin={isFirst ? 'mt-2' : 'mt-6'} />
      ) : (
        <AreaCard area={area} percent={percent} nunitoClass={nunitoClass} topMargin={isFirst ? 'mt-2' : 'mt-6'} />
      )}

      {/* ── Grid de módulos ── */}
      <div className="w-full max-w-md mx-auto bg-white py-8 px-4">
        <div className="flex flex-col gap-20">

          {moduleRows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className={`flex items-start w-full
                ${row.length === 1 ? 'justify-center' : ''}
                ${row.length === 2 ? 'justify-center gap-18' : ''}
                ${row.length === 3 ? 'justify-center gap-14' : ''}
              `}
            >
              {row.map((module) => {
                const globalIndex = modules.indexOf(module)
                const state = getEggState(module, modules, completedIds, prevAreaCompleted)
                return (
                  <EggNode
                    key={module.id}
                    name={module.name}
                    state={state}
                    index={globalIndex}
                    imageSrc={`/eggs/${eggPrefix}-${globalIndex}.png`}
                    fontClass={nunitoClass}
                    onClick={() => router.push(`/ruta/nivel/${ageRange}/modulo/${module.id}`)}
                  />
                )
              })}
            </div>
          ))}

          {/* ── Cofre especial ── */}
          <div className="flex justify-center">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, type: 'spring', stiffness: 200 }}
              whileHover={{ y: -6, scale: 1.05, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChestClick?.(area)}
              className="relative flex flex-col items-center cursor-pointer group"
            >
              <div className="relative w-[90px] h-[90px]">
                <Image
                  src={`/chest/chest-specials-${area.order_index}.png`}
                  alt={`Cofre especial área ${area.order_index}`}
                  fill
                  sizes="90px"
                  className="object-contain drop-shadow-lg group-hover:drop-shadow-xl transition-all duration-200"
                />
              </div>
              <p className={`${nunitoClass} text-sm font-extrabold text-amber-600 text-center mt-3 max-w-[120px]`}>
                ¡Cofre especial!
              </p>
            </motion.button>
          </div>

        </div>
      </div>
    </>
  )
}

// ─── ChestModal ────────────────────────────────────────────────────────────────

interface ChestModalProps {
  area: CurriculumArea
  ageRange: string
  onClose: () => void
}

const DOWNLOAD_ITEMS = [
  { title: 'Copa de campeón', desc: 'Trofeo descargable', emoji: '🏆', color: 'from-yellow-200 to-orange-100' },
  { title: 'Material de Apoyo', desc: 'Recursos adicionales', emoji: '📚', color: 'from-blue-200 to-indigo-100' },
]

function ChestModal({ area, ageRange, onClose }: ChestModalProps) {
  const router = useRouter()
  const isLastArea = area.order_index === 7
  const nextAreaUrl = !isLastArea
    ? `/ruta/nivel/${ageRange}?area=${area.order_index + 1}`
    : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
    >
      {/* Backdrop sólido */}
      <div className="absolute inset-0 bg-black/85" onClick={onClose} />

      {/* Modal compacto */}
      <motion.div
        initial={{ scale: 0.85, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.85, y: 30, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="relative w-full max-w-[280px] rounded-3xl shadow-xl overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)' }}
      >
        {/* Glass shine overlay */}
        <div className="absolute inset-0 pointer-events-none rounded-3xl" style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.2) 100%)',
          border: '1px solid rgba(255,255,255,0.8)',
        }} />
        <div className="relative p-5 flex flex-col items-center text-center">
          {/* Chest icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
            className="w-20 h-20 mb-3"
          >
            <Image
              src={`/chest/chest-specials-${area.order_index}.png`}
              alt="Cofre"
              width={80}
              height={80}
              className="object-contain drop-shadow-lg"
              unoptimized
            />
          </motion.div>

          {/* Congratulations */}
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-xl font-extrabold text-text-primary"
          >
            ¡Felicidades! 🎉
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs text-text-secondary font-semibold mt-1 mb-3"
          >
            Completaste <span className="text-brand-dark font-extrabold">{area.name}</span>
          </motion.p>

          {!isLastArea && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-[10px] text-text-muted font-medium mb-4"
            >
              Sigue así y continúa con la siguiente área
            </motion.p>
          )}

          {/* Downloadable items */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full space-y-2 mb-4"
          >
            <p className="text-badge text-text-muted uppercase tracking-wider mb-2">
              Contenido descargable
            </p>
            {DOWNLOAD_ITEMS.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200"
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-base shadow-sm shrink-0`}>
                  {item.emoji}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-xs font-bold text-text-primary">{item.title}</p>
                  <p className="text-[10px] text-text-muted font-medium">{item.desc}</p>
                </div>
                <span className="text-[9px] font-bold text-text-muted px-2 py-1 rounded-lg bg-surface-secondary">
                  Pronto
                </span>
              </div>
            ))}
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex flex-col gap-2 w-full"
          >
            {!isLastArea && nextAreaUrl && (
              <button
                onClick={() => {
                  onClose()
                  router.push(nextAreaUrl)
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand to-brand-dark text-white font-extrabold text-xs shadow-md active:scale-[0.98]"
              >
                Continuar con la siguiente área →
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full py-2 rounded-xl border border-gray-300 text-text-muted font-bold text-xs active:scale-[0.98]"
            >
              Cerrar
            </button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── NivelPage ────────────────────────────────────────────────────────────────

export default function NivelPage() {
  const params = useParams()
  const ageRange = params?.ageRange as string | undefined

  const { children } = useChildren()
  const childId = children[0]?.id

  const { areas, modulesByArea, loading } = useCurriculumAreasFull(ageRange)
  const { moduleProgress } = useModuleProgress(childId)

  const [openChestArea, setOpenChestArea] = useState<CurriculumArea | null>(null)

  const completedIds = useMemo(
    () => new Set(moduleProgress.filter(p => p.completed).map(p => p.module_id)),
    [moduleProgress]
  )

  if (!ageRange || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-text-muted font-semibold animate-pulse">Cargando ruta...</p>
      </div>
    )
  }

  // Determina si el área anterior está completada
  function isPrevAreaCompleted(areaIdx: number): boolean {
    if (areaIdx === 0) return true // área 1 no tiene anterior
    const prevArea = areas[areaIdx - 1]
    if (!prevArea) return true
    const prevModules = modulesByArea[prevArea.id] ?? []
    return prevModules.length > 0 && prevModules.every(m => completedIds.has(m.id))
  }

  return (
    <div className="flex flex-col pb-32 -mx-4">
      {areas.map((area, idx) => (
        <AreaSection
          key={area.id}
          area={area}
          modules={modulesByArea[area.id] ?? []}
          completedIds={completedIds}
          ageRange={ageRange}
          nunitoClass={nunito.className}
          dinoImage={idx <= 6 ? `/dinos/dino-master-${idx + 1}.png` : undefined}
          onChestClick={setOpenChestArea}
          prevAreaCompleted={isPrevAreaCompleted(idx)}
          isFirst={idx === 0}
        />
      ))}

      <AnimatePresence>
        {openChestArea && (
          <ChestModal
            area={openChestArea}
            ageRange={ageRange}
            onClose={() => setOpenChestArea(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}