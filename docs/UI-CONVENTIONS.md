# Convenciones de UI — Dino Aprende

## Modal (Ventana emergente)

### Patrón obligatorio (basado en ChestModal)

Todo modal debe seguir exactamente esta estructura para evitar errores de transparencia con Tailwind v4:

```tsx
  {/* Overlay — SIN onClick aquí, solo el backdrop maneja el cierre */}
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-6"
  >
    {/* Backdrop — usar bg-black/85 SIN backdrop-blur */}
    <div className="absolute inset-0 bg-black/85" onClick={onClose} />

  {/* Contenedor — usar gradient inline, NO bg-* de Tailwind */}
  <motion.div
    initial={{ scale: 0.92, opacity: 0, y: 10 }}
    animate={{ scale: 1, opacity: 1, y: 0 }}
    exit={{ scale: 0.92, opacity: 0, y: 10 }}
    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
    className="relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
    style={{ background: 'linear-gradient(145deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)' }}
  >
    {/* Glass shine decorativo — capa superpuesta sobre fondo sólido */}
    <div className="absolute inset-0 pointer-events-none rounded-3xl" style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.2) 100%)',
      border: '1px solid rgba(255,255,255,0.8)',
    }} />

    <div className="relative">
      {/* ... contenido del modal ... */}
    </div>
  </motion.div>
</motion.div>
```

### Reglas críticas
1. **Backdrop**: SIEMPRE `bg-black/85` sin `backdrop-blur-sm` — el blur causa problemas de renderizado en algunos contextos con Tailwind v4
2. **Fondo del modal**: Usar SIEMPRE `style={{ background: 'linear-gradient(...)' }}` inline. NO usar `bg-white`, `bg-surface`, etc. de Tailwind en el contenedor principal del modal — las variables CSS de Tailwind v4 no siempre resuelven en contextos de portal/modal
3. **Glass shine**: Es una capa decorativa superpuesta (pointer-events-none) sobre el fondo sólido, no el fondo mismo
4. **Border**: Usar `border-border/60` en lugar de `border-border` para consistencia
5. **Animación**: Spring con stiffness 300, damping 28, y = 10 (no 30)

## Colores Fitzgerald

Los colores del sistema Fitzgerald están centralizados en `src/types/caa.ts`:
- `FITZGERALD_COLORS` — objeto con bg, border, text, hex por cada key
- `FITZGERALD_LABELS` — nombres en español

**NO** definir colores Fitzgerald localmente en ningún componente. Siempre importar desde `@/types/caa`.

## API — Batch Operations

Para operaciones que afectan múltiples registros:
- Preferir batch insert (`POST` con array) en lugar de N llamadas individuales
- El endpoint `/api/caa/cells` soporta batch: enviar `POST` con `CAACell[]` en lugar de `CAACell`

## Componentes UI

- `Button`: soporta `title` prop para tooltips
- No pasar props no soportadas a componentes (TypeScript lo valida)
