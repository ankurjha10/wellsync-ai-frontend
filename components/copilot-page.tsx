'use client'

import { useState, type FormEvent } from 'react'
import { Button, Tag, Tile } from '@carbon/react'
import { Activity, ArrowUpRight } from '@carbon/icons-react'

export default function CopilotPage() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([{ role: 'ai', text: 'Operator Assist is ready. Ask about the active well state, telemetry, or recommended actions.' }])
  function submit(event: FormEvent) { event.preventDefault(); const prompt = input.trim(); if (!prompt) return; setMessages((current) => [...current, { role: 'operator', text: prompt }, { role: 'ai', text: 'I am reviewing the live telemetry stream. The current digital twin remains within the configured operating envelope.' }]); setInput('') }
  return <main id="main-content" className="page-main wellsync-page"><div className="ws-shell ws-copilot-page"><div className="ws-eyebrow"><Activity size={16} /> DIGITAL TWIN / OPERATOR ASSIST</div><div className="ws-title-row"><div><h1>AI Copilot</h1><p>Ask natural-language questions about the current well state.</p></div></div><Tile className="ws-panel ws-copilot-full"><div className="ws-panel-header"><div><span className="ws-label">GEMINI OPERATOR CHANNEL</span><h2>WellSync Copilot</h2></div><Tag type="green">READY</Tag></div><div className="ws-copilot-messages">{messages.map((message, index) => <div className={`ws-copilot-message ${message.role}`} key={`${message.role}-${index}`}><span>{message.role === 'ai' ? 'AI' : 'OPERATOR'}</span><p>{message.text}</p></div>)}</div><form className="ws-copilot-form" onSubmit={submit}><input aria-label="Ask AI Copilot" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about temperature, risk, or recommendations..."/><Button kind="primary" type="submit" renderIcon={ArrowUpRight}>Send question</Button></form></Tile></div></main>
}
