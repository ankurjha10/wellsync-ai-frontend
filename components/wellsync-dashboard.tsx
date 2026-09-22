'use client'

import { useMemo, type CSSProperties } from 'react'
import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  Button,
  Column,
  Grid,
  SkeletonPlaceholder,
  Tag,
  Tile,
  Dropdown,
} from '@carbon/react'
import { Activity, ArrowUpRight, CheckmarkFilled, ErrorFilled, Information, Renew, WarningAlt } from '@carbon/icons-react'
import { useDigitalTwin, type Telemetry } from './digital-twin-provider'
import { PumpSchematic } from './pump-schematic'

function readNumber(data: Telemetry, ...keys: string[]) {
  const value = keys.map((key) => data[key]).find((item) => typeof item === 'number')
  return typeof value === 'number' ? value : 0
}

function formatTime(value?: string) {
  if (!value) return '--:--:--'
  return new Date(value).toLocaleTimeString([], { hour12: false })
}

function severityTag(severity?: string) {
  const normalized = severity?.toLowerCase()
  if (normalized === 'critical' || normalized === 'high') return { type: 'red' as const, icon: ErrorFilled }
  if (normalized === 'warning' || normalized === 'medium') return { type: 'warm-gray' as const, icon: WarningAlt }
  return { type: 'green' as const, icon: CheckmarkFilled }
}

export function WellSyncDashboard() {
  const { wells, activeWell, setActiveWell, telemetry, chartData, alerts, recommendations, connection, error, executeRecommendation } = useDigitalTwin()

  const metrics = useMemo(() => [
    ['Temperature', readNumber(telemetry, 'temperature', 'temperatureC'), '°C'],
    ['Viscosity', readNumber(telemetry, 'viscosity'), 'cP'],
    ['Pump RPM', readNumber(telemetry, 'pumpRpm', 'pumpRPM'), 'rpm'],
    ['Rod Load', readNumber(telemetry, 'rodLoad'), 'kN'],
    ['Risk Score', readNumber(telemetry, 'riskScore'), '/ 100'],
    ['Production Rate', 450, 'BOPD'],
    ['Pump Efficiency', 78, '%'],
  ], [telemetry])

  const isLoadingRegistry = wells.length === 0 && !error
  const pumpRpm = readNumber(telemetry, 'pumpRpm', 'pumpRPM') || 12
  const pumpDuration = `${Math.max(0.8, Math.min(4, 60 / pumpRpm))}s`

  return (
    <main id="main-content" className="page-main wellsync-page">
      <div className="ws-shell">
        <Grid condensed className="ws-heading">
          <Column sm={4} md={8} lg={12}>
            <div className="ws-eyebrow"><Activity size={16} /> DIGITAL TWIN / OPERATIONS</div>
            <div className="ws-title-row"><div><h1>WellSync AI</h1><p>Live production intelligence for field operations</p></div><div className="ws-status"><span className={`ws-status-dot ${connection}`} /> {connection === 'live' ? 'LIVE TELEMETRY' : connection.toUpperCase()} <Renew size={16} /></div></div>
          </Column>
        </Grid>
        <Grid condensed className="ws-context">
          <Column sm={4} md={4} lg={4}>
            <span className="ws-label">ACTIVE WELL</span>
            {wells.length > 0 ? (
              <div style={{ marginTop: '0.25rem' }}>
                <Dropdown
                  id="well-selector"
                  titleText="Select Well"
                  hideLabel
                  items={wells}
                  itemToString={(item: Well) => item?.name || item?.wellName || item?.id || ''}
                  selectedItem={activeWell}
                  onChange={({ selectedItem }) => selectedItem && setActiveWell(selectedItem)}
                  size="sm"
                />
              </div>
            ) : (
              <strong>Loading well registry…</strong>
            )}
          </Column>
          <Column sm={4} md={4} lg={4}><span className="ws-label">FIELD</span><strong>{activeWell?.field || activeWell?.location || '—'}</strong></Column>
          <Column sm={4} md={4} lg={4}><span className="ws-label">ASSET COUNT</span><strong>{wells.length || '—'} connected wells</strong></Column>
        </Grid>
        {error && <div className="ws-error"><WarningAlt size={20} /><span>{error}. The dashboard will continue attempting the live connection.</span></div>}
        <Grid condensed className="ws-metrics">
          {isLoadingRegistry ? Array.from({ length: 5 }, (_, index) => <Column key={`metric-skeleton-${index}`} sm={4} md={4} lg={index === 4 ? 4 : 2}><Tile className="ws-metric ws-skeleton-tile"><SkeletonPlaceholder className="ws-metric-skeleton" /></Tile></Column>) : metrics.map(([label, value, unit]) => <Column key={label} sm={4} md={4} lg={label === 'Risk Score' ? 4 : 2}><Tile className="ws-metric"><span className="ws-label">{label}</span><div className="ws-metric-value">{typeof value === 'number' ? value.toFixed(label === 'Risk Score' ? 0 : 1) : value}<small>{unit}</small></div><span className="ws-muted">Live signal</span></Tile></Column>)}
        </Grid>
        <Grid condensed className="ws-main-grid">
          <Column sm={4} md={8} lg={8}><Tile className="ws-panel ws-chart-panel"><div className="ws-panel-header"><div><span className="ws-label">LIVE TELEMETRY</span><h2>Mechanical performance</h2></div><Tag type="blue">Last 30 readings</Tag></div><div className="ws-legend"><span><i className="ws-blue" /> Pump RPM</span><span><i className="ws-orange" /> Rod Load</span></div>{isLoadingRegistry ? <div className="ws-chart-skeleton"><SkeletonPlaceholder className="ws-chart-skeleton-placeholder" /></div> : <div className="ws-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 12, right: 8, bottom: 4, left: 0 }}><defs><linearGradient id="pumpFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--cds-link-primary)" stopOpacity={0.18}/><stop offset="95%" stopColor="var(--cds-link-primary)" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="var(--cds-border-subtle-01)" vertical={false}/><XAxis dataKey="time" tick={{ fill: 'var(--cds-text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false}/><YAxis yAxisId="left" tick={{ fill: 'var(--cds-text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false}/><YAxis yAxisId="right" orientation="right" tick={{ fill: 'var(--cds-text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false}/><Tooltip contentStyle={{ background: 'var(--cds-layer-01)', border: '1px solid var(--cds-border-strong-01)' }}/><Area yAxisId="left" type="monotone" dataKey="pumpRpm" stroke="var(--cds-link-primary)" fill="url(#pumpFill)" strokeWidth={2} dot={false}/><Area yAxisId="right" type="monotone" dataKey="rodLoad" stroke="var(--cds-support-warning)" fill="none" strokeWidth={2} dot={false}/></AreaChart></ResponsiveContainer></div>}</Tile></Column>
          <Column sm={4} md={8} lg={4}><Tile className="ws-panel ws-feed-panel"><div className="ws-panel-header"><div><span className="ws-label">DECISION SUPPORT</span><h2>Alerts & recommendations</h2></div><Information size={20}/></div><div className="ws-feed">{recommendations.map((item, index) => <div className="ws-feed-item ws-recommendation" key={item.id || `recommendation-${index}`}><div className="ws-feed-heading"><Tag type="purple">AI RECOMMENDATION</Tag><span>{item.title || item.commandType || 'Control action'}</span></div><p>{item.message || `Adjust to ${item.recommendedValue ?? 'recommended'} ${item.unit || ''}`}</p><Button size="sm" kind="tertiary" renderIcon={ArrowUpRight} onClick={() => executeRecommendation(item)}>Execute command</Button></div>)}{alerts.map((item, index) => { const status = severityTag(item.severity); const Icon = status.icon; return <div className="ws-feed-item" key={item.id || `alert-${index}`}><div className="ws-feed-heading"><Tag type={status.type}><Icon size={14} /> {item.severity || 'INFO'}</Tag><span>{formatTime(item.timestamp)}</span></div><p>{item.message || item.description || 'System alert received from the field.'}</p></div> })}{!recommendations.length && !alerts.length && <div className="ws-empty"><CheckmarkFilled size={32} /><p>Systems Nominal - No active alerts</p><span>Live decision support is monitoring this well.</span></div>}</div></Tile></Column>
        </Grid>
      </div>
    </main>
  )
}
