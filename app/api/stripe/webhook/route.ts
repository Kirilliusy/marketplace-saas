import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = session.metadata?.user_id
    if (userId) {
      await supabaseAdmin.from('profiles').upsert({ id: userId, is_pro: true })
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object
    const customer = await stripe.customers.retrieve(subscription.customer as string)
    if ('email' in customer && customer.email) {
      const { data: users } = await supabaseAdmin.auth.admin.listUsers()
      const user = users.users.find(u => u.email === customer.email)
      if (user) {
        await supabaseAdmin.from('profiles').upsert({ id: user.id, is_pro: false })
      }
    }
  }

  return NextResponse.json({ received: true })
}
