import { NextIntlClientProvider } from 'next-intl'
import { SupabaseProvider } from '@/components/layout/SupabaseProvider'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { AppShell } from '@/components/layout/AppShell'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider>
      <SupabaseProvider>
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </SupabaseProvider>
    </NextIntlClientProvider>
  )
}
