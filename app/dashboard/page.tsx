'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

// ── DESIGN TOKENS ──────────────────────────────────────────────
// Background: warm tan #f5efe6
// Glass cards: rgba(255,255,255,0.45) with backdrop-filter blur
// Accent: sage green #7a9e7e
// Text: #2c2415 (dark warm brown)
// Secondary text: #7a6a55
// Borders: rgba(255,255,255,0.6)
// Success: #5a8a5e / Warning: #c4813a / Danger: #b85c52

const GLASS_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

  * { box-sizing: border-box; }

  body {
    background: #f5efe6;
    font-family: 'Inter', sans-serif;
    color: #2c2415;
  }

  .glass-card {
    background: rgba(255,255,255,0.45);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.65);
    border-radius: 20px;
    box-shadow: 0 4px 24px rgba(122,90,50,0.08), 0 1px 4px rgba(122,90,50,0.06);
  }

  .glass-btn {
    background: rgba(122, 158, 126, 0.18);
    backdrop-filter: blur(16px) saturate(160%);
    -webkit-backdrop-filter: blur(16px) saturate(160%);
    border: 1px solid rgba(122, 158, 126, 0.45);
    border-radius: 14px;
    color: #2c5a30;
    font-family: 'Inter', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 2px 12px rgba(122,158,126,0.2), inset 0 1px 0 rgba(255,255,255,0.6);
    position: relative;
    overflow: hidden;
  }

  .glass-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%);
    border-radius: inherit;
    pointer-events: none;
  }

  .glass-btn:hover {
    background: rgba(122, 158, 126, 0.3);
    border-color: rgba(122, 158, 126, 0.65);
    box-shadow: 0 6px 24px rgba(122,158,126,0.35), inset 0 1px 0 rgba(255,255,255,0.7);
    transform: translateY(-2px) scale(1.01);
  }

  .glass-btn:active {
    transform: translateY(1px) scale(0.98);
    box-shadow: 0 1px 6px rgba(122,158,126,0.2), inset 0 2px 4px rgba(0,0,0,0.06);
    background: rgba(122, 158, 126, 0.38);
  }

  .glass-btn-primary {
    background: rgba(122, 158, 126, 0.85);
    border: 1px solid rgba(122, 158, 126, 0.9);
    color: #fff;
    box-shadow: 0 4px 18px rgba(122,158,126,0.4), inset 0 1px 0 rgba(255,255,255,0.35);
  }

  .glass-btn-primary::before {
    background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 50%);
  }

  .glass-btn-primary:hover {
    background: rgba(100, 140, 105, 0.95);
    border-color: rgba(100, 140, 105, 1);
    box-shadow: 0 8px 28px rgba(122,158,126,0.5), inset 0 1px 0 rgba(255,255,255,0.3);
    transform: translateY(-3px) scale(1.02);
  }

  .glass-btn-primary:active {
    transform: translateY(1px) scale(0.98);
    box-shadow: 0 2px 8px rgba(122,158,126,0.3), inset 0 2px 6px rgba(0,0,0,0.1);
  }

  .glass-btn-danger {
    background: rgba(184, 92, 82, 0.15);
    border: 1px solid rgba(184, 92, 82, 0.4);
    color: #8a2e25;
    box-shadow: 0 2px 12px rgba(184,92,82,0.12), inset 0 1px 0 rgba(255,255,255,0.6);
  }

  .glass-btn-danger:hover {
    background: rgba(184, 92, 82, 0.28);
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 6px 20px rgba(184,92,82,0.28);
  }

  .glass-input {
    background: rgba(255,255,255,0.55);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.7);
    border-radius: 12px;
    padding: 13px 16px;
    color: #2c2415;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    box-shadow: 0 1px 6px rgba(122,90,50,0.06);
  }

  .glass-input:focus {
    border-color: rgba(122,158,126,0.7);
    box-shadow: 0 0 0 3px rgba(122,158,126,0.15);
  }

  .glass-input::placeholder {
    color: rgba(122,100,70,0.45);
  }

  .glass-nav-active {
    background: rgba(122,158,126,0.18);
    border: 1px solid rgba(122,158,126,0.4);
    color: #2c5a30;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .glass-nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 14px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    border: 1px solid transparent;
    color: #7a6a55;
  }

  .glass-nav-item:hover {
    background: rgba(255,255,255,0.35);
    color: #2c2415;
    border-color: rgba(255,255,255,0.5);
  }

  .glass-sidebar {
    background: rgba(245,239,230,0.75);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border-right: 1px solid rgba(255,255,255,0.5);
  }

  .playfair {
    font-family: 'Playfair Display', serif;
  }

  .quiz-option-btn {
    background: rgba(255,255,255,0.5);
    border: 1px solid rgba(255,255,255,0.65);
    border-radius: 14px;
    padding: 14px 18px;
    color: #2c2415;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    text-align: left;
    width: 100%;
    transition: all 0.15s cubic-bezier(0.34, 1.2, 0.64, 1);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: 0 1px 4px rgba(122,90,50,0.06), inset 0 1px 0 rgba(255,255,255,0.7);
  }

  .quiz-option-btn:hover {
    background: rgba(122,158,126,0.18);
    border-color: rgba(122,158,126,0.5);
    transform: translateX(4px);
    box-shadow: 0 3px 12px rgba(122,158,126,0.2);
    color: #2c5a30;
  }

  .quiz-option-btn:active {
    transform: translateX(2px) scale(0.99);
    background: rgba(122,158,126,0.3);
  }

  .badge {
    padding: 3px 10px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .badge-green {
    background: rgba(90,138,94,0.14);
    color: #2c5a30;
    border: 1px solid rgba(90,138,94,0.3);
  }

  .badge-amber {
    background: rgba(196,129,58,0.14);
    color: #7a4a10;
    border: 1px solid rgba(196,129,58,0.3);
  }

  .badge-red {
    background: rgba(184,92,82,0.14);
    color: #8a2e25;
    border: 1px solid rgba(184,92,82,0.3);
  }

  .badge-blue {
    background: rgba(80,120,200,0.12);
    color: #2a4a8a;
    border: 1px solid rgba(80,120,200,0.25);
  }

  .tag-row {
    padding: 11px 16px;
    border-radius: 12px;
    background: rgba(255,255,255,0.35);
    border: 1px solid rgba(255,255,255,0.55);
    transition: background 0.12s;
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .tag-row:hover {
    background: rgba(255,255,255,0.55);
  }

  select option {
    background: #f5efe6;
    color: #2c2415;
  }
`

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
    <>
      <style>{GLASS_STYLE}</style>
      <div style={{ background: '#f5efe6', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", color: '#7a6a55' }}>
        Loading...
      </div>
    </>
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
  const [myQuestions, setMyQuestions] = useState<any[]>([])
const [questionsLoading, setQuestionsLoading] = useState(true)

  const [questions, setQuestions] = useState<any[]>([])
  const [quizIndex, setQuizIndex] = useState(0)
  const [answers, setAnswers] = useState<Array<{ correct: boolean; selected: string }>>([])
  const [quizDone, setQuizDone] = useState(false)
  const [quizLoading, setQuizLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
  setUserId(user.id)
  const res = await fetch(`/api/my-questions?user_id=${user.id}`)
  const data = await res.json()
  setMyQuestions(data.questions ?? [])
  setQuestionsLoading(false)
}
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

  const currentQuestion = questions[quizIndex]
  const totalCorrect = answers.filter(a => a.correct).length
  const finalScore = questions.length > 0 ? Math.round((totalCorrect / questions.length) * 100) : 0

  return (
    <>
      <style>{GLASS_STYLE}</style>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f5efe6' }}>
        {/* Sidebar */}
        <aside className="glass-sidebar" style={{ width: '256px', minHeight: '100vh', padding: '28px 18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px 26px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(122,158,126,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: '0 2px 10px rgba(122,158,126,0.35), inset 0 1px 0 rgba(255,255,255,0.4)' }}>🌿</div>
            <span className="playfair" style={{ fontSize: '20px', fontWeight: 700, color: '#2c2415', letterSpacing: '-0.3px' }}>PolicyPulse</span>
          </div>
          <div style={{ fontSize: '10px', color: '#b0976c', textTransform: 'uppercase', letterSpacing: '1.4px', padding: '4px 14px 8px', fontWeight: 600 }}>Employee</div>

          <div className={`glass-nav-item ${page === 'chat' ? 'glass-nav-active' : ''}`} onClick={() => setPage('chat')}>
            <span>💬</span> Policy Chat
          </div>
          <div className={`glass-nav-item ${page === 'quiz' ? 'glass-nav-active' : ''}`} onClick={() => setPage('quiz')}>
            <span>🎯</span> Daily Quiz
          </div>
          <div className={`glass-nav-item ${page === 'questions' ? 'glass-nav-active' : ''}`} onClick={() => setPage('questions')}>
  <span>📬</span> My Questions
  {myQuestions.filter(q => q.resolved && q.manager_reply).length > 0 && (
    <span style={{ marginLeft: 'auto', background: '#2c5a30', color: '#fff', borderRadius: '100px', fontSize: '10px', fontWeight: 700, padding: '2px 7px' }}>
      {myQuestions.filter(q => q.resolved && q.manager_reply).length}
    </span>
  )}
</div>

          <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(122,90,50,0.12)' }}>
            <div style={{ padding: '10px 14px', borderRadius: '12px', background: 'rgba(122,158,126,0.12)', border: '1px solid rgba(122,158,126,0.3)', fontSize: '12px', color: '#2c5a30', fontWeight: 600 }}>
              👷 Employee
            </div>
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, padding: '36px 44px', overflowY: 'auto' }}>

          {page === 'chat' && (
            <div>
              <div style={{ marginBottom: '28px' }}>
                <h1 className="playfair" style={{ fontSize: '32px', fontWeight: 700, color: '#2c2415', letterSpacing: '-0.5px', marginBottom: '6px' }}>Policy Chat</h1>
                <p style={{ color: '#7a6a55', fontSize: '14px' }}>Ask anything. Answers come straight from your handbook.</p>
              </div>
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '540px' }}>
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {messages.map((m, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: m.role === 'ai' ? 'rgba(122,158,126,0.85)' : 'rgba(255,255,255,0.7)', border: m.role === 'ai' ? '1px solid rgba(122,158,126,0.5)' : '1px solid rgba(255,255,255,0.9)', boxShadow: '0 1px 6px rgba(122,90,50,0.1)', color: m.role === 'ai' ? '#fff' : '#7a6a55', fontWeight: 600, fontSize: '11px' }}>
                        {m.role === 'ai' ? '🌿' : 'You'}
                      </div>
                      <div style={{ maxWidth: '72%' }}>
                        <div style={{ padding: '13px 17px', borderRadius: '16px', fontSize: '14px', lineHeight: 1.65, background: m.role === 'ai' ? 'rgba(255,255,255,0.55)' : 'rgba(122,158,126,0.18)', border: m.role === 'ai' ? '1px solid rgba(255,255,255,0.7)' : '1px solid rgba(122,158,126,0.4)', color: '#2c2415', backdropFilter: 'blur(8px)', boxShadow: '0 1px 6px rgba(122,90,50,0.06)' }}>
                          {m.text}
                        </div>
                        {m.citation && (
                          <div style={{ display: 'inline-flex', marginTop: '6px', background: 'rgba(122,158,126,0.12)', border: '1px solid rgba(122,158,126,0.3)', borderRadius: '6px', padding: '3px 10px', fontSize: '11px', color: '#2c5a30', fontFamily: 'monospace', fontWeight: 500 }}>
                            📄 {m.citation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {typing && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(122,158,126,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🌿</div>
                      <div style={{ padding: '13px 17px', borderRadius: '16px', background: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.7)', color: '#b0976c', fontSize: '14px', backdropFilter: 'blur(8px)' }}>Thinking...</div>
                    </div>
                  )}
                </div>
                <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(122,90,50,0.1)', display: 'flex', gap: '10px' }}>
                  <input className="glass-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder="Ask any policy question..." style={{ flex: 1 }} />
                  <button className="glass-btn glass-btn-primary" onClick={sendChat} style={{ width: '48px', height: '48px', padding: 0, borderRadius: '12px', fontSize: '18px' }}>→</button>
                </div>
              </div>
            </div>
          )}

          {page === 'quiz' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                <div>
                  <h1 className="playfair" style={{ fontSize: '32px', fontWeight: 700, color: '#2c2415', letterSpacing: '-0.5px', marginBottom: '6px' }}>Daily Quiz</h1>
                  <p style={{ color: '#7a6a55', fontSize: '14px' }}>3 questions. Stay sharp.</p>
                </div>
                {!quizDone && !quizLoading && (
                  <span className="badge badge-green" style={{ fontSize: '12px', padding: '5px 14px' }}>
                    Question {quizIndex + 1} of {questions.length}
                  </span>
                )}
              </div>

              {quizLoading && <div style={{ color: '#7a6a55', fontSize: '14px' }}>Loading today's questions...</div>}

              {!quizLoading && !quizDone && currentQuestion && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
                  <div className="glass-card" style={{ padding: '28px' }}>
                    <div style={{ height: '5px', borderRadius: '99px', background: 'rgba(122,90,50,0.12)', marginBottom: '18px' }}>
                      <div style={{ height: '100%', width: `${(quizIndex / questions.length) * 100}%`, borderRadius: '99px', background: 'rgba(122,158,126,0.85)', transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ fontSize: '11px', color: '#b0976c', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', fontWeight: 600 }}>{currentQuestion.topic}</div>
                    <div className="playfair" style={{ fontSize: '18px', fontWeight: 600, lineHeight: 1.55, marginBottom: '22px', color: '#2c2415' }}>{currentQuestion.question}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {['A', 'B', 'C', 'D'].map(opt => (
                        <button key={opt} className="quiz-option-btn" onClick={() => answerQuestion(opt)}>
                          <span style={{ fontWeight: 700, color: '#7a9e7e', marginRight: '8px' }}>{opt}.</span>
                          {currentQuestion[`option_${opt.toLowerCase()}`]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="glass-card" style={{ padding: '28px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#b0976c', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Your Progress</div>
                    {answers.map((a, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '10px', alignItems: 'center' }}>
                        <span style={{ color: '#7a6a55' }}>Question {i + 1}</span>
                        <span className={`badge ${a.correct ? 'badge-green' : 'badge-red'}`}>{a.correct ? '✓ Correct' : '✗ Wrong'}</span>
                      </div>
                    ))}
                    {answers.length === 0 && <div style={{ color: '#b0976c', fontSize: '13px' }}>No answers yet</div>}
                  </div>
                </div>
              )}

              {!quizLoading && quizDone && (
                <div className="glass-card" style={{ padding: '40px' }}>
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: '52px', marginBottom: '14px' }}>{finalScore === 100 ? '🏆' : finalScore >= 66 ? '✅' : '📖'}</div>
                    <div className="playfair" style={{ fontSize: '52px', fontWeight: 700, color: finalScore === 100 ? '#2c5a30' : finalScore >= 66 ? '#5a8a5e' : '#c4813a', marginBottom: '8px', letterSpacing: '-1px' }}>{finalScore}%</div>
                    <div style={{ fontSize: '16px', color: '#7a6a55', marginBottom: '28px' }}>{totalCorrect} of {questions.length} correct</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', maxWidth: '500px', margin: '0 auto 28px' }}>
                      {questions.map((q, i) => (
                        <div key={i} style={{ padding: '14px 18px', borderRadius: '14px', background: answers[i]?.correct ? 'rgba(90,138,94,0.1)' : 'rgba(184,92,82,0.08)', border: `1px solid ${answers[i]?.correct ? 'rgba(90,138,94,0.25)' : 'rgba(184,92,82,0.2)'}` }}>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: answers[i]?.correct ? '#2c5a30' : '#8a2e25', marginBottom: '4px' }}>
                            {answers[i]?.correct ? '✓ Correct' : '✗ Incorrect'} – Q{i + 1}
                          </div>
                          <div style={{ fontSize: '13px', color: '#7a6a55' }}>{q.explanation}</div>
                        </div>
                      ))}
                    </div>
                    <button className="glass-btn glass-btn-primary" onClick={() => { setQuizIndex(0); setAnswers([]); setQuizDone(false) }} style={{ padding: '14px 32px' }}>
                      Retake Quiz
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {page === 'questions' && (
  <div>
    <div style={{ marginBottom: '28px' }}>
      <h1 className="playfair" style={{ fontSize: '32px', fontWeight: 700, color: '#2c2415', letterSpacing: '-0.5px', marginBottom: '6px' }}>My Questions</h1>
      <p style={{ color: '#7a6a55', fontSize: '14px' }}>Questions you asked that the AI couldn't answer. Manager replies appear here.</p>
    </div>
    <div className="glass-card" style={{ padding: '24px' }}>
      {questionsLoading && <div style={{ color: '#7a6a55', fontSize: '14px' }}>Loading...</div>}
      {!questionsLoading && myQuestions.length === 0 && (
        <div style={{ color: '#7a6a55', fontSize: '14px' }}>No escalated questions yet.</div>
      )}
      {myQuestions.map(q => (
        <div key={q.id} style={{ padding: '20px 0', borderBottom: '1px solid rgba(122,90,50,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#b0976c' }}>
              {new Date(q.created_at).toLocaleDateString()}
            </div>
            <span className={`badge ${q.resolved ? 'badge-green' : 'badge-amber'}`}>
              {q.resolved ? '✓ Answered' : '⏳ Pending'}
            </span>
          </div>
          <div style={{ fontSize: '14px', color: '#2c2415', fontWeight: 500, marginBottom: '12px', padding: '12px 16px', background: 'rgba(255,255,255,0.4)', borderRadius: '10px', fontStyle: 'italic', border: '1px solid rgba(255,255,255,0.6)' }}>
            "{q.question}"
          </div>
          {q.manager_reply ? (
            <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(90,138,94,0.08)', border: '1px solid rgba(90,138,94,0.25)' }}>
              <div style={{ fontSize: '11px', color: '#2c5a30', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                {q.manager_name ?? 'Manager'} replied {q.replied_at ? `· ${new Date(q.replied_at).toLocaleDateString()}` : ''}
              </div>
              <div style={{ fontSize: '14px', color: '#2c2415', lineHeight: 1.6 }}>{q.manager_reply}</div>
            </div>
          ) : (
            <div style={{ fontSize: '13px', color: '#b0976c' }}>Waiting for a manager to reply...</div>
          )}
        </div>
      ))}
    </div>
  </div>
)}
        </main>
      </div>
    </>
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

  const maxCount = trending.length > 0 ? trending[0].count : 1

  return (
    <>
      <style>{GLASS_STYLE}</style>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f5efe6' }}>
        {/* Sidebar */}
        <aside className="glass-sidebar" style={{ width: '256px', minHeight: '100vh', padding: '28px 18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px 26px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(122,158,126,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: '0 2px 10px rgba(122,158,126,0.35), inset 0 1px 0 rgba(255,255,255,0.4)' }}>🌿</div>
            <span className="playfair" style={{ fontSize: '20px', fontWeight: 700, color: '#2c2415', letterSpacing: '-0.3px' }}>PolicyPulse</span>
          </div>
          <div style={{ fontSize: '10px', color: '#b0976c', textTransform: 'uppercase', letterSpacing: '1.4px', padding: '4px 14px 8px', fontWeight: 600 }}>Manager</div>

          <div className={`glass-nav-item ${page === 'snapshot' ? 'glass-nav-active' : ''}`} onClick={() => setPage('snapshot')}>
            <span>📊</span> Team Snapshot
          </div>
          <div className={`glass-nav-item ${page === 'inbox' ? 'glass-nav-active' : ''}`} onClick={() => setPage('inbox')}>
            <span>📩</span> Needs Answer
            {escalations.filter(e => !e.resolved).length > 0 && (
              <span style={{ marginLeft: 'auto', background: '#b85c52', color: '#fff', borderRadius: '100px', fontSize: '10px', fontWeight: 700, padding: '2px 7px' }}>
                {escalations.filter(e => !e.resolved).length}
              </span>
            )}
          </div>
          <div className={`glass-nav-item ${page === 'trending' ? 'glass-nav-active' : ''}`} onClick={() => setPage('trending')}>
            <span>📈</span> Trending Topics
          </div>
          <div className={`glass-nav-item ${page === 'search' ? 'glass-nav-active' : ''}`} onClick={() => setPage('search')}>
            <span>🔍</span> Audit Search
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(122,90,50,0.12)' }}>
            <div style={{ padding: '10px 14px', borderRadius: '12px', background: 'rgba(196,129,58,0.12)', border: '1px solid rgba(196,129,58,0.3)', fontSize: '12px', color: '#7a4a10', fontWeight: 600 }}>
              🗂️ Manager
            </div>
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, padding: '36px 44px', overflowY: 'auto' }}>

          {page === 'snapshot' && (
            <div>
              <div style={{ marginBottom: '28px' }}>
                <h1 className="playfair" style={{ fontSize: '32px', fontWeight: 700, color: '#2c2415', letterSpacing: '-0.5px', marginBottom: '6px' }}>Team Snapshot</h1>
                <p style={{ color: '#7a6a55', fontSize: '14px' }}>Today's knowledge check results for your team.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '18px', marginBottom: '24px' }}>
                {[
                  { label: 'Completed', val: pulseData ? `${pulseData.completed}` : '--', sub: `of ${pulseData?.total ?? '--'} members`, color: '#2c5a30', bg: 'rgba(90,138,94,0.1)', border: 'rgba(90,138,94,0.25)' },
                  { label: 'Avg Score', val: pulseData ? `${pulseData.avgScore}%` : '--', sub: 'today', color: '#2a4a8a', bg: 'rgba(80,120,200,0.08)', border: 'rgba(80,120,200,0.2)' },
                  { label: 'Not Started', val: pulseData ? `${(pulseData.total ?? 0) - (pulseData.completed ?? 0)}` : '--', sub: 'need a nudge', color: '#7a4a10', bg: 'rgba(196,129,58,0.1)', border: 'rgba(196,129,58,0.25)' },
                ].map(s => (
                  <div key={s.label} className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ fontSize: '11px', color: '#b0976c', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', fontWeight: 600 }}>{s.label}</div>
                    <div className="playfair" style={{ fontSize: '40px', fontWeight: 700, color: s.color, letterSpacing: '-1px', lineHeight: 1 }}>{s.val}</div>
                    <div style={{ fontSize: '12px', color: '#7a6a55', marginTop: '6px' }}>{s.sub}</div>
                  </div>
                ))}
              </div>
              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#b0976c', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Team Results</div>
                {(!pulseData?.team || pulseData.team.length === 0) && (
                  <div style={{ color: '#7a6a55', fontSize: '14px' }}>No team data yet.</div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(pulseData?.team ?? []).map((row: any) => (
                    <div key={row.name} className="tag-row">
                      <div style={{ fontSize: '20px' }}>{row.completed ? '✅' : '⏳'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#2c2415' }}>{row.name}</div>
                        <div style={{ fontSize: '12px', color: '#7a6a55', marginTop: '2px' }}>
                          {row.completed ? `Score: ${row.score}%` : 'Has not completed today\'s quiz'}
                        </div>
                      </div>
                      <span className={`badge ${row.completed ? 'badge-green' : 'badge-red'}`}>
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
              <div style={{ marginBottom: '28px' }}>
                <h1 className="playfair" style={{ fontSize: '32px', fontWeight: 700, color: '#2c2415', letterSpacing: '-0.5px', marginBottom: '6px' }}>Needs Answer</h1>
                <p style={{ color: '#7a6a55', fontSize: '14px' }}>Questions the AI couldn't answer. Reply and it goes straight to the employee.</p>
              </div>
              <div className="glass-card" style={{ padding: '24px' }}>
                {escalations.length === 0 && (
                  <div style={{ color: '#7a6a55', fontSize: '14px', padding: '16px 0' }}>No open questions. All clear.</div>
                )}
                {escalations.map(e => (
                  <div key={e.id} style={{ padding: '20px 0', borderBottom: '1px solid rgba(122,90,50,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: '#2c2415' }}>{e.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ fontSize: '11px', color: '#b0976c', fontFamily: 'monospace' }}>{new Date(e.time).toLocaleString()}</div>
                        <span className={`badge ${e.resolved ? 'badge-green' : 'badge-red'}`}>
                          {e.resolved ? 'Resolved' : 'Needs Answer'}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', color: '#7a6a55', marginBottom: '14px', padding: '12px 16px', background: 'rgba(255,255,255,0.4)', borderRadius: '10px', fontStyle: 'italic', border: '1px solid rgba(255,255,255,0.6)' }}>"{e.question}"</div>
                    {!e.resolved && !replySent[e.id] && (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                          className="glass-input"
                          value={replyText[e.id] ?? ''}
                          onChange={ev => setReplyText(p => ({ ...p, [e.id]: ev.target.value }))}
                          onKeyDown={ev => ev.key === 'Enter' && sendReply(e.id)}
                          placeholder="Type your answer and press Enter..."
                          style={{ flex: 1 }}
                        />
                        <button
                          className="glass-btn glass-btn-primary"
                          onClick={() => sendReply(e.id)}
                          disabled={replySending[e.id]}
                          style={{ padding: '13px 22px' }}>
                          {replySending[e.id] ? 'Sending...' : 'Send Reply'}
                        </button>
                      </div>
                    )}
                    {replySent[e.id] && (
                      <div style={{ fontSize: '13px', color: '#2c5a30', fontWeight: 500 }}>✓ Reply sent to employee</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {page === 'trending' && (
            <div>
              <div style={{ marginBottom: '28px' }}>
                <h1 className="playfair" style={{ fontSize: '32px', fontWeight: 700, color: '#2c2415', letterSpacing: '-0.5px', marginBottom: '6px' }}>Trending Topics</h1>
                <p style={{ color: '#7a6a55', fontSize: '14px' }}>What your team is asking about most – last 30 days. Use this in your morning stand-up.</p>
              </div>
              <div className="glass-card" style={{ padding: '28px' }}>
                {trending.length === 0 && (
                  <div style={{ color: '#7a6a55', fontSize: '14px' }}>No data yet. Topics appear as your team uses Policy Chat.</div>
                )}
                {trending.map((t, i) => (
                  <div key={t.term} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#b0976c', minWidth: '22px', textAlign: 'right', fontWeight: 600 }}>#{i + 1}</div>
                    <div style={{ fontSize: '14px', fontWeight: 500, minWidth: '140px', textTransform: 'capitalize', color: '#2c2415' }}>{t.term}</div>
                    <div style={{ flex: 1, height: '8px', borderRadius: '99px', background: 'rgba(122,90,50,0.1)' }}>
                      <div style={{ height: '100%', width: `${Math.round((t.count / maxCount) * 100)}%`, borderRadius: '99px', background: i === 0 ? '#b85c52' : i <= 2 ? '#c4813a' : '#7a9e7e', transition: 'width 0.4s' }} />
                    </div>
                    <div style={{ fontSize: '13px', fontFamily: 'monospace', color: '#7a6a55', minWidth: '70px', textAlign: 'right' }}>{t.count} {t.count === 1 ? 'query' : 'queries'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {page === 'search' && (
            <div>
              <div style={{ marginBottom: '28px' }}>
                <h1 className="playfair" style={{ fontSize: '32px', fontWeight: 700, color: '#2c2415', letterSpacing: '-0.5px', marginBottom: '6px' }}>Audit Search</h1>
                <p style={{ color: '#7a6a55', fontSize: '14px' }}>Search any employee's full history of questions and quiz scores.</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                <input
                  className="glass-input"
                  value={searchName}
                  onChange={e => setSearchName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchEmployee()}
                  placeholder="Enter employee name..."
                  style={{ flex: 1 }}
                />
                <button className="glass-btn glass-btn-primary" onClick={searchEmployee} style={{ padding: '13px 28px' }}>
                  Search
                </button>
              </div>
              {searchLoading && <div style={{ color: '#7a6a55', fontSize: '14px' }}>Searching...</div>}
              {!searchLoading && searchFound !== null && (
                <div style={{ fontSize: '12px', color: '#b0976c', marginBottom: '16px' }}>
                  {searchFound === 0 ? 'No employee found with that name.' : `Found ${searchFound} employee${searchFound > 1 ? 's' : ''} – showing all activity`}
                </div>
              )}
              {searchResults.length > 0 && (
                <div className="glass-card" style={{ padding: '24px' }}>
                  {searchResults.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '12px 0', borderBottom: '1px solid rgba(122,90,50,0.07)' }}>
                      <span className={`badge ${r.type === 'chat' ? 'badge-blue' : 'badge-green'}`} style={{ whiteSpace: 'nowrap' as const }}>
                        {r.type === 'chat' ? '💬 Chat' : '🎯 Quiz'}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '3px', color: '#2c2415' }}>
                          {r.type === 'chat' ? r.question : `Quiz Score: ${r.score}%`}
                        </div>
                        {r.type === 'chat' && r.escalated && (
                          <span style={{ fontSize: '10px', color: '#8a2e25', fontWeight: 600 }}>⚠ Escalated</span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#b0976c', whiteSpace: 'nowrap' as const }}>
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
    </>
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

  return (
    <>
      <style>{GLASS_STYLE}</style>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f5efe6' }}>
        {/* Sidebar */}
        <aside className="glass-sidebar" style={{ width: '256px', minHeight: '100vh', padding: '28px 18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px 26px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(122,158,126,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: '0 2px 10px rgba(122,158,126,0.35), inset 0 1px 0 rgba(255,255,255,0.4)' }}>🌿</div>
            <span className="playfair" style={{ fontSize: '20px', fontWeight: 700, color: '#2c2415', letterSpacing: '-0.3px' }}>PolicyPulse</span>
          </div>
          <div style={{ fontSize: '10px', color: '#b0976c', textTransform: 'uppercase', letterSpacing: '1.4px', padding: '4px 14px 8px', fontWeight: 600 }}>Admin</div>

          <div className={`glass-nav-item ${page === 'dashboard' ? 'glass-nav-active' : ''}`} onClick={() => setPage('dashboard')}>
            <span>🛡️</span> Overview
          </div>
          <div className={`glass-nav-item ${page === 'knowledge' ? 'glass-nav-active' : ''}`} onClick={() => setPage('knowledge')}>
            <span>📂</span> Knowledge Base
          </div>
          <div className={`glass-nav-item ${page === 'gaps' ? 'glass-nav-active' : ''}`} onClick={() => setPage('gaps')}>
            <span>🔬</span> Gap Analysis
          </div>
          <div className={`glass-nav-item ${page === 'logs' ? 'glass-nav-active' : ''}`} onClick={() => setPage('logs')}>
            <span>🗒️</span> Audit Log
          </div>
          <div className={`glass-nav-item ${page === 'invite' ? 'glass-nav-active' : ''}`} onClick={() => setPage('invite')}>
            <span>👥</span> User Management
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(122,90,50,0.12)' }}>
            <div style={{ padding: '10px 14px', borderRadius: '12px', background: 'rgba(80,120,200,0.1)', border: '1px solid rgba(80,120,200,0.25)', fontSize: '12px', color: '#2a4a8a', fontWeight: 600 }}>
              🛡️ Admin
            </div>
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, padding: '36px 44px', overflowY: 'auto' }}>

          {page === 'dashboard' && (
            <div>
              <div style={{ marginBottom: '28px' }}>
                <h1 className="playfair" style={{ fontSize: '32px', fontWeight: 700, color: '#2c2415', letterSpacing: '-0.5px', marginBottom: '6px' }}>Compliance Overview</h1>
                <p style={{ color: '#7a6a55', fontSize: '14px' }}>Company-wide compliance health</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '18px', marginBottom: '24px' }}>
                {[
                  { label: 'Overall Completion', val: adminStats ? `${adminStats.completion}%` : '--', sub: 'avg quiz score', color: '#2c5a30' },
                  { label: 'At Risk', val: adminStats ? `${adminStats.atRiskCount}` : '--', sub: 'employees below 60%', color: '#8a2e25' },
                ].map(s => (
                  <div key={s.label} className="glass-card" style={{ padding: '28px' }}>
                    <div style={{ fontSize: '11px', color: '#b0976c', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', fontWeight: 600 }}>{s.label}</div>
                    <div className="playfair" style={{ fontSize: '48px', fontWeight: 700, color: s.color, letterSpacing: '-1.5px', lineHeight: 1 }}>{s.val}</div>
                    <div style={{ fontSize: '12px', color: '#7a6a55', marginTop: '8px' }}>{s.sub}</div>
                  </div>
                ))}
              </div>
              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#b0976c', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Individual Check-In Scores</div>
                {!adminStats || adminStats.atRisk.length === 0 ? (
                  <div style={{ color: '#7a6a55', fontSize: '14px' }}>No at-risk employees.</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr>
                        {['Name', 'Score', 'Risk'].map(h => (
                          <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#b0976c', borderBottom: '1px solid rgba(122,90,50,0.1)', letterSpacing: '0.8px' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {adminStats.atRisk.map(r => (
                        <tr key={r.name}>
                          <td style={{ padding: '11px 12px', color: '#2c2415', borderBottom: '1px solid rgba(122,90,50,0.06)', fontWeight: 500 }}>{r.name}</td>
                          <td style={{ padding: '11px 12px', color: r.risk === 'Medium' ? '#7a4a10' : '#8a2e25', borderBottom: '1px solid rgba(122,90,50,0.06)', fontWeight: 600 }}>{r.score}</td>
                          <td style={{ padding: '11px 12px', borderBottom: '1px solid rgba(122,90,50,0.06)' }}>
                            <span className={`badge ${r.risk === 'Medium' ? 'badge-amber' : 'badge-red'}`}>{r.risk}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {page === 'knowledge' && (
            <div>
              <div style={{ marginBottom: '28px' }}>
                <h1 className="playfair" style={{ fontSize: '32px', fontWeight: 700, color: '#2c2415', letterSpacing: '-0.5px', marginBottom: '6px' }}>Knowledge Base</h1>
                <p style={{ color: '#7a6a55', fontSize: '14px' }}>Upload handbooks and policy documents. The AI reads them instantly.</p>
              </div>
              <div
                className="glass-card"
                style={{ border: uploading ? '2px dashed rgba(122,158,126,0.6)' : '2px dashed rgba(122,90,50,0.2)', borderRadius: '20px', padding: '56px', textAlign: 'center', cursor: 'pointer', transition: 'border 0.2s, background 0.2s', background: uploading ? 'rgba(122,158,126,0.08)' : undefined }}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleUpload(f) }}
              >
                <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f) }} />
                <div style={{ fontSize: '44px', marginBottom: '18px' }}>📄</div>
                <div className="playfair" style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px', color: '#2c2415' }}>
                  {uploading ? 'Processing...' : 'Drop PDF here or click to upload'}
                </div>
                <div style={{ fontSize: '13px', color: '#7a6a55' }}>
                  Employee handbook, safety manual, policy updates – any PDF
                </div>
                {uploadStatus && (
                  <div style={{ marginTop: '22px', padding: '12px 22px', borderRadius: '12px', background: uploadStatus.startsWith('✓') ? 'rgba(90,138,94,0.12)' : uploadStatus.startsWith('Error') ? 'rgba(184,92,82,0.1)' : 'rgba(122,158,126,0.1)', border: `1px solid ${uploadStatus.startsWith('✓') ? 'rgba(90,138,94,0.3)' : uploadStatus.startsWith('Error') ? 'rgba(184,92,82,0.25)' : 'rgba(122,158,126,0.3)'}`, fontSize: '13px', color: uploadStatus.startsWith('✓') ? '#2c5a30' : uploadStatus.startsWith('Error') ? '#8a2e25' : '#2c5a30', display: 'inline-block', fontWeight: 500 }}>
                    {uploadStatus}
                  </div>
                )}
              </div>
            </div>
          )}

          {page === 'gaps' && (
            <div>
              <div style={{ marginBottom: '28px' }}>
                <h1 className="playfair" style={{ fontSize: '32px', fontWeight: 700, color: '#2c2415', letterSpacing: '-0.5px', marginBottom: '6px' }}>Gap Analysis</h1>
                <p style={{ color: '#7a6a55', fontSize: '14px' }}>Topics your team asks about frequently but your documents barely cover.</p>
              </div>
              <div className="glass-card" style={{ padding: '24px' }}>
                {gaps.length === 0 && (
                  <div style={{ color: '#7a6a55', fontSize: '14px' }}>Not enough data yet. Gaps appear after your team uses Policy Chat for a few days.</div>
                )}
                {gaps.map((g, i) => (
                  <div key={g.term} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '14px', background: i === 0 ? 'rgba(184,92,82,0.07)' : 'rgba(196,129,58,0.06)', border: `1px solid ${i === 0 ? 'rgba(184,92,82,0.2)' : 'rgba(196,129,58,0.15)'}`, marginBottom: '10px' }}>
                    <div style={{ fontSize: '22px' }}>{i === 0 ? '🚨' : '⚠️'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '15px', fontWeight: 600, textTransform: 'capitalize', marginBottom: '4px', color: '#2c2415' }}>{g.term}</div>
                      <div style={{ fontSize: '12px', color: '#7a6a55' }}>
                        Asked {g.count} {g.count === 1 ? 'time' : 'times'} – only {g.docMentions} {g.docMentions === 1 ? 'mention' : 'mentions'} in your documents
                      </div>
                    </div>
                    <span className={`badge ${i === 0 ? 'badge-red' : 'badge-amber'}`}>
                      {i === 0 ? 'HIGH GAP' : 'GAP'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {page === 'logs' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                <div>
                  <h1 className="playfair" style={{ fontSize: '32px', fontWeight: 700, color: '#2c2415', letterSpacing: '-0.5px', marginBottom: '6px' }}>Global Audit Log</h1>
                  <p style={{ color: '#7a6a55', fontSize: '14px' }}>Every question, answer, and quiz across the whole company.</p>
                </div>
                <button className="glass-btn glass-btn-primary" onClick={exportCSV} style={{ padding: '13px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  ⬇ Export to CSV
                </button>
              </div>
              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#b0976c', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Activity Log</div>
                {auditLogs.length === 0 && <div style={{ color: '#7a6a55', fontSize: '14px' }}>No activity yet.</div>}
                {auditLogs.map((log, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(122,90,50,0.07)', fontSize: '13px' }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#b0976c', minWidth: '160px' }}>{new Date(log.time).toLocaleString()}</div>
                    <div style={{ color: '#2c5a30', fontWeight: 600, minWidth: '160px' }}>{log.user}</div>
                    <div style={{ color: '#7a6a55', flex: 1 }}>{log.action}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {page === 'invite' && (
            <div>
              <div style={{ marginBottom: '28px' }}>
                <h1 className="playfair" style={{ fontSize: '32px', fontWeight: 700, color: '#2c2415', letterSpacing: '-0.5px', marginBottom: '6px' }}>User Management</h1>
                <p style={{ color: '#7a6a55', fontSize: '14px' }}>Invite employees one at a time, or upload a CSV list.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#b0976c', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>Invite Individual</div>
                  <InviteForm />
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#b0976c', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>Bulk Upload via CSV</div>
                  <CsvUpload />
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </>
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
    const lines = text.trim().split('\n').slice(1)
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

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ fontSize: '13px', color: '#7a6a55', marginBottom: '18px', lineHeight: 1.65 }}>
        CSV format: <code style={{ background: 'rgba(122,90,50,0.1)', padding: '2px 8px', borderRadius: '5px', fontSize: '12px', color: '#2c2415', fontWeight: 600 }}>email,role</code><br />
        Roles: worker, manager, admin
      </div>
      <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleCsv(f) }} />
      <button className="glass-btn" onClick={() => fileRef.current?.click()} disabled={loading} style={{ width: '100%', padding: '14px' }}>
        {loading ? 'Sending invites...' : '📎 Upload CSV'}
      </button>
      {status && (
        <div style={{ marginTop: '14px', padding: '12px 16px', borderRadius: '12px', background: status.includes('failed') ? 'rgba(196,129,58,0.1)' : 'rgba(90,138,94,0.1)', border: `1px solid ${status.includes('failed') ? 'rgba(196,129,58,0.25)' : 'rgba(90,138,94,0.25)'}`, fontSize: '13px', color: status.includes('failed') ? '#7a4a10' : '#2c5a30', fontWeight: 500 }}>
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

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '11px', color: '#b0976c', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '7px', fontWeight: 700 }}>Email</label>
        <input className="glass-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="employee@company.com" style={{ width: '100%', boxSizing: 'border-box' as const }} />
      </div>
      <div style={{ marginBottom: '22px' }}>
        <label style={{ fontSize: '11px', color: '#b0976c', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '7px', fontWeight: 700 }}>Role</label>
        <select className="glass-input" value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%', boxSizing: 'border-box' as const, cursor: 'pointer' }}>
          <option value="worker">Worker</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button className="glass-btn glass-btn-primary" onClick={sendInvite} disabled={loading} style={{ width: '100%', padding: '15px' }}>
        {loading ? 'Sending...' : 'Send Invite'}
      </button>
      {status && (
        <div style={{ marginTop: '14px', padding: '12px 16px', borderRadius: '12px', background: status.includes('Error') ? 'rgba(184,92,82,0.1)' : 'rgba(90,138,94,0.1)', border: `1px solid ${status.includes('Error') ? 'rgba(184,92,82,0.25)' : 'rgba(90,138,94,0.25)'}`, fontSize: '13px', color: status.includes('Error') ? '#8a2e25' : '#2c5a30', fontWeight: 500 }}>
          {status}
        </div>
      )}
    </div>
  )
}