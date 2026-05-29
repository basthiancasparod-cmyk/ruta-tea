import { test, expect } from '@playwright/test'

async function gotoAndLogin(page: any, url: string) {
  await page.goto(url, { timeout: 60000 })
  const heading = page.getByRole('heading', { name: 'Iniciar sesión' })
  if (await heading.isVisible().catch(() => false)) {
    const email = process.env.TEST_EMAIL
    const password = process.env.TEST_PASSWORD
    if (!email || !password) {
      test.skip(true, 'TEST_EMAIL / TEST_PASSWORD not set')
    }
    await page.locator('input[type="email"]').fill(email)
    await page.waitForTimeout(300)
    await page.locator('input[type="password"]').fill(password)
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL(/\/(ruta|onboarding)/, { timeout: 90000 })
    await page.goto(url, { timeout: 60000 })
  }
  await page.waitForLoadState('networkidle')
}

async function gotoAndLoginWithSettings(page: any, settings: Record<string, unknown>) {
  // First navigate to a safe page to set localStorage before target page loads
  await page.goto('/herramientas', { timeout: 60000 })
  // Handle login if needed
  const heading = page.getByRole('heading', { name: 'Iniciar sesión' })
  if (await heading.isVisible().catch(() => false)) {
    const email = process.env.TEST_EMAIL
    const password = process.env.TEST_PASSWORD
    if (!email || !password) test.skip(true, 'TEST_EMAIL / TEST_PASSWORD not set')
    await page.locator('input[type="email"]').fill(email)
    await page.waitForTimeout(300)
    await page.locator('input[type="password"]').fill(password)
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL(/\/(ruta|onboarding)/, { timeout: 90000 })
    await page.goto('/herramientas', { timeout: 60000 })
  }
  // Set localStorage with settings
  await page.evaluate((s: Record<string, unknown>) => {
    localStorage.setItem('quickBoardSettings', JSON.stringify(s))
  }, settings)
  // Now navigate to quick board
  await page.goto('/herramientas/tablero-caa/quick', { timeout: 60000 })
  await page.waitForLoadState('networkidle')
}

const QUICK_URL = '/herramientas/tablero-caa/quick'

// ── BUG 1: scanEnabled conectado a boardSettings ───────────────────
test('BUG 1 — Scan button inicia/para escaneo vía boardSettings', async ({ page }) => {
  test.setTimeout(120000)
  await gotoAndLogin(page, QUICK_URL)

  const scanBtn = page.getByText('🔘 Scan')
  const stopBtn = page.getByText('🟢 Detener')

  await expect(scanBtn).toBeVisible({ timeout: 10000 })
  await expect(stopBtn).not.toBeVisible()

  await scanBtn.click()
  await expect(stopBtn).toBeVisible({ timeout: 5000 })
  await expect(scanBtn).not.toBeVisible()

  await stopBtn.click()
  await expect(scanBtn).toBeVisible({ timeout: 5000 })
  await expect(stopBtn).not.toBeVisible()
})

// ── BUG 2+5: autoSpeak se sincroniza desde localStorage ───────────
test('BUG 2 — autoSpeak se carga desde localStorage y sincroniza con collectBar', async ({ page }) => {
  test.setTimeout(120000)

  await gotoAndLoginWithSettings(page, { autoSpeak: true })

  // Verificar que el botón de autoSpeak en el strip muestra estado activado
  await expect(page.locator('button[title="Auto-hablar activado"]')).toBeVisible({ timeout: 10000 })

  // Tocar una celda para verificar que autoSpeak realmente habla (no crash)
  await page.getByRole('button', { name: 'Hola' }).click()
  await page.waitForTimeout(300)

  // Con autoSpeak activado, el texto se agrega al strip
  await expect(page.locator('span:has-text("Hola")').first()).toBeVisible({ timeout: 3000 })
})

// ── BUG 5: settings pasados a initFromGrid (collectMode) ──────────
test('BUG 5 — collectMode desde settings se aplica al initFromGrid', async ({ page }) => {
  test.setTimeout(120000)

  await gotoAndLoginWithSettings(page, { collectMode: 'text' })

  // Tocar una celda para agregar un token
  await page.getByRole('button', { name: 'Hola' }).click()
  await page.waitForTimeout(500)

  // En modo "text" los tokens se muestran como texto plano dentro de un span
  const stripText = page.locator('span:has-text("Hola")').first()
  await expect(stripText).toBeVisible({ timeout: 3000 })

  // El toggle de modo de colección debe mostrar 📝 (modo texto)
  const modeToggle = page.locator('button[title="Cambiar modo de colección"]')
  await expect(modeToggle).toBeVisible({ timeout: 3000 })
  const toggleText = await modeToggle.textContent()
  expect(toggleText).toBe('📝')
})

// ── BUG 7: highlightOnPress=false desactiva el overlay ───────────
test('BUG 7 — highlightOnPress=false no muestra overlay en celda', async ({ page }) => {
  test.setTimeout(120000)

  await gotoAndLoginWithSettings(page, { highlightOnPress: false })

  const cell = page.getByRole('button', { name: 'Hola' })
  await expect(cell).toBeVisible({ timeout: 10000 })
  await cell.click()
  await page.waitForTimeout(50)

  // El overlay tiene clase pointer-events-none, con highlightOnPress=false no se renderiza
  await expect(cell.locator('.pointer-events-none')).toHaveCount(0)
})
