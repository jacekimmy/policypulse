import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [], total: 0 })
  }

  const keyword = `%${q}%`

  // Search chat_logs – match on question or answer text
  const { data: chatRows, error: chatErr } = await supabase
    .from('chat_logs')
    .select(`
      id,
      created_at,
      question,
      answer,
      escalated,
      profiles!chat_logs_user_id_fkey (
        full_name,
        email
      )
    `)
    .or(`question.ilike.${keyword},answer.ilike.${keyword}`)
    .order('created_at', { ascending: false })
    .limit(100)

  // Search quiz_questions joined via quiz_results
  // First find matching questions
  const { data: matchingQuestions, error: qErr } = await supabase
    .from('quiz_questions')
    .select('id, question, topic, correct_option')
    .ilike('question', keyword)
    .limit(50)

  let quizRows: any[] = []
  if (matchingQuestions && matchingQuestions.length > 0) {
    const questionIds = matchingQuestions.map(q => q.id)
    const { data: results } = await supabase
      .from('quiz_results')
      .select(`
        id,
        created_at,
        score,
        correct,
        question_id,
        profiles!quiz_results_user_id_fkey (
          full_name,
          email
        )
      `)
      .in('question_id', questionIds)
      .order('created_at', { ascending: false })
      .limit(100)

    if (results) {
      quizRows = results.map(r => {
        const matchedQ = matchingQuestions.find(q => q.id === r.question_id)
        return { ...r, matched_question: matchedQ }
      })
    }
  }

  // Also search quiz_results where the topic matches (if quiz_questions has topic field)
  const { data: topicQuestions } = await supabase
    .from('quiz_questions')
    .select('id, question, topic, correct_option')
    .ilike('topic', keyword)
    .limit(50)

  if (topicQuestions && topicQuestions.length > 0) {
    const topicIds = topicQuestions.map(q => q.id).filter(id => !quizRows.find(r => r.question_id === id))
    if (topicIds.length > 0) {
      const { data: topicResults } = await supabase
        .from('quiz_results')
        .select(`
          id,
          created_at,
          score,
          correct,
          question_id,
          profiles!quiz_results_user_id_fkey (
            full_name,
            email
          )
        `)
        .in('question_id', topicIds)
        .order('created_at', { ascending: false })
        .limit(100)

      if (topicResults) {
        topicResults.forEach(r => {
          const matchedQ = topicQuestions.find(q => q.id === r.question_id)
          quizRows.push({ ...r, matched_question: matchedQ })
        })
      }
    }
  }

  const chatResults = (chatRows ?? []).map(r => ({
    type: 'chat' as const,
    id: r.id,
    date: r.created_at,
    employee: (r.profiles as any)?.full_name ?? (r.profiles as any)?.email ?? 'Unknown',
    email: (r.profiles as any)?.email ?? '',
    content: r.question,
    answer: r.answer,
    escalated: r.escalated ?? false,
  }))

  const quizResults = quizRows.map(r => ({
    type: 'quiz' as const,
    id: r.id,
    date: r.created_at,
    employee: (r.profiles as any)?.full_name ?? (r.profiles as any)?.email ?? 'Unknown',
    email: (r.profiles as any)?.email ?? '',
    content: r.matched_question?.question ?? 'Quiz question',
    topic: r.matched_question?.topic ?? '',
    score: r.score,
    correct: r.correct,
  }))

  const allResults = [...chatResults, ...quizResults].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return NextResponse.json({
    results: allResults,
    total: allResults.length,
    chatCount: chatResults.length,
    quizCount: quizResults.length,
  })
}