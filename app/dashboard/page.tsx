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

  if (!role) return <div style={{ background: '#060912', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f0f4ff', fontFamily: 'sans-serif' }}>Loading...</div>

  if (role === 'admin') return <AdminDashboard />
  if (role === 'manager') return <ManagerDashboard />
  return <WorkerDashboard />
}

function WorkerDashboard() {
  return <div style={{ background: '#060912', minHeight: '100vh', color: '#f0f4ff', fontFamily: 'sans-serif', padding: '40px' }}><h1>👷 Worker Dashboard</h1><p style={{ color: 'rgba(240,244,255,0.45)', marginTop: '8px' }}>Policy chat coming soon.</p></div>
}

function ManagerDashboard() {
  return <div style={{ background: '#060912', minHeight: '100vh', color: '#f0f4ff', fontFamily: 'sans-serif', padding: '40px' }}><h1>📋 Manager Dashboard</h1><p style={{ color: 'rgba(240,244,255,0.45)', marginTop: '8px' }}>Team pulse coming soon.</p></div>
}

function AdminDashboard() {
  return <div style={{ background: '#060912', minHeight: '100vh', color: '#f0f4ff', fontFamily: 'sans-serif', padding: '40px' }}><h1>🛡️ Admin Dashboard</h1><p style={{ color: 'rgba(240,244,255,0.45)', marginTop: '8px' }}>Compliance overview coming soon.</p></div>
}