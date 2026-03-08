import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const REQUIRED_TOPICS = [
  { term: 'Patient Abuse Prevention and Reporting', regulation: '105 CMR 155' },
  { term: 'Patient Rights and Bill of Rights', regulation: '42 CFR §484.50' },
  { term: 'Infection Control and Prevention', regulation: '42 CFR §484.80' },
  { term: 'Emergency Preparedness Plan', regulation: '42 CFR §484.102' },
  { term: 'OASIS Assessment and Reporting', regulation: '42 CFR §484.45' },
  { term: 'Plan of Care Development', regulation: '42 CFR §484.60' },
  { term: 'Medication Management and Administration', regulation: '42 CFR §484.60' },
  { term: 'Home Health Aide Supervision', regulation: '42 CFR §484.80' },
  { term: 'Background Checks and CORI', regulation: '101 CMR 15' },
  { term: 'Incident and Injury Reporting', regulation: '42 CFR §484.60' },
  { term: 'Privacy and HIPAA', regulation: '201 CMR 17' },
  { term: 'Grievance and Complaint Procedure', regulation: '42 CFR §484.50' },
  { term: 'Staff Training and Competency Evaluation', regulation: '42 CFR §484.80' },
  { term: 'Transfer and Discharge Policy', regulation: '42 CFR §484.50' },
  { term: 'Electronic Visit Verification', regulation: 'EVV / MassHealth' },
  { term: 'DNR and Advance Directives', regulation: '42 CFR §484.50' },
  { term: 'Mandatory Reporting – Elder Abuse', regulation: '651 CMR 5' },
  { term: 'Acceptance to Service Policy', regulation: '42 CFR §484.105' },
  { term: 'Quality Assurance and Performance Improvement', regulation: '42 CFR §484.65' },
  { term: 'Worker Safety and Injury Prevention', regulation: 'OSHA / MGL c.149' },
]

export async function GET() {
  const since = new Date()
  since.setDate(since.getDate() - 30)

  const { data: chats } = await supabase
    .from('chat_logs')
    .select('question')
    .gte('created_at', since.toISOString())

  const { data: chunks } = await supabase
    .from('document_chunks')
    .select('content')

  const docText = chunks?.map(c => c.content).join(' ') ?? ''
  const questions = chats?.map(c => c.question).join('\n') ?? ''

  if (!docText) return NextResponse.json({ gaps: [] })

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
        content: `You are a compliance analyst reviewing a home health agency's policy documents.

For each required compliance topic below, analyze:
1. docMentions: How well is this topic covered in the policy document? (0 = not covered at all, 1-2 = barely mentioned, 3-9 = lightly covered, 10+ = well covered). Be strict - a passing mention does not count as coverage.
2. count: How many of the employee questions relate to this topic? Use semantic understanding, not just keyword matching.

Return ONLY a JSON array, no other text:
[{"term": "exact topic name from list", "count": <number>, "docMentions": <number>}]

Required topics:
${REQUIRED_TOPICS.map(t => t.term).join('\n')}

Employee questions (last 30 days):
${questions || '(none yet)'}

Policy document:
${docText.slice(0, 8000)}`
      }],
      max_tokens: 1000
    })
  })

  const aiData = await res.json()
  let gaps: any[] = []

  try {
    const raw = aiData.choices[0].message.content.replace(/```json|```/g, '').trim()
    const scored = JSON.parse(raw)

    gaps = scored.map((g: any) => {
      const topic = REQUIRED_TOPICS.find(t => t.term === g.term)
      let label = null
      if (g.count >= 1 && g.docMentions <= 2) label = 'High Gap'
      else if (g.count >= 1 && g.docMentions <= 9) label = 'Gap'
      else if (g.count === 0 && g.docMentions <= 2) label = 'Low Gap'
      return {
        term: g.term,
        count: g.count,
        docMentions: g.docMentions,
        regulation: topic?.regulation ?? '',
        label
      }
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