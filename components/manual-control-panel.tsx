'use client'

import { useState } from 'react'
import {
  Button,
  Column,
  Grid,
  Tile,
  Dropdown,
  Modal,
  Slider,
  Tag,
  InlineNotification
} from '@carbon/react'
import { Activity, WarningAlt, StopFilledAlt, VirtualMachine, PlayFilledAlt } from '@carbon/icons-react'
import { useDigitalTwin, type Well, type Recommendation } from './digital-twin-provider'

export function ManualControlPanel() {
  const { wells, activeWell, setActiveWell, executeRecommendation, telemetry } = useDigitalTwin()
  const [confirmingCommand, setConfirmingCommand] = useState<Recommendation | null>(null)
  
  const [rpmValue, setRpmValue] = useState(8)
  const [steamValue, setSteamValue] = useState(250)

  const handleManualCommand = (type: string, value: number, unit: string) => {
    setConfirmingCommand({
      title: `Manual SCADA Override: ${type}`,
      message: `Operator requested manual override of asset setpoints.`,
      commandType: type,
      recommendedValue: value,
      unit: unit
    })
  }

  const handleEmergencyStop = () => {
    setConfirmingCommand({
      title: `EMERGENCY STOP`,
      message: `IMMEDIATE SHUTDOWN of the physical pump asset.`,
      commandType: 'STOP_PUMP',
      recommendedValue: 0,
      unit: ''
    })
  }

  const handleStartPump = () => {
    setConfirmingCommand({
      title: `START PUMP`,
      message: `Operator requested to restart the pump to normal operation.`,
      commandType: 'START_PUMP',
      recommendedValue: 6,
      unit: 'RPM'
    })
  }

  const isStopped = telemetry?.pumpRpm === 0

  return (
    <main id="main-content" className="page-main wellsync-page">
      <div className="ws-shell">
        <Grid condensed className="ws-heading">
          <Column sm={4} md={8} lg={12}>
            <div className="ws-eyebrow"><VirtualMachine size={16} /> MANUAL OVERRIDE</div>
            <div className="ws-title-row">
              <div>
                <h1>SCADA Control Panel</h1>
                <p>Direct manipulation of edge gateway and asset PLCs</p>
              </div>
            </div>
          </Column>
        </Grid>

        <Grid condensed className="ws-context" style={{ marginBottom: '2rem' }}>
          <Column sm={4} md={4} lg={4}>
            <span className="ws-label">TARGET ASSET</span>
            <div style={{ marginTop: '0.25rem' }}>
              <Dropdown
                id="manual-well-selector"
                titleText="Select Well"
                label="Select Well"
                hideLabel
                items={wells}
                itemToString={(item: Well) => item?.name || item?.wellName || item?.id || ''}
                selectedItem={activeWell}
                onChange={({ selectedItem }) => selectedItem && setActiveWell(selectedItem)}
                size="sm"
              />
            </div>
          </Column>
        </Grid>

        <Grid>
          <Column sm={4} md={8} lg={11}>
            <Tile className="ws-panel" style={{ marginBottom: '2rem', padding: '1.5rem 1.5rem 2.5rem' }}>
              <div className="ws-panel-header" style={{ marginBottom: '2rem' }}>
                <div>
                  <span className="ws-label">PUMP MECHANICS</span>
                  <h2>Variable Frequency Drive (VFD)</h2>
                </div>
              </div>
              <div style={{ padding: '0 1rem' }}>
                <Slider
                  labelText="Target Pump RPM"
                  value={rpmValue}
                  min={3}
                  max={12}
                  step={0.5}
                  stepMultiplier={1}
                  onChange={(e) => setRpmValue(e.value)}
                  style={{ marginBottom: '2rem' }}
                />
                <div style={{ marginTop: '2.5rem' }}>
                  <Button onClick={() => handleManualCommand('SET_RPM', rpmValue, 'RPM')}>
                    Transmit RPM Setpoint
                  </Button>
                </div>
              </div>
            </Tile>

            <Tile className="ws-panel" style={{ padding: '1.5rem 1.5rem 2.5rem' }}>
              <div className="ws-panel-header" style={{ marginBottom: '2rem' }}>
                <div>
                  <span className="ws-label">THERMAL INJECTION</span>
                  <h2>Steam Generator Control</h2>
                </div>
              </div>
              <div style={{ padding: '0 1rem' }}>
                <Slider
                  labelText="Target Steam Rate (bbl/d equiv)"
                  value={steamValue}
                  min={0}
                  max={500}
                  step={10}
                  stepMultiplier={5}
                  onChange={(e) => setSteamValue(e.value)}
                  style={{ marginBottom: '2rem' }}
                />
                <div style={{ marginTop: '2.5rem' }}>
                  <Button onClick={() => handleManualCommand('SET_STEAM_RATE', steamValue, 'bbl/d')}>
                    Transmit Steam Setpoint
                  </Button>
                </div>
              </div>
            </Tile>
          </Column>

          <Column sm={4} md={8} lg={5}>
            <Tile className="ws-panel" style={{ borderLeft: '4px solid var(--cds-support-error)', padding: '1.5rem' }}>
              <div className="ws-panel-header">
                <div>
                  <span className="ws-label" style={{ color: 'var(--cds-support-error)' }}>CRITICAL</span>
                  <h2>Emergency Controls</h2>
                </div>
                <WarningAlt size={24} style={{ fill: 'var(--cds-support-error)' }} />
              </div>
              <div style={{ marginTop: '2rem' }}>
                <p style={{ marginBottom: '1.5rem', color: 'var(--cds-text-secondary)' }}>
                  {isStopped 
                    ? "The pump asset is currently shut down. Use the restart button to bring it back online to base RPM."
                    : "Initiates an immediate shutdown sequence on the remote asset. Use only in case of catastrophic failure, fire, or severe environmental risk."}
                </p>
                {isStopped ? (
                  <Button kind="primary" renderIcon={PlayFilledAlt} onClick={handleStartPump} style={{ width: '100%', maxWidth: 'none' }}>
                    RESTART PUMP
                  </Button>
                ) : (
                  <Button kind="danger" renderIcon={StopFilledAlt} onClick={handleEmergencyStop} style={{ width: '100%', maxWidth: 'none' }}>
                    EMERGENCY STOP (E-STOP)
                  </Button>
                )}
              </div>
            </Tile>
          </Column>
        </Grid>
      </div>
      
      <Modal
        open={!!confirmingCommand}
        onRequestClose={() => setConfirmingCommand(null)}
        onRequestSubmit={() => {
          if (confirmingCommand) {
            executeRecommendation(confirmingCommand)
            setConfirmingCommand(null)
          }
        }}
        modalHeading="Confirm Edge Gateway Command"
        primaryButtonText="Confirm & Execute"
        secondaryButtonText="Cancel"
        danger={confirmingCommand?.commandType?.includes('STOP')}
      >
        {confirmingCommand && (
          <div style={{ paddingBottom: '1rem' }}>
            <p style={{ marginBottom: '1.5rem' }}>Are you sure you want to execute the following manual control action?</p>
            
            <div style={{ padding: '1rem', backgroundColor: 'var(--cds-layer-01)', border: `1px solid ${confirmingCommand.commandType?.includes('STOP') ? 'var(--cds-support-error)' : 'var(--cds-border-subtle-01)'}`, marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: confirmingCommand.commandType?.includes('STOP') ? 'var(--cds-support-error)' : 'inherit' }}>
                {confirmingCommand.title}
              </h4>
              <p style={{ color: 'var(--cds-text-secondary)', marginBottom: '1.5rem' }}>
                {confirmingCommand.message}
              </p>
              
              <div style={{ display: 'flex', gap: '3rem', borderTop: '1px solid var(--cds-border-subtle-01)', paddingTop: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Command Type</span>
                  <div style={{ fontSize: '1.125rem', fontWeight: 600, marginTop: '0.25rem' }}>{confirmingCommand.commandType}</div>
                </div>
                {confirmingCommand.recommendedValue !== undefined && (
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Target Value</span>
                    <div style={{ fontSize: '1.125rem', fontWeight: 600, marginTop: '0.25rem', color: confirmingCommand.commandType?.includes('STOP') ? 'var(--cds-support-error)' : 'var(--cds-link-primary)' }}>
                      {confirmingCommand.recommendedValue} {confirmingCommand.unit || ''}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <InlineNotification
              kind="warning"
              title="SCADA Safety Warning:"
              subtitle="This action will directly overwrite the physical setpoints on the remote asset's PLC. Ensure field safety protocols are met before proceeding."
              hideCloseButton
              style={{ maxWidth: '100%' }}
            />
          </div>
        )}
      </Modal>
    </main>
  )
}
