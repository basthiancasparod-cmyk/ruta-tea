export interface PredictionResult {
  word: string
  score: number
}

interface WordEntry {
  word: string
  freq: number
}

const SPANISH_COMMON: [string, number][] = [
  ["de", 1000], ["la", 990], ["que", 980], ["el", 970], ["en", 960],
  ["y", 950], ["a", 940], ["los", 930], ["se", 920], ["del", 910],
  ["las", 900], ["un", 890], ["por", 880], ["con", 870], ["no", 860],
  ["una", 850], ["su", 840], ["para", 830], ["es", 820], ["al", 810],
  ["lo", 800], ["como", 790], ["mas", 780], ["pero", 770], ["sus", 760],
  ["le", 750], ["ya", 740], ["o", 730], ["este", 720], ["si", 710],
  ["porque", 700], ["esta", 690], ["entre", 680], ["cuando", 670],
  ["muy", 660], ["sin", 650], ["sobre", 640], ["tambien", 630],
  ["me", 620], ["hasta", 610], ["hay", 600], ["donde", 590],
  ["quien", 580], ["todo", 570], ["bien", 560], ["ella", 550],
  ["estar", 540], ["hacer", 520], ["tener", 510],
  ["haber", 500], ["poder", 490], ["decir", 480], ["ir", 470],
  ["ver", 460], ["dar", 450], ["saber", 440], ["querer", 430],
  ["gustar", 420], ["jugar", 410], ["comer", 400], ["beber", 390],
  ["dormir", 380], ["leer", 370], ["escribir", 360], ["pensar", 350],
  ["casa", 340], ["agua", 330], ["comida", 320], ["amigo", 310],
  ["familia", 300], ["escuela", 290], ["libro", 280], ["mesa", 270],
  ["silla", 260], ["perro", 250], ["gato", 240], ["sol", 230],
  ["luna", 220], ["flor", 210], ["arbol", 200], ["cielo", 190],
  ["tierra", 180], ["mar", 170], ["fuego", 160], ["viento", 150],
  ["grande", 140], ["pequeno", 130], ["bueno", 120], ["malo", 110],
  ["feliz", 100], ["triste", 90], ["rapido", 80], ["lento", 70],
  ["ayer", 60], ["hoy", 50], ["manana", 60], ["noche", 55],
  ["dia", 58], ["semana", 52], ["ano", 54], ["tiempo", 56],
  ["nombre", 48], ["cosa", 46], ["mundo", 44], ["vida", 50],
  ["gracias", 50], ["hola", 45], ["adios", 40], ["por favor", 55],
  ["tengo", 200], ["tienes", 150], ["quiere", 120], ["quiero", 130],
  ["puedo", 110], ["puedes", 100], ["vamos", 90], ["ven", 80],
  ["mira", 70], ["escucha", 50], ["bebe", 40], ["come", 38],
  ["duerme", 30], ["juega", 35], ["corre", 28], ["salta", 22],
  ["bano", 45], ["cama", 40], ["cocina", 35], ["sala", 28],
  ["puerta", 30], ["ventana", 25],
  ["rojo", 20], ["azul", 18], ["verde", 18], ["amarillo", 14],
  ["negro", 16], ["blanco", 16], ["gris", 12],
  ["uno", 30], ["dos", 28], ["tres", 26], ["cuatro", 24],
  ["cinco", 22], ["seis", 20], ["siete", 18], ["ocho", 16],
  ["nueve", 14], ["diez", 16], ["lunes", 14], ["martes", 12],
  ["miercoles", 10], ["jueves", 10], ["viernes", 12],
  ["sabado", 14], ["domingo", 12],
  ["izquierda", 10], ["derecha", 14], ["arriba", 12],
  ["abajo", 12], ["dentro", 10], ["fuera", 12], ["cerca", 10],
  ["lejos", 8],
]

class PredictionService {
  private baseWords: WordEntry[] = []
  private boardWords: Map<string, number> = new Map()
  private learned: Map<string, number> = new Map()
  private initialized = false
  private storageKey = "caa_prediction_learned"

  init() {
    if (this.initialized) return
    this.baseWords = SPANISH_COMMON.filter(([w]) => w.length > 0).map(([word, freq]) => ({
      word: word.toLowerCase(),
      freq,
    }))
    try {
      const saved = localStorage.getItem(this.storageKey)
      if (saved) {
        const parsed = JSON.parse(saved) as [string, number][]
        parsed.forEach(([word, freq]) => this.learned.set(word.toLowerCase(), freq))
      }
    } catch { /* ignore */ }
    this.initialized = true
  }

  loadBoardVocab(words: string[], boost = 200) {
    this.init()
    this.boardWords.clear()
    for (const w of words) {
      const key = w.toLowerCase().trim()
      if (key.length > 0) {
        const existing = this.boardWords.get(key) ?? 0
        this.boardWords.set(key, Math.max(existing, boost))
      }
    }
  }

  clearBoardVocab() {
    this.boardWords.clear()
  }

  predict(input: string, maxResults = 4): PredictionResult[] {
    this.init()
    const clean = input.trim().toLowerCase()
    if (!clean) return []
    const matches = new Map<string, number>()

    const addWord = (word: string, score: number) => {
      const key = word.toLowerCase()
      if (key.startsWith(clean) && key !== clean) {
        matches.set(key, (matches.get(key) ?? 0) + score)
      }
    }

    for (const { word, freq } of this.baseWords) addWord(word, freq)
    this.boardWords.forEach((freq, word) => addWord(word, freq))
    this.learned.forEach((freq, word) => addWord(word, freq))

    return Array.from(matches.entries())
      .map(([word, score]) => ({ word, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
  }

  learn(word: string) {
    this.init()
    const key = word.trim().toLowerCase()
    if (!key) return
    const current = this.learned.get(key) ?? 0
    this.learned.set(key, current + 10 + Math.round(Math.random() * 5))
    this.persist()
  }

  getNextWords(input: string, maxResults = 4): PredictionResult[] {
    this.init()
    const clean = input.trim().toLowerCase()
    const words = clean.split(" ").filter(Boolean)
    const lastWord = words[words.length - 1] ?? ""

    if (lastWord.length > 0 && !clean.endsWith(" ")) {
      return this.predict(lastWord, maxResults)
    }

    if (!lastWord && words.length === 0) {
      return this.getTopWords(maxResults)
    }

    return this.getTopWords(maxResults)
  }

  private getTopWords(maxResults: number): PredictionResult[] {
    const seen = new Set<string>()
    const results: PredictionResult[] = []

    const tryAdd = (word: string, score: number) => {
      const key = word.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        results.push({ word: key, score })
      }
    }

    this.boardWords.forEach((freq, word) => tryAdd(word, freq))
    const learnedArr = Array.from(this.learned.entries()).sort((a, b) => b[1] - a[1])
    learnedArr.forEach(([word, freq]) => tryAdd(word, freq))
    this.baseWords.forEach(({ word, freq }) => tryAdd(word, freq))

    return results.slice(0, maxResults)
  }

  private persist() {
    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify(Array.from(this.learned.entries()))
      )
    } catch { /* ignore */ }
  }
}

export const predictionService = new PredictionService()
