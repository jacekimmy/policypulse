'use client'

import { useState } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

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
    <div style={{
      minHeight: '100vh', background: '#060912', display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '18px', padding: '40px', width: '100%', maxWidth: '400px'
      }}>
        <h1 style={{ color: '#f0f4ff', fontSize: '24px', marginBottom: '8px' }}>PolicyPulse</h1>
        <p style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px', marginBottom: '32px' }}>Sign in to your account</p>

        <input
          type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)}
          style={{
            width: '100%', padding: '12px 16px', borderRadius: '10px', marginBottom: '12px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#f0f4ff', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
          }}
        />
        <input
          type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)}
          style={{
            width: '100%', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#f0f4ff', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
          }}
        />
        {error && <p style={{ color: '#f87171', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}
        <button
          onClick={handleLogin} disabled={loading}
          style={{
            width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, #4f8ef7, #a78bfa)',
            color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer'
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </div>
    </div>
  )
}