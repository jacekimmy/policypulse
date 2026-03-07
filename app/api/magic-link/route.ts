import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { email, redirectTo } = await req.json()

  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` }
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const magicLink = data.properties.action_link

  await resend.emails.send({
    from: 'Handrail <hello@handrail.one>',
    to: email,
    subject: 'Your Handrail login link',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="font-size: 22px; color: #2c2415;">Sign in to Handrail</h2>
        <p style="color: #6a5a45; line-height: 1.6; margin: 16px 0;">Click the button below to log in. No password needed.</p>
        <a href="${magicLink}" style="display: inline-block; margin: 24px 0; padding: 14px 28px; background: #7a9e7e; color: white; border-radius: 10px; text-decoration: none; font-weight: 600;">Log in to Handrail</a>
        <p style="color: #b0a08c; font-size: 12px;">This link expires in 24 hours. If you didn't request this, ignore it.</p>
      </div>
    `
  })

  return NextResponse.json({ success: true })
}