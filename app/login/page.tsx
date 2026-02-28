'use client'

import { useState } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

const LOGIN_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #f5efe6;
    font-family: 'Inter', sans-serif;
  }

  .login-bg {
    min-height: 100vh;
    background: #f5efe6;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    position: relative;
    overflow: hidden;
  }

  .login-bg::before {
    content: '';
    position: absolute;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(122,158,126,0.12) 0%, transparent 70%);
    top: -200px;
    right: -200px;
    pointer-events: none;
  }

  .login-bg::after {
    content: '';
    position: absolute;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(196,129,58,0.08) 0%, transparent 70%);
    bottom: -100px;
    left: -100px;
    pointer-events: none;
  }

  .login-card {
    background: rgba(255,255,255,0.55);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.7);
    border-radius: 28px;
    padding: 48px 44px;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 8px 40px rgba(122,90,50,0.1), 0 1px 4px rgba(122,90,50,0.06);
    position: relative;
    z-index: 1;
  }

  .login-logo {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    background: rgba(122,158,126,0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    box-shadow: 0 4px 14px rgba(122,158,126,0.35), inset 0 1px 0 rgba(255,255,255,0.4);
    margin-bottom: 20px;
  }

  .login-input {
    width: 100%;
    padding: 14px 18px;
    border-radius: 14px;
    background: rgba(255,255,255,0.65);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.8);
    color: #2c2415;
    font-family: 'Inter', sans-serif;
    font-size: 15px;
    outline: none;
    transition: border-color 0.18s, box-shadow 0.18s, transform 0.18s;
    box-shadow: 0 1px 6px rgba(122,90,50,0.06);
    margin-bottom: 14px;
  }

  .login-input:focus {
    border-color: rgba(122,158,126,0.7);
    box-shadow: 0 0 0 4px rgba(122,158,126,0.12);
    transform: translateY(-1px);
    background: rgba(255,255,255,0.85);
  }

  .login-input::placeholder {
    color: rgba(122,100,70,0.45);
  }

  .login-btn {
    width: 100%;
    padding: 16px;
    border-radius: 16px;
    border: 1px solid rgba(122,158,126,0.9);
    background: rgba(122,158,126,0.85);
    color: #fff;
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 8px;
    position: relative;
    overflow: hidden;
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 6px 24px rgba(122,158,126,0.4), inset 0 1px 0 rgba(255,255,255,0.3);
  }

  .login-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 55%);
    border-radius: inherit;
    pointer-events: none;
  }

  .login-btn:hover:not(:disabled) {
    background: rgba(100,140,105,0.95);
    border-color: rgba(100,140,105,1);
    box-shadow: 0 10px 32px rgba(122,158,126,0.5), inset 0 1px 0 rgba(255,255,255,0.3);
    transform: translateY(-3px) scale(1.02);
  }

  .login-btn:active:not(:disabled) {
    transform: translateY(2px) scale(0.97);
    box-shadow: 0 2px 10px rgba(122,158,126,0.3), inset 0 2px 6px rgba(0,0,0,0.1);
    background: rgba(90,130,95,0.95);
  }

  .login-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .error-box {
    padding: 12px 16px;
    border-radius: 12px;
    background: rgba(184,92,82,0.1);
    border: 1px solid rgba(184,92,82,0.25);
    color: #8a2e25;
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 14px;
  }
`

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <>
      <style>{LOGIN_STYLE}</style>
      <div className="login-bg">
        <div className="login-card">
          <div className="login-logo">🌿</div>

          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 700, color: '#2c2415', letterSpacing: '-0.4px', marginBottom: '6px' }}>
            PolicyPulse
          </h1>
          <p style={{ color: '#7a6a55', fontSize: '14px', marginBottom: '32px' }}>
            Sign in to your account
          </p>

          <input
            className="login-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          <input
            className="login-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ marginBottom: '6px' }}
          />

          {error && <div className="error-box">⚠ {error}</div>}

          <button className="login-btn" onClick={handleLogin} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#b0976c', marginTop: '24px' }}>
            Secure compliance platform by PolicyPulse
          </p>
        </div>
      </div>
    </>
  )
}