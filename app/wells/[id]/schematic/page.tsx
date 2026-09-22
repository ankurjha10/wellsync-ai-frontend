'use client'

import { useMemo, use } from 'react'
import Link from 'next/link'
import { ArrowLeft } from '@carbon/icons-react'
import { Grid, Column, Tile, Tag } from '@carbon/react'
import { useDigitalTwin, type Telemetry } from '@/components/digital-twin-provider'
import { PumpSchematic } from '@/components/pump-schematic'
import { TelemetryCharts } from '@/components/telemetry-charts'

function readNumber(data: Telemetry, ...keys: string[]) {
  const value = keys.map((key) => data[key]).find((item) => typeof item === 'number')
  return typeof value === 'number' ? value : 0
}

export default function WellSchematicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { wells, activeWell, telemetry, connection } = useDigitalTwin()

  const well = wells.find(w => w.id === id) || activeWell

  const fluidLevel = readNumber(telemetry, 'fluidLevel') || 1250;
  const thp = readNumber(telemetry, 'thp') || 45;
  const chp = readNumber(telemetry, 'chp') || 12;
  const porePressure = readNumber(telemetry, 'porePressure') || 150;
  const isPound = Boolean(telemetry.isPound || (telemetry.riskScore && (telemetry.riskScore as number) > 80));

  const detailedMetrics = useMemo(() => [
    { label: 'Temperature', value: readNumber(telemetry, 'temperature', 'temperatureC'), unit: '°C' },
    { label: 'Viscosity', value: readNumber(telemetry, 'viscosity'), unit: 'cP' },
    { label: 'Pump RPM', value: readNumber(telemetry, 'pumpRpm', 'pumpRPM'), unit: 'rpm' },
    { label: 'Rod Load', value: readNumber(telemetry, 'rodLoad'), unit: 'kN' },
    { label: 'Risk Score', value: readNumber(telemetry, 'riskScore'), unit: '/ 100' },
    { label: 'Production Rate', value: 450, unit: 'BOPD' },
    { label: 'Pump Efficiency', value: 78, unit: '%' },
    { label: 'Reservoir Drawdown', value: porePressure - 110, unit: 'bar' },
    { label: 'Net Oil Rate', value: 420, unit: 'BOPD' },
    { label: 'Pump Fillage', value: isPound ? 45 : 95, unit: '%' },
  ], [telemetry, porePressure, isPound])

  return (
    <main id="main-content" className="page-main wellsync-page">
      <div className="ws-shell">
        <Grid condensed className="ws-heading">
          <Column sm={4} md={8} lg={12}>
            <div className="ws-eyebrow">DIGITAL TWIN / SCHEMATIC</div>
            <div className="ws-title-row">
              <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{well?.name || well?.wellName || `Well ${id}`} Detailed Schematic</h2>
                <p>Live subsurface view and comprehensive metrics.</p>
              </div>
              <div className="ws-status">
                <span className={`ws-status-dot ${connection}`} /> {connection === 'live' ? 'LIVE TELEMETRY' : connection.toUpperCase()}
              </div>
            </div>
          </Column>
        </Grid>

        <Grid style={{ marginTop: '0.5rem', height: 'calc(100vh - 9rem)' }}>
          {/* Column 1: Detailed Metrics */}
          <Column sm={4} md={4} lg={4} style={{ height: '100%' }}>
            <Tile className="ws-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              <div className="ws-panel-header">
                <div>
                  <span className="ws-label">TELEMETRY</span>
                  <h2>Detailed Metrics</h2>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem', flexShrink: 0 }}>
                {detailedMetrics.map((m, idx) => (
                  <div key={idx} style={{ padding: '1rem', background: 'var(--cds-layer-01)', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>{m.label}</span>
                    <strong style={{ color: 'var(--cds-text-primary)', fontSize: '1.25rem' }}>
                      {typeof m.value === 'number' ? m.value.toFixed(1) : m.value} <small style={{ color: 'var(--cds-text-helper)', fontSize: '0.875rem', marginLeft: '0.25rem' }}>{m.unit}</small>
                    </strong>
                  </div>
                ))}
              </div>
            </Tile>
          </Column>

          {/* Column 2: Pump Schematic */}
          <Column sm={4} md={8} lg={8} style={{ height: '100%' }}>
            <Tile className="ws-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div className="ws-panel-header">
                <div>
                  <span className="ws-label">SUBSURFACE</span>
                  <h2>Pump & Reservoir Schematic</h2>
                </div>
                <Tag type="blue">Real-time simulation</Tag>
              </div>
              <div style={{ flex: 1, position: 'relative', overflow: 'hidden', padding: '1rem' }}>
                <PumpSchematic 
                  fluidLevel={fluidLevel} 
                  thp={thp} 
                  chp={chp} 
                  porePressure={porePressure} 
                  isPound={isPound} 
                  pumpRpm={readNumber(telemetry, 'pumpRpm', 'pumpRPM')}
                />
              </div>
            </Tile>
          </Column>

          {/* Column 3: Telemetry Charts */}
          <Column sm={4} md={4} lg={4} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <TelemetryCharts />
          </Column>
        </Grid>
      </div>
    </main>
  )
}
