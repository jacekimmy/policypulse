import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  const { question } = await req.json()

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a compliance policy assistant for a financial services firm. 
You answer questions based on company policy. 
Always end your answer with a citation in this exact format: [Source: Section X.X - Topic Name]
If you don't know the answer, say so clearly and suggest the employee speak to their manager.
Keep answers concise and professional.`
      },
      {
        role: 'user',
        content: question
      }
    ],
    max_tokens: 300,
  })

  const text = completion.choices[0]?.message?.content ?? 'I could not generate a response.'
  
  // Extract citation if present
  const citationMatch = text.match(/\[Source: (.+?)\]/)
  const citation = citationMatch ? citationMatch[1] : null
  const answer = text.replace(/\[Source: .+?\]/, '').trim()

  return NextResponse.json({ answer, citation })
}