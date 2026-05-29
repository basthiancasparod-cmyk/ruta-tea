import type { CAABoard, CAACell } from "@/types/caa"

const GLOBAL_GRID_ID = "__global_default"
const PROFILE_ID = "__system"
const COLUMNS = 6

const EMPTY_CELL = {
  board_id: GLOBAL_GRID_ID, is_folder: false, order_index: 0,
  background_color: "#f1f5f9", border_color: "#94a3b8", text_color: "#1e293b",
  created_at: "",
  width: 1, height: 1,
}

/** Generate a default global grid board with navigation + utilities */
export function generateDefaultGlobalGrid(): { board: Partial<CAABoard>; cells: CAACell[] } {
  const cells: CAACell[] = [
    // Row 0: Home | Back | Speak All | Clear | Delete | (spacer)
    {
      ...EMPTY_CELL,
      id: "gg_home", position_row: 0, position_col: 0,
      label: "Inicio", pictogram_keyword: "casa",
      background_color: "#e0f2fe", border_color: "#0ea5e9", text_color: "#0c4a6e",
      fitzgerald_key: "social",
      actions: [{ id: "a_home", modelName: "GridActionNavigate", navType: "TO_HOME" }],
    },
    {
      ...EMPTY_CELL,
      id: "gg_back", position_row: 0, position_col: 1,
      label: "Atrás", pictogram_keyword: "atras",
      background_color: "#e0f2fe", border_color: "#0ea5e9", text_color: "#0c4a6e",
      fitzgerald_key: "social",
      actions: [{ id: "a_back", modelName: "GridActionNavigate", navType: "TO_LAST" }],
    },
    {
      ...EMPTY_CELL,
      id: "gg_speak", position_row: 0, position_col: 2,
      label: "Hablar", pictogram_keyword: "hablar",
      background_color: "#dcfce7", border_color: "#22c55e", text_color: "#14532d",
      fitzgerald_key: "verb",
      dontCollect: true,
      actions: [{ id: "a_speak", modelName: "GridActionCollectElement", action: "COLLECT_ACTION_SPEAK" }],
    },
    {
      ...EMPTY_CELL,
      id: "gg_clear", position_row: 0, position_col: 3,
      label: "Borrar", pictogram_keyword: "borrar",
      background_color: "#fee2e2", border_color: "#ef4444", text_color: "#7f1d1d",
      fitzgerald_key: "verb",
      dontCollect: true,
      actions: [{ id: "a_clear", modelName: "GridActionCollectElement", action: "COLLECT_ACTION_CLEAR" }],
    },
    {
      ...EMPTY_CELL,
      id: "gg_delete", position_row: 0, position_col: 4,
      label: "Quitar", pictogram_keyword: "quitar",
      background_color: "#fef3c7", border_color: "#f59e0b", text_color: "#78350f",
      fitzgerald_key: "verb",
      dontCollect: true,
      actions: [{ id: "a_delete", modelName: "GridActionCollectElement", action: "COLLECT_ACTION_REMOVE_WORD" }],
    },
    {
      ...EMPTY_CELL,
      id: "gg_mute", position_row: 0, position_col: 5,
      label: "Silencio", pictogram_keyword: "silencio",
      background_color: "#f1f5f9", border_color: "#94a3b8", text_color: "#1e293b",
      dontCollect: true,
      actions: [{ id: "a_mute", modelName: "GridActionSystem", action: "SYS_LEAVE_FULLSCREEN" }],
    },
  ]

  return {
    board: {
      id: GLOBAL_GRID_ID,
      profile_id: PROFILE_ID,
      name: "Barra Global",
      description: "Barra de navegación persistente en todos los tableros",
      grid_size: "custom",
      columns: COLUMNS,
      rows: 1,
      is_template: false,
      is_favorite: false,
      is_global_grid: true,
      locked: false,
      settings: { globalGridActive: true },
    },
    cells,
  }
}

/** Find the default global grid ID */
export function getDefaultGlobalGridId(): string {
  return GLOBAL_GRID_ID
}
