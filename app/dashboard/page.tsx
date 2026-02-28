'use client'

import { useEffect, useState, useRef } from 'react'
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
    { role: 'ai', text: "Hi! I'm your Policy Assistant. I've read the full Employee Handbook and can answer any question instantly, with an exact page citation every time. What do you need to know?" },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const [questions, setQuestions] = useState<any[]>([])
  const [quizIndex, setQuizIndex] = useState(0)
  const [answers, setAnswers] = useState<Array<{ correct: boolean; selected: string }>>([])
  const [quizDone, setQuizDone] = useState(false)
  const [quizLoading, setQuizLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    loadUser()
  }, [])

  useEffect(() => {
    async function loadQuestions() {
      const res = await fetch('/api/questions')
      const data = await res.json()
      setQuestions(data.questions ?? [])
      setQuizLoading(false)
    }
    loadQuestions()
  }, [])

  async function sendChat() {
    if (!input.trim()) return
    const question = input
    setMessages(m => [...m, { role: 'user', text: question }])
    setInput('')
    setTyping(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, user_id: userId })
      })
      const { answer, citation } = await res.json()
      setMessages(m => [...m, { role: 'ai', text: answer, citation }])
    } catch {
      setMessages(m => [...m, { role: 'ai', text: 'Something went wrong. Please try again.', citation: null }])
    } finally {
      setTyping(false)
    }
  }

  async function answerQuestion(selected: string) {
    const current = questions[quizIndex]
    const correct = selected === current.correct_option
    const newAnswers = [...answers, { correct, selected }]
    setAnswers(newAnswers)

    if (quizIndex + 1 >= questions.length) {
      setQuizDone(true)
      const totalCorrect = newAnswers.filter(a => a.correct).length
      const score = Math.round((totalCorrect / questions.length) * 100)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await fetch('/api/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, question_id: 'daily-quiz', correct: totalCorrect === questions.length, score })
        })
      }
    } else {
      setTimeout(() => setQuizIndex(i => i + 1), 800)
    }
  }

  const card = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', padding: '24px' }
  const navActive = { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', color: '#4f8ef7', background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.25)' } as React.CSSProperties
  const navInactive = { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', color: 'rgba(240,244,255,0.45)', background: 'transparent', border: '1px solid transparent' } as React.CSSProperties

  const currentQuestion = questions[quizIndex]
  const totalCorrect = answers.filter(a => a.correct).length
  const finalScore = questions.length > 0 ? Math.round((totalCorrect / questions.length) * 100) : 0

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#060912', fontFamily: 'sans-serif', color: '#f0f4ff' }}>
      <aside style={{ width: '260px', minHeight: '100vh', padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: '8px', borderRight: '1px solid rgba(255,255,255,0.1)', background: 'rgba(6,9,18,0.8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px 24px', fontSize: '18px', fontWeight: 700 }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'linear-gradient(135deg, #4f8ef7, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>⚡</div>
          PolicyPulse
        </div>
        <div style={{ fontSize: '10px', color: 'rgba(240,244,255,0.25)', textTransform: 'uppercase', letterSpacing: '1.2px', padding: '8px 14px 4px' }}>Worker</div>
        <div style={page === 'chat' ? navActive : navInactive} onClick={() => setPage('chat')}><span>💬</span> Policy Chat</div>
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
              <p style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px', marginTop: '6px' }}>Ask anything. Answers come straight from your handbook.</p>
            </div>
            <div style={{ ...card, display: 'flex', flexDirection: 'column', height: '520px' }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', background: m.role === 'ai' ? 'linear-gradient(135deg, #4f8ef7, #a78bfa)' : 'rgba(255,255,255,0.1)' }}>
                      {m.role === 'ai' ? '⚡' : 'You'}
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
          </div>
        )}

        {page === 'quiz' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.6px' }}>Daily Quiz</h1>
                <p style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px', marginTop: '6px' }}>3 questions. Stay sharp.</p>
              </div>
              {!quizDone && !quizLoading && (
                <span style={{ padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 600, background: 'rgba(79,142,247,0.12)', color: '#4f8ef7', border: '1px solid rgba(79,142,247,0.2)' }}>
                  Question {quizIndex + 1} of {questions.length}
                </span>
              )}
            </div>

            {quizLoading && <div style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px' }}>Loading today's questions...</div>}

            {!quizLoading && !quizDone && currentQuestion && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'start' }}>
                <div style={card}>
                  <div style={{ height: '4px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)', marginBottom: '16px' }}>
                    <div style={{ height: '100%', width: `${(quizIndex / questions.length) * 100}%`, borderRadius: '99px', background: '#4f8ef7', transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(240,244,255,0.25)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: '12px' }}>{currentQuestion.topic}</div>
                  <div style={{ fontSize: '17px', fontWeight: 600, lineHeight: 1.5, marginBottom: '20px' }}>{currentQuestion.question}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {['A', 'B', 'C', 'D'].map(opt => (
                      <button key={opt} onClick={() => answerQuestion(opt)}
                        style={{ padding: '13px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: '14px', background: 'rgba(255,255,255,0.03)', color: 'rgba(240,244,255,0.6)', fontFamily: 'sans-serif', textAlign: 'left' as const }}>
                        {opt}. {currentQuestion[`option_${opt.toLowerCase()}`]}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={card}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(240,244,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px' }}>Your Progress</div>
                  {answers.map((a, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                      <span style={{ color: 'rgba(240,244,255,0.45)' }}>Question {i + 1}</span>
                      <span style={{ color: a.correct ? '#34d399' : '#f87171', fontWeight: 600 }}>{a.correct ? '✓ Correct' : '✗ Wrong'}</span>
                    </div>
                  ))}
                  {answers.length === 0 && <div style={{ color: 'rgba(240,244,255,0.25)', fontSize: '13px' }}>No answers yet</div>}
                </div>
              </div>
            )}

            {!quizLoading && quizDone && (
              <div style={card}>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>{finalScore === 100 ? '🏆' : finalScore >= 66 ? '✅' : '📚'}</div>
                  <div style={{ fontSize: '36px', fontWeight: 700, color: finalScore === 100 ? '#34d399' : finalScore >= 66 ? '#4f8ef7' : '#f59e0b', marginBottom: '8px' }}>{finalScore}%</div>
                  <div style={{ fontSize: '16px', color: 'rgba(240,244,255,0.45)', marginBottom: '24px' }}>{totalCorrect} of {questions.length} correct</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', maxWidth: '500px', margin: '0 auto' }}>
                    {questions.map((q, i) => (
                      <div key={i} style={{ padding: '12px 16px', borderRadius: '10px', background: answers[i]?.correct ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)', border: `1px solid ${answers[i]?.correct ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}` }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: answers[i]?.correct ? '#34d399' : '#f87171', marginBottom: '4px' }}>
                          {answers[i]?.correct ? '✓ Correct' : '✗ Incorrect'} – Q{i + 1}
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(240,244,255,0.45)' }}>{q.explanation}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => { setQuizIndex(0); setAnswers([]); setQuizDone(false) }} style={{ marginTop: '24px', padding: '10px 24px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #4f8ef7, #a78bfa)', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'sans-serif' }}>
                    Retake Quiz
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

// ── MANAGER ──────────────────────────────────────────────
function ManagerDashboard() {
  const [page, setPage] = useState('snapshot')
  const [pulseData, setPulseData] = useState<any>(null)
  const [escalations, setEscalations] = useState<any[]>([])
  const [trending, setTrending] = useState<Array<{ term: string; count: number }>>([])
  const [searchName, setSearchName] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchFound, setSearchFound] = useState<number | null>(null)
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [replySending, setReplySending] = useState<Record<string, boolean>>({})
  const [replySent, setReplySent] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetch('/api/manager').then(r => r.json()).then(d => setPulseData(d))
    fetch('/api/escalations').then(r => r.json()).then(d => setEscalations(d.escalations ?? []))
    fetch('/api/trending').then(r => r.json()).then(d => setTrending(d.topics ?? []))
  }, [])

  async function searchEmployee() {
    if (!searchName.trim()) return
    setSearchLoading(true)
    setSearchResults([])
    const res = await fetch(`/api/audit-search?name=${encodeURIComponent(searchName)}`)
    const data = await res.json()
    setSearchResults(data.results ?? [])
    setSearchFound(data.found ?? 0)
    setSearchLoading(false)
  }

  async function sendReply(escalationId: string) {
    const reply = replyText[escalationId]
    if (!reply?.trim()) return
    setReplySending(p => ({ ...p, [escalationId]: true }))
    await fetch('/api/escalations/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ escalation_id: escalationId, reply, manager_name: 'Your Manager' })
    })
    setReplySent(p => ({ ...p, [escalationId]: true }))
    setEscalations(prev => prev.map(e => e.id === escalationId ? { ...e, resolved: true } : e))
    setReplySending(p => ({ ...p, [escalationId]: false }))
  }

  const card = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', padding: '24px' }
  const navActive = { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', color: '#f59e0b', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' } as React.CSSProperties
  const navInactive = { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', color: 'rgba(240,244,255,0.45)', background: 'transparent', border: '1px solid transparent' } as React.CSSProperties
  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 16px', color: '#f0f4ff', fontFamily: 'sans-serif', fontSize: '14px', outline: 'none' }

  const maxCount = trending.length > 0 ? trending[0].count : 1

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#060912', fontFamily: 'sans-serif', color: '#f0f4ff' }}>
      <aside style={{ width: '260px', minHeight: '100vh', padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: '8px', borderRight: '1px solid rgba(255,255,255,0.1)', background: 'rgba(6,9,18,0.8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px 24px', fontSize: '18px', fontWeight: 700 }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'linear-gradient(135deg, #4f8ef7, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>⚡</div>
          PolicyPulse
        </div>
        <div style={{ fontSize: '10px', color: 'rgba(240,244,255,0.25)', textTransform: 'uppercase', letterSpacing: '1.2px', padding: '8px 14px 4px' }}>Manager</div>
        <div style={page === 'snapshot' ? navActive : navInactive} onClick={() => setPage('snapshot')}><span>✅</span> Team Snapshot</div>
        <div style={page === 'inbox' ? navActive : navInactive} onClick={() => setPage('inbox')}><span>📬</span> Needs Answer
          {escalations.filter(e => !e.resolved).length > 0 && (
            <span style={{ marginLeft: 'auto', background: '#f87171', color: '#fff', borderRadius: '100px', fontSize: '10px', fontWeight: 700, padding: '1px 7px' }}>
              {escalations.filter(e => !e.resolved).length}
            </span>
          )}
        </div>
        <div style={page === 'trending' ? navActive : navInactive} onClick={() => setPage('trending')}><span>📈</span> Trending Topics</div>
        <div style={page === 'search' ? navActive : navInactive} onClick={() => setPage('search')}><span>🔍</span> Audit Search</div>
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)', fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>📋 Manager</div>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto' }}>

        {page === 'snapshot' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.6px' }}>Team Snapshot</h1>
              <p style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px', marginTop: '6px' }}>Today's knowledge check results for your team.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Completed', val: pulseData ? `${pulseData.completed}` : '--', sub: `of ${pulseData?.total ?? '--'} members`, color: '#34d399' },
                { label: 'Avg Score', val: pulseData ? `${pulseData.avgScore}%` : '--', sub: 'today', color: '#4f8ef7' },
                { label: 'Not Started', val: pulseData ? `${(pulseData.total ?? 0) - (pulseData.completed ?? 0)}` : '--', sub: 'need a nudge', color: '#f59e0b' },
              ].map(s => (
                <div key={s.label} style={card}>
                  <div style={{ fontSize: '11px', color: 'rgba(240,244,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>{s.label}</div>
                  <div style={{ fontSize: '34px', fontWeight: 700, color: s.color, letterSpacing: '-1px' }}>{s.val}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(240,244,255,0.45)', marginTop: '4px' }}>{s.sub}</div>
                </div>
              ))}
            </div>
            <div style={card}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(240,244,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px' }}>Team Results</div>
              {(!pulseData?.team || pulseData.team.length === 0) && (
                <div style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px' }}>No team data yet.</div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(pulseData?.team ?? []).map((row: any) => (
                  <div key={row.name} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '20px' }}>{row.completed ? '✅' : '❌'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>{row.name}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(240,244,255,0.35)', marginTop: '2px' }}>
                        {row.completed ? `Score: ${row.score}%` : 'Has not completed today\'s quiz'}
                      </div>
                    </div>
                    <span style={{ padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 600, background: row.completed ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)', color: row.completed ? '#34d399' : '#f87171', border: `1px solid ${row.completed ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}` }}>
                      {row.completed ? '✓ Done' : '⚠ Missing'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {page === 'inbox' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.6px' }}>Needs Answer</h1>
              <p style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px', marginTop: '6px' }}>Questions the AI couldn't answer. Reply and it goes straight to the employee.</p>
            </div>
            <div style={card}>
              {escalations.length === 0 && (
                <div style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px', padding: '16px 0' }}>No open questions. All clear.</div>
              )}
              {escalations.map(e => (
                <div key={e.id} style={{ padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{e.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ fontSize: '11px', color: 'rgba(240,244,255,0.3)', fontFamily: 'monospace' }}>{new Date(e.time).toLocaleString()}</div>
                      <span style={{ padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 600, background: e.resolved ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)', color: e.resolved ? '#34d399' : '#f87171', border: `1px solid ${e.resolved ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}` }}>
                        {e.resolved ? 'Resolved' : 'Needs Answer'}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', color: 'rgba(240,244,255,0.55)', marginBottom: '14px', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontStyle: 'italic' }}>"{e.question}"</div>
                  {!e.resolved && !replySent[e.id] && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        value={replyText[e.id] ?? ''}
                        onChange={ev => setReplyText(p => ({ ...p, [e.id]: ev.target.value }))}
                        onKeyDown={ev => ev.key === 'Enter' && sendReply(e.id)}
                        placeholder="Type your answer and press Enter..."
                        style={{ ...inputStyle, flex: 1 }}
                      />
                      <button
                        onClick={() => sendReply(e.id)}
                        disabled={replySending[e.id]}
                        style={{ padding: '10px 18px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #4f8ef7, #a78bfa)', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'sans-serif' }}>
                        {replySending[e.id] ? 'Sending...' : 'Send Reply'}
                      </button>
                    </div>
                  )}
                  {replySent[e.id] && (
                    <div style={{ fontSize: '13px', color: '#34d399' }}>✓ Reply sent to employee</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {page === 'trending' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.6px' }}>Trending Topics</h1>
              <p style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px', marginTop: '6px' }}>What your team is asking about most – last 30 days. Use this in your morning stand-up.</p>
            </div>
            <div style={card}>
              {trending.length === 0 && (
                <div style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px' }}>No data yet. Topics appear as your team uses Policy Chat.</div>
              )}
              {trending.map((t, i) => (
                <div key={t.term} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontFamily: 'monospace', color: 'rgba(240,244,255,0.25)', minWidth: '20px', textAlign: 'right' }}>#{i + 1}</div>
                  <div style={{ fontSize: '14px', fontWeight: 500, minWidth: '140px', textTransform: 'capitalize' }}>{t.term}</div>
                  <div style={{ flex: 1, height: '8px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)' }}>
                    <div style={{ height: '100%', width: `${Math.round((t.count / maxCount) * 100)}%`, borderRadius: '99px', background: i === 0 ? '#f87171' : i <= 2 ? '#f59e0b' : '#4f8ef7', transition: 'width 0.4s' }} />
                  </div>
                  <div style={{ fontSize: '13px', fontFamily: 'monospace', color: 'rgba(240,244,255,0.45)', minWidth: '60px', textAlign: 'right' }}>{t.count} {t.count === 1 ? 'query' : 'queries'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {page === 'search' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.6px' }}>Audit Search</h1>
              <p style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px', marginTop: '6px' }}>Search any employee's full history of questions and quiz scores.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              <input
                value={searchName}
                onChange={e => setSearchName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchEmployee()}
                placeholder="Enter employee name..."
                style={{ ...inputStyle, flex: 1 }}
              />
              <button onClick={searchEmployee} style={{ padding: '11px 24px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #4f8ef7, #a78bfa)', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'sans-serif' }}>
                Search
              </button>
            </div>
            {searchLoading && <div style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px' }}>Searching...</div>}
            {!searchLoading && searchFound !== null && (
              <div style={{ fontSize: '12px', color: 'rgba(240,244,255,0.35)', marginBottom: '16px' }}>
                {searchFound === 0 ? 'No employee found with that name.' : `Found ${searchFound} employee${searchFound > 1 ? 's' : ''} – showing all activity`}
              </div>
            )}
            {searchResults.length > 0 && (
              <div style={card}>
                {searchResults.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ padding: '4px 10px', borderRadius: '100px', fontSize: '10px', fontWeight: 700, background: r.type === 'chat' ? 'rgba(79,142,247,0.15)' : 'rgba(52,211,153,0.15)', color: r.type === 'chat' ? '#4f8ef7' : '#34d399', border: `1px solid ${r.type === 'chat' ? 'rgba(79,142,247,0.25)' : 'rgba(52,211,153,0.25)'}`, whiteSpace: 'nowrap' as const }}>
                      {r.type === 'chat' ? '💬 Chat' : '🧠 Quiz'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '3px' }}>
                        {r.type === 'chat' ? r.question : `Quiz Score: ${r.score}%`}
                      </div>
                      {r.type === 'chat' && r.escalated && (
                        <span style={{ fontSize: '10px', color: '#f87171', fontWeight: 600 }}>⚠ Escalated</span>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'rgba(240,244,255,0.25)', whiteSpace: 'nowrap' as const }}>
                      {new Date(r.time).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

// ── ADMIN ──────────────────────────────────────────────
function AdminDashboard() {
  const [page, setPage] = useState('dashboard')
  const [auditLogs, setAuditLogs] = useState<Array<{ time: string; user: string; action: string }>>([])
  const [adminStats, setAdminStats] = useState<{ completion: number; atRiskCount: number; atRisk: Array<{ name: string; score: string; risk: string }> } | null>(null)
  const [gaps, setGaps] = useState<Array<{ term: string; count: number; docMentions: number }>>([])
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/audit').then(r => r.json()).then(d => setAuditLogs(d.logs ?? []))
    fetch('/api/admin-stats').then(r => r.json()).then(d => setAdminStats(d))
    fetch('/api/gap-analysis').then(r => r.json()).then(d => setGaps(d.gaps ?? []))
  }, [])

  async function handleUpload(file: File) {
    if (!file || file.type !== 'application/pdf') {
      setUploadStatus('Please upload a PDF file.')
      return
    }
    setUploading(true)
    setUploadStatus('Uploading and processing...')
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (data.success) {
        setUploadStatus(`✓ Uploaded: ${file.name} – ${data.chunks} sections indexed`)
      } else {
        setUploadStatus(`Error: ${data.error}`)
      }
    } catch {
      setUploadStatus('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  function exportCSV() {
    window.open('/api/export-csv', '_blank')
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
        <div style={{ fontSize: '10px', color: 'rgba(240,244,255,0.25)', textTransform: 'uppercase', letterSpacing: '1.2px', padding: '8px 14px 4px' }}>Admin</div>
        <div style={page === 'dashboard' ? navActive : navInactive} onClick={() => setPage('dashboard')}><span>🛡️</span> Overview</div>
        <div style={page === 'knowledge' ? navActive : navInactive} onClick={() => setPage('knowledge')}><span>📚</span> Knowledge Base</div>
        <div style={page === 'gaps' ? navActive : navInactive} onClick={() => setPage('gaps')}><span>🔬</span> Gap Analysis</div>
        <div style={page === 'logs' ? navActive : navInactive} onClick={() => setPage('logs')}><span>📋</span> Audit Log</div>
        <div style={page === 'invite' ? navActive : navInactive} onClick={() => setPage('invite')}><span>✉️</span> User Management</div>
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.2)', fontSize: '12px', color: '#4f8ef7', fontWeight: 600 }}>🛡️ Admin</div>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto' }}>

        {page === 'dashboard' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.6px' }}>Compliance Overview</h1>
              <p style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px', marginTop: '6px' }}>Company-wide compliance health</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Overall Completion', val: adminStats ? `${adminStats.completion}%` : '--', sub: 'avg quiz score', color: '#34d399' },
                { label: 'At Risk', val: adminStats ? `${adminStats.atRiskCount}` : '--', sub: 'employees below 60%', color: '#f87171' },
              ].map(s => (
                <div key={s.label} style={card}>
                  <div style={{ fontSize: '11px', color: 'rgba(240,244,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>{s.label}</div>
                  <div style={{ fontSize: '34px', fontWeight: 700, color: s.color, letterSpacing: '-1px' }}>{s.val}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(240,244,255,0.45)', marginTop: '4px' }}>{s.sub}</div>
                </div>
              ))}
            </div>
            <div style={card}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(240,244,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px' }}>Individual Check-In Scores</div>
              {!adminStats || adminStats.atRisk.length === 0 ? (
                <div style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px' }}>No at-risk employees.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead><tr>{['Name', 'Score', 'Risk'].map(h => <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: 'rgba(240,244,255,0.25)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {adminStats.atRisk.map(r => {
                      const color = r.risk === 'Medium' ? '#f59e0b' : '#f87171'
                      const bg = r.risk === 'Medium' ? 'rgba(245,158,11,0.12)' : 'rgba(248,113,113,0.12)'
                      const border = r.risk === 'Medium' ? 'rgba(245,158,11,0.2)' : 'rgba(248,113,113,0.2)'
                      return (
                        <tr key={r.name}>
                          <td style={{ padding: '10px 12px', color: '#f0f4ff', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{r.name}</td>
                          <td style={{ padding: '10px 12px', color, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{r.score}</td>
                          <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}><span style={{ padding: '3px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 600, background: bg, color, border: `1px solid ${border}` }}>{r.risk}</span></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {page === 'knowledge' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.6px' }}>Knowledge Base</h1>
              <p style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px', marginTop: '6px' }}>Upload handbooks and policy documents. The AI reads them instantly.</p>
            </div>
            <div
              style={{ ...card, border: uploading ? '2px dashed #4f8ef7' : '2px dashed rgba(255,255,255,0.15)', borderRadius: '18px', padding: '48px', textAlign: 'center', cursor: 'pointer', transition: 'border 0.2s' }}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleUpload(f) }}
            >
              <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f) }} />
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>📄</div>
              <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                {uploading ? 'Processing...' : 'Drop PDF here or click to upload'}
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(240,244,255,0.45)' }}>
                Employee handbook, safety manual, policy updates – any PDF
              </div>
              {uploadStatus && (
                <div style={{ marginTop: '20px', padding: '12px 20px', borderRadius: '10px', background: uploadStatus.startsWith('✓') ? 'rgba(52,211,153,0.1)' : uploadStatus.startsWith('Error') ? 'rgba(248,113,113,0.1)' : 'rgba(79,142,247,0.1)', border: `1px solid ${uploadStatus.startsWith('✓') ? 'rgba(52,211,153,0.25)' : uploadStatus.startsWith('Error') ? 'rgba(248,113,113,0.25)' : 'rgba(79,142,247,0.25)'}`, fontSize: '13px', color: uploadStatus.startsWith('✓') ? '#34d399' : uploadStatus.startsWith('Error') ? '#f87171' : '#4f8ef7', display: 'inline-block' }}>
                  {uploadStatus}
                </div>
              )}
            </div>
          </div>
        )}

        {page === 'gaps' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.6px' }}>AI Gap Analysis</h1>
              <p style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px', marginTop: '6px' }}>Topics your team asks about frequently but your documents barely cover.</p>
            </div>
            <div style={card}>
              {gaps.length === 0 && (
                <div style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px' }}>Not enough data yet. Gaps appear after your team uses Policy Chat for a few days.</div>
              )}
              {gaps.map((g, i) => (
                <div key={g.term} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '12px', background: i === 0 ? 'rgba(248,113,113,0.06)' : 'rgba(245,158,11,0.04)', border: `1px solid ${i === 0 ? 'rgba(248,113,113,0.2)' : 'rgba(245,158,11,0.12)'}`, marginBottom: '10px' }}>
                  <div style={{ fontSize: '22px' }}>{i === 0 ? '🚨' : '⚠️'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: 600, textTransform: 'capitalize', marginBottom: '4px' }}>{g.term}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(240,244,255,0.45)' }}>
                      Asked {g.count} {g.count === 1 ? 'time' : 'times'} – only {g.docMentions} {g.docMentions === 1 ? 'mention' : 'mentions'} in your documents
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '100px', background: i === 0 ? 'rgba(248,113,113,0.15)' : 'rgba(245,158,11,0.12)', color: i === 0 ? '#f87171' : '#f59e0b', border: `1px solid ${i === 0 ? 'rgba(248,113,113,0.3)' : 'rgba(245,158,11,0.25)'}` }}>
                    {i === 0 ? 'HIGH GAP' : 'GAP'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {page === 'logs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.6px' }}>Global Audit Log</h1>
                <p style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px', marginTop: '6px' }}>Every question, answer, and quiz across the whole company.</p>
              </div>
              <button onClick={exportCSV} style={{ padding: '12px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg, #34d399, #4f8ef7)', color: 'white', fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⬇ Export to CSV
              </button>
            </div>
            <div style={card}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(240,244,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px' }}>Activity Log</div>
              {auditLogs.length === 0 && <div style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px' }}>No activity yet.</div>}
              {auditLogs.map((log, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '12px', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '13px' }}>
                  <div style={{ fontFamily: 'monospace', fontSize: '11px', color: 'rgba(240,244,255,0.25)', minWidth: '160px' }}>{new Date(log.time).toLocaleString()}</div>
                  <div style={{ color: '#4f8ef7', fontWeight: 500, minWidth: '160px' }}>{log.user}</div>
                  <div style={{ color: 'rgba(240,244,255,0.45)', flex: 1 }}>{log.action}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {page === 'invite' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.6px' }}>User Management</h1>
              <p style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px', marginTop: '6px' }}>Invite employees one at a time, or upload a CSV list.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(240,244,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '16px' }}>Invite Individual</div>
                <InviteForm />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(240,244,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '16px' }}>Bulk Upload via CSV</div>
                <CsvUpload />
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

function CsvUpload() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleCsv(file: File) {
    if (!file) return
    setLoading(true)
    setStatus('Processing...')
    const text = await file.text()
    const lines = text.trim().split('\n').slice(1) // skip header
    let sent = 0
    let failed = 0
    for (const line of lines) {
      const parts = line.split(',')
      const email = parts[0]?.trim().replace(/"/g, '')
      const role = parts[1]?.trim().replace(/"/g, '') || 'worker'
      if (!email || !email.includes('@')) continue
      try {
        const res = await fetch('/api/invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, role })
        })
        const data = await res.json()
        if (data.success) sent++
        else failed++
      } catch { failed++ }
    }
    setStatus(`Done – ${sent} invites sent${failed > 0 ? `, ${failed} failed` : ''}`)
    setLoading(false)
  }

  const card = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', padding: '24px' }

  return (
    <div style={card}>
      <div style={{ fontSize: '13px', color: 'rgba(240,244,255,0.45)', marginBottom: '16px', lineHeight: 1.6 }}>
        CSV format: <code style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>email,role</code><br />
        Roles: worker, manager, admin
      </div>
      <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleCsv(f) }} />
      <button onClick={() => fileRef.current?.click()} disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#f0f4ff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'sans-serif' }}>
        {loading ? 'Sending invites...' : '📎 Upload CSV'}
      </button>
      {status && (
        <div style={{ marginTop: '14px', padding: '12px 16px', borderRadius: '10px', background: status.includes('failed') ? 'rgba(245,158,11,0.08)' : 'rgba(52,211,153,0.08)', border: `1px solid ${status.includes('failed') ? 'rgba(245,158,11,0.2)' : 'rgba(52,211,153,0.2)'}`, fontSize: '13px', color: status.includes('failed') ? '#f59e0b' : '#34d399' }}>
          {status}
        </div>
      )}
    </div>
  )
}

function InviteForm() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('worker')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  async function sendInvite() {
    if (!email.trim()) return
    setLoading(true)
    setStatus('')
    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
      })
      const data = await res.json()
      if (data.success) {
        setStatus(`Invite sent to ${email}`)
        setEmail('')
      } else {
        setStatus(`Error: ${data.error}`)
      }
    } catch {
      setStatus('Failed to send invite.')
    } finally {
      setLoading(false)
    }
  }

  const card = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', padding: '24px' }

  return (
    <div style={card}>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '12px', color: 'rgba(240,244,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '6px' }}>Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="employee@company.com"
          style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 16px', color: '#f0f4ff', fontFamily: 'sans-serif', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }} />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontSize: '12px', color: 'rgba(240,244,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '6px' }}>Role</label>
        <select value={role} onChange={e => setRole(e.target.value)}
          style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 16px', color: '#f0f4ff', fontFamily: 'sans-serif', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }}>
          <option value="worker">Worker</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button onClick={sendInvite} disabled={loading}
        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #4f8ef7, #a78bfa)', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'sans-serif' }}>
        {loading ? 'Sending...' : 'Send Invite'}
      </button>
      {status && (
        <div style={{ marginTop: '14px', padding: '12px 16px', borderRadius: '10px', background: status.includes('Error') ? 'rgba(248,113,113,0.08)' : 'rgba(52,211,153,0.08)', border: `1px solid ${status.includes('Error') ? 'rgba(248,113,113,0.2)' : 'rgba(52,211,153,0.2)'}`, fontSize: '13px', color: status.includes('Error') ? '#f87171' : '#34d399' }}>
          {status}
        </div>
      )}
    </div>
  )
}