import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const since = new Date()
  since.setDate(since.getDate() - 30)

  const { data: chats } = await supabase
    .from('chat_logs')
    .select('question')
    .gte('created_at', since.toISOString())

  if (!chats || chats.length === 0) {
    return NextResponse.json({ gaps: [] })
  }

  const { data: chunks } = await supabase
    .from('document_chunks')
    .select('content')

  const docText = chunks?.map(c => c.content).join(' ') ?? ''
  const questions = chats.map(c => c.question).join('\n')

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `You are a policy compliance analyst. Analyze these employee questions and this policy document.

For each of the top 8 compliance topics found in the questions, determine:
1. How many employee questions relate to this topic (count)
2. How well the policy document covers this topic (docMentions: 0 = not covered, 1-2 = barely covered, 3-9 = lightly covered, 10+ = well covered)

Be semantic - understand meaning, not just keywords. "What's my PTO" and "how many vacation days do I get" are both about the same topic.

Return ONLY a JSON array, no other text:
[{"term": "Topic Name", "count": <number>, "docMentions": <number>}]

Employee questions:
${questions}

Policy document (first 6000 chars):
${docText.slice(0, 6000)}`
      }],
      max_tokens: 600
    })
  })

  const aiData = await res.json()
  let gaps: any[] = []

  try {
    const raw = aiData.choices[0].message.content.replace(/```json|```/g, '').trim()
    const scored = JSON.parse(raw)

    gaps = scored.map((g: any) => {
      let label = null
      if (g.count >= 1 && g.docMentions <= 2) label = 'High Gap'
      else if (g.count >= 1 && g.docMentions <= 9) label = 'Gap'
      else if (g.count === 0 && g.docMentions <= 2) label = 'Low Gap'
      return { term: g.term, count: g.count, docMentions: g.docMentions, label }
    })
    .filter((g: any) => g.label !== null)
    .sort((a: any, b: any) => {
      const order: Record<string, number> = { 'High Gap': 0, 'Gap': 1, 'Low Gap': 2 }
      return order[a.label] - order[b.label]
    })
  } catch {
    return NextResponse.json({ gaps: [] })
  }

  return NextResponse.json({ gaps })
}