'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Information } from '@carbon/icons-react'
import { Grid, Column, Tag, Tile, DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from '@carbon/react'
import { useDigitalTwin, type AlertItem } from '@/components/digital-twin-provider'
import '../wellsync.scss'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

const headers = [
  { key: 'severity', header: 'Severity' },
  { key: 'message', header: 'Message' },
  { key: 'description', header: 'Description' },
  { key: 'timestamp', header: 'Time' },
  { key: 'acknowledged', header: 'Status' }
]

export default function AlertsPage() {
  const { activeWell } = useDigitalTwin()
  const [historyAlerts, setHistoryAlerts] = useState<AlertItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!activeWell?.id) return

    let cancelled = false
    async function loadAlerts() {
      try {
        const res = await fetch(`${API_URL}/alerts?wellId=${activeWell?.id}`)
        if (res.ok) {
          const data = await res.json()
          if (!cancelled) setHistoryAlerts(data)
        }
      } catch (err) {
        console.error('Failed to load historical alerts:', err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadAlerts()
    return () => { cancelled = true }
  }, [activeWell?.id])

  async function handleAcknowledge(alertId: string) {
    const userId = '81da6534-9203-49e5-b03c-f27b7167ef45' // Admin user from database
    try {
      const res = await fetch(`${API_URL}/alerts/${alertId}/acknowledge?userId=${userId}`, {
        method: 'PATCH'
      })
      if (res.ok) {
        // Update local state to reflect acknowledged status
        setHistoryAlerts(prev => prev.map(a => 
          a.id === alertId ? { ...a, acknowledged: true, isAcknowledged: true } : a
        ))
      }
    } catch (err) {
      console.error('Failed to acknowledge alert:', err)
    }
  }

  const rows = historyAlerts.map(alert => ({
    id: alert.id || Math.random().toString(),
    severity: alert.severity,
    message: alert.message || (alert as any).title,
    description: alert.description || (alert as any).message,
    timestamp: alert.timestamp || (alert as any).createdAt,
    acknowledged: (alert as any).acknowledged || (alert as any).isAcknowledged || false
  }))

  return (
    <main id="main-content" className="page-main wellsync-page">
      <div className="ws-shell">
        <Link href="/" className="ws-back"><ArrowLeft size={16}/> Back to command center</Link>
        <Grid condensed className="ws-heading">
          <Column sm={4} md={8} lg={12}>
            <div className="ws-eyebrow">DIGITAL TWIN / INCIDENT MANAGEMENT</div>
            <h1>Incidents history</h1>
            <p>Chronological record of alerts received from field assets.</p>
          </Column>
        </Grid>
        
        <Tile className="ws-panel" style={{ minHeight: '400px' }}>
          <div className="ws-panel-header">
            <div>
              <span className="ws-label">EVENT LOG</span>
              <h2>Historical alerts</h2>
            </div>
            <Information size={20}/>
          </div>
          
          {(!activeWell || rows.length === 0) ? (
            <div className="ws-empty">
              <Information size={24}/>
              <p>{isLoading ? 'Loading historical incidents...' : 'Historical incidents will appear here when the WellSync API is connected.'}</p>
            </div>
          ) : (
            <div style={{ marginTop: '1.5rem' }}>
              <DataTable rows={rows} headers={headers}>
                {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
                  <Table {...getTableProps()}>
                    <TableHead>
                      <TableRow>
                        {headers.map((header) => (
                          <TableHeader {...getHeaderProps({ header })} key={header.key}>
                            {header.header}
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow {...getRowProps({ row })} key={row.id}>
                          {row.cells.map((cell) => {
                            if (cell.info.header === 'severity') {
                              const sev = (cell.value || '').toUpperCase()
                              let tagType = 'blue'
                              if (sev === 'CRITICAL' || sev === 'HIGH') tagType = 'red'
                              else if (sev === 'WARNING' || sev === 'MEDIUM') tagType = 'magenta'
                              
                              return (
                                <TableCell key={cell.id}>
                                  <Tag type={tagType as any} size="sm">{sev || 'INFO'}</Tag>
                                </TableCell>
                              )
                            }
                            if (cell.info.header === 'timestamp') {
                              return (
                                <TableCell key={cell.id}>
                                  {cell.value ? new Date(cell.value).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true }) : '--'}
                                </TableCell>
                              )
                            }
                            if (cell.info.header === 'acknowledged') {
                              return (
                                <TableCell key={cell.id}>
                                  {cell.value ? (
                                    <Tag type="green" size="sm">Acknowledged</Tag>
                                  ) : (
                                    <button 
                                      className="cds--btn cds--btn--sm cds--btn--primary"
                                      onClick={() => handleAcknowledge(row.id)}
                                      style={{ padding: '4px 12px', minHeight: '24px', fontSize: '12px' }}
                                    >
                                      Acknowledge
                                    </button>
                                  )}
                                </TableCell>
                              )
                            }
                            return <TableCell key={cell.id}>{cell.value}</TableCell>
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </DataTable>
            </div>
          )}
        </Tile>
      </div>
    </main>
  )
}
