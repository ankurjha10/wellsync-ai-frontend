'use client'

import { useDigitalTwin } from './digital-twin-provider'
import { SkeletonPlaceholder, Grid, Column, Tile } from '@carbon/react'

export function DataGuard({ children }: { children: React.ReactNode }) {
  const { wells, error } = useDigitalTwin()

  if (error && wells.length === 0) {
    return (
      <main id="main-content" className="page-main wellsync-page" style={{ padding: '2rem' }}>
        <div className="ws-shell">
          <Tile className="ws-panel" style={{ borderLeft: '4px solid var(--cds-support-error)' }}>
             <h3 style={{ color: 'var(--cds-support-error)', marginBottom: '1rem' }}>System Initialisation Error</h3>
             <p>{error}</p>
          </Tile>
        </div>
      </main>
    )
  }

  if (wells.length === 0) {
    return (
      <main id="main-content" className="page-main wellsync-page" style={{ padding: '2rem' }}>
        <div className="ws-shell">
          <Grid condensed style={{ marginBottom: '2rem' }}>
            <Column sm={4} md={8} lg={12}>
              <SkeletonPlaceholder style={{ height: '1rem', width: '150px', marginBottom: '0.5rem' }} />
              <SkeletonPlaceholder style={{ height: '2.5rem', width: '40%', marginBottom: '1rem' }} />
              <SkeletonPlaceholder style={{ height: '1rem', width: '60%' }} />
            </Column>
          </Grid>
          <Grid condensed style={{ marginBottom: '1rem' }}>
            <Column sm={4} md={2} lg={4}>
              <SkeletonPlaceholder style={{ height: '8rem', width: '100%' }} />
            </Column>
            <Column sm={4} md={2} lg={4}>
              <SkeletonPlaceholder style={{ height: '8rem', width: '100%' }} />
            </Column>
            <Column sm={4} md={2} lg={4}>
              <SkeletonPlaceholder style={{ height: '8rem', width: '100%' }} />
            </Column>
            <Column sm={4} md={2} lg={4}>
              <SkeletonPlaceholder style={{ height: '8rem', width: '100%' }} />
            </Column>
          </Grid>
          <Grid condensed>
            <Column sm={4} md={8} lg={12}>
              <SkeletonPlaceholder style={{ height: '30rem', width: '100%' }} />
            </Column>
          </Grid>
        </div>
      </main>
    )
  }

  return <>{children}</>
}
