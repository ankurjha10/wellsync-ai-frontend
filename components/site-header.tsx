'use client'

import {
  Header,
  HeaderGlobalAction,
  HeaderMenuButton,
  SideNav,
  SideNavItems,
  SideNavLink,
  SkipToContent,
} from '@carbon/react'
import { Activity, Asleep, ChartLine, Light, Menu, WarningAlt, WatsonHealthAiStatus, VirtualMachine } from '@carbon/icons-react'
import { useTheme } from '@/components/theme-provider'
import { useDigitalTwin } from '@/components/digital-twin-provider'
import { useEffect, useState } from 'react'

export function SiteHeader() {
  const { theme, toggleTheme } = useTheme()
  const { activeWell } = useDigitalTwin()
  const isDark = theme === 'g100'
  const [utcTime, setUtcTime] = useState('00:00:00 UTC')
  const [isNavExpanded, setIsNavExpanded] = useState(true)

  useEffect(() => {
    const updateClock = () => setUtcTime(`${new Date().toISOString().slice(11, 19)} UTC`)
    updateClock()
    const timer = window.setInterval(updateClock, 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (isNavExpanded) {
      document.body.classList.add('nav-expanded')
    } else {
      document.body.classList.remove('nav-expanded')
    }
  }, [isNavExpanded])

  return (
    <>
      <Header aria-label="WellSync AI" className="ws-topbar">
        <SkipToContent />
        <div className="ws-topbar-title">WellSync AI <span>Operator Terminal</span></div>
        <div className="ws-topbar-status" aria-label="System status">
          <span className="ws-console-clock">{utcTime}</span>
          <span className="ws-header-badge"><i className="ws-header-dot" />Kafka Link: CONNECTED</span>
          <span className="ws-header-badge">System Health: OPTIMAL</span>
          <span className="ws-operator-id">OP ID: 7892-X</span>
        </div>
        <HeaderGlobalAction aria-label={isNavExpanded ? 'Close sidebar' : 'Open sidebar'} tooltipAlignment="end" onClick={() => setIsNavExpanded(!isNavExpanded)}>
          <Menu size={20} />
        </HeaderGlobalAction>
        <HeaderGlobalAction aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'} tooltipAlignment="end" onClick={toggleTheme}>
          {isDark ? <Light size={20} /> : <Asleep size={20} />}
        </HeaderGlobalAction>
      </Header>
      <SideNav aria-label="WellSync AI navigation" expanded={isNavExpanded} className={`ws-sidebar ${isNavExpanded ? 'ws-sidebar-open' : ''}`}>
        <div className="ws-sidebar-brand">WS<span>•</span></div>
        <SideNavItems>
          <SideNavLink href="/" renderIcon={Activity}>Command center</SideNavLink>
          <SideNavLink href="/wells" renderIcon={ChartLine}>Well fleet</SideNavLink>
          <SideNavLink href={activeWell?.id ? `/wells/${activeWell.id}/schematic` : '/wells'} renderIcon={VirtualMachine}>Pump Schematic</SideNavLink>
          <SideNavLink href="/analytics" renderIcon={ChartLine}>Analytics</SideNavLink>
          <SideNavLink href="/copilot" renderIcon={WatsonHealthAiStatus}>AI Copilot</SideNavLink>
          <SideNavLink href="/alerts" renderIcon={WarningAlt}>Incidents</SideNavLink>
        </SideNavItems>
      </SideNav>
    </>
  )
}
