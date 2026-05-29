'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'



interface Section {
  id: string; title: string; icon: string; content: string[]
}

interface Category {
  id: string; label: string; icon: string
}

const categories: Category[] = [
  { id: 'understanding_tea', label: 'Entendiendo el TEA', icon: '🧠' },
  { id: 'first_steps', label: 'Primeros Pasos', icon: '👣' },
  { id: 'daily_life', label: 'Vida Diaria', icon: '🏠' },
  { id: 'emotional_support', label: 'Apoyo Emocional', icon: '💛' },
  { id: 'downloads', label: 'Descargables', icon: '📥' },
]

const sections: Record<string, Section[]> = {
  understanding_tea: [
    {
      id: 'que-es-tea', title: '¿Qué es el TEA?', icon: '🧩',
      content: [
        'El Trastorno del Espectro Autista (TEA) es una condición del neurodesarrollo que afecta la comunicación, la interacción social y el procesamiento sensorial. No es una enfermedad que deba curarse, sino una forma diferente de percibir el mundo.',
        'Se denomina "espectro" porque abarca una amplia variedad de características que se manifiestan de forma única en cada persona. Dos niños con TEA pueden tener perfiles completamente distintos.',
        'Según la OMS, aproximadamente 1 de cada 100 niños tiene TEA. El diagnóstico se basa en los criterios del DSM-5, que evalúa dos áreas principales: comunicación social y patrones repetitivos de comportamiento.',
        'El diagnóstico temprano y la intervención adecuada mejoran significativamente el pronóstico y la calidad de vida.',
      ],
    },
    {
      id: 'niveles', title: 'Niveles de Apoyo (Grados 1, 2 y 3)', icon: '📊',
      content: [
        'NIVEL 1 — "Necesita ayuda": Dificultades notables en comunicación social sin apoyos. Pueden comunicarse verbalmente con fluidez. El diagnóstico suele ser más tardío porque las señales se confunden con timidez. Requieren adaptaciones educativas y apoyo en habilidades sociales.',
        'NIVEL 2 — "Necesita ayuda notable": Déficits marcados incluso con apoyos. Limitada iniciación social. Comportamientos repetitivos evidentes. Requieren intervención terapéutica intensiva y apoyo educativo especializado.',
        'NIVEL 3 — "Necesita ayuda muy notable": Déficits severos con mínima comunicación funcional. Requieren apoyo constante y supervisión en la mayoría de actividades diarias. La inflexibilidad conductual interfiere marcadamente en todas las áreas.',
        'Importante: estos niveles no son etiquetas fijas. Con el apoyo adecuado, una persona puede avanzar y desarrollar nuevas habilidades a lo largo de su vida.',
      ],
    },
    {
      id: 'senales', title: 'Señales Tempranas por Edad', icon: '🔍',
      content: [
        '0-6 MESES: Poco contacto visual, ausencia de sonrisa social, falta de interés por rostros, escaso balbuceo, hipo o hiperreactividad a estímulos.',
        '6-12 MESES: No responde a su nombre, ausencia de gestos (señalar, mostrar), no sigue la mirada, pobre imitación, interés inusual en objetos.',
        '12-24 MESES: Retraso o pérdida del lenguaje, no señala para compartir, juego no funcional, conductas repetitivas (aleteo, balanceo), selectividad alimentaria extrema.',
        '2-5 AÑOS: Dificultades para jugar con otros, lenguaje literal o ecolalia, rutinas rígidas, intereses restringidos e intensos, reacciones extremas a estímulos sensoriales.',
        'No todos los niños presentan todas las señales. Lo relevante es la presencia de múltiples indicadores con intensidad y persistencia.',
      ],
    },
    {
      id: 'mitos', title: 'Mitos y Realidades', icon: '⚡',
      content: [
        '❌ "Las vacunas causan autismo." ✅ Desmentido por múltiples estudios. El estudio original fue retirado por fraude.',
        '❌ "Las personas con autismo no sienten emociones." ✅ Sienten profundamente, pero pueden expresarlas de forma diferente.',
        '❌ "El autismo se cura." ✅ No es una enfermedad. Con apoyos adecuados, las personas con TEA desarrollan todo su potencial.',
        '❌ "Tienen discapacidad intelectual." ✅ El TEA y la discapacidad intelectual son condiciones distintas. Muchos tienen CI promedio o superior.',
        '❌ "No quieren tener amigos." ✅ La mayoría desea conectar, pero puede no saber cómo o sentirse abrumada socialmente.',
        '❌ "Solo afecta a niños." ✅ Afecta a todos los géneros. Las niñas suelen ser infradiagnosticadas por manifestar síntomas más sutiles.',
      ],
    },
  ],
  first_steps: [
    {
      id: 'despues-diagnostico', title: '¿Qué Hacer Tras el Diagnóstico?', icon: '🗺️',
      content: [
        'Recibir el diagnóstico es abrumador. Es normal sentir alivio, incertidumbre o duelo. Permítete sentir sin juzgarte.',
        '1. INFÓRMATE de fuentes confiables (AAP, NIMH, asociaciones de autismo). Evita promesas de curas milagrosas.',
        '2. CONECTA con otros padres. Los grupos de apoyo son una fuente invaluable de experiencia y contención.',
        '3. INICIA intervención temprana. La neuroplasticidad es máxima en los primeros años. Pregunta a tu pediatra sobre recursos de atención temprana.',
        '4. COORDINA con la escuela. Solicita una reunión con el equipo docente para planificar adaptaciones.',
        '5. CUIDA DE TI. El bienestar de los padres es fundamental. Busca apoyo psicológico si lo necesitas.',
      ],
    },
    {
      id: 'intervencion', title: 'Intervención Temprana', icon: '🌱',
      content: [
        'La intervención temprana (0-6 años) aprovecha la plasticidad cerebral para potenciar al máximo las habilidades del niño.',
        'PRINCIPIOS: Inicio antes de los 3 años, intensidad de 15-25 h semanales, participación familiar activa, enfoque interdisciplinario, y generalización de habilidades a la vida cotidiana.',
        'MIENTRAS LLEGA LA INTERVENCIÓN: Mantén rutinas, usa apoyos visuales, háblale narrando tus acciones, sigue sus intereses para conectar, reduce la sobreestimulación, celebra cada logro.',
        'En España, los Centros de Atención Temprana (CAT) ofrecen servicios públicos. Solicita información a través de tu pediatra o servicios sociales municipales.',
      ],
    },
    {
      id: 'terapias', title: 'Terapias con Evidencia Científica', icon: '🏥',
      content: [
        'No existe una terapia única para todos. La mejor intervención se adapta al perfil individual del niño.',
        'ABA (Análisis Conductual Aplicado): Terapia intensiva que enseña habilidades mediante refuerzo positivo. Mejora cognición, lenguaje y conductas adaptativas. Incluye variantes como VB y PRT.',
        'ESDM (Modelo Denver): Para niños de 12-48 meses. Combina ABA con juego natural. Los padres son entrenados para aplicarlo en casa. Mejora CI, lenguaje y habilidades adaptativas.',
        'TEACCH: Enseñanza estructurada con organización visual, rutinas predecibles y sistemas individualizados. Maximiza la autonomía aprovechando las fortalezas visuales.',
        'LOGOPEDIA: Trabaja lenguaje, pragmática (uso social del lenguaje) y sistemas alternativos de comunicación como PECS.',
        'TERAPIA OCUPACIONAL: Aborda habilidades diarias, motricidad e integración sensorial. Fundamental para niños con hipo/hipersensibilidad sensorial.',
      ],
    },
    {
      id: 'sistema', title: 'Navegando el Sistema de Salud y Educación', icon: '🏛️',
      content: [
        'ATENCIÓN PRIMARIA: El pediatra es tu primer contacto. Solicita derivación a neuropediatría si observas señales de alerta.',
        'CENTROS DE ATENCIÓN TEMPRANA (CAT): Intervención gratuita para 0-6 años con logopedia, psicología y terapia ocupacional.',
        'EQUIPO DE ORIENTACIÓN EDUCATIVA (EOE): A partir de 3 años, evalúa necesidades educativas especiales y establece adaptaciones curriculares.',
        'GRADO DE DISCAPACIDAD: Solicítalo en servicios sociales. Da acceso a beneficios fiscales, ayudas económicas y recursos adicionales.',
        'ASOCIACIONES: Autismo España y asociaciones autonómicas ofrecen información, formación y grupos de apoyo.',
      ],
    },
  ],
  daily_life: [
    {
      id: 'rutinas', title: 'Rutinas y Estructura', icon: '🔄',
      content: [
        'Los niños con TEA encuentran seguridad en la predecibilidad. Las rutinas reducen la ansiedad y facilitan la comprensión del entorno.',
        'USA AGENDAS VISUALES: Pictogramas que muestran la secuencia del día (levantarse, desayunar, vestirse, ir al cole). Puedes usar la herramienta "Agenda Visual" en la sección Herramientas.',
        'ANTICIPA LOS CAMBIOS: Si habrá una alteración en la rutina, prepárale con tiempo usando imágenes o un calendario visual.',
        'ESTABLECE RITUALES: Momentos consistentes para comer, dormir y jugar. La consistencia reduce las crisis por incertidumbre.',
        'CREA UN ESPACIO SEGURO: Un rincón tranquilo con pocos estímulos donde el niño pueda autorregularse cuando se sienta sobrecargado.',
      ],
    },
    {
      id: 'comunicacion', title: 'Estrategias de Comunicación', icon: '💬',
      content: [
        'La comunicación con un niño con TEA requiere adaptar nuestro propio estilo comunicativo.',
        'HABLA CLARO Y CONCRETO: Frases cortas, lenguaje literal. Evita ironías, sarcasmos y dobles sentidos.',
        'USA APOYOS VISUALES: Acompaña tus palabras con imágenes, gestos o demostraciones. Muchos niños con TEA procesan mejor la información visual.',
        'DALE TIEMPO PARA RESPONDER: Procesar el lenguaje puede llevar más tiempo. Espera 5-10 segundos después de hacer una pregunta.',
        'VALID SUS EMOCIONES: Ayúdale a identificar lo que siente ("Veo que estás enfadado porque se acabó el tiempo de tablet").',
        'SISTEMAS AUMENTATIVOS: Si el niño no habla, explora sistemas como PECS (intercambio de imágenes), signos o comunicadores digitales (ver Tablero CAA en Herramientas).',
      ],
    },
    {
      id: 'sensorial', title: 'Manejo Sensorial', icon: '🎧',
      content: [
        'Muchos niños con TEA procesan la información sensorial de forma diferente. Pueden ser hipersensibles (reaccionan intensamente) o hiposensibles (buscan más estimulación).',
        'HIPERSENSIBILIDAD: Molestia con ruidos fuertes, luces brillantes, etiquetas de ropa, texturas de comida, aglomeraciones. Soluciones: auriculares de cancelación, ropa sin etiquetas, alimentos con texturas predecibles.',
        'HIPOSENSIBILIDAD: Búsqueda constante de movimiento, presión profunda, o estímulos intensos. Soluciones: columpios, mantas pesadas, masajes de presión, juguetes sensoriales.',
        'CRISIS SENSORIALES: Cuando el sistema se sobrecarga, el niño puede tener meltdowns (explosiones por sobrecarga) o shutdowns (desconexión/retraimiento). No son berrinches manipulativos — son respuestas involuntarias a una sobrecarga del sistema nervioso.',
        'QUÉ HACER DURANTE UNA CRISIS: Reduce estímulos (luces, ruido), no le exijas que hable, ofrécele un espacio seguro, espera con paciencia. No intentes razonar durante la crisis. La regulación llegará después.',
      ],
    },
    {
      id: 'escuela', title: 'Adaptaciones Escolares', icon: '🏫',
      content: [
        'La escuela puede ser un entorno desafiante para un niño con TEA. Las adaptaciones adecuadas marcan una gran diferencia.',
        'ADAPTACIONES CURRICULARES: El equipo de orientación educativa puede establecer ajustes en objetivos, metodología, evaluación o tiempos.',
        'APOYOS EN EL AULA: Aula de apoyo, maestro de pedagogía terapéutica (PT), auxiliar educativo, temporalización flexible.',
        'ESTRATEGIAS ÚTILES: Ubicación preferente (lejos de ruidos/distracciones), instrucciones escritas además de verbales, tiempo extra, descansos sensoriales.',
        'COMUNICACIÓN ESCUELA-FAMILIA: Establece un cuaderno de ida y vuelta, reuniones periódicas, y comparte qué estrategias funcionan en casa.',
      ],
    },
    {
      id: 'habilidades-sociales', title: 'Desarrollo de Habilidades Sociales', icon: '🤝',
      content: [
        'Las habilidades sociales no son intuitivas para muchos niños con TEA. Pueden enseñarse de forma explícita y estructurada.',
        'ENSEÑANZA EXPLÍCITA: Explica las reglas sociales de forma clara ("Cuando alguien habla, esperamos a que termine para responder"). Usa historias sociales para practicar situaciones concretas.',
        'JUEGO ESTRUCTURADO: Inicia con actividades con reglas claras (juegos de mesa, turnos). Progresivamente, introduce juegos con más flexibilidad.',
        'MODELAJE: Los niños aprenden observando. Modela las habilidades que quieres enseñar: saludar, pedir por favor, esperar turno.',
        'GRUPOS DE HABILIDADES SOCIALES: Busca grupos terapéuticos donde puedan practicar con otros niños en un entorno seguro y guiado.',
      ],
    },
  ],
  emotional_support: [
    {
      id: 'apoyo-padres', title: 'Apoyo para Padres', icon: '💪',
      content: [
        'Criar a un hijo con TEA es un viaje lleno de retos y alegrías únicas. El autocuidado de los padres no es un lujo — es una necesidad.',
        'PERMÍTETE SENTIR: Es normal experimentar duelo, enfado, culpa, agotamiento y amor inmenso, a veces todo en el mismo día. Todas las emociones son válidas.',
        'BUSCA AYUDA PROFESIONAL: La terapia psicológica para padres de niños con TEA ayuda a procesar emociones, desarrollar estrategias de afrontamiento y prevenir el burnout.',
        'CONECTA CON OTRAS FAMILIAS: Los grupos de apoyo de padres reducen el aislamiento y ofrecen consejos prácticos de quienes realmente entienden.',
        'MANTÉN ESPACIOS PROPIOS: Dedica tiempo a tus aficiones, tu pareja y tus amistades. Un padre que se cuida puede cuidar mejor.',
      ],
    },
    {
      id: 'apoyo-hermanos', title: 'Apoyo para Hermanos', icon: '👧',
      content: [
        'Los hermanos de niños con TEA tienen necesidades específicas que a menudo pasan desapercibidas.',
        'HÁBLALES SOBRE EL TEA: Explícales qué es el autismo de forma adecuada a su edad. Ayúdales a entender que su hermano no es "malo" o "raro" — su cerebro funciona de forma diferente.',
        'VALIDA SUS EMOCIONES: Pueden sentir amor, pero también frustración, vergüenza o celos por la atención que recibe su hermano. Todas estas emociones son normales.',
        'DEDICA TIEMPO EXCLUSIVO: Reserva momentos regulares a solas con cada hermano, sin que el foco sea el TEA. Necesitan sentirse vistos como individuos.',
        'GRUPOS PARA HERMANOS: Existen programas específicos donde los hermanos de niños con TEA comparten experiencias y aprenden estrategias.',
      ],
    },
    {
      id: 'bienestar-nino', title: 'Bienestar Emocional del Niño', icon: '🌈',
      content: [
        'El bienestar emocional del niño con TEA es tan importante como su desarrollo académico o terapéutico.',
        'AUTOCONOCIMIENTO: Ayúdale a entender su propio perfil — sus fortalezas, sus desafíos, y que el TEA es parte de quien es, pero no lo define por completo.',
        'CELEBRA SUS FORTALEZAS: Los niños con TEA tienen talentos únicos: atención al detalle, memoria excepcional, honestidad, creatividad, perseverancia. Céntrate en potenciar sus fortalezas.',
        'ENSEÑA AUTORREGULACIÓN: Ayúdale a identificar sus señales de sobrecarga y a usar estrategias de calma (respiración, espacio sensorial, movimiento).',
        'FOMENTA LA AUTOESTIMA: Evita comparaciones con otros niños. Celebra sus progresos, por pequeños que sean. Usa un lenguaje positivo sobre su neurodivergencia.',
      ],
    },
    {
      id: 'redes-apoyo', title: 'Construyendo una Red de Apoyo', icon: '🤲',
      content: [
        'Ninguna familia debería transitar este camino sola. Una red de apoyo sólida marca la diferencia.',
        'FAMILIA EXTENDIDA: Educa a abuelos, tíos y primos sobre el TEA. Cuanto más entiendan, mejor podrán apoyar.',
        'AMISTADES: Mantén las amistades verdaderas. Explícales cómo pueden apoyarte sin juzgar.',
        'ASOCIACIONES: Las asociaciones de familias ofrecen formación, grupos de apoyo, actividades inclusivas y defensa de derechos.',
        'PROFESIONALES DE CONFIANZA: Construye un equipo de profesionales (pediatra, terapeutas, psicólogo) que te escuchen y colaboren entre sí.',
        'COMUNIDAD ONLINE: Los grupos de Facebook, foros y comunidades como la nuestra (Módulo Comunidad) ofrecen apoyo disponible 24/7.',
      ],
    },
  ],
  downloads: [
    {
      id: 'guias', title: 'Guías para Padres', icon: '📘',
      content: ['Guías descargables sobre TEA, estrategias en casa, y derechos educativos. (Próximamente)'],
    },
    {
      id: 'agendas', title: 'Plantillas de Rutinas', icon: '📅',
      content: ['Agendas visuales imprimibles, horarios diarios, y calendarios de anticipación. (Próximamente)'],
    },
    {
      id: 'historias', title: 'Historias Sociales', icon: '📖',
      content: ['Colección de historias sociales ilustradas para trabajar situaciones cotidianas. (Próximamente)'],
    },
    {
      id: 'registros', title: 'Registros de Conducta', icon: '📊',
      content: ['Plantillas para registrar sueño, alimentación, conductas y progreso terapéutico. (Próximamente)'],
    },
  ],
}

// ─── AccordionSection ────────────────────────────────────────────────────────

function AccordionSection({ section, isOpen, onToggle }: { section: Section; isOpen: boolean; onToggle: () => void }) {
  return (
    <motion.div layout className="bg-white rounded-2xl shadow-md border border-border/40 overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-4 text-left">
        <span className="text-xl">{section.icon}</span>
        <span className="flex-1 heading-card leading-snug">{section.title}</span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-text-muted shrink-0">
          ▼
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              {section.content.map((line, i) => {
                const isHeading = line.startsWith('NIVEL') || line.startsWith('PRINCIPIOS') || line.startsWith('MIENTRAS') || line.startsWith('ATENCIÓN') || line.startsWith('CENTROS') || line.startsWith('EQUIPO') || line.startsWith('GRADO') || line.startsWith('ASOCIACIONES') || line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') || line.startsWith('4.') || line.startsWith('5.') || line.startsWith('❌') || line.startsWith('0-6') || line.startsWith('6-12') || line.startsWith('12-24') || line.startsWith('2-5')
                const isBullet = line.startsWith('•') || line.startsWith('ABA') || line.startsWith('ESDM') || line.startsWith('TEACCH') || line.startsWith('LOGOPEDIA') || line.startsWith('TERAPIA')
                if (!line.trim()) return <div key={i} className="h-1" />
                return (
                  <p key={i} className={`text-xs leading-relaxed ${isHeading ? 'font-extrabold text-text-primary mt-2' : isBullet ? 'text-text-secondary pl-3 border-l-2 border-brand/30' : 'text-text-secondary'}`}>
                    {line}
                  </p>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── EmptyDownloads ──────────────────────────────────────────────────────────

function EmptyDownloads() {
  return (
    <div className="flex flex-col items-center py-10 text-center">
<img src="/assets/dino-familia.png" alt="Dino" className="w-[90px] h-[105px] object-contain drop-shadow-lg" />
      <p className="heading-card mt-4">Contenido descargable en preparación</p>
      <p className="text-meta mt-1 max-w-xs">Estamos desarrollando guías, plantillas y materiales para apoyarte en casa. ¡Vuelve pronto!</p>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function RinconFamiliarPage() {
  const [activeCategory, setActiveCategory] = useState('understanding_tea')
  const [openSection, setOpenSection] = useState<string | null>(null)

  const currentSections = sections[activeCategory] ?? []
  const isDownloadsTab = activeCategory === 'downloads'

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
<img src="/assets/dino-familia.png" alt="Dino" className="w-[110px] h-[129px] object-contain drop-shadow-xl" />
        <div>
          <h1 className="heading-page">Rincón Familiar</h1>
          <p className="text-body">Información, recursos y apoyo para toda la familia</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-1 -mx-4 px-4 scrollbar-none">
        {categories.map((cat) => (
          <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setOpenSection(null) }}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all ${
              activeCategory === cat.id ? 'bg-brand text-white shadow-md' : 'bg-surface border border-border/60 text-text-secondary hover:border-brand'}`}
          >
            <span className="text-sm">{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3">
        {isDownloadsTab ? (
          <div className="flex flex-col gap-3">
            {currentSections.map((sec) => (
              <AccordionSection key={sec.id} section={sec} isOpen={openSection === sec.id} onToggle={() => setOpenSection(openSection === sec.id ? null : sec.id)} />
            ))}
            <EmptyDownloads />
          </div>
        ) : currentSections.map((sec) => (
          <AccordionSection key={sec.id} section={sec} isOpen={openSection === sec.id} onToggle={() => setOpenSection(openSection === sec.id ? null : sec.id)} />
        ))}
      </div>
    </div>
  )
}
