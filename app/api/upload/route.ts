import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function chunkText(text: string, size = 500): string[] {
  const words = text.split(/\s+/)
  const chunks: string[] = []
  let current: string[] = []
  for (const word of words) {
    current.push(word)
    if (current.length >= size) {
      chunks.push(current.join(' '))
      current = []
    }
  }
  if (current.length > 0) chunks.push(current.join(' '))
  return chunks
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  
  let text = ''
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pdfParse = require('pdf-parse')
    const parsed = await pdfParse(buffer)
    text = parsed.text
  } catch (e) {
    return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 500 })
  }

  const { data: doc, error: docError } = await supabase
    .from('documents')
    .insert({ name: file.name, content: text })
    .select()
    .single()

  if (docError) return NextResponse.json({ error: docError.message }, { status: 500 })

  const chunks = chunkText(text)
  const chunkRows = chunks.map((content, i) => ({
    document_id: doc.id,
    chunk_index: i,
    content
  }))

  const { error: chunkError } = await supabase
    .from('document_chunks')
    .insert(chunkRows)

  if (chunkError) return NextResponse.json({ error: chunkError.message }, { status: 500 })

  return NextResponse.json({ success: true, chunks: chunks.length, name: file.name })
}