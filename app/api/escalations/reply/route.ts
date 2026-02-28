import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { escalation_id, reply, manager_name } = await req.json()
    if (!escalation_id || !reply) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Get the escalation + original question + user email
    const { data: esc, error: escErr } = await supabase
      .from('chat_logs')
      .select('id, question, user_id')
      .eq('id', escalation_id)
      .single()

    if (escErr || !esc) {
      return NextResponse.json({ error: 'Escalation not found' }, { status: 404 })
    }

    // Get employee email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', esc.user_id)
      .single()

    if (!profile?.email) {
      return NextResponse.json({ error: 'Employee email not found' }, { status: 404 })
    }

    // Send email
    await resend.emails.send({
      from: 'PolicyPulse <noreply@policypulse.app>',
      to: profile.email,
      subject: 'Your question has been answered',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f9f9f9;">
          <h2 style="color: #1a1a2e;">Your question has been answered</h2>
          <div style="background: #fff; border-radius: 8px; padding: 20px; margin: 16px 0; border-left: 4px solid #4f8ef7;">
            <p style="color: #666; font-size: 13px; margin: 0 0 8px;">Your question:</p>
            <p style="color: #1a1a2e; font-style: italic;">"${esc.question}"</p>
          </div>
          <div style="background: #fff; border-radius: 8px; padding: 20px; margin: 16px 0; border-left: 4px solid #34d399;">
            <p style="color: #666; font-size: 13px; margin: 0 0 8px;">Answer from ${manager_name ?? 'your manager'}:</p>
            <p style="color: #1a1a2e;">${reply}</p>
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 24px;">PolicyPulse Compliance Platform</p>
        </div>
      `
    })

    // Mark escalation resolved and save reply
    await supabase
      .from('chat_logs')
      .update({ resolved: true, manager_reply: reply })
      .eq('id', escalation_id)

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}