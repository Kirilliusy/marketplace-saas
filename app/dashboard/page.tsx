'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'

const MARKETPLACES = [
  { id: 'wildberries', label: 'Wildberries', accent: '#CB11AB', short: 'WB' },
  { id: 'ozon', label: 'Ozon', accent: '#005BFF', short: 'OZ' },
  { id: 'amazon', label: 'Amazon', accent: '#FF9900', short: 'AM' },
]

const FREE_LIMIT = 5

function StarRating({ value, accent }: { value: number; accent: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="11" height="11" viewBox="0 0 12 12" fill={i <= Math.round(value) ? accent : 'none'} stroke={accent} strokeWidth="1">
          <path d="M6 1l1.3 2.6L10 4l-2 1.9.5 2.7L6 7.4 3.5 8.6l.5-2.7L2 4l2.7-.4z" />
        </svg>
      ))}
    </div>
  )
}

function MarketplaceCardPreview({ marketplace, productName, result }: {
  marketplace: typeof MARKETPLACES[0]
  productName: string
  result: string
}) {
  const { accent, label } = marketplace

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: '#E5E1D8' }}
    >
      {/* Marketplace header */}
      <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: accent }}>
        <span className="text-xs font-bold text-white tracking-wide">{label}</span>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-white opacity-50" />
          <div className="w-2 h-2 rounded-full bg-white opacity-50" />
          <div className="w-2 h-2 rounded-full bg-white opacity-50" />
        </div>
      </div>

      {/* Product card mock */}
      <div className="bg-white">
        {/* Image placeholder */}
        <div className="h-28 flex items-center justify-center" style={{ background: `${accent}08` }}>
          <svg width="32" height="32" fill="none" stroke={accent} strokeWidth="1.5" viewBox="0 0 24 24" opacity="0.3">
            <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 16l5-5 4 4 3-3 6 6" />
            <circle cx="8.5" cy="8.5" r="1.5" />
          </svg>
        </div>

        <div className="p-4">
          <p className="text-xs font-semibold text-[#191917] leading-snug mb-2 line-clamp-2">
            {productName || 'Название товара'}
          </p>
          <div className="flex items-center gap-2 mb-3">
            <StarRating value={4.8} accent={accent} />
            <span className="text-xs text-[#6B6760]" style={{ fontFamily: 'var(--font-fira), monospace' }}>4.8 · 1 234 отзыва</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-sm text-[#191917]">3 490 ₽</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${accent}15`, color: accent }}>
              В наличии
            </span>
          </div>

          {/* Generated content */}
          <div className="border-t border-[#E5E1D8] pt-3">
            <div className="prose prose-sm max-w-none text-[#191917] overflow-y-auto max-h-72
              [&_h2]:text-xs [&_h2]:font-bold [&_h2]:uppercase [&_h2]:tracking-wide [&_h2]:text-[#6B6760] [&_h2]:mt-3 [&_h2]:mb-1
              [&_p]:text-xs [&_p]:leading-relaxed [&_p]:text-[#191917] [&_p]:mb-2
              [&_li]:text-xs [&_li]:text-[#191917] [&_li]:leading-relaxed
              [&_ul]:pl-3 [&_ul]:space-y-0.5 [&_strong]:font-semibold">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      {/* AI footer */}
      <div className="px-4 py-2 border-t border-[#E5E1D8] flex items-center gap-2" style={{ background: '#F6F4F0' }}>
        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
        <span className="text-xs text-[#6B6760]" style={{ fontFamily: 'var(--font-fira), monospace' }}>
          MarketAI · claude-sonnet
        </span>
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [isPro, setIsPro] = useState(false)
  const [generationsToday, setGenerationsToday] = useState(0)

  const [marketplace, setMarketplace] = useState(0)
  const [productName, setProductName] = useState('')
  const [category, setCategory] = useState('')
  const [features, setFeatures] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const activeMarketplace = MARKETPLACES[marketplace]

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setUser(user)
      supabase.from('profiles').select('is_pro, generations_today, last_reset_at')
        .eq('id', user.id).single()
        .then(({ data }) => {
          if (data) {
            setIsPro(data.is_pro ?? false)
            const today = new Date().toISOString().split('T')[0]
            const lastReset = data.last_reset_at?.split('T')[0]
            setGenerationsToday(lastReset === today ? (data.generations_today ?? 0) : 0)
          }
        })
    })
  }, [])

  const handleGenerate = async () => {
    if (!productName.trim()) { setError('Введите название товара'); return }
    setLoading(true)
    setError('')
    setResult('')

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ marketplace: activeMarketplace.id, productName, category, features }),
    })

    if (res.status === 403) {
      setError('Дневной лимит исчерпан. Перейдите на Pro.')
      setLoading(false)
      return
    }
    if (!res.ok) { setError('Ошибка генерации. Попробуйте ещё раз.'); setLoading(false); return }

    const data = await res.json()
    setResult(data.content)
    setGenerationsToday(data.generationsToday)
    setLoading(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleUpgrade = async () => {
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const { url } = await res.json()
    window.location.href = url
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen" style={{ background: '#F6F4F0' }}>
      {/* Header */}
      <header className="bg-white border-b border-[#E5E1D8] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span style={{ fontFamily: 'var(--font-unbounded), sans-serif', fontSize: '14px', fontWeight: 800, color: '#191917' }}>
              MarketAI
            </span>
            {isPro && (
              <span className="bg-[#EEF1FD] text-[#2855D8] text-xs font-semibold px-2 py-0.5 rounded-full">PRO</span>
            )}
          </div>
          <div className="flex items-center gap-5">
            {!isPro && (
              <span className="text-xs text-[#6B6760]" style={{ fontFamily: 'var(--font-fira), monospace' }}>
                {generationsToday}/{FREE_LIMIT} сегодня
              </span>
            )}
            <span className="text-sm text-[#6B6760]">{user?.email}</span>
            <button onClick={handleLogout} className="text-sm text-[#6B6760] hover:text-[#191917] transition-colors cursor-pointer">
              Выйти
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Upgrade banner */}
        {!isPro && generationsToday >= FREE_LIMIT && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-[#2855D8] bg-[#EEF1FD] px-6 py-4 flex items-center justify-between"
          >
            <div>
              <p className="font-semibold text-[#191917] text-sm">Лимит на сегодня исчерпан</p>
              <p className="text-xs text-[#6B6760] mt-0.5">Pro — безлимитные генерации, история и поддержка</p>
            </div>
            <button
              onClick={handleUpgrade}
              className="bg-[#2855D8] text-white font-semibold text-sm px-5 py-2 rounded-xl hover:bg-[#1e44c2] transition-colors cursor-pointer whitespace-nowrap"
            >
              Перейти на Pro · $15/мес
            </button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="bg-white rounded-2xl border border-[#E5E1D8] p-7">
            <h2 className="font-bold text-[#191917] mb-6">Параметры товара</h2>

            <div className="space-y-5">
              {/* Marketplace selector */}
              <div>
                <label className="text-xs font-semibold text-[#6B6760] uppercase tracking-wide block mb-2">Маркетплейс</label>
                <div className="flex gap-2">
                  {MARKETPLACES.map((m, i) => (
                    <button
                      key={m.id}
                      onClick={() => setMarketplace(i)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 cursor-pointer"
                      style={{
                        background: marketplace === i ? m.accent : '#fff',
                        color: marketplace === i ? '#fff' : '#6B6760',
                        borderColor: marketplace === i ? m.accent : '#E5E1D8',
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#6B6760] uppercase tracking-wide block mb-2">Название товара *</label>
                <input
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                  placeholder="Кроссовки мужские беговые Nike Air"
                  className="w-full border border-[#E5E1D8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2855D8] transition-colors bg-[#F6F4F0]"
                  style={{ color: '#191917' }}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#6B6760] uppercase tracking-wide block mb-2">Категория</label>
                <input
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  placeholder="Обувь / Спорт"
                  className="w-full border border-[#E5E1D8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2855D8] transition-colors bg-[#F6F4F0]"
                  style={{ color: '#191917' }}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#6B6760] uppercase tracking-wide block mb-2">Ключевые особенности</label>
                <textarea
                  value={features}
                  onChange={e => setFeatures(e.target.value)}
                  placeholder="Амортизация, дышащий материал, подошва Vibram, размеры 40-46"
                  rows={3}
                  className="w-full border border-[#E5E1D8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2855D8] transition-colors resize-none bg-[#F6F4F0]"
                  style={{ color: '#191917' }}
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading || (!isPro && generationsToday >= FREE_LIMIT)}
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 cursor-pointer disabled:opacity-40"
                style={{ background: loading ? '#6B6760' : activeMarketplace.accent }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Генерирую...
                  </span>
                ) : 'Сгенерировать контент'}
              </button>
            </div>
          </div>

          {/* Result */}
          <div>
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl border border-[#E5E1D8] p-7 h-full flex flex-col items-center justify-center gap-3 min-h-64"
                >
                  <div
                    className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: `${activeMarketplace.accent}40`, borderTopColor: activeMarketplace.accent }}
                  />
                  <p className="text-sm text-[#6B6760]">Пишу текст для {activeMarketplace.label}...</p>
                </motion.div>
              )}

              {!loading && !result && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl border border-[#E5E1D8] p-7 h-full flex flex-col items-center justify-center gap-3 min-h-64"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#F6F4F0' }}>
                    <svg width="22" height="22" fill="none" stroke="#6B6760" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M12 2l3.1 6.2L22 9.3l-5 4.9 1.2 6.9L12 18l-6.2 3.1L7 14.2 2 9.3l6.9-1.1z" />
                    </svg>
                  </div>
                  <p className="text-sm text-[#6B6760] text-center">Заполните форму и нажмите<br />«Сгенерировать контент»</p>
                </motion.div>
              )}

              {!loading && result && (
                <div key="result">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-[#6B6760] uppercase tracking-wide">Результат · {activeMarketplace.label}</p>
                    <button
                      onClick={handleCopy}
                      className="text-xs font-semibold cursor-pointer transition-colors"
                      style={{ color: copied ? '#22c55e' : '#2855D8' }}
                    >
                      {copied ? 'Скопировано!' : 'Копировать текст'}
                    </button>
                  </div>
                  <MarketplaceCardPreview
                    marketplace={activeMarketplace}
                    productName={productName}
                    result={result}
                  />
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
