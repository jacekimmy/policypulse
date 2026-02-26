'use client'

import { useState } from 'react'

export default function UploadPage() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setStatus('Uploading and processing...')
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) {
        setStatus(`Done! "${data.name}" uploaded and split into ${data.chunks} chunks.`)
      } else {
        setStatus(`Error: ${data.error}`)
      }
    } catch {
      setStatus('Upload failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#060912', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', color: '#f0f4ff' }}>
      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', padding: '40px', width: '480px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Upload Policy Document</h1>
        <p style={{ color: 'rgba(240,244,255,0.45)', fontSize: '14px', marginBottom: '24px' }}>PDF only. The AI will read and index it automatically.</p>
        <input type="file" accept=".pdf" onChange={handleUpload} disabled={loading}
          style={{ display: 'block', width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: '#f0f4ff', fontFamily: 'sans-serif', cursor: 'pointer', marginBottom: '16px' }} />
        {status && (
          <div style={{ padding: '12px 16px', borderRadius: '10px', background: status.includes('Error') ? 'rgba(248,113,113,0.08)' : 'rgba(52,211,153,0.08)', border: `1px solid ${status.includes('Error') ? 'rgba(248,113,113,0.2)' : 'rgba(52,211,153,0.2)'}`, fontSize: '13px', color: status.includes('Error') ? '#f87171' : '#34d399' }}>
            {status}
          </div>
        )}
      </div>
    </div>
  )
}