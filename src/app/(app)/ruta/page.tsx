'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useChildren } from '@/lib/hooks/useData'
import { Dino } from '@/components/dino'

export default function RutaPage() {
  const router = useRouter()
  const { children, loading } = useChildren()

  useEffect(() => {
    if (loading) return
    const ageRange = children[0]?.age_range ?? '0-2'
    router.replace(`/ruta/nivel/${ageRange}`)
  }, [loading, children])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Dino mood="idle" message="Cargando tu ruta..." />
    </div>
  )
}
