import { test, expect } from '@playwright/test'

const TEMPLATES = [
  { name: 'Comunicación Básica', grid: '4x6', category: 'core' },
  { name: 'Emociones', grid: '3x4', category: 'emotions' },
  { name: 'Peticiones y Necesidades', grid: '4x6', category: 'requests' },
  { name: 'Comidas y Bebidas', grid: '4x6', category: 'fringe' },
  { name: 'Rutina Escolar', grid: '4x6', category: 'fringe' },
  { name: 'Juego y Tiempo Libre', grid: '4x6', category: 'fringe' },
]

async function login(page: any) {
  const heading = page.getByRole('heading', { name: 'Iniciar sesión' })
  if (!(await heading.isVisible().catch(() => false))) return

  const email = process.env.TEST_EMAIL
  const password = process.env.TEST_PASSWORD
  if (!email || !password) {
    test.skip(true, 'TEST_EMAIL / TEST_PASSWORD not set')
  }

  console.log('  📧 Escribiendo email...')
  await page.locator('input[type="email"]').fill(email)
  await page.waitForTimeout(500)

  console.log('  🔑 Escribiendo contraseña...')
  await page.locator('input[type="password"]').fill(password)
  await page.waitForTimeout(500)

  console.log('  🚀 Enviando login...')
  await page.getByRole('button', { name: 'Entrar' }).click()

  console.log('  ⏳ Esperando autenticación...')
  await page.waitForURL(/\/(ruta|onboarding)/, { timeout: 90000 })
  console.log('  ✅ Login exitoso')

  await page.goto('/herramientas/tablero-caa/plantillas')
}

test('Plantillas - flujo completo', async ({ page }) => {
  test.setTimeout(180000)

  console.log('\n🌐 Navegando a plantillas...')
  await page.goto('/herramientas/tablero-caa/plantillas', { timeout: 60000 })

  console.log('🔐 Verificando autenticación...')
  await login(page)
  await page.waitForTimeout(1000)

  console.log('📋 Verificando 6 tarjetas de plantilla...')
  for (const t of TEMPLATES) {
    await expect(page.getByRole('heading', { name: t.name })).toBeVisible()
    console.log(`   ✓ ${t.name}`)
  }
  await page.waitForTimeout(1000)

  console.log('🏷️  Verificando badges y botones...')
  for (const t of TEMPLATES) {
    const card = page.locator('h3', { hasText: t.name }).locator('..')
    await expect(card.getByText(t.grid)).toBeVisible()
    await expect(card.getByText(t.category)).toBeVisible()
    await expect(card.getByText('Usar plantilla')).toBeVisible()
    console.log(`   ✓ ${t.name} — ${t.grid}, ${t.category}, botón OK`)
  }
  await page.waitForTimeout(1000)

  console.log('🔘 Verificando botón "Crear desde cero"...')
  await expect(page.getByText('Crear desde cero')).toBeVisible()
  console.log('   ✓ Visible')
  await page.waitForTimeout(1000)

  console.log('⚠️  Probando clic en "Usar plantilla" sin perfil de niño...')
  page.on('dialog', async (dialog) => {
    console.log(`   📢 Alert: "${dialog.message()}"`)
    expect(dialog.message()).toBe('Necesitas tener un perfil de niño configurado')
    await dialog.dismiss()
    console.log('   ✅ Alert confirmado')
  })
  await page.getByText('Usar plantilla').first().click()
  await page.waitForTimeout(1500)

  console.log('\n🎉 ¡Todas las pruebas pasaron!\n')
})
