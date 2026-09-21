'use client'

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { Client, type IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { ToastNotification } from '@carbon/react'

export type Well = { id: string; name?: string; wellCode?: string; wellName?: string; field?: string; status?: string; location?: string }
export type Telemetry = Record<string, unknown> & { temperature?: number; viscosity?: number; pumpRpm?: number; rodLoad?: number; riskScore?: number; timestamp?: string }
export type AlertItem = { id?: string; severity?: string; message?: string; description?: string; timestamp?: string }
export type Recommendation = { id?: string; title?: string; message?: string; commandType?: string; recommendedValue?: number; unit?: string }
export type ChartPoint = { time: string; pumpRpm: number; rodLoad: number; temperature: number; viscosity: number; risk: number }
export type ToastMessage = { id: string; title: string; subtitle: string; caption: string; kind: 'error' | 'info' | 'success' | 'warning' }

type DigitalTwinContextType = {
  wells: Well[]
  activeWell: Well | null
  telemetry: Telemetry
  chartData: ChartPoint[]
  alerts: AlertItem[]
  recommendations: Recommendation[]
  connection: 'connecting' | 'live' | 'offline'
  error: string | null
  executeRecommendation: (recommendation: Recommendation) => Promise<void>
}

const DigitalTwinContext = createContext<DigitalTwinContextType | null>(null)

export function useDigitalTwin() {
  const context = useContext(DigitalTwinContext)
  if (!context) throw new Error('useDigitalTwin must be used within a DigitalTwinProvider')
  return context
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws'

function readNumber(data: Telemetry, ...keys: string[]) {
  const value = keys.map((key) => data[key]).find((item) => typeof item === 'number')
  return typeof value === 'number' ? value : 0
}

function formatTime(value?: string) {
  if (!value) return '--:--:--'
  return new Date(value).toLocaleTimeString([], { hour12: false })
}

export function DigitalTwinProvider({ children }: { children: ReactNode }) {
  const [wells, setWells] = useState<Well[]>([])
  const [activeWell, setActiveWell] = useState<Well | null>(null)
  const [telemetry, setTelemetry] = useState<Telemetry>({})
  const [chartData, setChartData] = useState<ChartPoint[]>([])
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [connection, setConnection] = useState<'connecting' | 'live' | 'offline'>('connecting')
  const [error, setError] = useState<string | null>(null)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const clientRef = useRef<Client | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const response = await fetch(`${API_URL}/wells`)
        if (!response.ok) throw new Error(`Wells request failed (${response.status})`)
        const list: Well[] = await response.json()
        if (cancelled) return
        setWells(list)
        const well = list[0]
        if (!well) throw new Error('No wells returned by the API')
        setActiveWell(well)
        const stateResponse = await fetch(`${API_URL}/telemetry/state/${well.id}`)
        if (!stateResponse.ok) throw new Error(`Telemetry request failed (${stateResponse.status})`)
        const rawState = await stateResponse.json()
        if (cancelled) return
        const state: Telemetry = {
          ...rawState,
          temperature: readNumber(rawState, 'temperature', 'temperatureC'),
          viscosity: readNumber(rawState, 'viscosity', 'viscosityCp'),
          pumpRpm: readNumber(rawState, 'pumpRpm', 'pumpRPM', 'rpm'),
          rodLoad: readNumber(rawState, 'rodLoad', 'rodLoadLbs'),
        }
        setTelemetry(state)
        setChartData([{ 
          time: formatTime(state.timestamp), 
          pumpRpm: state.pumpRpm || 0, 
          rodLoad: state.rodLoad || 0,
          temperature: state.temperature || 0,
          viscosity: state.viscosity || 0,
          risk: readNumber(state, 'riskScore')
        }])
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
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        setConnection('live')
        const receive = (message: IMessage) => {
          try { return JSON.parse(message.body) } catch { return null }
        }
        client.subscribe(`/topic/telemetry/${activeWell.id}`, (message) => {
          const raw = receive(message)
          if (!raw) return
          const state: Telemetry = {
            ...raw,
            temperature: readNumber(raw, 'temperature', 'temperatureC'),
            viscosity: readNumber(raw, 'viscosity', 'viscosityCp'),
            pumpRpm: readNumber(raw, 'pumpRpm', 'pumpRPM', 'rpm'),
            rodLoad: readNumber(raw, 'rodLoad', 'rodLoadLbs'),
          }
          setTelemetry(state)
          setChartData((current) => [...current, { 
            time: formatTime(state.timestamp || new Date().toISOString()), 
            pumpRpm: state.pumpRpm || 0, 
            rodLoad: state.rodLoad || 0,
            temperature: state.temperature || 0,
            viscosity: state.viscosity || 0,
            risk: readNumber(state, 'riskScore')
          }].slice(-30))
        })
        client.subscribe(`/topic/alerts/${activeWell.id}`, (message) => {
          const alert = receive(message) as AlertItem | null
          if (alert) {
            setAlerts((current) => [alert, ...current].slice(0, 8))
            setToasts((current) => [{
              id: alert.id || Date.now().toString() + Math.random(),
              title: `Alert: ${alert.severity || 'INFO'}`,
              subtitle: alert.message || alert.description || 'System alert received',
              caption: formatTime(alert.timestamp),
              kind: (alert.severity?.toLowerCase() === 'critical' || alert.severity?.toLowerCase() === 'high') ? 'error' : (alert.severity?.toLowerCase() === 'warning' || alert.severity?.toLowerCase() === 'medium') ? 'warning' : 'info'
            } as ToastMessage, ...current].slice(0, 3))
          }
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

  async function executeRecommendation(recommendation: Recommendation) {
    if (!activeWell?.id) return
    await fetch(`${API_URL}/control-commands/execute-recommendation`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wellId: activeWell.id, commandType: recommendation.commandType, requestedValue: recommendation.recommendedValue, unit: recommendation.unit }),
    })
  }

  return (
    <DigitalTwinContext.Provider value={{ wells, activeWell, telemetry, chartData, alerts, recommendations, connection, error, executeRecommendation }}>
      <div className="ws-toast-container" style={{ position: 'fixed', top: '4rem', right: '1rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {toasts.map(t => (
          <ToastNotification
            key={t.id}
            kind={t.kind}
            title={t.title}
            subtitle={t.subtitle}
            caption={t.caption}
            onCloseButtonClick={() => setToasts(current => current.filter(x => x.id !== t.id))}
            timeout={8000}
          />
        ))}
      </div>
      {children}
    </DigitalTwinContext.Provider>
  )
}
