import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function escape(val: any): string {
  if (val == null) return ''
  const str = String(val).replace(/"/g, '""')
  return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str
}

export async function GET() {
  try {
    const [{ data: chats }, { data: quizzes }, { data: profiles }] = await Promise.all([
      supabase.from('chat_logs').select('*').order('created_at', { ascending: false }),
      supabase.from('quiz_results').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name, email')
    ])

    const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))

    const rows: string[] = [
      'Type,User,Email,Timestamp,Question/Quiz,Answer/Score,Escalated'
    ]

    for (const c of chats ?? []) {
      const p = profileMap[c.user_id] ?? {}
      rows.push([
        'Chat',
        escape(p.full_name ?? ''),
        escape(p.email ?? ''),
        escape(c.created_at),
        escape(c.question),
        escape(c.answer),
        escape(c.escalated ? 'Yes' : 'No'),
      ].join(','))
    }

    for (const q of quizzes ?? []) {
      const p = profileMap[q.user_id] ?? {}
      rows.push([
        'Quiz',
        escape(p.full_name ?? ''),
        escape(p.email ?? ''),
        escape(q.created_at),
        'Daily Knowledge Check',
        escape(`${q.score}%`),
        '',
      ].join(','))
    }

    const csv = rows.join('\n')
    const date = new Date().toISOString().slice(0, 10)

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="policypulse-audit-${date}.csv"`,
      }
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}