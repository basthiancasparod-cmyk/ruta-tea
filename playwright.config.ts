import { defineConfig, devices } from '@playwright/test'

import { readFileSync } from 'fs'

// Load .env.test if present
try {
  const envContent = readFileSync('.env.test', 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx > 0) {
        process.env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1)
      }
    }
  }
} catch { /* no .env.test */ }

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  timeout: 120000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          slowMo: process.env.PW_SLOW_MO ? parseInt(process.env.PW_SLOW_MO) : undefined,
        },
      },
    },
  ],
})
