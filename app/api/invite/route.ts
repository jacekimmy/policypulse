import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { email, role } = await req.json()

  // Create invite record
  const { error: inviteError } = await supabase
    .from('invites')
    .insert({ email, role })

  if (inviteError) return NextResponse.json({ error: inviteError.message }, { status: 500 })

  // Send magic link via Supabase
  const { error: authError } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { role }
  })

  if (authError) return NextResponse.json({ error: authError.message }, { status: 500 })

  // Send welcome email via Resend
  await resend.emails.send({
    from: 'PolicyPulse <onboarding@resend.dev>',
    to: email,
    subject: 'You have been invited to PolicyPulse',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Welcome to PolicyPulse</h2>
        <p>You have been invited to join your firm's compliance training platform.</p>
        <p>Check your inbox for a separate email from Supabase with your login link. Click it to set your password and access your dashboard.</p>
        <p>Your role: <strong>${role}</strong></p>
      </div>
    `
  })

  return NextResponse.json({ success: true })
}