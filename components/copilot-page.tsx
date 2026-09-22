'use client'

import { useState, type FormEvent } from 'react'
import { Button, Tag, Tile, InlineLoading } from '@carbon/react'
import { Activity, ArrowUpRight } from '@carbon/icons-react'
import { useDigitalTwin } from './digital-twin-provider'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

export default function CopilotPage() {
  const digitalTwin = useDigitalTwin()
  const activeWell = digitalTwin?.activeWell
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([{ role: 'ai', text: 'Operator Assist is ready. Ask about the active well state, telemetry, or recommended actions.' }])

  async function submit(event: FormEvent) {
    event.preventDefault()
    const prompt = input.trim()
    if (!prompt) return

    if (!activeWell) {
      setMessages((current) => [...current, { role: 'operator', text: prompt }, { role: 'ai', text: 'Please select an active well first.' }])
      setInput('')
      return
    }

    setMessages((current) => [...current, { role: 'operator', text: prompt }])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/copilot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wellId: activeWell.id, message: prompt })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch AI response')
      }

      const data = await response.json()
      // Fallback logic to grab the response string from the DTO
      const aiText = typeof data === 'string' ? data : (data.response || data.message || data.text || 'Received empty response from AI.')

      setMessages((current) => [...current, { role: 'ai', text: aiText }])
    } catch (error) {
      setMessages((current) => [...current, { role: 'ai', text: 'Error connecting to AI Copilot service.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main id="main-content" className="page-main wellsync-page">
      <div className="ws-shell ws-copilot-page">
        <div className="ws-eyebrow"><Activity size={16} /> DIGITAL TWIN / OPERATOR ASSIST</div>
        <div className="ws-title-row">
          <div>
            <h1>AI Copilot</h1>
            <p>Ask natural-language questions about the current well state.</p>
          </div>
        </div>
        <Tile className="ws-panel ws-copilot-full">
          <div className="ws-panel-header">
            <div>
              <span className="ws-label">GEMINI OPERATOR CHANNEL</span>
              <h2>WellSync Copilot</h2>
            </div>
            <Tag type={loading ? 'blue' : 'green'}>{loading ? 'THINKING' : 'READY'}</Tag>
          </div>
          <div className="ws-copilot-messages">
            {messages.map((message, index) => (
              <div className={`ws-copilot-message ${message.role}`} key={`${message.role}-${index}`}>
                <span>{message.role === 'ai' ? 'AI' : 'OPERATOR'}</span>
                <p>{message.text}</p>
              </div>
            ))}
            {loading && (
              <div className="ws-copilot-message ai">
                <span>AI</span>
                <div><InlineLoading description="AI is reviewing the telemetry stream..." /></div>
              </div>
            )}
          </div>
          <form className="ws-copilot-form" onSubmit={submit}>
            <input 
              aria-label="Ask AI Copilot" 
              value={input} 
              onChange={(event) => setInput(event.target.value)} 
              placeholder="Ask about temperature, risk, or recommendations..."
              disabled={loading}
            />
            <Button kind="primary" type="submit" renderIcon={ArrowUpRight} disabled={loading || !input.trim()}>Send question</Button>
          </form>
        </Tile>
      </div>
    </main>
  )
}
