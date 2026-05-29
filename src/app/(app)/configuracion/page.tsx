'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { Card } from '@/components/ui/Card'
import { Lumi } from '@/components/lumi/Lumi'
import { AvatarUpload } from '@/components/ui/AvatarUpload'
import { useSupabase } from '@/components/layout/SupabaseProvider'
import { useChildren } from '@/lib/hooks/useData'
import { themes, setCookieTheme, getCookieTheme } from '@/lib/theme/themes'
import type { ThemeId } from '@/lib/theme/themes'

export default function ConfiguracionPage() {
  const { profile } = useSupabase()
  const { children } = useChildren()
  const child = children[0]
  const [childAvatarUrl, setChildAvatarUrl] = useState<string | null | undefined>(child?.avatar_url)
  const currentLocale = useLocale()

  useEffect(() => {
    setChildAvatarUrl(child?.avatar_url)
  }, [child?.avatar_url])

  const handleAvatarUpdate = (url: string | null) => {
    setChildAvatarUrl(url)
  }

  const [soundEnabled, setSoundEnabled] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal')
  const [activeTheme, setActiveTheme] = useState<ThemeId>('default')

  useEffect(() => {
    setActiveTheme(getCookieTheme())
  }, [])

  const switchTheme = (id: ThemeId) => {
    setActiveTheme(id)
    setCookieTheme(id)
    document.documentElement.setAttribute('data-theme', id)
  }

  const locales = [
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
  ]

  const switchLocale = (locale: string) => {
    document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000`
    window.location.reload()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Lumi mood="idle" size="sm" />
        <div>
          <h1 className="heading-page">Configuración</h1>
          <p className="text-body">Personaliza la experiencia</p>
        </div>
      </div>

      {child && (
        <Card variant="bordered" padding="md">
          <h2 className="heading-section mb-3">Perfil del niño</h2>
          <AvatarUpload
            childId={child.id}
            currentUrl={childAvatarUrl}
            currentEmoji={child.avatar_pictogram}
            name={child.name}
            onUpdate={handleAvatarUpdate}
          />
          <div className="mt-3">
            <p className="font-bold text-text-primary">{child.name}</p>
            <p className="text-sm text-text-secondary">
              {child.age_range} años · Nivel {child.tea_level} TEA
            </p>
          </div>
          {child.interests.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-bold text-text-muted mb-1">Intereses:</p>
              <div className="flex gap-1 flex-wrap">
                {child.interests.map((i) => (
                  <span key={i} className="text-xs bg-brand-bg text-brand font-bold px-2 py-0.5 rounded-full">
                    {i}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      <Card variant="default" padding="md">
        <h2 className="heading-section mb-4">Preferencias</h2>
        <div className="flex flex-col gap-4">
          <div>
            <span className="font-bold text-text-primary block mb-2">🎨 Tema</span>
            <div className="grid grid-cols-3 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => switchTheme(t.id)}
                  className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl font-bold text-sm transition-all ${
                    activeTheme === t.id ? 'bg-brand text-white ring-2 ring-brand-dark' : 'bg-surface border border-border text-text-secondary hover:border-brand'
                  }`}
                >
                  <span className="text-xl">{t.emoji}</span>
                  <span className="text-[11px]">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="font-bold text-text-primary block mb-2">🌐 Idioma</span>
            <div className="flex gap-2">
              {locales.map((loc) => (
                <button
                  key={loc.code}
                  onClick={() => switchLocale(loc.code)}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    currentLocale === loc.code ? 'bg-brand text-white' : 'bg-surface border border-border text-text-secondary'
                  }`}
                >
                  {loc.flag} {loc.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-bold text-text-primary">🔊 Sonidos</span>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-12 h-6 rounded-full transition-colors ${soundEnabled ? 'bg-brand' : 'bg-border'} relative`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-bold text-text-primary">🎬 Reducir animaciones</span>
            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`w-12 h-6 rounded-full transition-colors ${reducedMotion ? 'bg-brand' : 'bg-border'} relative`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${reducedMotion ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div>
            <span className="font-bold text-text-primary block mb-2">🔤 Tamaño de letra</span>
            <div className="flex gap-2">
              {(['normal', 'large', 'xlarge'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${fontSize === size ? 'bg-brand text-white' : 'bg-surface border border-border text-text-secondary'}`}
                >
                  {size === 'normal' ? 'Normal' : size === 'large' ? 'Grande' : 'Muy grande'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {profile && (
        <Card variant="default" padding="md">
          <h2 className="heading-section mb-2">Cuenta</h2>
          <p className="text-sm text-text-secondary">Rol: {profile.role === 'parent' ? 'Padre/Madre' : 'Profesional'}</p>
          <p className="text-xs text-text-muted mt-3">Versión 0.1.0 · Beta</p>
        </Card>
      )}
    </div>
  )
}
