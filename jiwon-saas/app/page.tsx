import Link from 'next/link'

const PLANS = [
  {
    name: '무료',
    price: '0원',
    features: ['공고 3건 열람', '알림 없음', 'AI 초안 없음'],
    cta: '무료로 시작',
    highlight: false,
  },
  {
    name: '베이직',
    price: '29,000원/월',
    features: ['공고 전체 열람', '알림 무제한', 'AI 초안 없음'],
    cta: '시작하기',
    highlight: false,
  },
  {
    name: '스탠다드',
    price: '59,000원/월',
    features: ['공고 전체 열람', '알림 무제한', 'AI 초안 월 5건'],
    cta: '시작하기',
    highlight: true,
  },
  {
    name: '프리미엄',
    price: '99,000원/월',
    features: ['공고 전체 열람', '알림 무제한', 'AI 초안 무제한'],
    cta: '시작하기',
    highlight: false,
  },
]

const HOW_IT_WORKS = [
  { step: '01', title: '업종·지역 설정', desc: '내 사업장에 맞는 조건을 한 번만 입력하세요.' },
  { step: '02', title: '공고 자동 수집', desc: '기업마당 공공 API에서 매일 맞춤 지원사업을 수집합니다.' },
  { step: '03', title: '카카오 알림톡', desc: '마감 D-14, D-7, D-3일 전에 자동으로 알려드립니다.' },
]

export default function LandingPage() {
  return (
    <div className="text-white">

      {/* ── 헤더 ─────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <span className="text-xl font-bold" style={{ color: '#E8A020', fontFamily: 'var(--font-serif)' }}>
          🔔 지원알림
        </span>
        <Link
          href="/login"
          className="px-5 py-2 rounded-full text-sm font-medium border border-white/20 hover:border-[#E8A020] transition"
        >
          로그인
        </Link>
      </header>

      {/* ── 히어로 ───────────────────────────────────────────── */}
      <section className="text-center px-6 pt-20 pb-24 max-w-3xl mx-auto">
        <p className="text-sm font-medium mb-4 tracking-widest" style={{ color: '#E8A020' }}>
          소상공인 맞춤 지원사업 알림
        </p>
        <h1
          className="text-4xl md:text-5xl font-bold leading-tight mb-6"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          놓치는 정부 지원금,<br />이제 먼저 알려드립니다
        </h1>
        <p className="text-lg text-white/60 mb-10 leading-relaxed">
          업종과 지역만 설정하면<br />
          맞춤 지원사업을 찾아 마감 전에 카카오톡으로 알려드립니다.
        </p>
        <Link
          href="/login"
          className="inline-block px-8 py-4 rounded-full font-bold text-lg transition hover:opacity-90"
          style={{ backgroundColor: '#E8A020', color: '#08112A' }}
        >
          무료로 시작하기 →
        </Link>
      </section>

      {/* ── 작동 방식 ─────────────────────────────────────────── */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <h2
          className="text-2xl font-bold text-center mb-12"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          이렇게 작동합니다
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {HOW_IT_WORKS.map((item) => (
            <div
              key={item.step}
              className="rounded-2xl p-8 text-center"
              style={{ backgroundColor: '#0D1E3F' }}
            >
              <p className="text-4xl font-bold mb-4" style={{ color: '#E8A020' }}>{item.step}</p>
              <h3 className="text-lg font-bold mb-3">{item.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 요금제 ───────────────────────────────────────────── */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <h2
          className="text-2xl font-bold text-center mb-3"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          요금제
        </h2>
        <p className="text-center text-white/50 text-sm mb-12">언제든지 변경·해지 가능합니다</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="rounded-2xl p-6 flex flex-col border transition"
              style={{
                backgroundColor: '#0D1E3F',
                borderColor: plan.highlight ? '#E8A020' : 'transparent',
              }}
            >
              {plan.highlight && (
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full self-start mb-3"
                  style={{ backgroundColor: '#E8A020', color: '#08112A' }}
                >
                  인기
                </span>
              )}
              <p className="font-bold text-lg mb-1">{plan.name}</p>
              <p className="font-bold text-2xl mb-4" style={{ color: '#E8A020' }}>{plan.price}</p>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm text-white/60">· {f}</li>
                ))}
              </ul>
              <Link
                href="/login"
                className="block text-center py-2.5 rounded-xl text-sm font-semibold transition"
                style={{
                  backgroundColor: plan.highlight ? '#E8A020' : 'rgba(255,255,255,0.08)',
                  color: plan.highlight ? '#08112A' : 'rgba(255,255,255,0.7)',
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA 배너 ──────────────────────────────────────────── */}
      <section
        className="mx-6 mb-20 rounded-3xl px-8 py-16 text-center max-w-5xl md:mx-auto"
        style={{ backgroundColor: '#0D1E3F' }}
      >
        <h2
          className="text-2xl md:text-3xl font-bold mb-4"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          지금 바로 시작해보세요
        </h2>
        <p className="text-white/50 mb-8">신용카드 없이 무료로 시작할 수 있습니다</p>
        <Link
          href="/login"
          className="inline-block px-8 py-4 rounded-full font-bold transition hover:opacity-90"
          style={{ backgroundColor: '#E8A020', color: '#08112A' }}
        >
          무료로 시작하기
        </Link>
      </section>

      {/* ── 푸터 ─────────────────────────────────────────────── */}
      <footer className="text-center py-8 text-white/30 text-xs border-t border-white/5">
        © 2025 지원알림. 소상공인을 위한 정부 지원사업 알림 서비스.
      </footer>

    </div>
  )
}
