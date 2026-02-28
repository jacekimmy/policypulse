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
    { role: 'ai', text: "Hi! I'm your Policy Assistant. I've read the full Employee Handbook and can answer any question instantly, with an exact page citation every time. What do you need to know?" },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const [onboardingSteps, setOnboardingSteps] = useState<Array<{ step_number: number; label: string; completed: boolean; completed_at: string | null }>>([])
  const [onboardingLoading, setOnboardingLoading] = useState(true)

  const [questions, setQuestions] = useState<any[]>([])
  const [quizIndex, setQuizIndex] = useState(0)
  const [answers, setAnswers] = useState<Array<{ correct: boolean; selected: string }>>([])
  const [quizDone, setQuizDone] = useState(false)
  const [quizLoading, setQuizLoading] = useState(true)

  useEffect(() => {
    async function loadOnboarding() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase
        .from('onboarding_steps')
        .select('*')
        .eq('user_id', user.id)
        .order('step_number')
      setOnboardingSteps(data ?? [])
      setOnboardingLoading(false)
    }
    loadOnboarding()
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
          body: JSON.stringify({
            user_id: user.id,
            question_id: 'daily-quiz',
            correct: totalCorrect === questions.length,
            score
          })
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
              <p style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px', marginTop: '6px' }}>Ask anything. Answers come straight from your firm's handbook.</p>
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

            {quizLoading && (
              <div style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px' }}>Loading questions...</div>
            )}

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
  const [page, setPage] = useState('pulse')
  const [pulseData, setPulseData] = useState<any>(null)
  const [escalations, setEscalations] = useState<any[]>([])

  useEffect(() => {
    async function loadPulse() {
      const res = await fetch('/api/manager')
      const data = await res.json()
      setPulseData(data)
    }
    loadPulse()
  }, [])

  useEffect(() => {
    async function loadEscalations() {
      const res = await fetch('/api/escalations')
      const data = await res.json()
      setEscalations(data.escalations ?? [])
    }
    loadEscalations()
  }, [])

  const card = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', padding: '24px' }
  const navActive = { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', color: '#f59e0b', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' } as React.CSSProperties
  const navInactive = { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', color: 'rgba(240,244,255,0.45)', background: 'transparent', border: '1px solid transparent' } as React.CSSProperties

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
              <p style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px', marginTop: '6px' }}>Team quiz results for today</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Completed', val: pulseData ? `${pulseData.completed}` : '--', sub: `of ${pulseData?.total ?? '--'} members`, color: '#34d399' },
                { label: 'Avg Score', val: pulseData ? `${pulseData.avgScore}%` : '--', sub: 'today', color: '#4f8ef7' },
                { label: 'Not Started', val: pulseData ? `${(pulseData.total ?? 0) - (pulseData.completed ?? 0)}` : '--', sub: 'reminders sent', color: '#f59e0b' },
                { label: "Today's Topic", val: 'SEC 17a-4', sub: 'record retention', color: '#f0f4ff' }
              ].map(s => (
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
                  {(pulseData?.team ?? []).map((row: any) => (
                    <tr key={row.name}>
                      <td style={{ padding: '12px 16px', color: '#f0f4ff', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{row.name}</td>
                      <td style={{ padding: '12px 16px', color: 'rgba(240,244,255,0.45)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{row.completed ? 'Today' : '--'}</td>
                      <td style={{ padding: '12px 16px', color: row.score === 100 ? '#34d399' : row.score !== null ? '#f59e0b' : '#f87171', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{row.score !== null ? `${row.score}%` : '--'}</td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', width: '140px' }}>
                        <div style={{ height: '6px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)' }}>
                          <div style={{ height: '100%', width: `${row.score ?? 0}%`, borderRadius: '99px', background: row.score === 100 ? '#34d399' : row.score !== null ? '#f59e0b' : '#f87171' }} />
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 600, background: row.completed ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)', color: row.completed ? '#34d399' : '#f87171', border: `1px solid ${row.completed ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}` }}>
                          {row.completed ? '✓ Done' : '⚠ Missing'}
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
              {[{ icon: '🚨', title: 'Travel Reimbursement – High Confusion', desc: '12 questions asked this week. Workers unclear on international limits.' }, { icon: '⚠️', title: 'Resignation Notice Period – Trending', desc: '7 questions in 3 days. Possible team anxiety signal.' }].map(a => (
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
              {escalations.length === 0 && (
                <div style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px', padding: '16px 0' }}>No unresolved escalations.</div>
              )}
              {escalations.map(e => (
                <div key={e.id} style={{ padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{e.name} – {new Date(e.time).toLocaleString()}</div>
                    <span style={{ padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 600, background: e.resolved ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)', color: e.resolved ? '#34d399' : '#f87171', border: `1px solid ${e.resolved ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}` }}>
                      {e.resolved ? 'Resolved' : 'Unresolved'}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'rgba(240,244,255,0.45)', marginBottom: '12px' }}>"{e.question}"</div>
                  {!e.resolved && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#f0f4ff', fontFamily: 'sans-serif' }}>Reply</button>
                      <button onClick={async () => {
                        await fetch('/api/escalations', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: e.id }) })
                        setEscalations(prev => prev.map(x => x.id === e.id ? { ...x, resolved: true } : x))
                      }} style={{ padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid rgba(52,211,153,0.25)', background: 'rgba(52,211,153,0.08)', color: '#34d399', fontFamily: 'sans-serif' }}>Mark Resolved</button>
                    </div>
                  )}
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
  const [auditLogs, setAuditLogs] = useState<Array<{ time: string; user: string; action: string }>>([])
  const [adminStats, setAdminStats] = useState<{ completion: number; atRiskCount: number; atRisk: Array<{ name: string; score: string; risk: string }> } | null>(null)

  useEffect(() => {
    async function loadAudit() {
      const res = await fetch('/api/audit')
      const data = await res.json()
      setAuditLogs(data.logs ?? [])
    }
    loadAudit()
  }, [])

  useEffect(() => {
    async function loadStats() {
      const res = await fetch('/api/admin-stats')
      const data = await res.json()
      setAdminStats(data)
    }
    loadStats()
  }, [])

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
        <div style={page === 'dashboard' ? navActive : navInactive} onClick={() => setPage('dashboard')}><span>🛡️</span> Compliance Dashboard</div>
        <div style={page === 'logs' ? navActive : navInactive} onClick={() => setPage('logs')}><span>📋</span> Audit Logs</div>
        <div style={page === 'invite' ? navActive : navInactive} onClick={() => setPage('invite')}><span>✉️</span> Invite Users</div>
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.2)', fontSize: '12px', color: '#4f8ef7', fontWeight: 600 }}>🛡️ Admin</div>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto' }}>

        {page === 'dashboard' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.6px' }}>Compliance Dashboard</h1>
              <p style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px', marginTop: '6px' }}>Birds-eye view – SEC/FINRA audit readiness</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Overall Completion', val: adminStats ? `${adminStats.completion}%` : '--', sub: 'avg quiz score', color: '#34d399' },
                { label: 'At Risk', val: adminStats ? `${adminStats.atRiskCount}` : '--', sub: 'employees below 60%', color: '#f87171' },
              ].map(s => (
                <div key={s.label} style={card}>
                  <div style={{ fontSize: '11px', color: 'rgba(240,244,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>{s.label}</div>
                  <div style={{ fontSize: s.label === 'Next Audit' ? '22px' : '34px', fontWeight: 700, color: s.color, letterSpacing: '-1px' }}>{s.val}</div>
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
              <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.6px' }}>Invite Users</h1>
              <p style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px', marginTop: '6px' }}>Send an invite link to a new employee.</p>
            </div>
            <InviteForm />
          </div>
        )}

      </main>
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
    <div style={{ ...card, maxWidth: '480px' }}>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '12px', color: 'rgba(240,244,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '6px' }}>Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="employee@firm.com"
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