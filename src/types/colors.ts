export type ColorIntensity = "VERY_LIGHT" | "LIGHT" | "MEDIUM" | "DARK"
export type ColorMode = "BACKGROUND" | "BORDER" | "BOTH"

export interface SchemeCategory {
  key: string
  label: string
}

export interface ColorScheme {
  name: string
  label: string
  categories: SchemeCategory[]
  colors: Record<ColorIntensity, string[]>
  customBorders?: Partial<Record<ColorIntensity, Record<string, string>>>
  mappings?: Record<string, string>
}

export type SchemeName =
  | "CS_MODIFIED_FITZGERALD_KEY"
  | "CS_GOOSSENS"
  | "CS_MONTESSORI"

export const COLOR_INTENSITIES: { key: ColorIntensity; label: string }[] = [
  { key: "VERY_LIGHT", label: "Muy claro" },
  { key: "LIGHT",      label: "Claro" },
  { key: "MEDIUM",     label: "Medio" },
  { key: "DARK",       label: "Oscuro" },
]

export const FITZGERALD_CATEGORIES: SchemeCategory[] = [
  { key: "CC_PRONOUN_PERSON_NAME", label: "Pronombre / Persona" },
  { key: "CC_NOUN",                label: "Sustantivo / Objeto" },
  { key: "CC_VERB",                label: "Verbo / Acción" },
  { key: "CC_DESCRIPTOR",          label: "Descriptivo / Cualidad" },
  { key: "CC_SOCIAL_EXPRESSIONS",  label: "Social" },
  { key: "CC_MISC",                label: "Misceláneo" },
  { key: "CC_PLACE",               label: "Lugar" },
  { key: "CC_CATEGORY",            label: "Categoría" },
  { key: "CC_IMPORTANT",           label: "Importante" },
  { key: "CC_OTHERS",              label: "Otros" },
]

export const GOOSSENS_CATEGORIES: SchemeCategory[] = [
  { key: "CC_VERB",                         label: "Verbo" },
  { key: "CC_DESCRIPTOR",                   label: "Descriptivo" },
  { key: "CC_PREPOSITION",                  label: "Preposición" },
  { key: "CC_NOUN",                         label: "Sustantivo" },
  { key: "CC_QUESTION_NEGATION_PRONOUN",    label: "Pregunta / Negación / Pronombre" },
]

export const MONTESSORI_CATEGORIES: SchemeCategory[] = [
  { key: "CC_NOUN",                 label: "Sustantivo" },
  { key: "CC_ARTICLE",              label: "Artículo" },
  { key: "CC_ADJECTIVE",           label: "Adjetivo" },
  { key: "CC_VERB",                 label: "Verbo" },
  { key: "CC_PREPOSITION",         label: "Preposición" },
  { key: "CC_ADVERB",              label: "Adverbio" },
  { key: "CC_PRONOUN_PERSON_NAME", label: "Pronombre / Persona" },
  { key: "CC_CONJUNCTION",         label: "Conjunción" },
  { key: "CC_INTERJECTION",        label: "Interjección" },
  { key: "CC_CATEGORY",            label: "Categoría" },
]

// Map non-Fitzgerald categories to Fitzgerald equivalents
export const MAPPING_TO_FITZGERALD: Record<string, string> = {
  "CC_ADJECTIVE":           "CC_DESCRIPTOR",
  "CC_ADVERB":              "CC_DESCRIPTOR",
  "CC_ARTICLE":             "CC_MISC",
  "CC_PREPOSITION":         "CC_MISC",
  "CC_CONJUNCTION":         "CC_MISC",
  "CC_INTERJECTION":        "CC_SOCIAL_EXPRESSIONS",
  "CC_QUESTION_NEGATION_PRONOUN": "CC_MISC",
}

export const COLOR_SCHEMES: Record<SchemeName, ColorScheme> = {
  CS_MODIFIED_FITZGERALD_KEY: {
    name: "CS_MODIFIED_FITZGERALD_KEY",
    label: "Fitzgerald",
    categories: FITZGERALD_CATEGORIES,
    colors: {
      VERY_LIGHT: [
        "#fafad0", "#fbf3e4", "#dff4df", "#eaeffd",
        "#fff0f6", "#ffffff", "#fbf2ff", "#ddccc1",
        "#FCE8E8", "#e4e4e4",
      ],
      LIGHT: [
        "#fdfd96", "#ffda89", "#c7f3c7", "#84b6f4",
        "#fdcae1", "#ffffff", "#bc98f3", "#d8af97",
        "#ff9688", "#bdbfbf",
      ],
      MEDIUM: [
        "#ffff6b", "#ffb56b", "#b5ff6b", "#6bb5ff",
        "#ff6bff", "#ffffff", "#ce6bff", "#bf9075",
        "#ff704d", "#a3a3a3",
      ],
      DARK: [
        "#79791F", "#804c26", "#4c8026", "#264c80",
        "#802680", "#747474", "#602680", "#52331f",
        "#80261a", "#464646",
      ],
    },
    mappings: MAPPING_TO_FITZGERALD,
  },

  CS_GOOSSENS: {
    name: "CS_GOOSSENS",
    label: "Goossens'",
    categories: GOOSSENS_CATEGORIES,
    colors: {
      VERY_LIGHT: [
        "#fff0f6", "#eaeffd", "#dff4df", "#fafad0", "#fbf3e4",
      ],
      LIGHT: [
        "#fdcae1", "#84b6f4", "#c7f3c7", "#fdfd96", "#ffda89",
      ],
      MEDIUM: [
        "#ff6bff", "#6bb5ff", "#b5ff6b", "#ffff6b", "#ffb56b",
      ],
      DARK: [
        "#802680", "#264c80", "#4c8026", "#79791F", "#804c26",
      ],
    },
    mappings: MAPPING_TO_FITZGERALD,
  },

  CS_MONTESSORI: {
    name: "CS_MONTESSORI",
    label: "Montessori",
    categories: MONTESSORI_CATEGORIES,
    colors: {
      VERY_LIGHT: [
        "#ffffff", "#e3f5fa", "#eaeffd", "#FCE8E8",
        "#dff4df", "#fbf3e4", "#fbf2ff", "#fff0f6",
        "#fbf7e4", "#e4e4e4",
      ],
      LIGHT: [
        "#afafaf", "#a8e0f0", "#a5bbf7", "#f4a8a8",
        "#ace3ac", "#f2d7a6", "#e4a5ff", "#ffa5c9",
        "#f2e5a6", "#d1d1d1",
      ],
      MEDIUM: [
        "#000000", "#4ca6d9", "#1347ae", "#e73a0f",
        "#04bf82", "#fd9030", "#6118a2", "#f1c9d1",
        "#aa996b", "#d1d1d1",
      ],
      DARK: [
        "#464646", "#18728c", "#0d3298", "#931212",
        "#287728", "#BC5800", "#7500a7", "#a70043",
        "#807351", "#747474",
      ],
    },
    customBorders: {
      VERY_LIGHT: { "CC_NOUN": "#353535" },
    },
  },
}

// Map old fitzgerald_key keys to color categories
export const FITZGERALD_KEY_MAP: Record<string, string> = {
  social:      "CC_SOCIAL_EXPRESSIONS",
  subject:     "CC_PRONOUN_PERSON_NAME",
  verb:        "CC_VERB",
  object:      "CC_NOUN",
  descriptive: "CC_DESCRIPTOR",
  place:       "CC_PLACE",
  time:        "CC_MISC",
}

/**
 * Resolve cell colors based on the active color scheme and the cell's
 * colorCategory or fitzgerald_key. Falls back to hardcoded cell colors.
 */
export function resolveCellColors(
  cell: { colorCategory?: string; fitzgerald_key?: string; background_color: string; border_color: string; text_color: string },
  settings?: {
    colorScheme?: string
    colorIntensity?: ColorIntensity
    colorSchemesActivated?: boolean
    colorMode?: ColorMode
  }
): { bg: string; border: string; text: string } {
  const fallback = {
    bg: cell.background_color,
    border: cell.border_color,
    text: cell.text_color,
  }

  if (settings?.colorSchemesActivated === false) return fallback
  if (!settings) return fallback

  const schemeName = (settings.colorScheme ?? "CS_MODIFIED_FITZGERALD_KEY") as SchemeName
  const scheme = COLOR_SCHEMES[schemeName]
  if (!scheme) return fallback

  const intensity = settings.colorIntensity ?? "LIGHT"
  const catKey = cell.colorCategory ?? (cell.fitzgerald_key ? FITZGERALD_KEY_MAP[cell.fitzgerald_key] : undefined)
  if (!catKey) return fallback

  let idx = scheme.categories.findIndex(c => c.key === catKey)
  if (idx === -1 && scheme.mappings) {
    const mapped = scheme.mappings[catKey]
    if (mapped) idx = scheme.categories.findIndex(c => c.key === mapped)
  }
  if (idx === -1 || idx >= (scheme.colors[intensity]?.length ?? 0)) return fallback

  const bgColor = scheme.colors[intensity][idx]
  const mode = settings.colorMode ?? "BACKGROUND"

  if (mode === "BACKGROUND") {
    return { bg: bgColor, border: fallback.border, text: isDark(bgColor) ? "#ffffff" : "#1A202C" }
  }
  if (mode === "BORDER") {
    return { bg: fallback.bg, border: bgColor, text: fallback.text }
  }
  // BOTH
  const customBorder = scheme.customBorders?.[intensity]?.[catKey]
  const borderColor = customBorder ?? adjustBrightness(bgColor, -30)
  return { bg: bgColor, border: borderColor, text: isDark(bgColor) ? "#ffffff" : "#1A202C" }
}

function isDark(hex: string): boolean {
  const c = hex.replace("#", "")
  if (c.length < 6) return false
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  return r * 0.299 + g * 0.587 + b * 0.114 <= 149
}

function adjustBrightness(hex: string, amount: number): string {
  const c = hex.replace("#", "")
  if (c.length < 6) return hex
  const r = Math.max(0, Math.min(255, parseInt(c.slice(0, 2), 16) + amount))
  const g = Math.max(0, Math.min(255, parseInt(c.slice(2, 4), 16) + amount))
  const b = Math.max(0, Math.min(255, parseInt(c.slice(4, 6), 16) + amount))
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
}
