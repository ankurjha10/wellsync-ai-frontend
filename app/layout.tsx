import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { SiteHeader } from '@/components/site-header'
import './globals.scss'
import './wellsync.scss'
import './scada.scss'

export const metadata: Metadata = {
  title: 'WellSync AI | Digital Twin Operations',
  description: 'Real-time oil well monitoring and AI-assisted field operations.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <SiteHeader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
