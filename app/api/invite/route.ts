import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { email, role, adminId } = await req.json()

  // Look up admin's organization_id
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', adminId)
    .single()

  if (!adminProfile?.organization_id) {
    return NextResponse.json({ error: 'Admin has no organization assigned' }, { status: 400 })
  }

  const organization_id = adminProfile.organization_id

  // Create invite record
  const { error: inviteError } = await supabase
    .from('invites')
    .insert({ email, role, organization_id })

  if (inviteError) return NextResponse.json({ error: inviteError.message }, { status: 500 })

  // Send magic link with role + org_id in metadata
  const { error: authError } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { role, organization_id }
  })

  if (authError) return NextResponse.json({ error: authError.message }, { status: 500 })

  await resend.emails.send({
    from: 'Handrail <hello@handrail.one>',
    to: email,
    subject: 'You have been invited to Handrail',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Welcome to Handrail</h2>
        <p>You have been invited to join your firm's compliance training platform.</p>
        <p>Check your inbox for a separate email from Supabase with your login link. Click it to access your dashboard.</p>
        <p>Your role: <strong>${role}</strong></p>
      </div>
    `
  })

  return NextResponse.json({ success: true })
}