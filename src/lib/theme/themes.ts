export type ThemeId = 'default' | 'pastel' | 'rainbow' | 'ocean' | 'sunset' | 'forest'

export interface Theme {
  id: ThemeId
  label: string
  emoji: string
  description: string
}

type ThemePalette = {
  brand: string
  brandLight: string
  brandDark: string
  brandBg: string
  accent: string
  accentLight: string
}

export const themes: Theme[] = [
  { id: 'default', label: 'Clásico', emoji: '🦕', description: 'Verde teal original' },
  { id: 'pastel', label: 'Pastel', emoji: '🌸', description: 'Tonos suaves y dulces' },
  { id: 'rainbow', label: 'Arcoíris', emoji: '🌈', description: 'Colores vibrantes y divertidos' },
  { id: 'ocean', label: 'Océano', emoji: '🌊', description: 'Azules profundos y frescos' },
  { id: 'sunset', label: 'Atardecer', emoji: '🌅', description: 'Naranjas y dorados cálidos' },
  { id: 'forest', label: 'Bosque', emoji: '🌲', description: 'Verdes naturales y tierra' },
]

const themePalettes: Record<ThemeId, ThemePalette> = {
  default: {
    brand: '#00c9a7',
    brandLight: '#00b894',
    brandDark: '#00856A',
    brandBg: '#f0fdf9',
    accent: '#f59e0b',
    accentLight: '#fbbf24',
  },
  pastel: {
    brand: '#f472b6',
    brandLight: '#db2777',
    brandDark: '#be185d',
    brandBg: '#fdf2f8',
    accent: '#a855f7',
    accentLight: '#c084fc',
  },
  rainbow: {
    brand: '#8b5cf6',
    brandLight: '#6d28d9',
    brandDark: '#4c1d95',
    brandBg: '#f5f3ff',
    accent: '#ec4899',
    accentLight: '#f472b6',
  },
  ocean: {
    brand: '#0ea5e9',
    brandLight: '#0284c7',
    brandDark: '#0369a1',
    brandBg: '#f0f9ff',
    accent: '#06b6d4',
    accentLight: '#22d3ee',
  },
  sunset: {
    brand: '#f97316',
    brandLight: '#ea580c',
    brandDark: '#c2410c',
    brandBg: '#fff7ed',
    accent: '#eab308',
    accentLight: '#facc15',
  },
  forest: {
    brand: '#22c55e',
    brandLight: '#16a34a',
    brandDark: '#15803d',
    brandBg: '#f0fdf4',
    accent: '#84cc16',
    accentLight: '#a3e635',
  },
}

export function isThemeId(value: string | undefined): value is ThemeId {
  return !!value && themes.some(t => t.id === value)
}

export function getCookieTheme(): ThemeId {
  if (typeof document === 'undefined') return 'default'
  const match = document.cookie.match(/(?:^|;\s*)theme=([^;]+)/)
  const value = match?.[1]
  return isThemeId(value) ? value : 'default'
}

export function setCookieTheme(theme: ThemeId) {
  document.cookie = `theme=${theme};path=/;max-age=31536000;samesite=lax`
}

export function applyTheme(theme: ThemeId) {
  if (typeof document === 'undefined') return
  const palette = themePalettes[theme]
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  root.style.setProperty('--color-brand', palette.brand)
  root.style.setProperty('--color-brand-light', palette.brandLight)
  root.style.setProperty('--color-brand-dark', palette.brandDark)
  root.style.setProperty('--color-brand-bg', palette.brandBg)
  root.style.setProperty('--color-accent', palette.accent)
  root.style.setProperty('--color-accent-light', palette.accentLight)
}
