'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Lumi } from '@/components/lumi/Lumi'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center px-4">
      <Lumi mood="sad" size="lg" />
      <h1 className="text-3xl font-extrabold text-text-primary">
        {isOnline ? '¡Conexión restaurada!' : 'Sin conexión'}
      </h1>
      <p className="text-text-secondary text-lg max-w-sm">
        {isOnline
          ? 'Ya estás conectado de nuevo. ¡Sigue aprendiendo!'
          : 'Parece que no tienes conexión a internet. Revisa tu conexión e intenta de nuevo.'}
      </p>
      <div className="flex gap-3">
        <Button variant="primary" onClick={() => window.location.reload()}>
          {isOnline ? 'Continuar' : 'Reintentar'}
        </Button>
      </div>
      <div className="mt-8 text-sm text-text-muted">
        <p>💡 Puedes usar la Agenda Visual y el Tablero CAA sin conexión</p>
      </div>
    </div>
  )
}
