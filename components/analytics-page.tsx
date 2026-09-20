'use client'

import { useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Column, Grid, Tag, Tile } from '@carbon/react'
import { Activity } from '@carbon/icons-react'

const API_BASE = 'http://localhost:8080'
type Point = { time: string; temperature: number; viscosity: number; rpm: number; rodLoad: number; risk: number }

export default function AnalyticsPage() {
  const [points, setPoints] = useState<Point[]>([])
  useEffect(() => {
    let cancelled = false
    fetch(`${API_BASE}/api/v1/wells`).then((res) => res.json()).then((wells) => wells[0]?.id && fetch(`${API_BASE}/api/v1/telemetry/state/${wells[0].id}`)).then((res) => res?.json()).then((state) => {
      if (cancelled || !state) return
      setPoints([{ time: new Date(state.timestamp || Date.now()).toLocaleTimeString([], { hour12: false }), temperature: state.temperature || 0, viscosity: state.viscosity || 0, rpm: state.pumpRpm || state.pumpRPM || 0, rodLoad: state.rodLoad || 0, risk: state.riskScore || 0 }])
    }).catch(() => undefined)
    return () => { cancelled = true }
  }, [])
  const data = points.length ? points : [{ time: '--:--', temperature: 0, viscosity: 0, rpm: 0, rodLoad: 0, risk: 0 }]
  return <main id="main-content" className="page-main wellsync-page"><div className="ws-shell"><div className="ws-eyebrow"><Activity size={16} /> DIGITAL TWIN / ANALYTICS</div><div className="ws-title-row"><div><h1>Telemetry analytics</h1><p>Cross-signal trends from the active well telemetry stream.</p></div><Tag type="blue">LIVE SIGNALS</Tag></div><Grid condensed className="ws-analytics-grid"><Column sm={4} md={8} lg={6}><Tile className="ws-panel ws-analytics-panel"><div className="ws-panel-header"><h2>Temperature vs viscosity</h2><Tag type="cool-gray">Dual axis</Tag></div><ResponsiveContainer width="100%" height={280}><LineChart data={data}><CartesianGrid stroke="var(--cds-border-subtle-01)" vertical={false}/><XAxis dataKey="time"/><YAxis/><Tooltip/><Legend/><Line dataKey="temperature" stroke="var(--cds-support-warning)"/><Line dataKey="viscosity" stroke="var(--cds-link-primary)"/></LineChart></ResponsiveContainer></Tile></Column><Column sm={4} md={8} lg={6}><Tile className="ws-panel ws-analytics-panel"><div className="ws-panel-header"><h2>RPM vs rod load</h2><Tag type="cool-gray">Mechanical</Tag></div><ResponsiveContainer width="100%" height={280}><AreaChart data={data}><CartesianGrid stroke="var(--cds-border-subtle-01)" vertical={false}/><XAxis dataKey="time"/><YAxis/><Tooltip/><Legend/><Area dataKey="rpm" stroke="var(--cds-link-primary)" fill="var(--cds-link-primary)" fillOpacity={.14}/><Area dataKey="rodLoad" stroke="var(--cds-support-warning)" fill="none"/></AreaChart></ResponsiveContainer></Tile></Column><Column sm={4} md={8} lg={12}><Tile className="ws-panel ws-analytics-panel"><div className="ws-panel-header"><h2>Risk score trend</h2><Tag type="green">Decision support</Tag></div><ResponsiveContainer width="100%" height={280}><LineChart data={data}><CartesianGrid stroke="var(--cds-border-subtle-01)" vertical={false}/><XAxis dataKey="time"/><YAxis domain={[0, 100]}/><Tooltip/><Line dataKey="risk" stroke="var(--cds-support-error)" strokeWidth={3}/></LineChart></ResponsiveContainer></Tile></Column></Grid></div></main>
}
