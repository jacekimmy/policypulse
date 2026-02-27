import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('chat_logs')
    .select('id, user_id, question, created_at, resolved')
    .eq('escalated', true)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name')

  const escalations = (data ?? []).map(e => {
    const profile = profiles?.find(p => p.id === e.user_id)
    return {
      id: e.id,
      name: profile?.full_name ?? profile?.email ?? 'Unknown',
      question: e.question,
      time: e.created_at,
      resolved: e.resolved ?? false
    }
  })

  return NextResponse.json({ escalations })
}

export async function PATCH(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { id } = await req.json()

  const { error } = await supabase
    .from('chat_logs')
    .update({ resolved: true })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}