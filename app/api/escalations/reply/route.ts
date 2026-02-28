import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { escalation_id, reply, manager_name } = await req.json()
    if (!escalation_id || !reply) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Verify the escalation exists
    const { data: esc, error: escErr } = await supabase
      .from('chat_logs')
      .select('id, question, user_id')
      .eq('id', escalation_id)
      .single()

    if (escErr || !esc) {
      return NextResponse.json({ error: 'Escalation not found' }, { status: 404 })
    }

    // Save reply and mark resolved
    const { error: updateErr } = await supabase
      .from('chat_logs')
      .update({
        resolved: true,
        manager_reply: reply,
        manager_name: manager_name ?? 'Your Manager',
        replied_at: new Date().toISOString()
      })
      .eq('id', escalation_id)

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}