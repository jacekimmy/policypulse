import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

async function expandKeywords(query: string): Promise<string[]> {
  try {
    const res = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      max_tokens: 100,
      messages: [
        {
          role: 'system',
          content: 'You are a home health care compliance assistant. Given a search topic, return a JSON array of 10-15 related keywords, phrases, synonyms, and alternate forms that would appear in compliance training records, chat logs, or quiz questions. Include: direct synonyms, abbreviations, related procedures, and common alternate spellings. Return ONLY the JSON array, no other text. Example for "medication": ["medication","medicine","medications","medicines","drug","drugs","prescription","dosage","dose","administer","pill","pills","pharmaceutical","med","meds"]',
        },
        {
          role: 'user',
          content: query,
        },
      ],
    })

    const text = res.choices[0]?.message?.content?.trim() ?? '[]'
    const parsed = JSON.parse(text)
    // Always include the original query too
    return [...new Set([query, ...parsed])] as string[]
  } catch (e) {
    console.error('Groq keyword expansion failed:', e)
    // Fall back to just the original query
    return [query]
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [], total: 0, chatCount: 0, quizCount: 0, keywords: [] })
  }

  // Expand to related keywords using AI
  const keywords = await expandKeywords(q)

  // Build an OR filter for all keywords across relevant columns
  // e.g. question.ilike.%infection%,question.ilike.%hand hygiene%,...
  const chatFilter = keywords
    .flatMap(k => [
      `question.ilike.%${k}%`,
      `answer.ilike.%${k}%`,
    ])
    .join(',')

  const quizFilter = keywords
    .flatMap(k => [
      `question.ilike.%${k}%`,
      `topic.ilike.%${k}%`,
    ])
    .join(',')

  // ── 1. Search chat_logs ──────────────────────────────────────
  const { data: chatRows, error: chatErr } = await supabase
    .from('chat_logs')
    .select('id, user_id, question, answer, escalated, created_at')
    .or(chatFilter)
    .order('created_at', { ascending: false })
    .limit(100)

  if (chatErr) {
    console.error('chat_logs query error:', chatErr)
  }

  // ── 2. Search quiz_questions ─────────────────────────────────
  const { data: matchingQuestions } = await supabase
    .from('quiz_questions')
    .select('id, question, topic')
    .or(quizFilter)
    .limit(50)

  // ── 3. Get quiz_results for matching questions ───────────────
  let quizRows: any[] = []
  if (matchingQuestions && matchingQuestions.length > 0) {
    const questionIds = matchingQuestions.map(q => q.id)
    const { data: results } = await supabase
      .from('quiz_results')
      .select('id, user_id, question_id, score, correct, created_at')
      .in('question_id', questionIds)
      .order('created_at', { ascending: false })
      .limit(100)

    quizRows = (results ?? []).map(r => ({
      ...r,
      matched_question: matchingQuestions.find(q => q.id === r.question_id),
    }))
  }

  // ── 4. Fetch profiles for all user_ids ───────────────────────
  const allUserIds = [
    ...new Set([
      ...(chatRows ?? []).map(r => r.user_id),
      ...quizRows.map(r => r.user_id),
    ]),
  ].filter(Boolean)

  let profileMap: Record<string, string> = {}
  let emailMap: Record<string, string> = {}

  if (allUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', allUserIds)

    for (const p of profiles ?? []) {
      profileMap[p.id] = p.full_name ?? p.email ?? 'Unknown'
      emailMap[p.id] = p.email ?? ''
    }
  }

  // ── 5. Shape results ─────────────────────────────────────────
  const chatResults = (chatRows ?? []).map(r => ({
    type: 'chat' as const,
    id: r.id,
    date: r.created_at,
    employee: profileMap[r.user_id] ?? 'Unknown',
    email: emailMap[r.user_id] ?? '',
    content: r.question,
    answer: r.answer,
    escalated: r.escalated ?? false,
  }))

  const quizResults = quizRows.map(r => ({
    type: 'quiz' as const,
    id: r.id,
    date: r.created_at,
    employee: profileMap[r.user_id] ?? 'Unknown',
    email: emailMap[r.user_id] ?? '',
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
    keywords, // send back so admin can see what terms were searched
  })
}