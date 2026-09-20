'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  Button,
  Column,
  Grid,
  SkeletonPlaceholder,
  Tag,
  Tile,
} from '@carbon/react'
import { Activity, ArrowUpRight, CheckmarkFilled, ErrorFilled, Information, Renew, WarningAlt } from '@carbon/icons-react'

type Well = { id: string; name?: string; field?: string; status?: string; location?: string }
type Telemetry = Record<string, unknown> & { temperature?: number; viscosity?: number; pumpRpm?: number; rodLoad?: number; riskScore?: number; timestamp?: string }
type AlertItem = { id?: string; severity?: string; message?: string; description?: string; timestamp?: string }
type Recommendation = { id?: string; title?: string; message?: string; commandType?: string; recommendedValue?: number; unit?: string }

type ChartPoint = { time: string; pumpRpm: number; rodLoad: number }

const API_BASE = 'http://localhost:8080'

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
  const [wells, setWells] = useState<Well[]>([])
  const [activeWell, setActiveWell] = useState<Well | null>(null)
  const [telemetry, setTelemetry] = useState<Telemetry>({})
  const [chartData, setChartData] = useState<ChartPoint[]>([])
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [connection, setConnection] = useState<'connecting' | 'live' | 'offline'>('connecting')
  const [error, setError] = useState<string | null>(null)
  const clientRef = useRef<Client | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const response = await fetch(`${API_BASE}/api/v1/wells`)
        if (!response.ok) throw new Error(`Wells request failed (${response.status})`)
        const list: Well[] = await response.json()
        if (cancelled) return
        setWells(list)
        const well = list[0]
        if (!well) throw new Error('No wells returned by the API')
        setActiveWell(well)
        const stateResponse = await fetch(`${API_BASE}/api/v1/telemetry/state/${well.id}`)
        if (!stateResponse.ok) throw new Error(`Telemetry request failed (${stateResponse.status})`)
        const state: Telemetry = await stateResponse.json()
        if (cancelled) return
        setTelemetry(state)
        setChartData([{ time: formatTime(state.timestamp), pumpRpm: readNumber(state, 'pumpRpm', 'pumpRPM'), rodLoad: readNumber(state, 'rodLoad') }])
      } catch (requestError) {
        if (!cancelled) {
          setConnection('offline')
          setError(requestError instanceof Error ? requestError.message : 'Unable to reach WellSync API')
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!activeWell?.id) return
    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE}/ws`),
      reconnectDelay: 5000,
      onConnect: () => {
        setConnection('live')
        const receive = (message: IMessage) => {
          try { return JSON.parse(message.body) } catch { return null }
        }
        client.subscribe(`/topic/telemetry/${activeWell.id}`, (message) => {
          const state = receive(message) as Telemetry | null
          if (!state) return
          setTelemetry(state)
          setChartData((current) => [...current, { time: formatTime(state.timestamp || new Date().toISOString()), pumpRpm: readNumber(state, 'pumpRpm', 'pumpRPM'), rodLoad: readNumber(state, 'rodLoad') }].slice(-30))
        })
        client.subscribe(`/topic/alerts/${activeWell.id}`, (message) => {
          const alert = receive(message) as AlertItem | null
          if (alert) setAlerts((current) => [alert, ...current].slice(0, 8))
        })
        client.subscribe(`/topic/recommendations/${activeWell.id}`, (message) => {
          const recommendation = receive(message) as Recommendation | null
          if (recommendation) setRecommendations((current) => [recommendation, ...current].slice(0, 5))
        })
      },
      onWebSocketClose: () => setConnection('offline'),
      onStompError: () => setConnection('offline'),
    })
    clientRef.current = client
    client.activate()
    return () => { client.deactivate(); clientRef.current = null }
  }, [activeWell?.id])

  const metrics = useMemo(() => [
    ['Temperature', readNumber(telemetry, 'temperature', 'temperatureC'), '°C'],
    ['Viscosity', readNumber(telemetry, 'viscosity'), 'cP'],
    ['Pump RPM', readNumber(telemetry, 'pumpRpm', 'pumpRPM'), 'rpm'],
    ['Rod Load', readNumber(telemetry, 'rodLoad'), 'kN'],
    ['Risk Score', readNumber(telemetry, 'riskScore'), '/ 100'],
    ['Production Rate', 450, 'BOPD'],
    ['Pump Efficiency', 78, '%'],
  ], [telemetry])

  async function executeRecommendation(recommendation: Recommendation) {
    if (!activeWell?.id) return
    await fetch(`${API_BASE}/api/v1/control-commands/execute-recommendation`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wellId: activeWell.id, commandType: recommendation.commandType, requestedValue: recommendation.recommendedValue, unit: recommendation.unit }),
    })
  }

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
          <Column sm={4} md={4} lg={4}><span className="ws-label">ACTIVE WELL</span><strong>{activeWell?.name || 'Loading well registry…'}</strong></Column>
          <Column sm={4} md={4} lg={4}><span className="ws-label">FIELD</span><strong>{activeWell?.field || activeWell?.location || '—'}</strong></Column>
          <Column sm={4} md={4} lg={4}><span className="ws-label">ASSET COUNT</span><strong>{wells.length || '—'} connected wells</strong></Column>
        </Grid>
        {error && <div className="ws-error"><WarningAlt size={20} /><span>{error}. The dashboard will continue attempting the live connection.</span></div>}
        <Grid condensed className="ws-metrics">
          {isLoadingRegistry ? Array.from({ length: 5 }, (_, index) => <Column key={`metric-skeleton-${index}`} sm={4} md={4} lg={index === 4 ? 4 : 2}><Tile className="ws-metric ws-skeleton-tile"><SkeletonPlaceholder className="ws-metric-skeleton" /></Tile></Column>) : metrics.map(([label, value, unit]) => <Column key={label} sm={4} md={4} lg={label === 'Risk Score' ? 4 : 2}><Tile className="ws-metric"><span className="ws-label">{label}</span><div className="ws-metric-value">{typeof value === 'number' ? value.toFixed(label === 'Risk Score' ? 0 : 1) : value}<small>{unit}</small></div><span className="ws-muted">Live signal</span></Tile></Column>)}
        </Grid>
        <Grid condensed className="ws-main-grid">
          <Column sm={4} md={8} lg={6}><Tile className="ws-panel ws-chart-panel"><div className="ws-panel-header"><div><span className="ws-label">LIVE TELEMETRY</span><h2>Mechanical performance</h2></div><Tag type="blue">Last 30 readings</Tag></div><div className="ws-legend"><span><i className="ws-blue" /> Pump RPM</span><span><i className="ws-orange" /> Rod Load</span></div>{isLoadingRegistry ? <div className="ws-chart-skeleton"><SkeletonPlaceholder className="ws-chart-skeleton-placeholder" /></div> : <div className="ws-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 12, right: 8, bottom: 4, left: 0 }}><defs><linearGradient id="pumpFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--cds-link-primary)" stopOpacity={0.18}/><stop offset="95%" stopColor="var(--cds-link-primary)" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="var(--cds-border-subtle-01)" vertical={false}/><XAxis dataKey="time" tick={{ fill: 'var(--cds-text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false}/><YAxis yAxisId="left" tick={{ fill: 'var(--cds-text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false}/><YAxis yAxisId="right" orientation="right" tick={{ fill: 'var(--cds-text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false}/><Tooltip contentStyle={{ background: 'var(--cds-layer-01)', border: '1px solid var(--cds-border-strong-01)' }}/><Area yAxisId="left" type="monotone" dataKey="pumpRpm" stroke="var(--cds-link-primary)" fill="url(#pumpFill)" strokeWidth={2} dot={false}/><Area yAxisId="right" type="monotone" dataKey="rodLoad" stroke="var(--cds-support-warning)" fill="none" strokeWidth={2} dot={false}/></AreaChart></ResponsiveContainer></div>}</Tile></Column>
          <Column sm={4} md={8} lg={3}><Tile className="ws-panel ws-feed-panel"><div className="ws-panel-header"><div><span className="ws-label">DECISION SUPPORT</span><h2>Alerts & recommendations</h2></div><Information size={20}/></div><div className="ws-feed">{recommendations.map((item, index) => <div className="ws-feed-item ws-recommendation" key={item.id || `recommendation-${index}`}><div className="ws-feed-heading"><Tag type="purple">AI RECOMMENDATION</Tag><span>{item.title || item.commandType || 'Control action'}</span></div><p>{item.message || `Adjust to ${item.recommendedValue ?? 'recommended'} ${item.unit || ''}`}</p><Button size="sm" kind="tertiary" renderIcon={ArrowUpRight} onClick={() => executeRecommendation(item)}>Execute command</Button></div>)}{alerts.map((item, index) => { const status = severityTag(item.severity); const Icon = status.icon; return <div className="ws-feed-item" key={item.id || `alert-${index}`}><div className="ws-feed-heading"><Tag type={status.type}><Icon size={14} /> {item.severity || 'INFO'}</Tag><span>{formatTime(item.timestamp)}</span></div><p>{item.message || item.description || 'System alert received from the field.'}</p></div> })}{!recommendations.length && !alerts.length && <div className="ws-empty"><CheckmarkFilled size={32} /><p>Systems Nominal - No active alerts</p><span>Live decision support is monitoring this well.</span></div>}</div></Tile></Column>
          <Column sm={4} md={8} lg={3}><Tile className="ws-panel ws-pump-panel"><div className="ws-panel-header"><div><span className="ws-label">DIGITAL TWIN / ACTUATOR</span><h2>Sucker rod pump</h2></div><Tag type="green">{pumpRpm.toFixed(1)} RPM</Tag></div><div className="ws-pump-stage" style={{ '--pump-duration': pumpDuration } as CSSProperties}><svg viewBox="0 0 420 210" role="img" aria-label="Animated sucker rod pump simulation"><path className="ws-pump-base" d="M42 180h336M72 180l18-86h26l18 86M282 180l18-86h26l18 86"/><path className="ws-pump-frame" d="M96 94 184 42l104 52M184 42v138M184 78h104"/><path className="ws-pump-head" d="M184 42h106c20 0 36 9 48 20H184z"/><path className="ws-pump-rod" d="M286 62v88"/><path className="ws-pump-beam" d="M146 82h158"/><circle className="ws-pump-pivot" cx="184" cy="94" r="9"/><g className="ws-pump-motion"><path d="M286 62v88"/><circle cx="286" cy="62" r="7"/></g></svg><div className="ws-pump-readout"><span>STROKE RATE</span><strong>{pumpDuration.replace('s', '')}s cycle</strong></div></div></Tile></Column>
        </Grid>
      </div>
    </main>
  )
}
