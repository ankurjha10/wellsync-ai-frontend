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

export function TelemetryCharts() {
  const { chartData } = useDigitalTwin()

  const customTooltipStyle = {
    backgroundColor: 'rgba(26, 36, 58, 0.95)',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#fff',
    padding: '10px'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem', height: '100%', overflowY: 'auto' }}>
      
      {/* Mechanics Chart (Rod Load vs RPM) */}
      <div style={{ background: '#1a243a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #28385e' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#e2e8f0', fontWeight: 600 }}>Mechanical Telemetry</h3>
        <div style={{ height: '250px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#28385e" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickMargin={8} minTickGap={20} />
              <YAxis yAxisId="left" stroke="#00e5ff" fontSize={12} domain={['auto', 'auto']} tickFormatter={(v) => `${(v/1000).toFixed(1)}k`} />
              <YAxis yAxisId="right" orientation="right" stroke="#ff4b72" fontSize={12} domain={[0, 'auto']} />
              <Tooltip contentStyle={customTooltipStyle} itemStyle={{ fontWeight: 600 }} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Line yAxisId="left" type="monotone" dataKey="rodLoad" name="Rod Load (lbs)" stroke="#00e5ff" strokeWidth={3} dot={false} activeDot={{ r: 6 }} animationDuration={500} />
              <Line yAxisId="right" type="monotone" dataKey="pumpRpm" name="Pump SPM" stroke="#ff4b72" strokeWidth={3} dot={false} activeDot={{ r: 6 }} animationDuration={500} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Thermodynamics Chart (Temperature vs Viscosity) */}
      <div style={{ background: '#1a243a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #28385e' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#e2e8f0', fontWeight: 600 }}>Thermodynamics</h3>
        <div style={{ height: '250px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#28385e" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickMargin={8} minTickGap={20} />
              <YAxis yAxisId="left" stroke="#ff8c00" fontSize={12} domain={['dataMin - 10', 'dataMax + 10']} />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} domain={[0, 'auto']} />
              <Tooltip contentStyle={customTooltipStyle} itemStyle={{ fontWeight: 600 }} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Line yAxisId="left" type="monotone" dataKey="temperature" name="Temperature (°C)" stroke="#ff8c00" strokeWidth={3} dot={false} activeDot={{ r: 6 }} animationDuration={500} />
              <Line yAxisId="right" type="monotone" dataKey="viscosity" name="Viscosity (cP)" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} animationDuration={500} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  )
}
