import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  // Get all profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name')

  // Get today's quiz results
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: results } = await supabase
    .from('quiz_results')
    .select('*')
    .gte('completed_at', today.toISOString())

  // Merge profiles with their quiz results
  const team = profiles?.map(profile => {
    const result = results?.find(r => r.user_id === profile.id)
    return {
      name: profile.full_name ?? profile.email,
      completed: !!result,
      correct: result?.correct ?? null,
      score: result?.score ?? null,
    }
  }) ?? []

  const completed = team.filter(m => m.completed).length
  const avgScore = team.filter(m => m.score !== null).reduce((acc, m) => acc + (m.score ?? 0), 0) / (team.filter(m => m.score !== null).length || 1)

  return NextResponse.json({ team, completed, total: team.length, avgScore: Math.round(avgScore) })
}