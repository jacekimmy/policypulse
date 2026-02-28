'use client'

import { useState } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

const LOGIN_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #f4f0ea;
    font-family: 'DM Sans', sans-serif;
  }

  .login-bg {
    min-height: 100vh;
    background: #f4f0ea;
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
    width: 800px;
    height: 800px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(122,158,126,0.09) 0%, transparent 65%);
    top: -300px;
    right: -300px;
    pointer-events: none;
  }

  .login-bg::after {
    content: '';
    position: absolute;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(182,142,108,0.07) 0%, transparent 65%);
    bottom: -150px;
    left: -150px;
    pointer-events: none;
  }

  .login-orb {
    position: absolute;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(122,158,126,0.06) 0%, transparent 70%);
    bottom: 20%;
    right: 15%;
    pointer-events: none;
    animation: orb-float 8s ease-in-out infinite;
  }

  @keyframes orb-float {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(-20px, -15px); }
  }

  .login-card {
    background: rgba(255,255,255,0.42);
    backdrop-filter: blur(40px) saturate(180%);
    -webkit-backdrop-filter: blur(40px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.6);
    border-radius: 32px;
    padding: 52px 48px;
    width: 100%;
    max-width: 440px;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.3),
      0 8px 40px rgba(100,80,50,0.08),
      0 2px 8px rgba(100,80,50,0.04),
      inset 0 1px 0 rgba(255,255,255,0.7);
    position: relative;
    z-index: 1;
    animation: fadeInUp 0.5s ease-out;
  }

  .login-card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(
      135deg,
      rgba(255,255,255,0.5) 0%,
      rgba(255,255,255,0.1) 40%,
      rgba(255,255,255,0) 60%,
      rgba(255,255,255,0.15) 100%
    );
    pointer-events: none;
  }

  .login-logo {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    background: linear-gradient(135deg, rgba(122,158,126,0.9) 0%, rgba(90,130,95,0.95) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow:
      0 6px 20px rgba(122,158,126,0.3),
      inset 0 1px 0 rgba(255,255,255,0.35),
      inset 0 -1px 0 rgba(0,0,0,0.05);
    margin-bottom: 28px;
    position: relative;
    overflow: hidden;
  }

  .login-logo::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%);
    border-radius: inherit;
  }

  .login-logo svg {
    position: relative;
    z-index: 1;
  }

  .login-input {
    width: 100%;
    padding: 16px 20px;
    border-radius: 16px;
    background: rgba(255,255,255,0.5);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.7);
    color: #2c2415;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 500;
    outline: none;
    transition: all 0.2s ease;
    box-shadow:
      0 1px 4px rgba(100,80,50,0.04),
      inset 0 1px 0 rgba(255,255,255,0.6);
    margin-bottom: 14px;
  }

  .login-input:focus {
    border-color: rgba(122,158,126,0.6);
    box-shadow:
      0 0 0 4px rgba(122,158,126,0.1),
      0 2px 8px rgba(122,158,126,0.08),
      inset 0 1px 0 rgba(255,255,255,0.8);
    background: rgba(255,255,255,0.7);
  }

  .login-input::placeholder {
    color: rgba(120,100,70,0.4);
    font-weight: 400;
  }

  .login-btn {
    width: 100%;
    padding: 17px;
    border-radius: 18px;
    border: 1px solid rgba(122,158,126,0.85);
    background: linear-gradient(135deg, rgba(122,158,126,0.88) 0%, rgba(95,135,100,0.95) 100%);
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 10px;
    position: relative;
    overflow: hidden;
    transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow:
      0 6px 24px rgba(122,158,126,0.35),
      0 2px 6px rgba(122,158,126,0.15),
      inset 0 1px 0 rgba(255,255,255,0.3);
    letter-spacing: 0.2px;
  }

  .login-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 50%);
    border-radius: inherit;
    pointer-events: none;
  }

  .login-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(105,148,110,0.95) 0%, rgba(80,125,85,1) 100%);
    box-shadow:
      0 10px 36px rgba(122,158,126,0.45),
      0 4px 12px rgba(122,158,126,0.2),
      inset 0 1px 0 rgba(255,255,255,0.3);
    transform: translateY(-2px);
  }

  .login-btn:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow:
      0 2px 10px rgba(122,158,126,0.25),
      inset 0 2px 6px rgba(0,0,0,0.08);
  }

  .login-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .error-box {
    padding: 14px 18px;
    border-radius: 14px;
    background: rgba(184,92,82,0.08);
    border: 1px solid rgba(184,92,82,0.2);
    color: #8a3a30;
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 14px;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .success-box {
    padding: 22px 24px;
    border-radius: 18px;
    background: rgba(122,158,126,0.08);
    border: 1px solid rgba(122,158,126,0.25);
    color: #3a6b40;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 14px;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    text-align: center;
    line-height: 1.7;
    animation: fadeInUp 0.4s ease-out;
  }

  .success-box strong {
    display: block;
    font-size: 17px;
    margin-bottom: 8px;
    color: #2d5a33;
    font-weight: 600;
  }

  .toggle-link {
    background: none;
    border: none;
    color: rgba(122,100,70,0.5);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;
    padding: 0;
    transition: color 0.15s ease;
  }

  .toggle-link:hover {
    color: rgba(90,75,55,0.8);
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .password-field {
    animation: slideDown 0.2s ease-out;
  }
`

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [usePassword, setUsePassword] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleMagicLink() {
    if (!email) { setError('Enter your email first'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })
    if (error) {
      setError(error.message)
    } else {
      setMagicLinkSent(true)
    }
    setLoading(false)
  }

  async function handlePasswordLogin() {
    if (!email || !password) { setError('Enter your email and password'); return }
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

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key !== 'Enter') return
    if (usePassword) handlePasswordLogin()
    else handleMagicLink()
  }

  return (
    <>
      <style>{LOGIN_STYLE}</style>
      <div className="login-bg">
        <div className="login-orb" />
        <div className="login-card">
          <div className="login-logo">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>

          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '30px', fontWeight: 400, color: '#2c2415', letterSpacing: '-0.3px', marginBottom: '6px' }}>
            PolicyPulse
          </h1>
          <p style={{ color: '#8a7a65', fontSize: '14px', marginBottom: '36px', lineHeight: 1.5 }}>
            Sign in to your compliance dashboard
          </p>

          {magicLinkSent ? (
            <div className="success-box">
              <strong>Check your inbox</strong>
              We sent a login link to <span style={{ fontWeight: 600 }}>{email}</span>.<br />
              Tap it and you're in – no password needed.
            </div>
          ) : (
            <>
              <input
                className="login-input"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
              />

              {usePassword && (
                <div className="password-field">
                  <input
                    className="login-input"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={{ marginBottom: '8px' }}
                  />
                </div>
              )}

              {error && (
                <div className="error-box">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                className="login-btn"
                onClick={usePassword ? handlePasswordLogin : handleMagicLink}
                disabled={loading}
              >
                {loading
                  ? (usePassword ? 'Signing in...' : 'Sending link...')
                  : (usePassword ? 'Sign In' : 'Send Magic Link')}
              </button>

              <p style={{ textAlign: 'center', marginTop: '20px' }}>
                <button
                  className="toggle-link"
                  onClick={() => { setUsePassword(v => !v); setError('') }}
                >
                  {usePassword ? 'Send a magic link instead' : 'Use password instead'}
                </button>
              </p>
            </>
          )}

          <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(122,100,70,0.4)', marginTop: '32px', letterSpacing: '0.2px' }}>
            Secure compliance platform
          </p>
        </div>
      </div>
    </>
  )
}