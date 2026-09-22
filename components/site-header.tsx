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
import { usePathname } from 'next/navigation'

export function SiteHeader() {
  const { theme, toggleTheme } = useTheme()
  const { activeWell, connection } = useDigitalTwin()
  const isDark = theme === 'g100'
  const pathname = usePathname()
  const [localTime, setLocalTime] = useState('00:00:00 IST')
  const [isNavExpanded, setIsNavExpanded] = useState(true)

  useEffect(() => {
    const updateClock = () => {
      const timeStr = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true })
      setLocalTime(`${timeStr} IST`)
    }
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
          <span className="ws-console-clock">{localTime}</span>
          <span className="ws-header-badge"><i className="ws-header-dot" style={{ backgroundColor: connection === 'live' ? 'var(--cds-support-success)' : 'var(--cds-support-error)', boxShadow: connection === 'live' ? '0 0 7px var(--cds-support-success)' : 'none', animation: connection === 'live' ? 'pulse-dot 1.5s ease-in-out infinite' : 'none' }} />Kafka Link: {connection === 'live' ? 'CONNECTED' : connection.toUpperCase()}</span>
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
          <SideNavLink href="/" renderIcon={Activity} isActive={pathname === '/'}>Command center</SideNavLink>
          <SideNavLink href="/wells" renderIcon={ChartLine} isActive={pathname === '/wells'}>Well fleet</SideNavLink>
          <SideNavLink href={activeWell?.id ? `/wells/${activeWell.id}/digital-twin` : '/wells'} renderIcon={VirtualMachine} isActive={pathname?.includes('/digital-twin')}>Digital Twin</SideNavLink>
          <SideNavLink href="/performance" renderIcon={ChartLine} isActive={pathname?.startsWith('/performance')}>Performance Analytics</SideNavLink>
          <SideNavLink href="/ai-advisor" renderIcon={WatsonHealthAiStatus} isActive={pathname?.startsWith('/ai-advisor')}>AI Advisor</SideNavLink>
          <SideNavLink href="/incidents" renderIcon={WarningAlt} isActive={pathname?.startsWith('/incidents')}>Incidents & Alarms</SideNavLink>
          <SideNavLink href="/audit" renderIcon={Activity} isActive={pathname?.startsWith('/audit')}>Audit Log</SideNavLink>
        </SideNavItems>
      </SideNav>
    </>
  )
}
