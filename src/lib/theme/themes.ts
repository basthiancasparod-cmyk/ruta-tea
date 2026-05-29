export type ThemeId = 'default' | 'pastel' | 'rainbow' | 'ocean' | 'sunset' | 'forest'

export interface Theme {
  id: ThemeId
  label: string
  emoji: string
  description: string
}

export const themes: Theme[] = [
  { id: 'default', label: 'Clásico', emoji: '🦕', description: 'Verde teal original' },
  { id: 'pastel', label: 'Pastel', emoji: '🌸', description: 'Tonos suaves y dulces' },
  { id: 'rainbow', label: 'Arcoíris', emoji: '🌈', description: 'Colores vibrantes y divertidos' },
  { id: 'ocean', label: 'Océano', emoji: '🌊', description: 'Azules profundos y frescos' },
  { id: 'sunset', label: 'Atardecer', emoji: '🌅', description: 'Naranjas y dorados cálidos' },
  { id: 'forest', label: 'Bosque', emoji: '🌲', description: 'Verdes naturales y tierra' },
]

export function getCookieTheme(): ThemeId {
  if (typeof document === 'undefined') return 'default'
  const match = document.cookie.match(/(?:^|;\s*)theme=([^;]+)/)
  const value = match?.[1] as ThemeId | undefined
  if (value && themes.some(t => t.id === value)) return value
  return 'default'
}

export function setCookieTheme(theme: ThemeId) {
  document.cookie = `theme=${theme};path=/;max-age=31536000`
}
