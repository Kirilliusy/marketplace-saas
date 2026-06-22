import { NextRequest, NextResponse } from 'next/server'
import { anthropic } from '@/lib/anthropic'
import { createClient } from '@/lib/supabase/server'

const FREE_LIMIT = 5

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { marketplace, productName, category, features, language } = await req.json()

  if (!productName || !marketplace) {
    return NextResponse.json({ error: 'productName and marketplace are required' }, { status: 400 })
  }

  // Check generation count for free users
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_pro, generations_today, last_reset_at')
    .eq('id', user.id)
    .single()

  const today = new Date().toISOString().split('T')[0]
  const lastReset = profile?.last_reset_at?.split('T')[0]
  const generationsToday = lastReset === today ? (profile?.generations_today ?? 0) : 0

  if (!profile?.is_pro && generationsToday >= FREE_LIMIT) {
    return NextResponse.json({ error: 'FREE_LIMIT_REACHED' }, { status: 403 })
  }

  const marketplaceGuides: Record<string, string> = {
    wildberries: 'Wildberries (российский маркетплейс). Используй ключевые слова для SEO WB. Стиль: продающий, эмоциональный.',
    ozon: 'Ozon (российский маркетплейс). Rich-контент, структурированное описание. Стиль: информативный.',
    amazon: 'Amazon (международный маркетплейс). A+ Content стиль. Пиши на английском языке.',
  }

  const guide = marketplaceGuides[marketplace] || marketplace
  const lang = language || (marketplace === 'amazon' ? 'английском' : 'русском')

  const prompt = `Ты — эксперт по продажам на маркетплейсах. Создай продающий контент для товара.

Маркетплейс: ${guide}
Название товара: ${productName}
Категория: ${category || 'не указана'}
Ключевые особенности: ${features || 'не указаны'}
Язык: ${lang}

Сгенерируй:
1. **Заголовок** (до 100 символов, с ключевыми словами)
2. **Краткое описание** (2-3 предложения, главные преимущества)
3. **Полное описание** (300-500 слов, продающий текст с SEO)
4. **Характеристики** (5-7 пунктов списком)
5. **Ключевые слова** (10-15 слов через запятую)

Формат: Markdown с заголовками ## для каждого раздела.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0].type === 'text' ? message.content[0].text : ''

  // Update generation count
  await supabase.from('profiles').upsert({
    id: user.id,
    generations_today: generationsToday + 1,
    last_reset_at: new Date().toISOString(),
  })

  // Save to history
  await supabase.from('generations').insert({
    user_id: user.id,
    marketplace,
    product_name: productName,
    result: content,
  })

  return NextResponse.json({ content, generationsToday: generationsToday + 1 })
}
