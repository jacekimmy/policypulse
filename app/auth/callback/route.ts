import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (!code) return NextResponse.redirect(new URL('/login', req.url))

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) return NextResponse.redirect(new URL('/login', req.url))

  const user = data.user
  const metadata = user.user_metadata

  // Write role and org_id to profile
  await supabase.from('profiles').upsert({
    id: user.id,
    email: user.email,
    role: metadata.role ?? 'worker',
    organization_id: metadata.organization_id ?? null,
  })

  return NextResponse.redirect(new URL('/dashboard', req.url))
}