import Groq from 'groq-sdk'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getOrgId(user_id: string | null, fallback: string): Promise<string> {
  if (!user_id) return fallback
  const { data } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user_id)
    .single()
  return data?.organization_id ?? fallback
}

async function findRelevantChunks(question: string, organization_id: string): Promise<string> {
  const { data } = await supabase
    .from('document_chunks')
    .select('content')
    .eq('organization_id', organization_id)

  if (!data || data.length === 0) return ''

  const keywords = question.toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3)

  const scored = data.map(chunk => {
    const lower = chunk.content.toLowerCase()
    let score = 0
    for (const keyword of keywords) {
      const matches = (lower.match(new RegExp(keyword, 'g')) || []).length
      score += matches
    }
    return { content: chunk.content, score }
  }).sort((a, b) => b.score - a.score)

  const top = scored.filter(c => c.score > 0).slice(0, 5)
  if (top.length === 0) return scored.slice(0, 3).map(c => c.content).join('\n\n')
  return top.map(c => c.content).join('\n\n')
}

export async function POST(req: NextRequest) {
  const { question, user_id, organization_id: fallback_org = 'default' } = await req.json()

  // Always resolve org from profile if user is logged in
  const organization_id = await getOrgId(user_id, fallback_org)

  const context = await findRelevantChunks(question, organization_id)

  const systemPrompt = context
    ? `You are a compliance policy assistant. Answer questions using ONLY the following policy content. Always cite the specific section you're referencing in this format: [Source: Section X.X - Topic Name].

Your default language is English. Only switch languages if the user's message is clearly written in another language — for example, respond in Spanish only if the user writes in Spanish, Tagalog only if they write in Tagalog. If the user writes in English, always respond in English.

If the answer is not clearly covered in the policy content below, you must respond with exactly this phrase at the start: "ESCALATED:" followed by a brief message telling the employee their question has been sent to a manager.

Policy content:
${context}`
    : `You are a compliance policy assistant. No policy documents have been uploaded yet. Respond in English by default. Respond with exactly: "ESCALATED: Your question has been sent to a manager who will reply shortly."`

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question }
    ],
    max_tokens: 600,
  })

  const text = completion.choices[0]?.message?.content ?? 'I could not generate a response.'
  const escalated = text.trimStart().startsWith('ESCALATED:')

  const citationMatch = text.match(/\[Source: (.+?)\]/)
  const citation = citationMatch ? citationMatch[1] : null

  const answer = escalated
    ? text.replace(/^ESCALATED:\s*/i, '').replace(/\[Source: .+?\]/, '').trim()
    : text.replace(/\[Source: .+?\]/, '').trim()

  const { error: logError } = await supabase.from('chat_logs').insert({
    user_id: user_id ?? null,
    question,
    answer,
    citation,
    escalated,
    resolved: false,
  })

  if (logError) console.error('chat_logs insert error:', logError)

  return NextResponse.json({ answer, citation, escalated })
}