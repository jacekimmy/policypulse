import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

function todayString() {
  return new Date().toISOString().slice(0, 10)
}

export async function GET() {
  try {
    const today = todayString()

    // Check if today's questions already exist
    const { data: existing } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_date', today)

    if (existing && existing.length >= 3) {
      return NextResponse.json({ questions: existing })
    }

    // Pull document chunks for context
    const { data: chunks } = await supabase
      .from('document_chunks')
      .select('content')
      .limit(20)

    const context = (chunks ?? []).map(c => c.content).join('\n\n').slice(0, 6000)

    const prompt = context.length > 100
      ? `You are a compliance training expert. Based on the following policy document content, generate exactly 3 multiple choice quiz questions to test employee knowledge. Each question must have 4 options (A, B, C, D) and one correct answer.

POLICY CONTENT:
${context}

Return ONLY valid JSON in this exact format, no other text:
[
  {
    "question": "Question text here?",
    "topic": "Topic category",
    "option_a": "Option A text",
    "option_b": "Option B text",
    "option_c": "Option C text",
    "option_d": "Option D text",
    "correct_option": "A",
    "explanation": "Brief explanation of the correct answer"
  }
]`
      : `You are a compliance training expert for a home health care / assisted living company. Generate exactly 3 multiple choice quiz questions covering topics like HIPAA, resident rights, medication administration, incident reporting, and caregiver safety. Each question must have 4 options (A, B, C, D) and one correct answer.

Return ONLY valid JSON in this exact format, no other text:
[
  {
    "question": "Question text here?",
    "topic": "Topic category",
    "option_a": "Option A text",
    "option_b": "Option B text",
    "option_c": "Option C text",
    "option_d": "Option D text",
    "correct_option": "A",
    "explanation": "Brief explanation of the correct answer"
  }
]`

    const completion = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    })

    const raw = completion.choices[0]?.message?.content ?? '[]'
    const cleaned = raw.replace(/```json|```/g, '').trim()
    const questions = JSON.parse(cleaned)

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid questions format from AI')
    }

    // Delete old questions and insert today's
    await supabase.from('quiz_questions').delete().neq('quiz_date', today)

    const toInsert = questions.slice(0, 3).map((q: any) => ({
      ...q,
      quiz_date: today,
    }))

    const { data: inserted, error } = await supabase
      .from('quiz_questions')
      .insert(toInsert)
      .select()

    if (error) throw error

    return NextResponse.json({ questions: inserted, generated: true })
  } catch (e: any) {
    console.error('Quiz generate error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}