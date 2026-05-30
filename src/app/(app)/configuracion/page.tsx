'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Card } from '@/components/ui/Card'
import { Lumi } from '@/components/lumi/Lumi'
import { AvatarUpload } from '@/components/ui/AvatarUpload'
import { useSupabase } from '@/components/layout/SupabaseProvider'
import { useChildren } from '@/lib/hooks/useData'
import { themes, setCookieTheme, getCookieTheme, applyTheme } from '@/lib/theme/themes'
import type { ThemeId } from '@/lib/theme/themes'

export default function ConfiguracionPage() {
  const t = useTranslations('config')
  const { profile } = useSupabase()
  const { children } = useChildren()
  const child = children[0]
  const [childAvatarUrl, setChildAvatarUrl] = useState<string | null | undefined>(undefined)
  const currentLocale = useLocale()

  const handleAvatarUpdate = (url: string | null) => {
    setChildAvatarUrl(url)
  }

  const [soundEnabled, setSoundEnabled] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal')
  const [activeTheme, setActiveTheme] = useState<ThemeId>(() => getCookieTheme())

  const switchTheme = (id: ThemeId) => {
    setActiveTheme(id)
    setCookieTheme(id)
    applyTheme(id)
  }

  const locales = [
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
  ]

  const switchLocale = (locale: string) => {
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000;samesite=lax`
    window.location.reload()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Lumi mood="idle" size="sm" />
        <div>
          <h1 className="heading-page">{t('title')}</h1>
          <p className="text-body">{t('subtitle')}</p>
        </div>
      </div>

      {child && (
        <Card variant="bordered" padding="md">
          <h2 className="heading-section mb-3">{t('profile')}</h2>
          <AvatarUpload
            childId={child.id}
            currentUrl={childAvatarUrl === undefined ? child.avatar_url : childAvatarUrl}
            currentEmoji={child.avatar_pictogram}
            name={child.name}
            onUpdate={handleAvatarUpdate}
          />
            <div className="mt-3">
            <p className="heading-card">{child.name}</p>
            <p className="text-body">
              {t('ageRange', { age: child.age_range, level: child.tea_level })}
            </p>
          </div>
          {child.interests.length > 0 && (
            <div className="mt-3">
              <p className="text-badge mb-1">{t('interests')}:</p>
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
        <h2 className="heading-section mb-4">{t('preferences')}</h2>
        <div className="flex flex-col gap-4">
          <div>
            <span className="heading-card block mb-2">🎨 {t('theme')}</span>
            <div className="grid grid-cols-3 gap-2">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => switchTheme(theme.id)}
                  className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl font-bold text-sm transition-all ${
                    activeTheme === theme.id ? 'bg-brand text-white ring-2 ring-brand-dark' : 'bg-surface border border-border text-text-secondary hover:border-brand'
                  }`}
                >
                  <span className="text-xl">{theme.emoji}</span>
                  <span className="text-xs">{t(`themes.${theme.id}`)}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="heading-card block mb-2">🌐 {t('language')}</span>
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
            <span className="heading-card">🔊 {t('sounds')}</span>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-12 h-6 rounded-full transition-colors ${soundEnabled ? 'bg-brand' : 'bg-border'} relative`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="heading-card">🎬 {t('reducedMotion')}</span>
            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`w-12 h-6 rounded-full transition-colors ${reducedMotion ? 'bg-brand' : 'bg-border'} relative`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${reducedMotion ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div>
            <span className="heading-card block mb-2">🔤 {t('fontSize')}</span>
            <div className="flex gap-2">
              {(['normal', 'large', 'xlarge'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${fontSize === size ? 'bg-brand text-white' : 'bg-surface border border-border text-text-secondary'}`}
                >
                  {t(`fontSizes.${size}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {profile && (
        <Card variant="default" padding="md">
          <h2 className="heading-section mb-2">{t('account')}</h2>
          <p className="text-body">{t('role')}: {profile.role === 'parent' ? t('roles.parent') : t('roles.professional')}</p>
          <p className="text-meta mt-3">{t('version')}</p>
        </Card>
      )}
    </div>
  )
}
