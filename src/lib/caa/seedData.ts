import type { FitzgeraldKey } from '@/types/caa'

// Vocabulario CORE - Las 100 palabras más importantes según investigación AAC
export const CORE_VOCABULARY_ES = [
  // Social (20)
  { label: 'hola', keyword: 'hola', fitz: 'social' as FitzgeraldKey },
  { label: 'adiós', keyword: 'adios', fitz: 'social' as FitzgeraldKey },
  { label: 'gracias', keyword: 'gracias', fitz: 'social' as FitzgeraldKey },
  { label: 'por favor', keyword: 'porfavor', fitz: 'social' as FitzgeraldKey },
  { label: 'sí', keyword: 'si', fitz: 'social' as FitzgeraldKey },
  { label: 'no', keyword: 'no', fitz: 'social' as FitzgeraldKey },
  { label: 'perdón', keyword: 'perdon', fitz: 'social' as FitzgeraldKey },
  { label: 'ayuda', keyword: 'ayuda', fitz: 'social' as FitzgeraldKey },
  
  // Subjects (15)
  { label: 'yo', keyword: 'yo', fitz: 'subject' as FitzgeraldKey },
  { label: 'tú', keyword: 'tu', fitz: 'subject' as FitzgeraldKey },
  { label: 'mamá', keyword: 'mama', fitz: 'subject' as FitzgeraldKey },
  { label: 'papá', keyword: 'papa', fitz: 'subject' as FitzgeraldKey },
  { label: 'hermano', keyword: 'hermano', fitz: 'subject' as FitzgeraldKey },
  { label: 'amigo', keyword: 'amigo', fitz: 'subject' as FitzgeraldKey },
  
  // Verbs (25)
  { label: 'querer', keyword: 'querer', fitz: 'verb' as FitzgeraldKey },
  { label: 'necesito', keyword: 'necesitar', fitz: 'verb' as FitzgeraldKey },
  { label: 'ir', keyword: 'ir', fitz: 'verb' as FitzgeraldKey },
  { label: 'hacer', keyword: 'hacer', fitz: 'verb' as FitzgeraldKey },
  { label: 'tener', keyword: 'tener', fitz: 'verb' as FitzgeraldKey },
  { label: 'ver', keyword: 'ver', fitz: 'verb' as FitzgeraldKey },
  { label: 'dar', keyword: 'dar', fitz: 'verb' as FitzgeraldKey },
  { label: 'comer', keyword: 'comer', fitz: 'verb' as FitzgeraldKey },
  { label: 'beber', keyword: 'beber', fitz: 'verb' as FitzgeraldKey },
  { label: 'jugar', keyword: 'jugar', fitz: 'verb' as FitzgeraldKey },
  
  // Descriptive (15)
  { label: 'más', keyword: 'mas', fitz: 'descriptive' as FitzgeraldKey },
  { label: 'menos', keyword: 'menos', fitz: 'descriptive' as FitzgeraldKey },
  { label: 'bien', keyword: 'bien', fitz: 'descriptive' as FitzgeraldKey },
  { label: 'mal', keyword: 'mal', fitz: 'descriptive' as FitzgeraldKey },
  { label: 'feliz', keyword: 'alegre', fitz: 'descriptive' as FitzgeraldKey },
  { label: 'triste', keyword: 'triste', fitz: 'descriptive' as FitzgeraldKey },
  
  // Time (10)
  { label: 'ahora', keyword: 'ahora', fitz: 'time' as FitzgeraldKey },
  { label: 'después', keyword: 'despues', fitz: 'time' as FitzgeraldKey },
  { label: 'hoy', keyword: 'hoy', fitz: 'time' as FitzgeraldKey },
  { label: 'mañana', keyword: 'manana', fitz: 'time' as FitzgeraldKey },
  
  // Places (10)
  { label: 'aquí', keyword: 'aqui', fitz: 'place' as FitzgeraldKey },
  { label: 'casa', keyword: 'casa', fitz: 'place' as FitzgeraldKey },
  { label: 'escuela', keyword: 'escuela', fitz: 'place' as FitzgeraldKey },
]