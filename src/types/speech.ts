export interface SpeechConfig {
  preferredVoice?: string
  secondVoice?: string
  voiceRate?: number
  voicePitch?: number
  voiceLangIsTextLang?: boolean
}

export interface VoiceGroup {
  lang: string
  langLabel: string
  voices: SpeechSynthesisVoice[]
}
