'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, DocumentTasks } from '@carbon/icons-react'
import { Grid, Column, Tag, Tile, DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from '@carbon/react'
import { useDigitalTwin } from '@/components/digital-twin-provider'
import '../wellsync.scss'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

const headers = [
  { key: 'commandType', header: 'Command' },
  { key: 'details', header: 'Details' },
  { key: 'source', header: 'Source' },
  { key: 'requestedAt', header: 'Requested At' },
  { key: 'status', header: 'Status' }
]

export default function AuditLogPage() {
  const { activeWell } = useDigitalTwin()
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!activeWell?.id) return

    let cancelled = false
    async function loadAudit() {
      try {
        const res = await fetch(`${API_URL}/control-commands?wellId=${activeWell?.id}`)
        if (res.ok) {
          const data = await res.json()
          if (!cancelled) setAuditLogs(data)
        }
      } catch (err) {
        console.error('Failed to load audit logs:', err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadAudit()
    return () => { cancelled = true }
  }, [activeWell?.id])

  const rows = auditLogs.map(log => ({
    id: log.id || Math.random().toString(),
    commandType: log.commandType,
    details: log.previousValue !== null && log.requestedValue !== null 
      ? `Changed from ${log.previousValue} to ${log.requestedValue} ${log.unit || ''}`
      : `Set to ${log.requestedValue} ${log.unit || ''}`,
    source: log.source || 'MANUAL',
    requestedAt: log.requestedAt,
    status: log.status || 'PENDING'
  }))

  return (
    <main id="main-content" className="page-main wellsync-page">
      <div className="ws-shell">
        <Link href="/" className="ws-back"><ArrowLeft size={16}/> Back to command center</Link>
        <Grid condensed className="ws-heading">
          <Column sm={4} md={8} lg={12}>
            <div className="ws-eyebrow">DIGITAL TWIN / AUDIT LOG</div>
            <h1>Control Actions & Audit Log</h1>
            <p>Chronological record of AI recommendations and operator executed control actions.</p>
          </Column>
        </Grid>
        
        <Tile className="ws-panel" style={{ minHeight: '400px' }}>
          <div className="ws-panel-header">
            <div>
              <span className="ws-label">EVENT LOG</span>
              <h2>Historical Actions</h2>
            </div>
            <DocumentTasks size={20}/>
          </div>
          
          {(!activeWell || rows.length === 0) ? (
            <div className="ws-empty">
              <DocumentTasks size={24}/>
              <p>{isLoading ? 'Loading audit logs...' : 'No control actions have been executed for this well yet.'}</p>
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
                            if (cell.info.header === 'status') {
                              const stat = (cell.value || '').toUpperCase()
                              let tagType = 'blue'
                              if (stat === 'EXECUTED' || stat === 'SUCCESS') tagType = 'green'
                              else if (stat === 'FAILED' || stat === 'REJECTED') tagType = 'red'
                              else if (stat === 'PENDING') tagType = 'cyan'
                              
                              return (
                                <TableCell key={cell.id}>
                                  <Tag type={tagType as any} size="sm">{stat}</Tag>
                                </TableCell>
                              )
                            }
                            if (cell.info.header === 'requestedAt') {
                              return (
                                <TableCell key={cell.id}>
                                  {cell.value ? new Date(cell.value).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true }) : '--'}
                                </TableCell>
                              )
                            }
                            if (cell.info.header === 'source') {
                              return (
                                <TableCell key={cell.id}>
                                  <Tag type="purple" size="sm">{cell.value}</Tag>
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
