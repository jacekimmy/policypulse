'use client'

import { useState, useRef, useEffect } from "react";

const ORG_ID = "demo";

const HARDCODED_QUIZ = [
  {
    id: "q1",
    topic: "Abuse Reporting – 105 CMR 155.00",
    question: "You notice unexplained bruising on a 74-year-old client's arms. What are you legally required to do under 105 CMR 155.00?",
    option_a: "Document it in your notes and mention it at the next team meeting",
    option_b: "Ask the client's family about it before taking action",
    option_c: "Report it immediately to your supervisor and follow your agency's written abuse reporting policy",
    option_d: "Wait to see if more signs appear before reporting",
    correct_option: "C",
    explanation: "105 CMR 155.00 requires all home health agency staff to report suspected abuse immediately per the agency's written policies and procedures. Waiting or asking family first is not compliant."
  },
  {
    id: "q2",
    topic: "Staffing & Training – 651 CMR 12.00",
    question: "Under 651 CMR 12.00, what must an Assisted Living Residence do before a new staff member provides direct care to residents?",
    option_a: "Have them shadow another caregiver for one week",
    option_b: "Ensure they complete required orientation and training as outlined in the residence's staffing plan",
    option_c: "Get written approval from the resident's family",
    option_d: "Submit their credentials to EOEA for review",
    correct_option: "B",
    explanation: "651 CMR 12.06 and 12.07 require that all staff complete orientation and training that meets state standards before providing direct care. The residence must maintain a documented staffing and training plan."
  },
  {
    id: "q3",
    topic: "Resident Rights – 651 CMR 12.00",
    question: "A resident at your assisted living facility wants to refuse a scheduled medication. Under 651 CMR 12.00, what is the correct response?",
    option_a: "Administer the medication anyway since it was ordered by a doctor",
    option_b: "Contact the family to get permission to override the refusal",
    option_c: "Respect the resident's right to refuse and document the refusal per your agency's policy",
    option_d: "Call 911 if the medication is critical",
    correct_option: "C",
    explanation: "651 CMR 12.08 protects resident rights including the right to refuse treatment. Staff must respect this decision, document it clearly, and notify the appropriate care team member — not override it."
  }
];

function IconLayers({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>);
}
function IconSend({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>);
}
function IconTarget({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>);
}
function IconChat({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>);
}
function IconCheck({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>);
}
function IconX({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
}
function IconFile({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>);
}
function IconAward({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>);
}
function IconGlobe({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>);
}
function IconMail({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>);
}

const SUGGESTED_QUESTIONS = [
  { text: "What are the hand hygiene rules?", lang: "en" },
  { text: "How do I report suspected abuse?", lang: "en" },
  { text: "What are the medication administration rules?", lang: "en" },
  { text: "¿Cuáles son las normas de control de infecciones?", lang: "es" },
];

const OPTIONS = ["A", "B", "C", "D"] as const;

export default function PolicyPulseDemo() {
  const [page, setPage] = useState("chat");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f4f0ea; font-family: 'DM Sans', sans-serif; color: #2c2415; }
        .glass-card {
          background: rgba(255,255,255,0.38);
          backdrop-filter: blur(40px) saturate(180%);
          -webkit-backdrop-filter: blur(40px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.55);
          border-radius: 24px;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.2), 0 4px 24px rgba(100,80,50,0.06), inset 0 1px 0 rgba(255,255,255,0.6);
          position: relative; overflow: hidden;
        }
        .glass-card::before {
          content: ''; position: absolute; inset: 0; border-radius: inherit;
          background: linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.05) 35%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.1) 100%);
          pointer-events: none; z-index: 0;
        }
        .glass-card > * { position: relative; z-index: 1; }
        .glass-input {
          background: rgba(255,255,255,0.45); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.6); border-radius: 14px; padding: 14px 18px;
          color: #2c2415; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
          outline: none; transition: all 0.18s ease;
          box-shadow: 0 1px 4px rgba(100,80,50,0.04), inset 0 1px 0 rgba(255,255,255,0.5);
        }
        .glass-input:focus {
          border-color: rgba(122,158,126,0.6);
          box-shadow: 0 0 0 3px rgba(122,158,126,0.1), 0 2px 8px rgba(122,158,126,0.06);
          background: rgba(255,255,255,0.65);
        }
        .glass-input::placeholder { color: rgba(120,100,70,0.38); font-weight: 400; }
        .glass-btn-primary {
          background: linear-gradient(135deg, rgba(122,158,126,0.88) 0%, rgba(95,135,100,0.95) 100%);
          border: 1px solid rgba(122,158,126,0.8); color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer;
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 4px 18px rgba(122,158,126,0.3), inset 0 1px 0 rgba(255,255,255,0.3);
          display: inline-flex; align-items: center; justify-content: center; gap: 8px; border-radius: 14px;
        }
        .glass-btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(105,148,110,0.95) 0%, rgba(80,125,85,1) 100%);
          box-shadow: 0 8px 28px rgba(122,158,126,0.4); transform: translateY(-2px);
        }
        .glass-btn-primary:disabled { opacity: 0.5; cursor: default; }
        .chat-bubble-ai {
          background: rgba(255,255,255,0.5); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.6); border-radius: 18px 18px 18px 6px;
          box-shadow: 0 1px 6px rgba(100,80,50,0.04), inset 0 1px 0 rgba(255,255,255,0.5);
        }
        .chat-bubble-user {
          background: rgba(122,158,126,0.14); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(122,158,126,0.3); border-radius: 18px 18px 6px 18px;
        }
        .quiz-option-btn {
          background: rgba(255,255,255,0.4); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.55); border-radius: 16px; padding: 16px 20px;
          color: #2c2415; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
          cursor: pointer; text-align: left; width: 100%;
          transition: all 0.18s cubic-bezier(0.34, 1.2, 0.64, 1);
          box-shadow: 0 1px 4px rgba(100,80,50,0.04), inset 0 1px 0 rgba(255,255,255,0.6);
          display: flex; align-items: center;
        }
        .quiz-option-btn:hover:not(:disabled) {
          background: rgba(122,158,126,0.14); border-color: rgba(122,158,126,0.4);
          transform: translateX(4px); color: #2c5a30;
        }
        .quiz-option-btn:disabled { cursor: default; }
        .nav-tab {
          padding: 10px 20px; border-radius: 12px; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.15s ease; border: 1px solid transparent;
          display: flex; align-items: center; gap: 8px; background: transparent; color: #8a7a65;
        }
        .nav-tab:hover { background: rgba(255,255,255,0.3); color: #2c2415; }
        .nav-tab-active { background: rgba(122,158,126,0.14) !important; border-color: rgba(122,158,126,0.35) !important; color: #2c5a30 !important; }
        .suggest-chip {
          padding: 8px 16px; border-radius: 100px; font-size: 12px; font-weight: 500;
          cursor: pointer; transition: all 0.15s ease; background: rgba(255,255,255,0.45);
          border: 1px solid rgba(255,255,255,0.6); color: #5a5040;
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        }
        .suggest-chip:hover { background: rgba(122,158,126,0.12); border-color: rgba(122,158,126,0.35); color: #2c5a30; transform: translateY(-1px); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes pulse-dot { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f4f0ea", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "fixed", width: "800px", height: "800px", borderRadius: "50%", background: "radial-gradient(circle, rgba(122,158,126,0.07) 0%, transparent 65%)", top: "-300px", right: "-300px", pointerEvents: "none" }} />
        <div style={{ position: "fixed", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(182,142,108,0.05) 0%, transparent 65%)", bottom: "-150px", left: "-150px", pointerEvents: "none" }} />

        <header style={{ padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(122,100,70,0.06)", position: "relative", zIndex: 10, background: "rgba(244,240,234,0.8)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, rgba(122,158,126,0.85) 0%, rgba(95,135,100,0.95) 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(122,158,126,0.25), inset 0 1px 0 rgba(255,255,255,0.35)" }}>
              <IconLayers size={17} color="#fff" />
            </div>
            <div>
              <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "18px", color: "#2c2415", letterSpacing: "-0.3px" }}>PolicyPulse</span>
              <span style={{ fontSize: "11px", color: "#b0a08c", marginLeft: "10px", fontWeight: 500 }}>Demo</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <button className={`nav-tab ${page === "chat" ? "nav-tab-active" : ""}`} onClick={() => setPage("chat")}><IconChat size={16} /> Policy Chat</button>
            <button className={`nav-tab ${page === "quiz" ? "nav-tab-active" : ""}`} onClick={() => setPage("quiz")}><IconTarget size={16} /> Daily Quiz</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#b0a08c", fontWeight: 500 }}>
            <IconGlobe size={13} /> MA Home Care Regulations
          </div>
        </header>

        <main style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px 100px", position: "relative", zIndex: 5 }}>
          {page === "chat" && <ChatDemo />}
          {page === "quiz" && <QuizDemo />}
        </main>

        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "14px 32px", background: "rgba(244,240,234,0.9)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderTop: "1px solid rgba(122,100,70,0.08)", display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", zIndex: 20 }}>
          <span style={{ fontSize: "13px", color: "#5a5040", fontWeight: 500 }}>This demo uses general MA regulations. Want to see it loaded with your agency's handbook?</span>
          <a href="mailto:YOUR_EMAIL@gmail.com?subject=Interested in PolicyPulse for my agency" style={{ padding: "8px 20px", borderRadius: "10px", background: "linear-gradient(135deg, rgba(122,158,126,0.88) 0%, rgba(95,135,100,0.95) 100%)", color: "#fff", fontSize: "12px", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", boxShadow: "0 4px 14px rgba(122,158,126,0.3), inset 0 1px 0 rgba(255,255,255,0.3)" }}>
            <IconMail size={13} /> Reply to Thomas's email
          </a>
        </div>
      </div>
    </>
  );
}

// ── CHAT ──────────────────────────────────────────
function ChatDemo() {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Welcome. I'm loaded with Massachusetts home care and assisted living regulations (651 CMR 12.00, 105 CMR 155.00, and 651 CMR 3.00). Ask me any compliance question in English or Spanish.", citation: null as string | null }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function sendMessage(text?: string) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setMessages(prev => [...prev, { role: "user", text: msg, citation: null }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: msg, organization_id: ORG_ID }) });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "ai", text: data.answer, citation: data.citation ?? null }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "Something went wrong. Please try again.", citation: null }]);
    } finally { setLoading(false); }
  }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "28px", color: "#2c2415", letterSpacing: "-0.5px", marginBottom: "6px" }}>Policy Assistant</h1>
        <p style={{ color: "#8a7a65", fontSize: "13px" }}>Ask any compliance question in English or Spanish. Answers come from MA home care regulations.</p>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
        {SUGGESTED_QUESTIONS.map((sq, i) => (
          <button key={i} className="suggest-chip" onClick={() => sendMessage(sq.text)}>
            {sq.lang === "es" && <span style={{ marginRight: "4px" }}>🇪🇸</span>}{sq.text}
          </button>
        ))}
      </div>
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", height: "520px" }}>
        <div style={{ flex: 1, overflow: "auto", padding: "24px 22px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "10px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", ...(m.role === "ai" ? { background: "linear-gradient(135deg, rgba(122,158,126,0.85) 0%, rgba(95,135,100,0.95) 100%)", boxShadow: "0 2px 8px rgba(122,158,126,0.25)" } : { background: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.8)", color: "#8a7a65", fontWeight: 600, fontSize: "11px" }) }}>
                {m.role === "ai" ? <IconLayers size={15} color="#fff" /> : "You"}
              </div>
              <div style={{ maxWidth: "72%" }}>
                <div className={m.role === "ai" ? "chat-bubble-ai" : "chat-bubble-user"} style={{ padding: "14px 18px", fontSize: "14px", lineHeight: 1.7 }}>{m.text}</div>
                {m.citation && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "8px", background: "rgba(122,158,126,0.08)", border: "1px solid rgba(122,158,126,0.2)", borderRadius: "8px", padding: "4px 12px", fontSize: "11px", color: "#2c5a30", fontWeight: 600 }}>
                    <IconFile size={11} /> {m.citation}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "linear-gradient(135deg, rgba(122,158,126,0.85) 0%, rgba(95,135,100,0.95) 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}><IconLayers size={15} color="#fff" /></div>
              <div className="chat-bubble-ai" style={{ padding: "14px 18px", fontSize: "20px", color: "#b0a08c", display: "flex", gap: "2px" }}>
                <span style={{ animation: "pulse-dot 1.2s infinite 0s" }}>.</span>
                <span style={{ animation: "pulse-dot 1.2s infinite 0.2s" }}>.</span>
                <span style={{ animation: "pulse-dot 1.2s infinite 0.4s" }}>.</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(122,100,70,0.06)", display: "flex", gap: "10px" }}>
          <input className="glass-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="Ask a compliance question in English or Spanish..." style={{ flex: 1 }} />
          <button className="glass-btn-primary" onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{ width: "48px", height: "48px", padding: 0 }}><IconSend size={17} /></button>
        </div>
      </div>
    </div>
  );
}

// ── QUIZ ──────────────────────────────────────────
function QuizDemo() {
  const [quizIndex, setQuizIndex] = useState(0);
  const [answers, setAnswers] = useState<{ correct: boolean; selected: string }[]>([]);
  const [done, setDone] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const questions = HARDCODED_QUIZ;
  const current = questions[quizIndex];
  const totalCorrect = answers.filter(a => a.correct).length;
  const score = done ? Math.round((totalCorrect / questions.length) * 100) : 0;

  function getOptionText(opt: string) {
    return current[`option_${opt.toLowerCase()}` as keyof typeof current] as string;
  }

  function pickAnswer(opt: string) {
    if (showResult) return;
    setSelected(opt);
    setShowResult(true);
    const correct = opt === current.correct_option;
    setTimeout(() => {
      const newAnswers = [...answers, { correct, selected: opt }];
      setAnswers(newAnswers);
      setSelected(null);
      setShowResult(false);
      if (quizIndex + 1 >= questions.length) setDone(true);
      else setQuizIndex(quizIndex + 1);
    }, 1600);
  }

  function restart() {
    setQuizIndex(0); setAnswers([]); setDone(false); setSelected(null); setShowResult(false);
  }

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "28px", color: "#2c2415", letterSpacing: "-0.5px", marginBottom: "6px" }}>Daily Compliance Quiz</h1>
          <p style={{ color: "#8a7a65", fontSize: "13px" }}>3 questions based on MA home care regulations. Every answer is logged with a timestamp.</p>
        </div>
        {!done && (
          <span style={{ padding: "6px 16px", borderRadius: "100px", fontSize: "12px", fontWeight: 600, background: "rgba(90,138,94,0.1)", color: "#2c5a30", border: "1px solid rgba(90,138,94,0.25)" }}>
            {quizIndex + 1} / {questions.length}
          </span>
        )}
      </div>

      {!done && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px", alignItems: "start" }}>
          <div className="glass-card" style={{ padding: "32px" }}>
            <div style={{ height: "4px", borderRadius: "99px", background: "rgba(122,100,70,0.08)", marginBottom: "24px" }}>
              <div style={{ height: "100%", width: `${(quizIndex / questions.length) * 100}%`, borderRadius: "99px", background: "linear-gradient(90deg, rgba(122,158,126,0.7), rgba(122,158,126,0.9))", transition: "width 0.3s ease" }} />
            </div>
            <div style={{ fontSize: "10px", color: "#b0a08c", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: "12px", fontWeight: 700 }}>{current.topic}</div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "18px", lineHeight: 1.6, marginBottom: "28px", color: "#2c2415" }}>{current.question}</div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {OPTIONS.map((opt) => {
                const isCorrect = opt === current.correct_option;
                const isSelected = selected === opt;
                const isWrong = showResult && isSelected && !isCorrect;
                let extraStyle: React.CSSProperties = {};
                if (showResult && isCorrect) extraStyle = { background: "rgba(90,138,94,0.15)", borderColor: "rgba(90,138,94,0.4)", color: "#2c5a30" };
                else if (isWrong) extraStyle = { background: "rgba(184,92,82,0.1)", borderColor: "rgba(184,92,82,0.3)", color: "#8a3a30" };

                return (
                  <button key={opt} className="quiz-option-btn" onClick={() => pickAnswer(opt)} disabled={showResult} style={extraStyle}>
                    <span style={{ fontWeight: 700, color: showResult && isCorrect ? "#2c5a30" : "#7a9e7e", marginRight: "10px", fontSize: "13px", flexShrink: 0 }}>{opt}</span>
                    <span style={{ flex: 1 }}>{getOptionText(opt)}</span>
                    {showResult && isCorrect && <IconCheck size={16} color="#2c5a30" />}
                    {isWrong && <IconX size={16} color="#8a3a30" />}
                  </button>
                );
              })}
            </div>

            {showResult && (
              <div style={{ marginTop: "20px", padding: "14px 18px", borderRadius: "14px", background: selected === current.correct_option ? "rgba(90,138,94,0.06)" : "rgba(184,92,82,0.05)", border: `1px solid ${selected === current.correct_option ? "rgba(90,138,94,0.18)" : "rgba(184,92,82,0.15)"}`, fontSize: "13px", color: "#5a5040", lineHeight: 1.6 }}>
                {current.explanation}
              </div>
            )}
          </div>

          <div className="glass-card" style={{ padding: "28px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#b0a08c", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: "20px" }}>Your Progress</div>
            {answers.length === 0 && <div style={{ color: "#b0a08c", fontSize: "13px" }}>No answers yet</div>}
            {answers.map((a, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "14px", alignItems: "center" }}>
                <span style={{ color: "#8a7a65" }}>Question {i + 1}</span>
                <span style={{ padding: "3px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px", ...(a.correct ? { background: "rgba(90,138,94,0.1)", color: "#2c5a30", border: "1px solid rgba(90,138,94,0.25)" } : { background: "rgba(184,92,82,0.1)", color: "#8a3a30", border: "1px solid rgba(184,92,82,0.2)" }) }}>
                  {a.correct ? <><IconCheck size={11} /> Correct</> : <><IconX size={11} /> Wrong</>}
                </span>
              </div>
            ))}
            <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid rgba(122,100,70,0.06)", fontSize: "11px", color: "#b0a08c" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#7a9e7e" }} />
                Logged with timestamp
              </div>
              <div style={{ color: "#c0b8a8" }}>{new Date().toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      {done && (
        <div className="glass-card fade-in" style={{ padding: "48px" }}>
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ marginBottom: "20px" }}>
              {score === 100 ? <IconAward size={52} color="#2c5a30" /> : score >= 66 ? <IconCheck size={52} color="#5a8a5e" /> : <IconTarget size={52} color="#b8926c" />}
            </div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "56px", color: score === 100 ? "#2c5a30" : score >= 66 ? "#5a8a5e" : "#b8926c", marginBottom: "8px", letterSpacing: "-2px" }}>{score}%</div>
            <div style={{ fontSize: "15px", color: "#8a7a65", marginBottom: "32px" }}>{totalCorrect} of {questions.length} correct</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", textAlign: "left", maxWidth: "520px", margin: "0 auto 32px" }}>
              {questions.map((q, i) => (
                <div key={i} style={{ padding: "16px 20px", borderRadius: "16px", background: answers[i]?.correct ? "rgba(90,138,94,0.06)" : "rgba(184,92,82,0.05)", border: `1px solid ${answers[i]?.correct ? "rgba(90,138,94,0.18)" : "rgba(184,92,82,0.15)"}` }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: answers[i]?.correct ? "#2c5a30" : "#8a3a30", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                    {answers[i]?.correct ? <IconCheck size={13} /> : <IconX size={13} />}
                    {answers[i]?.correct ? "Correct" : "Incorrect"} · Question {i + 1}
                  </div>
                  <div style={{ fontSize: "13px", color: "#8a7a65", lineHeight: 1.5 }}>{q.explanation}</div>
                </div>
              ))}
            </div>
            <button className="glass-btn-primary" onClick={restart} style={{ padding: "15px 36px", fontSize: "15px" }}>Retake Quiz</button>
          </div>
        </div>
      )}
    </div>
  );
}