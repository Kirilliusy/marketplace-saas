import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'

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

  // 3. Check DeepSeek API key
  const key = process.env.DEEPSEEK_API_KEY || ''
  results.deepseek_key = key.startsWith('sk-') ? `OK (len=${key.length})` : 'MISSING'

  // 4. Quick DeepSeek API test
  try {
    const deepseek = createOpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: process.env.DEEPSEEK_API_KEY,
    })
    const { text } = await generateText({
      model: deepseek('deepseek-chat'),
      prompt: 'Say "ok" in one word.',
      maxOutputTokens: 10,
    })
    results.deepseek_api = `OK: ${text}`
  } catch (e: unknown) {
    results.deepseek_api = `ERROR: ${e instanceof Error ? e.message : String(e)}`
  }

  return NextResponse.json(results)
}
