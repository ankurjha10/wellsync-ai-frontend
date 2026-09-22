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
  Tag
} from '@carbon/react'
import { Activity, WarningAlt, StopFilledAlt, VirtualMachine } from '@carbon/icons-react'
import { useDigitalTwin, type Well, type Recommendation } from './digital-twin-provider'

export function ManualControlPanel() {
  const { wells, activeWell, setActiveWell, executeRecommendation } = useDigitalTwin()
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

        <Grid condensed>
          <Column sm={4} md={8} lg={8}>
            <Tile className="ws-panel" style={{ marginBottom: '1rem', paddingBottom: '2rem' }}>
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
                <Button onClick={() => handleManualCommand('SET_RPM', rpmValue, 'RPM')}>
                  Transmit RPM Setpoint
                </Button>
              </div>
            </Tile>

            <Tile className="ws-panel" style={{ paddingBottom: '2rem' }}>
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
                <Button onClick={() => handleManualCommand('SET_STEAM_RATE', steamValue, 'bbl/d')}>
                  Transmit Steam Setpoint
                </Button>
              </div>
            </Tile>
          </Column>

          <Column sm={4} md={8} lg={4}>
            <Tile className="ws-panel" style={{ borderLeft: '4px solid var(--cds-support-error)', height: '100%' }}>
              <div className="ws-panel-header">
                <div>
                  <span className="ws-label" style={{ color: 'var(--cds-support-error)' }}>CRITICAL</span>
                  <h2>Emergency Controls</h2>
                </div>
                <WarningAlt size={24} style={{ fill: 'var(--cds-support-error)' }} />
              </div>
              <div style={{ marginTop: '2rem' }}>
                <p style={{ marginBottom: '1.5rem', color: 'var(--cds-text-secondary)' }}>
                  Initiates an immediate shutdown sequence on the remote asset. Use only in case of catastrophic failure, fire, or severe environmental risk.
                </p>
                <Button kind="danger" renderIcon={StopFilledAlt} onClick={handleEmergencyStop} style={{ width: '100%', maxWidth: 'none' }}>
                  EMERGENCY STOP (E-STOP)
                </Button>
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
            <p style={{ marginBottom: '1rem' }}>Are you sure you want to execute the following manual control action?</p>
            <Tile className="ws-panel" style={{ borderLeft: `4px solid ${confirmingCommand.commandType.includes('STOP') ? 'var(--cds-support-error)' : 'var(--cds-link-primary)'}` }}>
              <strong style={{ color: confirmingCommand.commandType.includes('STOP') ? 'var(--cds-support-error)' : 'inherit' }}>{confirmingCommand.title}</strong>
              <p style={{ marginTop: '0.5rem', marginBottom: '1rem', color: 'var(--cds-text-secondary)' }}>
                {confirmingCommand.message}
              </p>
              <Tag type="purple">COMMAND: {confirmingCommand.commandType}</Tag>
              {confirmingCommand.recommendedValue !== undefined && (
                <Tag type="blue">TARGET VALUE: {confirmingCommand.recommendedValue} {confirmingCommand.unit || ''}</Tag>
              )}
            </Tile>
            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cds-support-warning)' }}>
              <WarningAlt size={20} />
              <p><strong>Warning:</strong> This action will directly overwrite the physical setpoints on the remote asset's PLC. Ensure field safety protocols are met before proceeding.</p>
            </div>
          </div>
        )}
      </Modal>
    </main>
  )
}
