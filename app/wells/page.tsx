'use client'

import Link from 'next/link'
import { ArrowLeft } from '@carbon/icons-react'
import { Button, Grid, Column, Tag, Tile } from '@carbon/react'
import { useDigitalTwin, type Well } from '@/components/digital-twin-provider'
import '../wellsync.scss'

function StatusTag({ status }: { status?: string }) {
  const norm = status?.toUpperCase()
  if (norm === 'ACTIVE') return <Tag type="green">Active</Tag>
  if (norm === 'INACTIVE') return <Tag type="gray">Inactive</Tag>
  if (norm === 'WARNING' || norm === 'MAINTENANCE') return <Tag type="warm-gray">{norm}</Tag>
  if (norm === 'CRITICAL' || norm === 'ERROR') return <Tag type="red">{norm}</Tag>
  return <Tag type="blue">{status || 'UNKNOWN'}</Tag>
}

export default function WellsPage() {
  const { wells } = useDigitalTwin()

  return (
    <main id="main-content" className="page-main wellsync-page">
      <div className="ws-shell">
        <Link href="/" className="ws-back"><ArrowLeft size={16}/> Back to command center</Link>
        <Grid condensed className="ws-heading">
          <Column sm={4} md={8} lg={12}>
            <div className="ws-eyebrow">DIGITAL TWIN / ASSET REGISTRY</div>
            <h1>Well fleet</h1>
            <p>Operational status across connected production assets.</p>
          </Column>
        </Grid>
        <Tile className="ws-panel ws-table-panel">
          <div className="ws-panel-header">
            <div><span className="ws-label">CONNECTED ASSETS</span><h2>Active wells</h2></div>
            <Tag type="blue">Live registry</Tag>
          </div>
          <div className="ws-table-wrap">
            <table className="ws-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Field</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {wells.length === 0 ? (
                  <tr>
                    <td colSpan={4}><strong>Loading registry...</strong></td>
                  </tr>
                ) : (
                  wells.map((well: Well) => (
                    <tr key={well.id}>
                      <td><strong>{well.wellName || well.name || well.wellCode || well.id}</strong></td>
                      <td>{well.location || well.field || '—'}</td>
                      <td><StatusTag status={well.status} /></td>
                      <td><Button kind="ghost" size="sm" href="/">Open dashboard</Button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Tile>
      </div>
    </main>
  )
}
