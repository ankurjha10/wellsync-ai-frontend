'use client'

import { useDigitalTwin } from './digital-twin-provider'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Tile, Tag } from '@carbon/react'

export function TelemetryCharts() {
  const { chartData } = useDigitalTwin()
  const data = chartData.length ? chartData : [{ time: '--:--', temperature: 0, viscosity: 0, pumpRpm: 0, rodLoad: 0 }]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', height: '100%', overflowY: 'auto', paddingRight: '0.5rem' }}>
      
      {/* Mechanics Chart (Rod Load vs RPM) */}
      <Tile className="ws-panel">
        <div className="ws-panel-header">
          <h2 style={{ fontSize: '1rem', margin: 0, fontWeight: 600 }}>Mechanical Telemetry</h2>
          <Tag type="cool-gray" size="sm">Dual Axis</Tag>
        </div>
        <div style={{ height: '280px', width: '100%', marginTop: '1rem' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid stroke="var(--cds-border-subtle-01)" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} tickMargin={8} minTickGap={20} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="var(--cds-support-warning)" domain={['auto', 'auto']} tickFormatter={(v) => `${(v/1000).toFixed(1)}k`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="var(--cds-link-primary)" domain={[0, 'auto']} />
              <Tooltip />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Line yAxisId="left" type="monotone" dataKey="rodLoad" name="Rod Load (lbs)" stroke="var(--cds-support-warning)" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line yAxisId="right" type="monotone" dataKey="pumpRpm" name="Pump SPM" stroke="var(--cds-link-primary)" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Tile>

      {/* Thermodynamics Chart (Temperature vs Viscosity) */}
      <Tile className="ws-panel">
        <div className="ws-panel-header">
          <h2 style={{ fontSize: '1rem', margin: 0, fontWeight: 600 }}>Thermodynamics</h2>
          <Tag type="cool-gray" size="sm">Dual Axis</Tag>
        </div>
        <div style={{ height: '280px', width: '100%', marginTop: '1rem' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid stroke="var(--cds-border-subtle-01)" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} tickMargin={8} minTickGap={20} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="var(--cds-support-warning)" domain={['dataMin - 10', 'dataMax + 10']} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="var(--cds-link-primary)" domain={[0, 'auto']} />
              <Tooltip />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Line yAxisId="left" type="monotone" dataKey="temperature" name="Temperature (°C)" stroke="var(--cds-support-warning)" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line yAxisId="right" type="monotone" dataKey="viscosity" name="Viscosity (cP)" stroke="var(--cds-link-primary)" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Tile>

    </div>
  )
}
