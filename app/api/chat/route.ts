import Groq from 'groq-sdk'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function findRelevantChunks(question: string): Promise<string> {
  const { data } = await supabase
    .from('document_chunks')
    .select('content')

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
  const { question } = await req.json()

  const context = await findRelevantChunks(question)

  const systemPrompt = context
    ? `You are a compliance policy assistant. Answer questions using ONLY the following policy content. Always cite the specific section you're referencing in this format: [Source: Section X.X - Topic Name]. If the answer isn't in the content, say so clearly.\n\nPolicy content:\n${context}`
    : `You are a compliance policy assistant. No policy documents have been uploaded yet. Let the user know they need to upload their handbook first, but you can answer general compliance questions in the meantime.`

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question }
    ],
    max_tokens: 600,
  })

  const text = completion.choices[0]?.message?.content ?? 'I could not generate a response.'
  const citationMatch = text.match(/\[Source: (.+?)\]/)
  const citation = citationMatch ? citationMatch[1] : null
  const answer = text.replace(/\[Source: .+?\]/, '').trim()

  await supabase.from('chat_logs').insert({
    question,
    answer,
    citation,
    escalated: !context
  })

  return NextResponse.json({ answer, citation })
}