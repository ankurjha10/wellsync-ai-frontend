'use client'

import Link from 'next/link'
import { ArrowLeft, DocumentTasks } from '@carbon/icons-react'
import { Grid, Column, Tile } from '@carbon/react'
import '../wellsync.scss'

export default function AuditLogPage() {
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
          
          <div className="ws-empty">
            <DocumentTasks size={24}/>
            <p>Audit logs will appear here when the WellSync API is connected.</p>
          </div>
        </Tile>
      </div>
    </main>
  )
}
