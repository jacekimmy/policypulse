import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: chats } = await supabase
    .from('chat_logs')
    .select('user_id, question, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: quizzes } = await supabase
    .from('quiz_results')
    .select('user_id, score, correct, completed_at')
    .order('completed_at', { ascending: false })
    .limit(50)

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name')

  function getUser(id: string | null) {
    if (!id) return 'Unknown'
    const p = profiles?.find(p => p.id === id)
    return p?.email ?? p?.full_name ?? 'Unknown'
  }

  const logs = [
    ...(chats ?? []).map(c => ({
      time: c.created_at,
      user: getUser(c.user_id),
      action: `Policy Chat query: "${c.question}"`
    })),
    ...(quizzes ?? []).map(q => ({
      time: q.completed_at,
      user: getUser(q.user_id),
      action: `Completed Daily Quiz – Score: ${q.score}% – ${q.correct ? 'Pass' : 'Fail'}`
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

  return NextResponse.json({ logs })
}