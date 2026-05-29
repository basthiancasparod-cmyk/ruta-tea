export type FitzgeraldKey = "social" | "subject" | "verb" | "object" | "descriptive" | "place" | "time"
export type GridSize = "3x4" | "4x6" | "5x8" | "5x10" | "5x12" | "5x16" | "custom"
export type CollectMode = "auto" | "text" | "separated"
import type { ColorIntensity, ColorMode } from "@/types/colors"
export type { ColorIntensity, ColorMode }

// ─── Action types (Asterics-AAC inspired, 20+ types) ──────────────
export type ActionModelName =
  | "GridActionSpeak"
  | "GridActionSpeakCustom"
  | "GridActionNavigate"
  | "GridActionCollectElement"
  | "GridActionAudio"
  | "GridActionOpenWebpage"
  | "GridActionWordForm"
  | "GridActionSystem"
  | "GridActionVocabLevelToggle"
  | "GridActionPredict"
  | "GridActionARE"
  | "GridActionOpenHAB"
  | "GridActionWebradio"
  | "GridActionYoutube"
  | "GridActionPodcast"
  | "GridActionChangeLang"
  | "GridActionHTTP"
  | "GridActionUART"
  | "GridActionPredefined"
  | "GridActionMatrix"

export interface WordForm {
  lang?: string
  tags?: string[]
  value?: string
  pronunciation?: string
}

export interface CAAAction {
  id?: string
  modelName: ActionModelName
  // Speak
  speakLanguage?: string
  // SpeakCustom
  speakText?: string
  // Navigate
  toGridId?: string
  navType?: "TO_HOME" | "TO_LAST" | "TO_GRID" | "OPEN_SEARCH"
  addToCollectElem?: boolean
  searchCollectedText?: string
  searchText?: string
  // CollectElement
  action?: string
  // Audio
  dataBase64?: string
  // OpenWebpage
  openURL?: string
  timeoutSeconds?: number
  // WordForm
  type?: string
  tags?: string[]
  toggle?: boolean
  secondaryType?: string
  // WordFormAction
  wordFormMode?: string
  wordFormTags?: string[]
  // VocabLevelToggle
  vocabularyLevel?: number
  mode?: string
  // Predict
  dictionaryKey?: string
  suggestOnChange?: boolean
  // ChangeLang
  language?: string
  voice?: string
  // System
  actionValue?: number
  // Predefined
  groupId?: string
  actionInfo?: string
  customValues?: Record<string, unknown>
  isLiveAction?: boolean
  // Youtube
  playType?: string
  data?: string
  stepSeconds?: number
  stepVolume?: number
  showCC?: boolean
  playMuted?: boolean
  performAfterNav?: boolean
  // Webradio
  radioId?: string
  // Podcast
  podcastGuid?: string
  step?: number
  // HTTP
  restUrl?: string
  method?: string
  contentType?: string
  acceptHeader?: string
  body?: string
  authUser?: string
  authPw?: string
  noCorsMode?: boolean
  useCorsProxy?: boolean
}

export interface CAABoardSettings {
  voiceGender?: "male" | "female"
  voiceRate?: number
  voicePitch?: number
  preferredVoice?: string
  secondVoice?: string
  autoSpeak?: boolean
  highlightOnPress?: boolean
  cellSize?: "sm" | "md" | "lg" | "xl"
  showLabels?: boolean
  theme?: string
  globalReadActive?: boolean
  globalReadActiveRate?: number
  globalBeepFeedback?: boolean
  collectMode?: CollectMode
  collectShowLabels?: boolean
  collectShowFullLabels?: boolean
  collectSingleLine?: boolean
  collectImageHeightPercentage?: number
  collectConvertToLowercase?: boolean
  // Color scheme settings
  colorScheme?: string
  colorIntensity?: ColorIntensity
  colorSchemesActivated?: boolean
  colorMode?: ColorMode
  // Scanning settings
  scanEnabled?: boolean
  scanAuto?: boolean
  scanTimeoutMs?: number
  scanTimeoutFirstElementFactor?: number
  scanVertical?: boolean
  scanBinary?: boolean
  scanStartWithAction?: boolean
  scanRoundsUntilBack?: number
  scanBeepFeedback?: boolean
  scanReadActive?: boolean
  scanReadActiveRate?: number
  scanDualSwitch?: boolean
  // Global grid settings
  globalGridActive?: boolean
  globalGridId?: string
}

export interface CAABoard {
  id: string
  profile_id: string
  child_id?: string
  name: string
  description?: string
  grid_size: GridSize
  columns: number
  rows: number
  is_template: boolean
  is_favorite: boolean
  category?: string
  locked?: boolean
  is_global_grid?: boolean
  settings: CAABoardSettings
  created_at: string
  updated_at: string
}

export interface CAACell {
  id: string
  board_id: string
  position_row: number
  position_col: number
  label: string
  pictogram_keyword?: string
  pictogram_id?: number
  custom_image_url?: string
  background_color: string
  border_color: string
  text_color: string
  fitzgerald_key?: FitzgeraldKey
  colorCategory?: string
  vocalization?: string
  action_type?: string // kept for backward compat, use actions instead
  navigation_board_id?: string
  is_folder: boolean
  order_index: number
  created_at: string
  // New multi-span + actions fields
  width?: number
  height?: number
  x?: number
  y?: number
  actions?: CAAAction[]
  vocabulary_level?: number
  hidden?: boolean
  pronunciation?: Record<string, string>
  dontCollect?: boolean
  toggleInBar?: boolean
  gridElementType?: "normal" | "prediction"
  wordForms?: WordForm[]
}

export interface CAAUsageRecord {
  id: string
  child_id: string
  board_id?: string
  cell_id?: string
  message_text?: string
  timestamp: string
  session_id?: string
  context?: Record<string, unknown>
}

export interface MessageToken {
  id: string
  label: string
  fitzgerald_key?: FitzgeraldKey
  vocalization?: string
  color: string
}

// ─── Action helpers ────────────────────────────────────────────────
export function getDefaultActions(cell: Partial<CAACell>): CAAAction[] {
  if (cell.actions && cell.actions.length > 0) return cell.actions
  // Backward compat: convert action_type to actions
  const at = cell.action_type
  if (!at || at === "add_to_message") return [{ id: crypto.randomUUID?.() ?? "", modelName: "GridActionCollectElement" }]
  if (at === "speak_instant") return [{ id: crypto.randomUUID?.() ?? "", modelName: "GridActionSpeak", speakLanguage: "es-ES" }]
  if (at === "navigate") return [{ id: crypto.randomUUID?.() ?? "", modelName: "GridActionNavigate", navType: "TO_GRID", toGridId: cell.navigation_board_id }]
  if (at === "clear") return [{ id: crypto.randomUUID?.() ?? "", modelName: "GridActionCollectElement", action: "COLLECT_ACTION_CLEAR" }]
  if (at === "back") return [{ id: crypto.randomUUID?.() ?? "", modelName: "GridActionNavigate", navType: "TO_LAST" }]
  return []
}

export function hasAction(cell: CAACell, modelName: ActionModelName): boolean {
  const actions = cell.actions ?? getDefaultActions(cell)
  return actions.some(a => a.modelName === modelName)
}

export function findAction(cell: CAACell, modelName: ActionModelName): CAAAction | undefined {
  const actions = cell.actions ?? getDefaultActions(cell)
  return actions.find(a => a.modelName === modelName)
}

// ─── Grid Set types ──────────────────────────────────────────────
export interface CAAGridSet {
  id: string
  profile_id: string
  name: string
  description?: string
  icon?: string
  color?: string
  order_index: number
  created_at: string
  updated_at: string
}

export interface CAAGridSetBoard {
  id: string
  grid_set_id: string
  board_id: string
  order_index: number
}

export interface CAAGridSetWithBoards extends CAAGridSet {
  boards: CAAGridSetBoard[]
}

// ─── Constante centralizada Fitzgerald ───────────────────────────────────────
export const FITZGERALD_COLORS: Record<FitzgeraldKey, {
  bg: string; border: string; text: string; hex: string; label: string
}> = {
  social:      { bg: "#f3e8ff", border: "#a855f7", text: "#581c87", hex: "#a855f7", label: "Social"   },
  subject:     { bg: "#fef9c3", border: "#facc15", text: "#713f12", hex: "#facc15", label: "Persona"  },
  verb:        { bg: "#dcfce7", border: "#22c55e", text: "#14532d", hex: "#22c55e", label: "Acción"   },
  object:      { bg: "#fed7aa", border: "#fb923c", text: "#7c2d12", hex: "#fb923c", label: "Objeto"   },
  descriptive: { bg: "#dbeafe", border: "#3b82f6", text: "#1e3a8a", hex: "#3b82f6", label: "Cualidad" },
  place:       { bg: "#fce7f3", border: "#ec4899", text: "#831843", hex: "#ec4899", label: "Lugar"    },
  time:        { bg: "#f1f5f9", border: "#94a3b8", text: "#1e293b", hex: "#94a3b8", label: "Tiempo"   },
}