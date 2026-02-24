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
      {/* Sidebar */}
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

      {/* Main */}
      <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto' }}>

        {/* CHAT */}
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
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', background: m.role === 'ai' ? 'linear-gradient(135deg, #4f8ef7, #a78bfa)' : 'rgba(255,255,255,0.1)', border: m.role === 'user' ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
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
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f8ef7, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚡</div>
                    <div style={{ padding: '12px 16px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,244,255,0.45)', fontSize: '14px' }}>Thinking...</div>
                  </div>
                )}
              </div>
              <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '10px' }}>
                <input
                  value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChat()}
                  placeholder="Ask any policy question..."
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 16px', color: '#f0f4ff', fontFamily: 'sans-serif', fontSize: '14px', outline: 'none' }}
                />
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

        {/* ONBOARDING */}
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

        {/* QUIZ */}
        {page === 'quiz' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.6px' }}>Daily Quiz</h1>
                <p style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px', marginTop: '6px' }}>30 seconds. One question. Stay sharp.</p>
              </div>
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 600, background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>Streak: 5 days 🔥</span>
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

function ManagerDashboard() {
  return <div style={{ background: '#060912', minHeight: '100vh', color: '#f0f4ff', fontFamily: 'sans-serif', padding: '40px' }}><h1>📋 Manager Dashboard</h1><p style={{ color: 'rgba(240,244,255,0.45)', marginTop: '8px' }}>Coming soon.</p></div>
}

function AdminDashboard() {
  return <div style={{ background: '#060912', minHeight: '100vh', color: '#f0f4ff', fontFamily: 'sans-serif', padding: '40px' }}><h1>🛡️ Admin Dashboard</h1><p style={{ color: 'rgba(240,244,255,0.45)', marginTop: '8px' }}>Coming soon.</p></div>
}