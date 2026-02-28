import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name')?.trim()
  if (!name) return NextResponse.json({ results: [] })

  try {
    // Search profiles by name
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .ilike('full_name', `%${name}%`)

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ results: [] })
    }

    const userIds = profiles.map(p => p.id)

    // Get chat history
    const { data: chats } = await supabase
      .from('chat_logs')
      .select('user_id, question, answer, escalated, created_at')
      .in('user_id', userIds)
      .order('created_at', { ascending: false })
      .limit(50)

    // Get quiz history
    const { data: quizzes } = await supabase
      .from('quiz_results')
      .select('user_id, score, correct, created_at')
      .in('user_id', userIds)
      .order('created_at', { ascending: false })
      .limit(20)

    const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]))

    const chatRows = (chats ?? []).map(c => ({
      type: 'chat',
      user: profileMap[c.user_id]?.full_name ?? profileMap[c.user_id]?.email ?? 'Unknown',
      question: c.question,
      answer: c.answer,
      escalated: c.escalated,
      time: c.created_at,
    }))

    const quizRows = (quizzes ?? []).map(q => ({
      type: 'quiz',
      user: profileMap[q.user_id]?.full_name ?? profileMap[q.user_id]?.email ?? 'Unknown',
      score: q.score,
      correct: q.correct,
      time: q.created_at,
    }))

    const results = [...chatRows, ...quizRows].sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    )

    return NextResponse.json({ results, found: profiles.length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}