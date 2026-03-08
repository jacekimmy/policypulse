import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  // Get all chat questions from the last 30 days
  const since = new Date()
  since.setDate(since.getDate() - 30)

  const { data: chats } = await supabase
    .from('chat_logs')
    .select('question')
    .gte('created_at', since.toISOString())

  if (!chats || chats.length === 0) {
    return NextResponse.json({ gaps: [] })
  }

  // Get all doc chunks to cross-reference
  const { data: chunks } = await supabase
    .from('document_chunks')
    .select('content')

  const docText = chunks?.map(c => c.content).join(' ').toLowerCase() ?? ''

  // Use AI to extract topics from questions
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
        content: `Extract the top 8 compliance topics from these employee questions. Return ONLY a JSON array of strings, no other text:\n\n${questions}`
      }],
      max_tokens: 200
    })
  })

  const aiData = await res.json()
  let topics: string[] = []
  try {
    const raw = aiData.choices[0].message.content.replace(/```json|```/g, '').trim()
    topics = JSON.parse(raw)
  } catch {
    return NextResponse.json({ gaps: [] })
  }

  // Score each topic by question frequency vs doc coverage
  const gaps = topics.map(topic => {
    const topicWords = topic.toLowerCase().split(' ').filter(w => w.length > 2)
const count = chats.filter(c => {
  const q = c.question.toLowerCase()
  return topicWords.some(word => q.includes(word))
}).length
    const docMentions = topicWords.reduce((acc, word) => {
  return acc + (docText.match(new RegExp(word, 'g')) ?? []).length
}, 0)
    const gapScore = count - (docMentions * 0.1)
    return { term: topic, count, docMentions, gapScore }
  })
  .filter(g => g.docMentions < 10)
  .sort((a, b) => b.gapScore - a.gapScore)

  return NextResponse.json({ gaps })
}