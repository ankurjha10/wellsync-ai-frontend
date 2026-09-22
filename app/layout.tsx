import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { SiteHeader } from '@/components/site-header'
import './globals.scss'
import './wellsync.scss'
import './scada.scss'
import { DigitalTwinProvider } from '@/components/digital-twin-provider'
import { DataGuard } from '@/components/data-guard'

export const metadata: Metadata = {
  title: 'WellSync AI | Digital Twin Operations',
  description: 'Real-time oil well monitoring and AI-assisted field operations.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <DigitalTwinProvider>
            <SiteHeader />
            <DataGuard>
              {children}
            </DataGuard>
          </DigitalTwinProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
