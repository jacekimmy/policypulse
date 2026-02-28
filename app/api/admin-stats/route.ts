import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name')

  const { data: quizzes } = await supabase
    .from('quiz_results')
    .select('user_id, score')

  if (!profiles || !quizzes) return NextResponse.json({ completion: 0, atRiskCount: 0, atRisk: [] })

  // Get latest score per user
  const latestScores: Record<string, number> = {}
  for (const q of quizzes) {
    if (!latestScores[q.user_id] || q.score > latestScores[q.user_id]) {
      latestScores[q.user_id] = q.score
    }
  }

  const scores = Object.values(latestScores)
  const completion = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0

  const atRisk = profiles
    .filter(p => latestScores[p.id] !== undefined && latestScores[p.id] < 60)
    .map(p => ({
      name: p.full_name ?? p.email ?? 'Unknown',
      score: `${latestScores[p.id]}%`,
      risk: latestScores[p.id] < 40 ? 'Critical' : latestScores[p.id] < 50 ? 'High' : 'Medium'
    }))

  return NextResponse.json({ completion, atRiskCount: atRisk.length, atRisk })
}