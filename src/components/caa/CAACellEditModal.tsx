"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { Pictogram, searchPictogramId } from "@/components/ui/Pictogram"
import { FITZGERALD_COLORS, getDefaultActions } from "@/types/caa"
import type { CAACell, FitzgeraldKey, CAAAction, ActionModelName } from "@/types/caa"
import { COLOR_SCHEMES } from "@/types/colors"
import type { SchemeName } from "@/types/colors"

interface CAACellEditModalProps {
  cell?: CAACell | null
  onSave: (cell: Partial<CAACell>) => void
  onDelete?: () => void
  onClose: () => void
}

export function CAACellEditModal({ cell, onSave, onDelete, onClose }: CAACellEditModalProps) {
  const [formData, setFormData] = useState<Partial<CAACell>>({
    label: cell?.label || "",
    pictogram_keyword: cell?.pictogram_keyword || "",
    custom_image_url: cell?.custom_image_url,
    background_color: cell?.background_color || "#FFFFFF",
    border_color: cell?.border_color || "#E2E8F0",
    text_color: cell?.text_color || "#1A202C",
    fitzgerald_key: cell?.fitzgerald_key,
    vocalization: cell?.vocalization || "",
    actions: cell?.actions ?? getDefaultActions(cell ?? {}),
    is_folder: cell?.is_folder || false,
    width: cell?.width ?? 1,
    height: cell?.height ?? 1,
    dontCollect: cell?.dontCollect || false,
    toggleInBar: cell?.toggleInBar || false,
    hidden: cell?.hidden || false,
    colorCategory: cell?.colorCategory || "",
    wordForms: cell?.wordForms || [],
  })
  const [searchQuery, setSearchQuery] = useState(cell?.pictogram_keyword || "")
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length < 2) return
      try {
        setIsSearching(true)
        const res = await fetch(
          `https://api.arasaac.org/v1/pictograms/es/search/${encodeURIComponent(searchQuery.trim())}`
        )
        if (!res.ok) return
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          const first = data[0]
          setFormData(p => ({
            ...p,
            pictogram_keyword: searchQuery.trim(),
            pictogram_id: first._id
          }))
        }
      } catch (e) {
        console.error("Error buscando pictograma", e)
      } finally {
        setIsSearching(false)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const applyFitzgerald = (key: FitzgeraldKey) => {
    const c = FITZGERALD_COLORS[key]
    setFormData((p) => ({
      ...p,
      fitzgerald_key: key,
      background_color: c.bg,
      border_color: c.hex,
      text_color: c.text,
    }))
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      {/* Backdrop — mismo patrón ChestModal */}
      <div className="absolute inset-0 bg-black/85" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.92, y: 10, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 10, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl"
        style={{ background: 'linear-gradient(145deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)' }}
      >
        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-text-primary">
              {cell ? "✏️ Editar Celda" : "✨ Nueva Celda"}
            </h2>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-surface-secondary flex items-center justify-center text-text-muted text-lg">✕</button>
          </div>

          {/* Label */}
          <div>
            <label className="block text-sm font-bold text-text-primary mb-1.5">Etiqueta *</label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData((p) => ({ ...p, label: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border-2 border-border bg-white text-sm font-medium focus:border-brand focus:outline-none"
              placeholder="Ej: Agua, Mamá, Quiero..."
            />
          </div>

          {/* Pictogram search */}
          <div>
            <label className="block text-sm font-bold text-text-primary mb-1.5">
              Pictograma ARASAAC
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-lg border-2 border-border bg-white text-sm font-medium focus:border-brand focus:outline-none"
                placeholder="Escribe la palabra clave..."
              />
              {isSearching && (
                <div className="flex items-center px-3 text-xs text-text-muted font-medium">
                  Buscando…
                </div>
              )}
            </div>
            {/* Preview */}
            {formData.pictogram_keyword && (
              <div className="mt-2 flex items-center gap-3 p-3 bg-surface-secondary rounded-xl border border-border">
                <Pictogram keyword={formData.pictogram_keyword} size={64} />
                <div>
                  <p className="text-sm font-bold text-text-primary">{formData.pictogram_keyword}</p>
                  <p className="text-xs text-text-muted">Vista previa del pictograma</p>
                </div>
              </div>
            )}
          </div>

          {/* Custom image upload */}
          <div>
            <label className="block text-sm font-bold text-text-primary mb-1.5">
              Imagen personalizada
              <span className="text-text-muted font-normal ml-1">(opcional)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.custom_image_url ?? ""}
                onChange={(e) => setFormData(p => ({ ...p, custom_image_url: e.target.value || undefined }))}
                className="flex-1 px-3 py-2.5 rounded-lg border-2 border-border bg-white text-sm font-medium focus:border-brand focus:outline-none"
                placeholder="Pega una URL de imagen..."
              />
              <label className="px-3 py-2.5 rounded-lg border-2 border-border bg-white text-sm font-bold text-text-secondary hover:border-brand hover:text-brand cursor-pointer transition-colors shrink-0 flex items-center gap-1">
                📁
                <input type="file" accept="image/*" className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = () => {
                      setFormData(p => ({ ...p, custom_image_url: reader.result as string }))
                    }
                    reader.readAsDataURL(file)
                  }} />
              </label>
              {formData.custom_image_url && (
                <button onClick={() => setFormData(p => ({ ...p, custom_image_url: undefined }))}
                  className="px-3 py-2.5 rounded-lg border-2 border-red-200 bg-red-50 text-sm font-bold text-red-600 hover:border-red-400 transition-colors shrink-0">
                  ✕
                </button>
              )}
            </div>
            {formData.custom_image_url && (
              <div className="mt-2 flex items-center gap-3 p-3 bg-surface-secondary rounded-xl border border-border">
                <img src={formData.custom_image_url} alt="preview" className="w-16 h-16 rounded-lg object-contain bg-white" />
                <div>
                  <p className="text-sm font-bold text-text-primary">Imagen personalizada</p>
                  <p className="text-xs text-text-muted break-all">{formData.custom_image_url.length > 60 ? formData.custom_image_url.slice(0, 60) + "…" : formData.custom_image_url}</p>
                </div>
              </div>
            )}
          </div>

          {/* Width / Height */}
          <div>
            <label className="block text-sm font-bold text-text-primary mb-1.5">Tamaño en el grid</label>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-text-muted mb-0.5">Ancho</label>
                <input type="number" min={1} max={8}
                  value={formData.width ?? 1}
                  onChange={(e) => setFormData(p => ({ ...p, width: Math.max(1, parseInt(e.target.value) || 1) }))}
                  className="w-full px-3 py-2 rounded-lg border-2 border-border bg-white text-sm font-medium focus:border-brand focus:outline-none" />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-text-muted mb-0.5">Alto</label>
                <input type="number" min={1} max={8}
                  value={formData.height ?? 1}
                  onChange={(e) => setFormData(p => ({ ...p, height: Math.max(1, parseInt(e.target.value) || 1) }))}
                  className="w-full px-3 py-2 rounded-lg border-2 border-border bg-white text-sm font-medium focus:border-brand focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Fitzgerald colors */}
          <div>
            <label className="block text-sm font-bold text-text-primary mb-1.5">
              Categoría Fitzgerald
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.entries(FITZGERALD_COLORS) as [FitzgeraldKey, typeof FITZGERALD_COLORS[FitzgeraldKey]][]).map(
                ([key, colors]) => (
                  <button
                    key={key}
                    onClick={() => applyFitzgerald(key)}
                    className={`
                      flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-bold
                      border-2 transition-all
                      ${formData.fitzgerald_key === key ? "ring-2 ring-offset-1" : ""}
                    `}
                    style={{
                      backgroundColor: colors.bg,
                      borderColor: colors.hex,
                      color: colors.text,
                    }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colors.hex }} />
                    {colors.label}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Color category (all schemes) */}
          <div>
            <label className="block text-sm font-bold text-text-primary mb-1.5">
              Categoría de color (esquemas)
              <span className="text-text-muted font-normal ml-1">(opcional)</span>
            </label>
            <select
              value={formData.colorCategory ?? ""}
              onChange={(e) => setFormData(p => ({ ...p, colorCategory: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border-2 border-border bg-white text-sm font-medium focus:border-brand focus:outline-none"
            >
              <option value="">Usar Fitzgerald (arriba)</option>
              {Object.values(COLOR_SCHEMES).flatMap(s =>
                s.categories.map(cat => (
                  <option key={`${s.name}-${cat.key}`} value={cat.key}>{cat.label} ({s.label})</option>
                ))
              )}
            </select>
          </div>

          {/* Vocalization */}
          <div>
            <label className="block text-sm font-bold text-text-primary mb-1.5">
              Vocalización TTS
              <span className="text-text-muted font-normal ml-1">(opcional)</span>
            </label>
            <input
              type="text"
              value={formData.vocalization}
              onChange={(e) => setFormData((p) => ({ ...p, vocalization: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border-2 border-border bg-white text-sm font-medium focus:border-brand focus:outline-none"
              placeholder="Texto para síntesis de voz (si difiere de la etiqueta)"
            />
          </div>

          {/* Actions */}
          <div>
            <label className="block text-sm font-bold text-text-primary mb-1.5">Acciones al tocar</label>
            <div className="space-y-2">
              {(formData.actions ?? []).map((action, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-white">
                  <select
                    value={action.modelName}
                    onChange={(e) => {
                      const newActions = [...(formData.actions ?? [])]
                      newActions[i] = { ...newActions[i], modelName: e.target.value as ActionModelName }
                      setFormData(p => ({ ...p, actions: newActions }))
                    }}
                    className="flex-1 px-2 py-1.5 rounded-md border border-border bg-white text-xs font-medium focus:border-brand focus:outline-none"
                  >
                    <option value="GridActionCollectElement">➕ Añadir al mensaje</option>
                    <option value="GridActionSpeak">🔊 Hablar</option>
                    <option value="GridActionSpeakCustom">🔊 Hablar (texto personalizado)</option>
                    <option value="GridActionNavigate">➡️ Navegar</option>
                    <option value="GridActionAudio">🔊 Sonido</option>
                    <option value="GridActionOpenWebpage">🌐 Abrir web</option>
                    <option value="GridActionWordForm">📝 Forma gramatical</option>
                    <option value="GridActionSystem">⚙️ Sistema</option>
                    <option value="GridActionVocabLevelToggle">🔢 Nivel vocabulario</option>
                    <option value="GridActionPredict">🔮 Predicción</option>
                    <option value="GridActionChangeLang">🌐 Cambiar idioma</option>
                    <option value="GridActionYoutube">▶️ YouTube</option>
                    <option value="GridActionWebradio">📻 Webradio</option>
                    <option value="GridActionPodcast">🎙️ Podcast</option>
                    <option value="GridActionHTTP">🌐 HTTP</option>
                    <option value="GridActionPredefined">📋 Predefinido</option>
                  </select>
                  {action.modelName === "GridActionNavigate" && (
                    <>
                      <input type="text" value={action.toGridId ?? ""}
                        onChange={(e) => {
                          const newActions = [...(formData.actions ?? [])]; newActions[i] = { ...newActions[i], toGridId: e.target.value, navType: "TO_GRID" }; setFormData(p => ({ ...p, actions: newActions }))
                        }} placeholder="ID del tablero..." className="w-24 px-2 py-1.5 rounded-md border border-border bg-white text-[10px] font-medium focus:border-brand focus:outline-none" />
                      <label className="flex items-center gap-1 text-[9px] font-medium text-text-muted cursor-pointer whitespace-nowrap">
                        <input type="checkbox" checked={!!action.addToCollectElem}
                          onChange={(e) => { const newActions = [...(formData.actions ?? [])]; newActions[i] = { ...newActions[i], addToCollectElem: e.target.checked }; setFormData(p => ({ ...p, actions: newActions })) }}
                          className="w-3 h-3 accent-brand" /> colectar
                      </label>
                    </>
                  )}
                  {action.modelName === "GridActionSpeak" && (
                    <input type="text" value={action.speakLanguage ?? "es-ES"}
                      onChange={(e) => { const newActions = [...(formData.actions ?? [])]; newActions[i] = { ...newActions[i], speakLanguage: e.target.value }; setFormData(p => ({ ...p, actions: newActions })) }}
                      placeholder="es-ES" className="w-16 px-2 py-1.5 rounded-md border border-border bg-white text-[10px] font-medium focus:border-brand focus:outline-none" />
                  )}
                  {action.modelName === "GridActionSpeakCustom" && (
                    <input type="text" value={action.speakText ?? ""}
                      onChange={(e) => { const newActions = [...(formData.actions ?? [])]; newActions[i] = { ...newActions[i], speakText: e.target.value }; setFormData(p => ({ ...p, actions: newActions })) }}
                      placeholder="Texto a hablar..." className="w-28 px-2 py-1.5 rounded-md border border-border bg-white text-[10px] font-medium focus:border-brand focus:outline-none" />
                  )}
                  {action.modelName === "GridActionOpenWebpage" && (
                    <input type="text" value={action.openURL ?? ""}
                      onChange={(e) => { const newActions = [...(formData.actions ?? [])]; newActions[i] = { ...newActions[i], openURL: e.target.value }; setFormData(p => ({ ...p, actions: newActions })) }}
                      placeholder="https://..." className="w-28 px-2 py-1.5 rounded-md border border-border bg-white text-[10px] font-medium focus:border-brand focus:outline-none" />
                  )}
                  {action.modelName === "GridActionCollectElement" && (
                    <select value={action.action ?? "COLLECT_ACTION_SPEAK"}
                      onChange={(e) => { const newActions = [...(formData.actions ?? [])]; newActions[i] = { ...newActions[i], action: e.target.value }; setFormData(p => ({ ...p, actions: newActions })) }}
                      className="w-28 px-2 py-1.5 rounded-md border border-border bg-white text-[10px] font-medium focus:border-brand focus:outline-none">
                      <option value="COLLECT_ACTION_SPEAK">Hablar</option>
                      <option value="COLLECT_ACTION_SPEAK_CONTINUOUS">Hablar continuo</option>
                      <option value="COLLECT_ACTION_CLEAR">Limpiar</option>
                      <option value="COLLECT_ACTION_REMOVE_WORD">Borrar palabra</option>
                      <option value="COLLECT_ACTION_REMOVE_CHAR">Borrar carácter</option>
                    </select>
                  )}
                  {action.modelName === "GridActionVocabLevelToggle" && (
                    <input type="number" min={1} max={10} value={action.vocabularyLevel ?? 1}
                      onChange={(e) => { const newActions = [...(formData.actions ?? [])]; newActions[i] = { ...newActions[i], vocabularyLevel: parseInt(e.target.value) || 1 }; setFormData(p => ({ ...p, actions: newActions })) }}
                      className="w-16 px-2 py-1.5 rounded-md border border-border bg-white text-[10px] font-medium focus:border-brand focus:outline-none" />
                  )}
                  {action.modelName === "GridActionSystem" && (
                    <>
                      <select value={action.action ?? "SYS_VOLUME_UP"}
                        onChange={(e) => { const newActions = [...(formData.actions ?? [])]; newActions[i] = { ...newActions[i], action: e.target.value }; setFormData(p => ({ ...p, actions: newActions })) }}
                        className="w-24 px-2 py-1.5 rounded-md border border-border bg-white text-[10px] font-medium focus:border-brand focus:outline-none">
                        <option value="SYS_VOLUME_UP">Vol +</option>
                        <option value="SYS_VOLUME_DOWN">Vol -</option>
                        <option value="SYS_VOLUME_TOGGLE_MUTE">Silencio</option>
                        <option value="SYS_ENTER_FULLSCREEN">Pantalla completa</option>
                        <option value="SYS_LEAVE_FULLSCREEN">Salir pantalla completa</option>
                      </select>
                      <input type="number" min={1} max={100} value={action.actionValue ?? 10}
                        onChange={(e) => { const newActions = [...(formData.actions ?? [])]; newActions[i] = { ...newActions[i], actionValue: parseInt(e.target.value) || 10 }; setFormData(p => ({ ...p, actions: newActions })) }}
                        className="w-14 px-2 py-1.5 rounded-md border border-border bg-white text-[10px] font-medium focus:border-brand focus:outline-none" />
                    </>
                  )}
                  {action.modelName === "GridActionChangeLang" && (
                    <select value={action.language ?? "es"}
                      onChange={(e) => { const newActions = [...(formData.actions ?? [])]; newActions[i] = { ...newActions[i], language: e.target.value }; setFormData(p => ({ ...p, actions: newActions })) }}
                      className="w-24 px-2 py-1.5 rounded-md border border-border bg-white text-[10px] font-medium focus:border-brand focus:outline-none">
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="pt">Português</option>
                    </select>
                  )}
                  {action.modelName === "GridActionYoutube" && (
                    <>
                      <select value={action.playType ?? "YT_PLAY_VIDEO"}
                        onChange={(e) => { const newActions = [...(formData.actions ?? [])]; newActions[i] = { ...newActions[i], playType: e.target.value }; setFormData(p => ({ ...p, actions: newActions })) }}
                        className="w-24 px-2 py-1.5 rounded-md border border-border bg-white text-[10px] font-medium focus:border-brand focus:outline-none">
                        <option value="YT_PLAY_VIDEO">Video</option>
                        <option value="YT_PLAY_SEARCH">Buscar</option>
                        <option value="YT_PLAY_PLAYLIST">Lista</option>
                      </select>
                      <input type="text" value={action.data ?? ""}
                        onChange={(e) => { const newActions = [...(formData.actions ?? [])]; newActions[i] = { ...newActions[i], data: e.target.value }; setFormData(p => ({ ...p, actions: newActions })) }}
                        placeholder="Video ID / búsqueda..." className="w-28 px-2 py-1.5 rounded-md border border-border bg-white text-[10px] font-medium focus:border-brand focus:outline-none" />
                    </>
                  )}
                  {action.modelName === "GridActionHTTP" && (
                    <>
                      <select value={action.method ?? "POST"}
                        onChange={(e) => { const newActions = [...(formData.actions ?? [])]; newActions[i] = { ...newActions[i], method: e.target.value }; setFormData(p => ({ ...p, actions: newActions })) }}
                        className="w-14 px-2 py-1.5 rounded-md border border-border bg-white text-[10px] font-medium focus:border-brand focus:outline-none">
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                      </select>
                      <input type="text" value={action.restUrl ?? ""}
                        onChange={(e) => { const newActions = [...(formData.actions ?? [])]; newActions[i] = { ...newActions[i], restUrl: e.target.value }; setFormData(p => ({ ...p, actions: newActions })) }}
                        placeholder="URL..." className="w-28 px-2 py-1.5 rounded-md border border-border bg-white text-[10px] font-medium focus:border-brand focus:outline-none" />
                    </>
                  )}
                  {action.modelName === "GridActionPredefined" && (
                    <input type="text" value={action.groupId ?? ""}
                      onChange={(e) => { const newActions = [...(formData.actions ?? [])]; newActions[i] = { ...newActions[i], groupId: e.target.value }; setFormData(p => ({ ...p, actions: newActions })) }}
                      placeholder="Group ID..." className="w-24 px-2 py-1.5 rounded-md border border-border bg-white text-[10px] font-medium focus:border-brand focus:outline-none" />
                  )}
                  {action.modelName === "GridActionWordForm" && (
                    <div className="flex flex-wrap items-center gap-1.5 flex-1">
                      <select value={action.wordFormMode ?? "WORDFORM_MODE_CHANGE_EVERYWHERE"}
                        onChange={(e) => { const newActions = [...(formData.actions ?? [])]; newActions[i] = { ...newActions[i], wordFormMode: e.target.value }; setFormData(p => ({ ...p, actions: newActions })) }}
                        className="px-2 py-1.5 rounded-md border border-border bg-white text-[10px] font-medium focus:border-brand focus:outline-none">
                        <option value="WORDFORM_MODE_NEXT_FORM">Siguiente forma</option>
                        <option value="WORDFORM_MODE_RESET_FORMS">Reiniciar</option>
                        <option value="WORDFORM_MODE_CHANGE_ELEMENTS">Cambiar elementos</option>
                        <option value="WORDFORM_MODE_CHANGE_BAR">Cambiar barra</option>
                        <option value="WORDFORM_MODE_CHANGE_EVERYWHERE">Cambiar todo</option>
                      </select>
                      {action.wordFormMode !== "WORDFORM_MODE_NEXT_FORM" && action.wordFormMode !== "WORDFORM_MODE_RESET_FORMS" && (
                        <>
                          <div className="flex flex-wrap gap-0.5">
                            {["BASE","NEGATION","SINGULAR","PLURAL","1.PERS","2.PERS","3.PERS","FEMININE","MASCULINE","NEUTRAL","1.CASE","2.CASE","3.CASE","4.CASE","5.CASE","6.CASE","COMPARATIVE","SUPERLATIVE","PRESENT","PAST","FUTURE","INDEFINITE","DEFINITE"].map(tag => {
                              const active = (action.wordFormTags ?? []).includes(tag)
                              return (
                                <button key={tag} onClick={() => {
                                  const tags = action.wordFormTags ?? []
                                  const next = active ? tags.filter(t => t !== tag) : [...tags, tag]
                                  const newActions = [...(formData.actions ?? [])]; newActions[i] = { ...newActions[i], wordFormTags: next }; setFormData(p => ({ ...p, actions: newActions }))
                                }}
                                  className={`text-[9px] font-bold px-1 py-0.5 rounded transition-all ${active ? "bg-brand text-white" : "bg-surface text-text-secondary hover:bg-border"}`}>
                                  {tag}
                                </button>
                              )
                            })}
                          </div>
                          <label className="flex items-center gap-1 text-[9px] font-medium text-text-muted cursor-pointer whitespace-nowrap">
                            <input type="checkbox" checked={!!action.toggle}
                              onChange={(e) => { const newActions = [...(formData.actions ?? [])]; newActions[i] = { ...newActions[i], toggle: e.target.checked }; setFormData(p => ({ ...p, actions: newActions })) }}
                              className="w-3 h-3 accent-brand" /> toggle
                          </label>
                        </>
                      )}
                    </div>
                  )}
                  {["GridActionPredict", "GridActionAudio", "GridActionWebradio", "GridActionPodcast"].includes(action.modelName) && (
                    <span className="text-[9px] text-text-muted font-medium">(sin configuración adicional)</span>
                  )}
                  <button
                    onClick={() => {
                      const newActions = (formData.actions ?? []).filter((_, idx) => idx !== i)
                      setFormData(p => ({ ...p, actions: newActions }))
                    }}
                    className="text-red-500 hover:text-red-700 text-xs font-bold px-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newActions = [...(formData.actions ?? []), { modelName: "GridActionCollectElement" as ActionModelName }]
                  setFormData(p => ({ ...p, actions: newActions }))
                }}
                className="text-xs font-bold text-brand hover:text-brand-dark transition-colors px-2 py-1"
              >
                + Añadir acción
              </button>
            </div>
          </div>

          {/* Flags */}
          <div className="flex flex-wrap gap-3 items-center">
            <label className="flex items-center gap-2 text-xs font-bold text-text-primary cursor-pointer">
              <input type="checkbox" checked={!!formData.dontCollect}
                onChange={(e) => setFormData(p => ({ ...p, dontCollect: e.target.checked }))}
                className="w-4 h-4 rounded border-border accent-brand" />
              No colectar
            </label>
            <label className="flex items-center gap-2 text-xs font-bold text-text-primary cursor-pointer">
              <input type="checkbox" checked={!!formData.toggleInBar}
                onChange={(e) => setFormData(p => ({ ...p, toggleInBar: e.target.checked }))}
                className="w-4 h-4 rounded border-border accent-brand" />
              Toggle en barra
            </label>
            <label className="flex items-center gap-2 text-xs font-bold text-text-primary cursor-pointer">
              <input type="checkbox" checked={!!formData.hidden}
                onChange={(e) => setFormData(p => ({ ...p, hidden: e.target.checked }))}
                className="w-4 h-4 rounded border-border accent-brand" />
              Ocultar
            </label>
          </div>

          {/* Word Forms */}
          <div className="pt-2 border-t border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-text-primary">Formas gramaticales</span>
              <span className="text-[10px] text-text-muted">[{formData.wordForms?.length ?? 0}]</span>
            </div>
            <textarea
              value={JSON.stringify(formData.wordForms ?? [], null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value)
                  if (Array.isArray(parsed)) setFormData(p => ({ ...p, wordForms: parsed }))
                } catch { /* ignore invalid JSON */ }
              }}
              className="w-full h-20 px-2 py-1.5 rounded-lg border-2 border-border bg-surface text-xs font-mono text-text-primary resize-none focus:border-brand focus:outline-none"
              placeholder='[{"value":"corro","tags":["1.PERS","PRESENT"]}]'
            />
            <p className="text-[10px] text-text-muted">
              Formato JSON. Tags: BASE, SINGULAR, PLURAL, 1.PERS, 2.PERS, 3.PERS, PRESENT, PAST, FUTURE, FEMININE, MASCULINE, NEGATION
            </p>
          </div>

          {/* Acciones guardar */}
          <div className="flex gap-3 pt-2 border-t border-border">
            {onDelete && (
              <Button variant="ghost" size="md" onClick={onDelete} className="text-red-600 hover:bg-red-50">
                🗑 Eliminar
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="outline" size="md" onClick={onClose}>Cancelar</Button>
            <Button variant="primary" size="md" onClick={() => onSave(formData)} disabled={!formData.label}>
              💾 Guardar
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}