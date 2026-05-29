// Singleton TTS — seguro en SSR (typeof window check)
// No usar useState; el estado de voz es global a nivel de pestaña.

export interface TTSOptions {
  lang?: string
  rate?: number
  pitch?: number
  voiceName?: string
}

class TTSService {
  private synth: SpeechSynthesis
  private voices: SpeechSynthesisVoice[] = []
  private ready = false

  constructor() {
    this.synth = window.speechSynthesis
    const load = () => {
      this.voices = this.synth.getVoices()
      this.ready = true
    }
    load()
    this.synth.onvoiceschanged = load
  }

  getVoices(lang?: string): SpeechSynthesisVoice[] {
    if (!lang) return this.voices
    return this.voices.filter(v => v.lang.startsWith(lang.split('-')[0]))
  }

  speak(text: string, opts: TTSOptions = {}) {
    if (!text.trim()) return
    this.synth.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = opts.lang ?? 'es-ES'
    utt.rate = opts.rate ?? 0.85
    utt.pitch = opts.pitch ?? 1.0
    if (opts.voiceName) {
      const v = this.voices.find(v => v.name === opts.voiceName)
      if (v) utt.voice = v
    }
    // Workaround Chrome bug: habla se corta después de ~15s
    const resume = setInterval(() => {
      if (this.synth.paused) this.synth.resume()
    }, 5000)
    utt.onend = () => clearInterval(resume)
    utt.onerror = () => clearInterval(resume)
    this.synth.speak(utt)
  }

  cancel() { this.synth.cancel() }
  isSupported() { return 'speechSynthesis' in window }
}

let _instance: TTSService | null = null

export function getTTS(): TTSService | null {
  if (typeof window === 'undefined') return null
  if (!_instance) _instance = new TTSService()
  return _instance
}
