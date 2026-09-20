'use client'

import {
  Header,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SkipToContent,
} from '@carbon/react'
import { Asleep, Light } from '@carbon/icons-react'
import { useTheme } from '@/components/theme-provider'

export function SiteHeader() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'g100'

  return (
    <Header aria-label="WellSync AI">
      <SkipToContent />
      <HeaderName href="/" prefix="WELLSYNC">
        AI OPERATIONS
      </HeaderName>
      <HeaderNavigation aria-label="WellSync AI navigation">
        <HeaderMenuItem href="/">Command center</HeaderMenuItem>
        <HeaderMenuItem href="/wells">Well fleet</HeaderMenuItem>
        <HeaderMenuItem href="/alerts">Incidents</HeaderMenuItem>
      </HeaderNavigation>
      <HeaderGlobalBar>
        <HeaderGlobalAction
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          tooltipAlignment="end"
          onClick={toggleTheme}
        >
          {isDark ? <Light size={20} /> : <Asleep size={20} />}
        </HeaderGlobalAction>
      </HeaderGlobalBar>
    </Header>
  )
}
