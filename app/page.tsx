import { WellSyncDashboard } from '@/components/wellsync-dashboard'
import './wellsync.scss'

export default function Page() {
  return <WellSyncDashboard />
}

const unused = null
void unused

export const dynamic = 'force-dynamic'

// Dashboard is intentionally client-rendered because the live STOMP session is browser-owned.

