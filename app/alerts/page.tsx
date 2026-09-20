import Link from 'next/link'
import { ArrowLeft, Information } from '@carbon/icons-react'
import { Grid, Column, Tag, Tile } from '@carbon/react'
import '../wellsync.scss'

export default function AlertsPage() {
  return <main id="main-content" className="page-main wellsync-page"><div className="ws-shell"><Link href="/" className="ws-back"><ArrowLeft size={16}/> Back to command center</Link><Grid condensed className="ws-heading"><Column sm={4} md={8} lg={12}><div className="ws-eyebrow">DIGITAL TWIN / INCIDENT MANAGEMENT</div><h1>Incidents history</h1><p>Chronological record of alerts received from field assets.</p></Column></Grid><Tile className="ws-panel"><div className="ws-panel-header"><div><span className="ws-label">EVENT LOG</span><h2>Historical alerts</h2></div><Information size={20}/></div><div className="ws-empty"><Information size={24}/><p>Historical incidents will appear here when the WellSync API is connected.</p></div></Tile></div></main>
}
