# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: settings-fixes.spec.ts >> BUG 1 — Scan button inicia/para escaneo vía boardSettings
- Location: e2e\settings-fixes.spec.ts:52:5

# Error details

```
TimeoutError: page.goto: Timeout 60000ms exceeded.
Call log:
  - navigating to "http://localhost:3000/herramientas/tablero-caa/quick", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | 
  3   | async function gotoAndLogin(page: any, url: string) {
> 4   |   await page.goto(url, { timeout: 60000 })
      |              ^ TimeoutError: page.goto: Timeout 60000ms exceeded.
  5   |   const heading = page.getByRole('heading', { name: 'Iniciar sesión' })
  6   |   if (await heading.isVisible().catch(() => false)) {
  7   |     const email = process.env.TEST_EMAIL
  8   |     const password = process.env.TEST_PASSWORD
  9   |     if (!email || !password) {
  10  |       test.skip(true, 'TEST_EMAIL / TEST_PASSWORD not set')
  11  |     }
  12  |     await page.locator('input[type="email"]').fill(email)
  13  |     await page.waitForTimeout(300)
  14  |     await page.locator('input[type="password"]').fill(password)
  15  |     await page.waitForTimeout(300)
  16  |     await page.getByRole('button', { name: 'Entrar' }).click()
  17  |     await page.waitForURL(/\/(ruta|onboarding)/, { timeout: 90000 })
  18  |     await page.goto(url, { timeout: 60000 })
  19  |   }
  20  |   await page.waitForLoadState('networkidle')
  21  | }
  22  | 
  23  | async function gotoAndLoginWithSettings(page: any, settings: Record<string, unknown>) {
  24  |   // First navigate to a safe page to set localStorage before target page loads
  25  |   await page.goto('/herramientas', { timeout: 60000 })
  26  |   // Handle login if needed
  27  |   const heading = page.getByRole('heading', { name: 'Iniciar sesión' })
  28  |   if (await heading.isVisible().catch(() => false)) {
  29  |     const email = process.env.TEST_EMAIL
  30  |     const password = process.env.TEST_PASSWORD
  31  |     if (!email || !password) test.skip(true, 'TEST_EMAIL / TEST_PASSWORD not set')
  32  |     await page.locator('input[type="email"]').fill(email)
  33  |     await page.waitForTimeout(300)
  34  |     await page.locator('input[type="password"]').fill(password)
  35  |     await page.waitForTimeout(300)
  36  |     await page.getByRole('button', { name: 'Entrar' }).click()
  37  |     await page.waitForURL(/\/(ruta|onboarding)/, { timeout: 90000 })
  38  |     await page.goto('/herramientas', { timeout: 60000 })
  39  |   }
  40  |   // Set localStorage with settings
  41  |   await page.evaluate((s) => {
  42  |     localStorage.setItem('quickBoardSettings', JSON.stringify(s))
  43  |   }, settings)
  44  |   // Now navigate to quick board
  45  |   await page.goto('/herramientas/tablero-caa/quick', { timeout: 60000 })
  46  |   await page.waitForLoadState('networkidle')
  47  | }
  48  | 
  49  | const QUICK_URL = '/herramientas/tablero-caa/quick'
  50  | 
  51  | // ── BUG 1: scanEnabled conectado a boardSettings ───────────────────
  52  | test('BUG 1 — Scan button inicia/para escaneo vía boardSettings', async ({ page }) => {
  53  |   test.setTimeout(120000)
  54  |   await gotoAndLogin(page, QUICK_URL)
  55  | 
  56  |   const scanBtn = page.getByText('🔘 Scan')
  57  |   const stopBtn = page.getByText('🟢 Detener')
  58  | 
  59  |   await expect(scanBtn).toBeVisible({ timeout: 10000 })
  60  |   await expect(stopBtn).not.toBeVisible()
  61  | 
  62  |   await scanBtn.click()
  63  |   await expect(stopBtn).toBeVisible({ timeout: 5000 })
  64  |   await expect(scanBtn).not.toBeVisible()
  65  | 
  66  |   await stopBtn.click()
  67  |   await expect(scanBtn).toBeVisible({ timeout: 5000 })
  68  |   await expect(stopBtn).not.toBeVisible()
  69  | })
  70  | 
  71  | // ── BUG 2+5: autoSpeak se sincroniza desde localStorage ───────────
  72  | test('BUG 2 — autoSpeak se carga desde localStorage y sincroniza con collectBar', async ({ page }) => {
  73  |   test.setTimeout(120000)
  74  | 
  75  |   await gotoAndLoginWithSettings(page, { autoSpeak: true })
  76  | 
  77  |   // Verificar que el botón de autoSpeak en el strip muestra estado activado
  78  |   await expect(page.locator('button[title="Auto-hablar activado"]')).toBeVisible({ timeout: 10000 })
  79  | 
  80  |   // Tocar una celda para verificar que autoSpeak realmente habla (no crash)
  81  |   await page.getByRole('button', { name: 'Hola' }).click()
  82  |   await page.waitForTimeout(300)
  83  | 
  84  |   // Con autoSpeak activado, el texto se agrega al strip
  85  |   await expect(page.locator('span:has-text("Hola")').first()).toBeVisible({ timeout: 3000 })
  86  | })
  87  | 
  88  | // ── BUG 5: settings pasados a initFromGrid (collectMode) ──────────
  89  | test('BUG 5 — collectMode desde settings se aplica al initFromGrid', async ({ page }) => {
  90  |   test.setTimeout(120000)
  91  | 
  92  |   await gotoAndLoginWithSettings(page, { collectMode: 'text' })
  93  | 
  94  |   // Tocar una celda para agregar un token
  95  |   await page.getByRole('button', { name: 'Hola' }).click()
  96  |   await page.waitForTimeout(500)
  97  | 
  98  |   // En modo "text" los tokens se muestran como texto plano dentro de un span
  99  |   const stripText = page.locator('span:has-text("Hola")').first()
  100 |   await expect(stripText).toBeVisible({ timeout: 3000 })
  101 | 
  102 |   // El toggle de modo de colección debe mostrar 📝 (modo texto)
  103 |   const modeToggle = page.locator('button[title="Cambiar modo de colección"]')
  104 |   await expect(modeToggle).toBeVisible({ timeout: 3000 })
```