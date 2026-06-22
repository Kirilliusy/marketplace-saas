'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const step = target / 40
    let current = 0
    const timer = setInterval(() => {
      current += step
      if (current >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(current))
    }, 30)
    return () => clearInterval(timer)
  }, [inView, target])

  return <span ref={ref}>{count}{suffix}</span>
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
}

const CARD_PREVIEW = {
  wildberries: {
    accent: '#CB11AB',
    label: 'Wildberries',
    stars: 4.8,
    reviews: 2341,
    price: '3 490 ₽',
    title: 'Кроссовки мужские беговые Nike Air Max — амортизация, дышащий материал',
    badge: 'Хит продаж',
  },
  ozon: {
    accent: '#005BFF',
    label: 'Ozon',
    stars: 4.9,
    reviews: 891,
    price: '3 799 ₽',
    title: 'Кроссовки Nike Air Max мужские | Беговые | Подошва Vibram | р. 40-46',
    badge: 'Premium',
  },
  amazon: {
    accent: '#FF9900',
    label: 'Amazon',
    stars: 4.7,
    reviews: 5102,
    price: '$42.99',
    title: 'Nike Air Max Men\'s Running Shoes — Breathable, Cushioned, Sizes 7-13',
    badge: 'Best Seller',
  },
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill={i <= Math.round(value) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1" className="text-amber-400">
          <path d="M6 1l1.3 2.6L10 4l-2 1.9.5 2.7L6 7.4 3.5 8.6l.5-2.7L2 4l2.7-.4z" />
        </svg>
      ))}
    </div>
  )
}

function HeroCard() {
  const [active, setActive] = useState<keyof typeof CARD_PREVIEW>('wildberries')
  const card = CARD_PREVIEW[active]

  return (
    <div className="relative">
      {/* Marketplace tabs */}
      <div className="flex gap-2 mb-3">
        {(Object.keys(CARD_PREVIEW) as Array<keyof typeof CARD_PREVIEW>).map(key => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className="px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer"
            style={{
              background: active === key ? card.accent : '#E5E1D8',
              color: active === key ? '#fff' : '#6B6760',
            }}
          >
            {CARD_PREVIEW[key].label}
          </button>
        ))}
      </div>

      {/* Product card */}
      <motion.div
        key={active}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl border border-[#E5E1D8] overflow-hidden shadow-sm"
      >
        {/* Image placeholder */}
        <div className="h-44 flex items-center justify-center" style={{ background: `${card.accent}10` }}>
          <div className="text-center opacity-30">
            <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="mx-auto mb-1" style={{ color: card.accent }}>
              <path d="M4 16l4-4 4 4 4-6 4 6" /><rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
            <p className="text-xs" style={{ color: card.accent }}>Фото товара</p>
          </div>
        </div>

        <div className="p-4">
          {/* Badge */}
          <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2" style={{ background: `${card.accent}15`, color: card.accent }}>
            {card.badge}
          </span>

          {/* Title */}
          <p className="text-sm font-semibold text-[#191917] leading-snug mb-2 line-clamp-2">{card.title}</p>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <StarRating value={card.stars} />
            <span className="text-xs text-[#6B6760]">{card.stars} · {card.reviews.toLocaleString('ru')} отзывов</span>
          </div>

          {/* Price + CTA */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg text-[#191917]">{card.price}</span>
            <button
              className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer"
              style={{ background: card.accent }}
            >
              В корзину
            </button>
          </div>
        </div>

        {/* AI label */}
        <div className="border-t border-[#E5E1D8] px-4 py-2 flex items-center gap-2 bg-[#F6F4F0]">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-[#6B6760] font-mono">Сгенерировано MarketAI · 8 сек</span>
        </div>
      </motion.div>
    </div>
  )
}

export default function Home() {
  const featuresRef = useRef(null)
  const featuresInView = useInView(featuresRef, { once: true, margin: '-80px' })

  const statsRef = useRef(null)
  const statsInView = useInView(statsRef, { once: true, margin: '-80px' })

  return (
    <div className="min-h-screen" style={{ background: '#F6F4F0' }}>
      {/* Nav */}
      <nav className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <span style={{ fontFamily: 'var(--font-unbounded), sans-serif', fontSize: '15px', fontWeight: 800, color: '#191917', letterSpacing: '-0.02em' }}>
          MarketAI
        </span>
        <div className="flex items-center gap-4">
          <Link href="#pricing" className="text-sm text-[#6B6760] hover:text-[#191917] transition-colors">Тарифы</Link>
          <Link
            href="/auth/login"
            className="bg-[#2855D8] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-[#1e44c2] transition-colors"
          >
            Войти
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp}>
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#2855D8] mb-5 px-3 py-1 bg-[#EEF1FD] rounded-full">
              Wildberries · Ozon · Amazon
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            style={{ fontFamily: 'var(--font-unbounded), sans-serif', fontWeight: 800, fontSize: 'clamp(32px, 4vw, 52px)', lineHeight: 1.1, letterSpacing: '-0.03em', color: '#191917' }}
          >
            Описания<br />товаров<br />
            <span style={{ color: '#2855D8' }}>за 10 секунд</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-6 text-[#6B6760] text-lg leading-relaxed max-w-md">
            Больше не нужно тратить часы на тексты. MarketAI пишет продающие описания, SEO-заголовки и ключевые слова — специально под каждый маркетплейс.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex items-center gap-4">
            <Link
              href="/auth/login"
              className="inline-block bg-[#191917] text-white px-7 py-3.5 rounded-xl text-sm font-semibold hover:bg-[#2855D8] transition-colors duration-200"
            >
              Попробовать бесплатно
            </Link>
            <span className="text-xs text-[#6B6760]">5 генераций · без карты</span>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <HeroCard />
        </motion.div>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="max-w-6xl mx-auto px-6 py-12">
        <div className="border border-[#E5E1D8] rounded-2xl bg-white grid grid-cols-3 divide-x divide-[#E5E1D8]">
          {[
            { value: 12000, suffix: '+', label: 'товаров описано' },
            { value: 10, suffix: 'x', label: 'быстрее вручную' },
            { value: 3, suffix: '', label: 'маркетплейса' },
          ].map((s, i) => (
            <div key={i} className="px-8 py-7 text-center">
              <div
                style={{ fontFamily: 'var(--font-unbounded), sans-serif', fontWeight: 800, fontSize: '36px', color: '#191917', letterSpacing: '-0.03em' }}
              >
                {statsInView ? <CountUp target={s.value} suffix={s.suffix} /> : `0${s.suffix}`}
              </div>
              <p className="text-sm text-[#6B6760] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section ref={featuresRef} className="max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial="hidden"
          animate={featuresInView ? 'visible' : 'hidden'}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {[
            { step: '01', title: 'Введи данные', desc: 'Название товара, категория, ключевые особенности — всё в одной форме.' },
            { step: '02', title: 'AI пишет', desc: 'Claude генерирует заголовок, описание, характеристики и ключевые слова под конкретный маркетплейс.' },
            { step: '03', title: 'Копируй', desc: 'Готовый текст — сразу в карточку товара. Никакой правки, никаких шаблонов.' },
          ].map((item) => (
            <motion.div key={item.step} variants={fadeUp} className="bg-white border border-[#E5E1D8] rounded-2xl p-7">
              <span className="font-mono text-xs text-[#6B6760] tracking-widest">{item.step}</span>
              <h3 className="mt-3 font-bold text-lg text-[#191917]">{item.title}</h3>
              <p className="mt-2 text-sm text-[#6B6760] leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-16">
        <h2 style={{ fontFamily: 'var(--font-unbounded), sans-serif', fontWeight: 800, fontSize: '28px', letterSpacing: '-0.02em', color: '#191917' }} className="mb-10 text-center">
          Тарифы
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {/* Free */}
          <div className="bg-white border border-[#E5E1D8] rounded-2xl p-8">
            <p className="font-semibold text-[#191917]">Бесплатно</p>
            <div style={{ fontFamily: 'var(--font-unbounded), sans-serif', fontWeight: 800, fontSize: '36px', letterSpacing: '-0.03em', color: '#191917' }} className="mt-2">
              $0
            </div>
            <ul className="mt-6 space-y-2.5">
              {['5 генераций в день', 'WB, Ozon, Amazon', 'Копирование результата'].map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-[#6B6760]">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3 6-6" stroke="#2855D8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/auth/login" className="mt-7 block text-center border border-[#E5E1D8] rounded-xl py-2.5 text-sm font-medium text-[#191917] hover:border-[#2855D8] hover:text-[#2855D8] transition-colors">
              Начать бесплатно
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-[#191917] rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: '#2855D8', filter: 'blur(40px)', transform: 'translate(30%, -30%)' }} />
            <p className="font-semibold text-white">Pro</p>
            <div style={{ fontFamily: 'var(--font-unbounded), sans-serif', fontWeight: 800, fontSize: '36px', letterSpacing: '-0.03em', color: '#fff' }} className="mt-2">
              $15 <span className="text-base font-normal text-neutral-400">/мес</span>
            </div>
            <ul className="mt-6 space-y-2.5">
              {['Безлимитные генерации', 'История запросов', 'Приоритетная скорость', 'Поддержка'].map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-neutral-300">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3 6-6" stroke="#2855D8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/auth/login" className="mt-7 block text-center bg-[#2855D8] rounded-xl py-2.5 text-sm font-semibold text-white hover:bg-[#1e44c2] transition-colors">
              Начать с Pro
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-8 border-t border-[#E5E1D8] flex items-center justify-between">
        <span style={{ fontFamily: 'var(--font-unbounded), sans-serif', fontSize: '13px', fontWeight: 800, color: '#191917' }}>MarketAI</span>
        <p className="text-xs text-[#6B6760]">© 2026 MarketAI. Все права защищены.</p>
      </footer>
    </div>
  )
}
