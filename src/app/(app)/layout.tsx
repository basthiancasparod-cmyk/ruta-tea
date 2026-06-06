import { NextIntlClientProvider } from 'next-intl'
import { SupabaseProvider } from '@/components/layout/SupabaseProvider'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { AppShell } from '@/components/layout/AppShell'
import es from '../../../messages/es.json'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider>
      <ThemeProvider>
        <NextIntlClientProvider locale="es" messages={es} timeZone="America/Mexico_City">
          <AppShell>{children}</AppShell>
        </NextIntlClientProvider>
      </ThemeProvider>
    </SupabaseProvider>
  )
}
