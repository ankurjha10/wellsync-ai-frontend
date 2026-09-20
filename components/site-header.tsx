'use client'

import {
  Header,
  HeaderGlobalAction,
  SideNav,
  SideNavItems,
  SideNavLink,
  SkipToContent,
} from '@carbon/react'
import { Activity, Asleep, ChartLine, Light, WarningAlt } from '@carbon/icons-react'
import { useTheme } from '@/components/theme-provider'

export function SiteHeader() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'g100'

  return (
    <>
      <Header aria-label="WellSync AI" className="ws-topbar">
        <SkipToContent />
        <div className="ws-topbar-title">WELLSYNC <span>AI OPERATIONS</span></div>
        <HeaderGlobalAction aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'} tooltipAlignment="end" onClick={toggleTheme}>
          {isDark ? <Light size={20} /> : <Asleep size={20} />}
        </HeaderGlobalAction>
      </Header>
      <SideNav aria-label="WellSync AI navigation" expanded className="ws-sidebar">
        <div className="ws-sidebar-brand">WS<span>•</span></div>
        <SideNavItems>
          <SideNavLink href="/" renderIcon={Activity}>Command center</SideNavLink>
          <SideNavLink href="/wells" renderIcon={ChartLine}>Well fleet</SideNavLink>
          <SideNavLink href="/alerts" renderIcon={WarningAlt}>Incidents</SideNavLink>
        </SideNavItems>
      </SideNav>
    </>
  )
}
