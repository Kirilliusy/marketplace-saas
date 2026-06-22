import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const results: Record<string, string> = {}

  // 1. Check auth
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    results.auth = user ? `OK: ${user.email}` : `No user: ${error?.message}`
  } catch (e) {
    results.auth = `ERROR: ${e}`
  }

  // 2. Check Supabase DB
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('profiles').select('id').limit(1)
    results.supabase_db = error ? `ERROR: ${error.message}` : 'OK'
  } catch (e) {
    results.supabase_db = `ERROR: ${e}`
  }

  // 3. Check DeepSeek key
  const key = process.env.DEEPSEEK_API_KEY || ''
  results.deepseek_key = key.startsWith('sk-') ? `OK (len=${key.length})` : 'MISSING'

  // 4. Test DeepSeek API directly
  try {
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'say ok' }],
        max_tokens: 5,
      }),
    })
    const data = await res.json()
    if (res.ok) {
      results.deepseek_api = `OK: ${data.choices?.[0]?.message?.content}`
    } else {
      results.deepseek_api = `ERROR ${res.status}: ${data.error?.message}`
    }
  } catch (e: unknown) {
    results.deepseek_api = `ERROR: ${e instanceof Error ? e.message : String(e)}`
  }

  return NextResponse.json(results)
}
