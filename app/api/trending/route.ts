import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

export async function GET() {
  try {
    const since = new Date()
    since.setDate(since.getDate() - 30)

    const { data, error } = await supabase
      .from('chat_logs')
      .select('question')
      .gte('created_at', since.toISOString())

    if (error) throw error

    const questions = (data ?? []).map(r => r.question).filter(Boolean)
    if (questions.length === 0) return NextResponse.json({ topics: [] })

    const prompt = `You are analyzing staff questions from a home health agency compliance system.

Here are the questions asked in the last 30 days:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Extract the top 8 compliance topics being asked about. Each topic should be a short 2-4 word phrase in English (e.g. "Infection Control", "Elder Abuse Reporting", "Medication Handling").

Respond ONLY with a JSON array like this, no other text:
[{"term": "Infection Control", "count": 5}, {"term": "Elder Abuse", "count": 3}]

Count how many questions relate to each topic. Sort by count descending.`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    })

    const raw = completion.choices[0]?.message?.content ?? '[]'
    const clean = raw.replace(/```json|```/g, '').trim()
    const topics = JSON.parse(clean)

    return NextResponse.json({ topics })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}