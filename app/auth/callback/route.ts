import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  // Handle invite links (token_hash flow)
  if (token_hash && type) {
    // Redirect to login page with the token so client-side can handle it
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('token_hash', token_hash)
    redirectUrl.searchParams.set('type', type)
    return NextResponse.redirect(redirectUrl)
  }

  // Handle PKCE code flow
  if (!code) return NextResponse.redirect(new URL('/login', req.url))

  const redirectUrl = new URL('/login', req.url)
  redirectUrl.searchParams.set('code', code)
  return NextResponse.redirect(redirectUrl)
}