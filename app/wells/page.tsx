import Link from 'next/link'
import { ArrowLeft } from '@carbon/icons-react'
import { Button, Grid, Column, Tag, Tile } from '@carbon/react'
import '../wellsync.scss'

export default function WellsPage() {
  return <main id="main-content" className="page-main wellsync-page"><div className="ws-shell"><Link href="/" className="ws-back"><ArrowLeft size={16}/> Back to command center</Link><Grid condensed className="ws-heading"><Column sm={4} md={8} lg={12}><div className="ws-eyebrow">DIGITAL TWIN / ASSET REGISTRY</div><h1>Well fleet</h1><p>Operational status across connected production assets.</p></Column></Grid><Tile className="ws-panel ws-table-panel"><div className="ws-panel-header"><div><span className="ws-label">CONNECTED ASSETS</span><h2>Active wells</h2></div><Tag type="blue">Live registry</Tag></div><div className="ws-table-wrap"><table className="ws-table"><thead><tr><th>Asset</th><th>Field</th><th>Status</th><th>Last signal</th><th></th></tr></thead><tbody><tr><td><strong>API data loads in command center</strong></td><td>—</td><td><Tag type="gray">Awaiting API</Tag></td><td>—</td><td><Button kind="ghost" size="sm" href="/">Open dashboard</Button></td></tr></tbody></table></div></Tile></div></main>
}

