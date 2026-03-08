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

  // Generate magic link
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'invite',
    email,
    options: { data: { role, organization_id } }
  })

  if (linkError || !linkData) return NextResponse.json({ error: linkError?.message }, { status: 500 })

  const magicLink = linkData.properties?.action_link

  // Send single branded email via Resend
  await resend.emails.send({
    from: 'Handrail <hello@handrail.one>',
    to: email,
    subject: "You've been invited to Handrail",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 0;">
        <h2 style="margin-bottom: 8px;">Welcome to Handrail</h2>
        <p style="color: #6a5a45; margin-bottom: 24px;">You've been invited to join your agency's compliance training platform.</p>
        <a href="${magicLink}" style="display: inline-block; background: #5f8764; color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">Access Your Dashboard</a>
        <p style="color: #b0a08c; font-size: 12px; margin-top: 24px;">Your role: ${role}. This link expires in 24 hours.</p>
      </div>
    `
  })

  return NextResponse.json({ success: true })
}