'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [role, setRole] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function getRole() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      setRole(data?.role ?? 'worker')
    }
    getRole()
  }, [])

  if (!role) return (
    <div style={{ background: '#060912', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f0f4ff', fontFamily: 'sans-serif' }}>
      Loading...
    </div>
  )

  if (role === 'admin') return <AdminDashboard />
  if (role === 'manager') return <ManagerDashboard />
  return <WorkerDashboard />
}

// ── WORKER ──────────────────────────────────────────────
function WorkerDashboard() {
  const [page, setPage] = useState('chat')
  const [messages, setMessages] = useState<Array<{ role: string; text: string; citation?: string | null }>>([
    { role: 'ai', text: "Hi! I'm your Policy Assistant. I've read the full 60-page Employee Handbook and can answer any question instantly, with an exact page citation every time. What do you need to know?" },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [quizDone, setQuizDone] = useState(false)
  const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null)

  const aiResponses = [
    { text: "In your first year, you earn 15 days of PTO, accruing at 1.25 days per month. PTO cannot carry over beyond 5 days at year-end.", citation: "Handbook p. 12 - Section 3.2 'Time Off'" },
    { text: "The remote work policy allows up to 3 days per week from home for eligible roles, subject to manager approval.", citation: "Handbook p. 22 - Section 5.1 'Remote Work'" },
    { text: "FINRA compliance issues must be reported within 24 hours to the Chief Compliance Officer using Form CCO-001.", citation: "Handbook p. 51 - Section 12.4 'Regulatory Reporting'" },
    { text: "Business casual applies Monday-Thursday. Fridays are casual dress. Client-facing days always require business professional.", citation: "Handbook p. 8 - Section 2.3 'Dress Code'" },
    { text: "I could not find a specific answer in the handbook. I have flagged this to your manager automatically.", citation: null },
  ]
  let aiIdx = 0

  function sendChat() {
    if (!input.trim()) return
    setMessages(m => [...m, { role: 'user', text: input }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      const r = aiResponses[aiIdx % aiResponses.length]
      aiIdx++
      setTyping(false)
      setMessages(m => [...m, { role: 'ai', text: r.text, citation: r.citation }])
    }, 1400)
  }

  function answerQuiz(correct: boolean) {
    if (quizDone) return
    setQuizDone(true)
    setQuizCorrect(correct)
  }

  const card = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', padding: '24px' }
  const navActive = { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', color: '#4f8ef7', background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.25)' } as React.CSSProperties
  const navInactive = { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', color: 'rgba(240,244,255,0.45)', background: 'transparent', border: '1px solid transparent' } as React.CSSProperties

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#060912', fontFamily: 'sans-serif', color: '#f0f4ff' }}>
      <aside style={{ width: '260px', minHeight: '100vh', padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: '8px', borderRight: '1px solid rgba(255,255,255,0.1)', background: 'rgba(6,9,18,0.8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px 24px', fontSize: '18px', fontWeight: 700 }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'linear-gradient(135deg, #4f8ef7, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>⚡</div>
          PolicyPulse
        </div>
        <div style={{ fontSize: '10px', color: 'rgba(240,244,255,0.25)', textTransform: 'uppercase', letterSpacing: '1.2px', padding: '8px 14px 4px' }}>Worker</div>
        <div style={page === 'chat' ? navActive : navInactive} onClick={() => setPage('chat')}><span>💬</span> Policy Chat</div>
        <div style={page === 'onboarding' ? navActive : navInactive} onClick={() => setPage('onboarding')}><span>✅</span> My Onboarding</div>
        <div style={page === 'quiz' ? navActive : navInactive} onClick={() => setPage('quiz')}><span>🧠</span> Daily Quiz</div>
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)', fontSize: '12px', color: '#34d399', fontWeight: 600 }}>👷 Worker</div>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto' }}>
        {page === 'chat' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.6px' }}>Policy Chat</h1>
              <p style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px', marginTop: '6px' }}>Ask anything. Answers come straight from your firm's handbook.</p>
            </div>
            <div style={{ ...card, display: 'flex', flexDirection: 'column', height: '520px' }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', background: m.role === 'ai' ? 'linear-gradient(135deg, #4f8ef7, #a78bfa)' : 'rgba(255,255,255,0.1)' }}>
                      {m.role === 'ai' ? '⚡' : 'JD'}
                    </div>
                    <div style={{ maxWidth: '72%' }}>
                      <div style={{ padding: '12px 16px', borderRadius: '14px', fontSize: '14px', lineHeight: 1.6, background: m.role === 'ai' ? 'rgba(255,255,255,0.05)' : 'rgba(79,142,247,0.15)', border: `1px solid ${m.role === 'ai' ? 'rgba(255,255,255,0.1)' : 'rgba(79,142,247,0.25)'}` }}>
                        {m.text}
                      </div>
                      {m.citation && (
                        <div style={{ display: 'inline-flex', marginTop: '6px', background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.2)', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', color: '#4f8ef7', fontFamily: 'monospace' }}>
                          📄 {m.citation}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f8ef7, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚡</div>
                    <div style={{ padding: '12px 16px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,244,255,0.45)', fontSize: '14px' }}>Thinking...</div>
                  </div>
                )}
              </div>
              <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '10px' }}>
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder="Ask any policy question..." style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 16px', color: '#f0f4ff', fontFamily: 'sans-serif', fontSize: '14px', outline: 'none' }} />
                <button onClick={sendChat} style={{ width: '40px', height: '40px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #4f8ef7, #a78bfa)', color: 'white', fontSize: '16px', cursor: 'pointer' }}>→</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '24px' }}>
              <div style={{ ...card, padding: '16px' }}>
                <div style={{ fontSize: '11px', color: 'rgba(240,244,255,0.25)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: '8px' }}>Quick Topics</div>
                {['Remote work policy', 'FINRA reporting', 'Dress code'].map(t => (
                  <button key={t} onClick={() => setInput(t)} style={{ display: 'block', width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '7px', padding: '8px 12px', fontSize: '12px', color: 'rgba(240,244,255,0.45)', cursor: 'pointer', textAlign: 'left', fontFamily: 'sans-serif', marginBottom: '6px' }}>{t}</button>
                ))}
              </div>
              <div style={{ ...card, padding: '16px' }}>
                <div style={{ fontSize: '11px', color: 'rgba(240,244,255,0.25)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: '8px' }}>Questions Today</div>
                <div style={{ fontSize: '34px', fontWeight: 700, color: '#34d399' }}>7</div>
                <div style={{ fontSize: '12px', color: 'rgba(240,244,255,0.45)' }}>across your team</div>
              </div>
              <div style={{ ...card, padding: '16px' }}>
                <div style={{ fontSize: '11px', color: 'rgba(240,244,255,0.25)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: '8px' }}>Citation Accuracy</div>
                <div style={{ fontSize: '34px', fontWeight: 700, color: '#4f8ef7' }}>100%</div>
                <div style={{ fontSize: '12px', color: 'rgba(240,244,255,0.45)' }}>verified answers only</div>
              </div>
            </div>
          </div>
        )}

        {page === 'onboarding' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.6px' }}>My Onboarding</h1>
              <p style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px', marginTop: '6px' }}>Track your compliance training progress.</p>
            </div>
            <div style={card}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(240,244,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px' }}>Completion Progress</div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ color: 'rgba(240,244,255,0.45)' }}>Overall</span>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>50%</span>
                </div>
                <div style={{ height: '8px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)' }}>
                  <div style={{ height: '100%', width: '50%', borderRadius: '99px', background: 'linear-gradient(90deg, #34d399, #6ee7b7)' }} />
                </div>
              </div>
              {[
                { num: '✓', label: 'Employee Handbook – Section 1-3', sub: 'Completed Feb 12, 2026', done: true },
                { num: '✓', label: 'Code of Conduct Acknowledgment', sub: 'Completed Feb 12, 2026', done: true },
                { num: '✓', label: 'Data Privacy & GDPR Module', sub: 'Completed Feb 14, 2026', done: true },
                { num: '4', label: 'SEC / FINRA Compliance Training', sub: 'Due Feb 28, 2026 – Not started', done: false },
                { num: '5', label: 'Anti-Money Laundering (AML) Module', sub: 'Due Mar 7, 2026', done: false },
                { num: '6', label: 'IT Security & Acceptable Use Policy', sub: 'Due Mar 7, 2026', done: false },
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, background: step.done ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)', color: step.done ? '#34d399' : 'rgba(240,244,255,0.25)', border: `1px solid ${step.done ? 'rgba(52,211,153,0.25)' : 'rgba(255,255,255,0.1)'}` }}>{step.num}</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{step.label}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(240,244,255,0.45)', marginTop: '2px' }}>{step.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {page === 'quiz' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.6px' }}>Daily Quiz</h1>
                <p style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px', marginTop: '6px' }}>30 seconds. One question. Stay sharp.</p>
              </div>
              <span style={{ padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 600, background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>Streak: 5 days 🔥</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'start' }}>
              <div style={card}>
                <div style={{ fontSize: '11px', color: 'rgba(240,244,255,0.25)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: '12px' }}>Today's Question</div>
                <div style={{ fontSize: '17px', fontWeight: 600, lineHeight: 1.5, marginBottom: '20px' }}>Under SEC Rule 17a-4, how long must broker-dealers retain order tickets and related records?</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[{ label: 'A. 1 year', correct: false }, { label: 'B. 2 years', correct: false }, { label: 'C. 3 years', correct: true }, { label: 'D. 7 years', correct: false }].map((opt, i) => (
                    <button key={i} onClick={() => answerQuiz(opt.correct)} disabled={quizDone}
                      style={{ padding: '13px 16px', borderRadius: '10px', border: `1px solid ${quizDone && opt.correct ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.1)'}`, cursor: quizDone ? 'default' : 'pointer', fontSize: '14px', background: quizDone && opt.correct ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.03)', color: quizDone && opt.correct ? '#34d399' : 'rgba(240,244,255,0.6)', fontFamily: 'sans-serif', textAlign: 'left' as const }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
                {quizCorrect !== null && (
                  <div style={{ marginTop: '16px', padding: '14px 16px', borderRadius: '10px', background: quizCorrect ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)', border: `1px solid ${quizCorrect ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}` }}>
                    <strong style={{ color: quizCorrect ? '#34d399' : '#f87171' }}>{quizCorrect ? '✓ Correct!' : '✗ Incorrect.'}</strong>
                    <span style={{ color: 'rgba(240,244,255,0.45)', fontSize: '13px', marginLeft: '8px' }}>SEC Rule 17a-4 requires 3 years. — Handbook p. 48</span>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={card}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(240,244,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px' }}>Your Score History</div>
                  {[{ label: 'This Week', val: '4 / 5 correct', color: '#34d399', width: '80%' }, { label: 'This Month', val: '18 / 22 correct', color: '#4f8ef7', width: '82%' }].map(item => (
                    <div key={item.label} style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                        <span style={{ color: 'rgba(240,244,255,0.45)' }}>{item.label}</span>
                        <span style={{ color: item.color, fontWeight: 600 }}>{item.val}</span>
                      </div>
                      <div style={{ height: '6px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)' }}>
                        <div style={{ height: '100%', width: item.width, borderRadius: '99px', background: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={card}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(240,244,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px' }}>Team Leaderboard</div>
                  {[{ name: '🥇 Sarah K.', score: '98%', color: '#34d399' }, { name: '🥈 Marcus T.', score: '95%', color: '#4f8ef7' }, { name: '🥉 You (JD)', score: '82%', color: '#f59e0b' }, { name: 'Priya R.', score: '77%', color: 'rgba(240,244,255,0.45)' }].map(item => (
                    <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                      <span style={{ color: 'rgba(240,244,255,0.45)' }}>{item.name}</span>
                      <span style={{ color: item.color }}>{item.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// ── MANAGER ──────────────────────────────────────────────
function ManagerDashboard() {
  const [page, setPage] = useState('pulse')

  const card = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', padding: '24px' }
  const navActive = { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', color: '#f59e0b', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' } as React.CSSProperties
  const navInactive = { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', color: 'rgba(240,244,255,0.45)', background: 'transparent', border: '1px solid transparent' } as React.CSSProperties

  const team = [
    { name: 'Sarah K.', time: '9:02 AM', score: '100%', pct: 100, status: 'Done' },
    { name: 'Marcus T.', time: '9:15 AM', score: '100%', pct: 100, status: 'Done' },
    { name: 'Jordan D.', time: '10:31 AM', score: '75%', pct: 75, status: 'Review' },
    { name: 'Priya R.', time: '11:04 AM', score: '75%', pct: 75, status: 'Review' },
    { name: 'Chen W.', time: '--', score: '--', pct: 0, status: 'Missing' },
    { name: 'Alex B.', time: '--', score: '--', pct: 0, status: 'Missing' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#060912', fontFamily: 'sans-serif', color: '#f0f4ff' }}>
      <aside style={{ width: '260px', minHeight: '100vh', padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: '8px', borderRight: '1px solid rgba(255,255,255,0.1)', background: 'rgba(6,9,18,0.8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px 24px', fontSize: '18px', fontWeight: 700 }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'linear-gradient(135deg, #4f8ef7, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>⚡</div>
          PolicyPulse
        </div>
        <div style={{ fontSize: '10px', color: 'rgba(240,244,255,0.25)', textTransform: 'uppercase', letterSpacing: '1.2px', padding: '8px 14px 4px' }}>Manager</div>
        <div style={page === 'pulse' ? navActive : navInactive} onClick={() => setPage('pulse')}><span>📊</span> Daily Pulse</div>
        <div style={page === 'gaps' ? navActive : navInactive} onClick={() => setPage('gaps')}><span>🔍</span> Gap Detection</div>
        <div style={page === 'escalations' ? navActive : navInactive} onClick={() => setPage('escalations')}><span>🤝</span> Escalations</div>
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)', fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>📋 Manager</div>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto' }}>

        {page === 'pulse' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.6px' }}>Daily Pulse</h1>
              <p style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px', marginTop: '6px' }}>Team quiz results for today – Feb 24, 2026</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
              {[{ label: 'Completed', val: '14', sub: 'of 18 members', color: '#34d399' }, { label: 'Avg Score', val: '81%', sub: 'up 4% from last week', color: '#4f8ef7' }, { label: 'Not Started', val: '4', sub: 'reminders sent', color: '#f59e0b' }, { label: "Today's Topic", val: 'SEC 17a-4', sub: 'record retention', color: '#f0f4ff' }].map(s => (
                <div key={s.label} style={card}>
                  <div style={{ fontSize: '11px', color: 'rgba(240,244,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>{s.label}</div>
                  <div style={{ fontSize: s.label === "Today's Topic" ? '20px' : '34px', fontWeight: 700, color: s.color, letterSpacing: '-1px' }}>{s.val}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(240,244,255,0.45)', marginTop: '4px' }}>{s.sub}</div>
                </div>
              ))}
            </div>
            <div style={card}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(240,244,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px' }}>Team Results</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr>{['Employee', 'Completed', 'Score', 'Progress', 'Status'].map(h => <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '10px', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'rgba(240,244,255,0.25)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {team.map(row => (
                    <tr key={row.name}>
                      <td style={{ padding: '12px 16px', color: '#f0f4ff', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{row.name}</td>
                      <td style={{ padding: '12px 16px', color: 'rgba(240,244,255,0.45)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{row.time}</td>
                      <td style={{ padding: '12px 16px', color: row.pct === 100 ? '#34d399' : row.pct > 0 ? '#f59e0b' : '#f87171', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{row.score}</td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', width: '140px' }}>
                        <div style={{ height: '6px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)' }}>
                          <div style={{ height: '100%', width: `${row.pct}%`, borderRadius: '99px', background: row.pct === 100 ? '#34d399' : row.pct > 0 ? '#f59e0b' : '#f87171' }} />
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 600, background: row.status === 'Done' ? 'rgba(52,211,153,0.12)' : row.status === 'Review' ? 'rgba(245,158,11,0.12)' : 'rgba(248,113,113,0.12)', color: row.status === 'Done' ? '#34d399' : row.status === 'Review' ? '#f59e0b' : '#f87171', border: `1px solid ${row.status === 'Done' ? 'rgba(52,211,153,0.2)' : row.status === 'Review' ? 'rgba(245,158,11,0.2)' : 'rgba(248,113,113,0.2)'}` }}>
                          {row.status === 'Missing' ? '⚠ Missing' : row.status === 'Done' ? '✓ Done' : 'Review'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {page === 'gaps' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.6px' }}>Gap Detection</h1>
              <p style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px', marginTop: '6px' }}>AI-detected policy areas your team is struggling with.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              {[{ icon: '🚨', title: 'Travel Reimbursement – High Confusion', desc: '12 questions asked this week. Workers unclear on international limits.', color: '#f59e0b' }, { icon: '⚠️', title: 'Resignation Notice Period – Trending', desc: '7 questions in 3 days. Possible team anxiety signal.', color: '#f59e0b' }].map(a => (
                <div key={a.title} style={{ padding: '14px 18px', borderRadius: '10px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '18px' }}>{a.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#f0f4ff', marginBottom: '2px' }}>{a.title}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(240,244,255,0.45)' }}>{a.desc}</div>
                  </div>
                  <button style={{ padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#f0f4ff', fontFamily: 'sans-serif' }}>Review</button>
                </div>
              ))}
            </div>
            <div style={card}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(240,244,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px' }}>Flagged Policy Sections</div>
              {[{ icon: '✈️', title: 'Section 7.1 – Travel & Expenses', sub: '12 questions this week', badge: 'High', color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.2)' }, { icon: '📝', title: 'Section 11.3 – Resignation & Offboarding', sub: '7 questions this week – unusual spike', badge: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.2)' }, { icon: '💻', title: 'Section 5.2 – Remote Work Equipment', sub: '4 questions this week – new hires unclear', badge: 'Low', color: '#4f8ef7', bg: 'rgba(79,142,247,0.12)', border: 'rgba(79,142,247,0.2)' }].map(g => (
                <div key={g.title} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '8px' }}>
                  <div style={{ fontSize: '20px' }}>{g.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{g.title}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(240,244,255,0.45)' }}>{g.sub}</div>
                  </div>
                  <span style={{ padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 600, background: g.bg, color: g.color, border: `1px solid ${g.border}` }}>{g.badge}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {page === 'escalations' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.6px' }}>Escalations</h1>
              <p style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px', marginTop: '6px' }}>Questions the AI could not answer – sent directly to you.</p>
            </div>
            <div style={card}>
              {[{ name: 'Jordan D.', time: '10:47 AM', q: 'If my manager verbally approves an expense but then leaves the company, how do I get reimbursed without a paper trail?' }, { name: 'Chen W.', time: 'Yesterday 4:12 PM', q: 'Does the resignation policy apply if I am transitioning to a contractor role with the same firm?' }].map(e => (
                <div key={e.name} style={{ padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{e.name} – {e.time}</div>
                    <span style={{ padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 600, background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>Unresolved</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'rgba(240,244,255,0.45)', marginBottom: '12px' }}>"{e.q}"</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#f0f4ff', fontFamily: 'sans-serif' }}>Reply</button>
                    <button style={{ padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid rgba(52,211,153,0.25)', background: 'rgba(52,211,153,0.08)', color: '#34d399', fontFamily: 'sans-serif' }}>Mark Resolved</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// ── ADMIN ──────────────────────────────────────────────
function AdminDashboard() {
  const [page, setPage] = useState('dashboard')

  const card = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', padding: '24px' }
  const navActive = { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', color: '#4f8ef7', background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.25)' } as React.CSSProperties
  const navInactive = { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', color: 'rgba(240,244,255,0.45)', background: 'transparent', border: '1px solid transparent' } as React.CSSProperties

  const atRisk = [{ name: 'Alex B.', dept: 'IT/Support', score: '42%', risk: 'Critical', color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.2)' }, { name: 'Chen W.', dept: 'Operations', score: '51%', risk: 'High', color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.2)' }, { name: 'Nina G.', dept: 'IT/Support', score: '58%', risk: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.2)' }, { name: 'Raj M.', dept: 'Compliance', score: '59%', risk: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.2)' }]

  const logs = [
    { time: '2026-02-24 11:47', user: 'sarah.k@firm.com', action: 'Completed Daily Quiz – SEC 17a-4 – Score: 100%' },
    { time: '2026-02-24 11:32', user: 'marcus.t@firm.com', action: 'Completed Daily Quiz – SEC 17a-4 – Score: 100%' },
    { time: '2026-02-24 10:47', user: 'jordan.d@firm.com', action: 'Policy Chat query: "Travel reimbursement international hotels"' },
    { time: '2026-02-24 10:31', user: 'jordan.d@firm.com', action: 'Completed Daily Quiz – SEC 17a-4 – Score: 75%' },
    { time: '2026-02-24 10:12', user: 'priya.r@firm.com', action: 'Acknowledged FINRA Compliance Module v2.1' },
    { time: '2026-02-24 09:55', user: 'r.miller@firm.com', action: 'Manager reviewed Gap Detection report – Travel flagged' },
    { time: '2026-02-24 09:02', user: 'sarah.k@firm.com', action: 'Policy Chat query: "SEC Rule 15c3-3 customer protection"' },
    { time: '2026-02-23 17:18', user: 'admin@firm.com', action: 'Audit log exported for Feb 1-23, 2026 – PDF generated' },
  ]

  const sentiment = [
    { topic: 'Travel & Expenses', count: 44, pct: 88, color: '#f87171' },
    { topic: 'Resignation / Offboarding', count: 29, pct: 58, color: '#f59e0b' },
    { topic: 'Remote Work Policy', count: 24, pct: 48, color: '#4f8ef7' },
    { topic: 'FINRA / SEC Rules', count: 18, pct: 36, color: '#34d399' },
    { topic: 'PTO & Leave', count: 14, pct: 28, color: '#4f8ef7' },
    { topic: 'IT / Equipment', count: 10, pct: 20, color: '#34d399' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#060912', fontFamily: 'sans-serif', color: '#f0f4ff' }}>
      <aside style={{ width: '260px', minHeight: '100vh', padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: '8px', borderRight: '1px solid rgba(255,255,255,0.1)', background: 'rgba(6,9,18,0.8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px 24px', fontSize: '18px', fontWeight: 700 }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'linear-gradient(135deg, #4f8ef7, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>⚡</div>
          PolicyPulse
        </div>
        <div style={{ fontSize: '10px', color: 'rgba(240,244,255,0.25)', textTransform: 'uppercase', letterSpacing: '1.2px', padding: '8px 14px 4px' }}>Admin</div>
        <div style={page === 'dashboard' ? navActive : navInactive} onClick={() => setPage('dashboard')}><span>🛡️</span> Compliance Dashboard</div>
        <div style={page === 'logs' ? navActive : navInactive} onClick={() => setPage('logs')}><span>📋</span> Audit Logs</div>
        <div style={page === 'sentiment' ? navActive : navInactive} onClick={() => setPage('sentiment')}><span>📡</span> Sentiment Analytics</div>
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.2)', fontSize: '12px', color: '#4f8ef7', fontWeight: 600 }}>🛡️ Admin</div>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto' }}>

        {page === 'dashboard' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.6px' }}>Compliance Dashboard</h1>
              <p style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px', marginTop: '6px' }}>Birds-eye view – SEC/FINRA audit readiness for Feb 2026</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
              {[{ label: 'Overall Completion', val: '87%', sub: 'up 12% from Jan', color: '#34d399' }, { label: 'At Risk', val: '4', sub: 'employees below 60%', color: '#f87171' }, { label: 'Modules Deployed', val: '9', sub: 'across 3 departments', color: '#4f8ef7' }, { label: 'Next Audit', val: 'Apr 15', sub: '50 days away', color: '#f0f4ff' }].map(s => (
                <div key={s.label} style={card}>
                  <div style={{ fontSize: '11px', color: 'rgba(240,244,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>{s.label}</div>
                  <div style={{ fontSize: s.label === 'Next Audit' ? '22px' : '34px', fontWeight: 700, color: s.color, letterSpacing: '-1px' }}>{s.val}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(240,244,255,0.45)', marginTop: '4px' }}>{s.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={card}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(240,244,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px' }}>Completion by Department</div>
                {[{ dept: 'Trading Desk', pct: 94, color: '#34d399' }, { dept: 'Operations', pct: 88, color: '#4f8ef7' }, { dept: 'Compliance', pct: 79, color: '#f59e0b' }, { dept: 'IT / Support', pct: 61, color: '#f87171' }].map(d => (
                  <div key={d.dept} style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                      <span style={{ color: 'rgba(240,244,255,0.45)' }}>{d.dept}</span>
                      <span style={{ color: d.color, fontWeight: 600 }}>{d.pct}%</span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)' }}>
                      <div style={{ height: '100%', width: `${d.pct}%`, borderRadius: '99px', background: d.color }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={card}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(240,244,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px' }}>At-Risk Employees</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead><tr>{['Name', 'Dept', 'Score', 'Risk'].map(h => <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: 'rgba(240,244,255,0.25)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {atRisk.map(r => (
                      <tr key={r.name}>
                        <td style={{ padding: '10px 12px', color: '#f0f4ff', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{r.name}</td>
                        <td style={{ padding: '10px 12px', color: 'rgba(240,244,255,0.45)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{r.dept}</td>
                        <td style={{ padding: '10px 12px', color: r.color, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{r.score}</td>
                        <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}><span style={{ padding: '3px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 600, background: r.bg, color: r.color, border: `1px solid ${r.border}` }}>{r.risk}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {page === 'logs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.6px' }}>Audit Logs</h1>
                <p style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px', marginTop: '6px' }}>Timestamped proof of your firm's compliance culture.</p>
              </div>
              <button style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: '1px solid rgba(79,142,247,0.25)', background: 'rgba(79,142,247,0.1)', color: '#4f8ef7', fontFamily: 'sans-serif' }}>⬇ Export PDF Report</button>
            </div>
            <div style={card}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(240,244,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px' }}>Activity Log – Last 24 Hours</div>
              {logs.map((log, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '12px', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '13px' }}>
                  <div style={{ fontFamily: 'monospace', fontSize: '11px', color: 'rgba(240,244,255,0.25)', minWidth: '140px' }}>{log.time}</div>
                  <div style={{ color: '#4f8ef7', fontWeight: 500, minWidth: '140px' }}>{log.user}</div>
                  <div style={{ color: 'rgba(240,244,255,0.45)', flex: 1 }}>{log.action}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {page === 'sentiment' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.6px' }}>Sentiment Analytics</h1>
              <p style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px', marginTop: '6px' }}>What your office is actually worried about – anonymized.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={card}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(240,244,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px' }}>Top Query Topics</div>
                {sentiment.map(s => (
                  <div key={s.topic} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '13px', minWidth: '170px', color: 'rgba(240,244,255,0.45)' }}>{s.topic}</div>
                    <div style={{ flex: 1, height: '6px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)' }}>
                      <div style={{ height: '100%', width: `${s.pct}%`, borderRadius: '99px', background: s.color }} />
                    </div>
                    <div style={{ fontSize: '12px', fontFamily: 'monospace', color: 'rgba(240,244,255,0.25)', minWidth: '28px', textAlign: 'right' }}>{s.count}</div>
                  </div>
                ))}
              </div>
              <div style={card}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(240,244,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px' }}>AI Insight Summary</div>
                {[{ icon: '📈', title: 'Resignation queries up 140% this month', desc: 'Spike started Feb 10. Possible response to rumored restructuring – recommend leadership transparency.', color: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' }, { icon: '✈️', title: 'Travel reimbursement is the #1 confusion point', desc: 'Section 7.1 has unclear international limits. AI recommends rewriting with explicit cap tables.', color: 'rgba(79,142,247,0.08)', border: 'rgba(79,142,247,0.2)' }, { icon: '🏠', title: 'Remote work queries increasing post-RTO', desc: '24 questions since Feb 1 – employees seeking clarity on hybrid exceptions.', color: 'rgba(79,142,247,0.08)', border: 'rgba(79,142,247,0.2)' }].map(a => (
                  <div key={a.title} style={{ padding: '12px 14px', borderRadius: '10px', background: a.color, border: `1px solid ${a.border}`, marginBottom: '10px', display: 'flex', gap: '10px' }}>
                    <div style={{ fontSize: '16px' }}>{a.icon}</div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#f0f4ff', marginBottom: '3px' }}>{a.title}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(240,244,255,0.45)' }}>{a.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}