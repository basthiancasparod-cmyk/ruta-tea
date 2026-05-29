'use client'

import { useState, useRef } from 'react'
import { useSupabase } from '@/components/layout/SupabaseProvider'

type Props = {
  childId: string
  currentUrl?: string | null
  currentEmoji: string
  name: string
  onUpdate: (url: string | null) => void
}

export function AvatarUpload({ childId, currentUrl, currentEmoji, name, onUpdate }: Props) {
  const { supabase } = useSupabase()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const ext = file.name.split('.').pop() ?? 'png'
      const filePath = `${childId}/${crypto.randomUUID()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl

      const { error: dbError } = await supabase
        .from('children')
        .update({ avatar_url: publicUrl })
        .eq('id', childId)
      if (dbError) throw dbError

      setPreview(null)
      onUpdate(publicUrl)
    } catch (err) {
      console.error('Error uploading avatar:', err)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleDelete = async () => {
    if (!currentUrl) return
    setUploading(true)
    try {
      const pathMatch = currentUrl.match(/avatars\/(.+)$/)
      if (pathMatch) {
        await supabase.storage.from('avatars').remove([pathMatch[1]])
      }

      const { error: dbError } = await supabase
        .from('children')
        .update({ avatar_url: null })
        .eq('id', childId)
      if (dbError) throw dbError

      onUpdate(null)
    } catch (err) {
      console.error('Error deleting avatar:', err)
    } finally {
      setUploading(false)
    }
  }

  const displayUrl = preview ?? currentUrl

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-16 h-16 shrink-0">
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-brand-bg rounded-full flex items-center justify-center text-3xl">
            {currentEmoji}
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold animate-pulse">...</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFile}
        />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-sm font-bold text-brand hover:text-brand-dark transition-colors disabled:opacity-50 text-left"
        >
          {currentUrl ? 'Cambiar foto' : 'Subir foto'}
        </button>
        {currentUrl && (
          <button
            onClick={handleDelete}
            disabled={uploading}
            className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors disabled:opacity-50 text-left"
          >
            Eliminar foto
          </button>
        )}
      </div>
    </div>
  )
}
