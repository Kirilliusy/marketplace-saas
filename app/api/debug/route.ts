import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

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

  // 3. Check Supabase RPC
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('increment_generation', {
      user_id_input: '00000000-0000-0000-0000-000000000000',
      free_limit: 5,
    })
    results.supabase_rpc = error ? `ERROR: ${error.message}` : `OK: ${JSON.stringify(data)}`
  } catch (e) {
    results.supabase_rpc = `ERROR: ${e}`
  }

  // 4. Check Anthropic API key format
  const key = process.env.ANTHROPIC_API_KEY || ''
  results.anthropic_key = key.startsWith('sk-ant-') ? `OK (len=${key.length})` : `MISSING or wrong format`

  // 5. Quick Anthropic API test
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'say ok' }],
    })
    results.anthropic_api = `OK: ${msg.content[0].type === 'text' ? msg.content[0].text : 'no text'}`
  } catch (e: unknown) {
    results.anthropic_api = `ERROR: ${e instanceof Error ? e.message : e}`
  }

  return NextResponse.json(results)
}
