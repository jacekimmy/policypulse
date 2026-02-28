import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const STOP_WORDS = new Set([
  'the','a','an','is','it','in','on','at','to','for','of','and','or','but',
  'what','how','can','do','does','i','my','we','our','you','your','me','us',
  'this','that','with','have','has','are','was','were','be','been','will',
  'would','could','should','if','when','where','who','which','about','from',
  'not','no','any','all','some','they','their','there','than','then','just',
  'its','his','her','him','she','he','get','got','need','want','know','tell',
  'please','help','explain','policy','employee','company','handbook'
])

export async function GET() {
  try {
    const since = new Date()
    since.setDate(since.getDate() - 30)

    const { data, error } = await supabase
      .from('chat_logs')
      .select('question')
      .gte('created_at', since.toISOString())

    if (error) throw error

    const freq: Record<string, number> = {}

    for (const row of data ?? []) {
      const words = (row.question ?? '')
        .toLowerCase()
        .replace(/[^a-z\s]/g, '')
        .split(/\s+/)
        .filter((w: string) => w.length > 3 && !STOP_WORDS.has(w))

      for (const word of words) {
        freq[word] = (freq[word] ?? 0) + 1
      }
    }

    const topics = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([term, count]) => ({ term, count }))

    return NextResponse.json({ topics })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}