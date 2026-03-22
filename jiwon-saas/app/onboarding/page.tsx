'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { BizType, BizSize } from '@/lib/supabase/types'

// ─── 지역 데이터 ──────────────────────────────────────────────
const REGIONS: Record<string, string[]> = {
  '서울특별시': ['강남구','강동구','강북구','강서구','관악구','광진구','구로구','금천구','노원구','도봉구','동대문구','동작구','마포구','서대문구','서초구','성동구','성북구','송파구','양천구','영등포구','용산구','은평구','종로구','중구','중랑구'],
  '경기도': ['수원시','성남시','의정부시','안양시','부천시','광명시','평택시','동두천시','안산시','고양시','과천시','구리시','남양주시','오산시','시흥시','군포시','의왕시','하남시','용인시','파주시','이천시','안성시','김포시','화성시','광주시','양주시','포천시','여주시','연천군','가평군','양평군'],
  '부산광역시': ['중구','서구','동구','영도구','부산진구','동래구','남구','북구','해운대구','사하구','금정구','강서구','연제구','수영구','사상구','기장군'],
  '인천광역시': ['중구','동구','미추홀구','연수구','남동구','부평구','계양구','서구','강화군','옹진군'],
  '대구광역시': ['중구','동구','서구','남구','북구','수성구','달서구','달성군'],
  '대전광역시': ['동구','중구','서구','유성구','대덕구'],
  '광주광역시': ['동구','서구','남구','북구','광산구'],
  '울산광역시': ['중구','남구','동구','북구','울주군'],
  '세종특별자치시': ['세종시'],
  '강원특별자치도': ['춘천시','원주시','강릉시','동해시','태백시','속초시','삼척시','홍천군','횡성군','영월군','평창군','정선군','철원군','화천군','양구군','인제군','고성군','양양군'],
  '충청북도': ['청주시','충주시','제천시','보은군','옥천군','영동군','증평군','진천군','괴산군','음성군','단양군'],
  '충청남도': ['천안시','공주시','보령시','아산시','서산시','논산시','계룡시','당진시','금산군','부여군','서천군','청양군','홍성군','예산군','태안군'],
  '전북특별자치도': ['전주시','군산시','익산시','정읍시','남원시','김제시','완주군','진안군','무주군','장수군','임실군','순창군','고창군','부안군'],
  '전라남도': ['목포시','여수시','순천시','나주시','광양시','담양군','곡성군','구례군','고흥군','보성군','화순군','장흥군','강진군','해남군','영암군','무안군','함평군','영광군','장성군','완도군','진도군','신안군'],
  '경상북도': ['포항시','경주시','김천시','안동시','구미시','영주시','영천시','상주시','문경시','경산시','군위군','의성군','청송군','영양군','영덕군','청도군','고령군','성주군','칠곡군','예천군','봉화군','울진군','울릉군'],
  '경상남도': ['창원시','진주시','통영시','사천시','김해시','밀양시','거제시','양산시','의령군','함안군','창녕군','고성군','남해군','하동군','산청군','함양군','거창군','합천군'],
  '제주특별자치도': ['제주시','서귀포시'],
}

// ─── 업종 목록 ────────────────────────────────────────────────
const BIZ_TYPES: { value: BizType; label: string; emoji: string }[] = [
  { value: 'restaurant', label: '음식업·카페', emoji: '🍽️' },
  { value: 'retail',     label: '소매·판매업', emoji: '🛍️' },
  { value: 'beauty',     label: '미용·뷰티',   emoji: '✂️' },
  { value: 'fitness',    label: '운동·피트니스',emoji: '🏋️' },
  { value: 'it',         label: 'IT·소프트웨어',emoji: '💻' },
  { value: 'manufacturing', label: '제조업',   emoji: '🏭' },
  { value: 'wholesale',  label: '도매·유통',   emoji: '📦' },
  { value: 'service',    label: '서비스·수리', emoji: '🔧' },
  { value: 'other',      label: '기타',        emoji: '📌' },
]

// ─── 규모 목록 ────────────────────────────────────────────────
const BIZ_SIZES: { value: BizSize; label: string; emoji: string }[] = [
  { value: 'solo',    label: '1인 (대표만)', emoji: '🤷' },
  { value: 'under5',  label: '2~4명',        emoji: '👥' },
  { value: 'under10', label: '5~9명',        emoji: '🏢' },
  { value: 'over10',  label: '10명 이상',    emoji: '🏭' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [bizType, setBizType] = useState<BizType | null>(null)
  const [sido, setSido] = useState('')
  const [sigungu, setSigungu] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSelectSize(size: BizSize) {
    if (!bizType || !sido || !sigungu) return
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    await supabase.from('profiles').upsert({
      id: user.id,
      biz_type: bizType,
      biz_region_sido: sido,
      biz_region_sigungu: sigungu,
      biz_size: size,
    })

    router.push('/dashboard')
  }

  const sigunguList = sido ? (REGIONS[sido] ?? []) : []
  const progress = `${step}/3`

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#08112A' }}
    >
      <div
        className="w-full max-w-[520px] rounded-2xl p-8"
        style={{ backgroundColor: '#0D1E3F' }}
      >
        {/* 상단 진행 바 */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-white/40 mb-2">
            <span>사업장 정보 입력</span>
            <span>{progress}</span>
          </div>
          <div className="h-1 rounded-full bg-white/10">
            <div
              className="h-1 rounded-full transition-all duration-500"
              style={{
                width: `${(step / 3) * 100}%`,
                backgroundColor: '#E8A020',
              }}
            />
          </div>
        </div>

        {/* ── Step 1: 업종 ─────────────────────────────────────── */}
        {step === 1 && (
          <>
            <h2 className="text-xl font-bold text-white mb-6">
              어떤 사업을 이어하고 계신가요?
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {BIZ_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => {
                    setBizType(t.value)
                    setStep(2)
                  }}
                  className="flex items-center gap-3 px-4 py-4 rounded-xl border transition text-left"
                  style={{
                    backgroundColor: bizType === t.value ? 'rgba(232,160,32,0.15)' : 'rgba(255,255,255,0.03)',
                    borderColor: bizType === t.value ? '#E8A020' : 'rgba(255,255,255,0.1)',
                  }}
                >
                  <span className="text-2xl">{t.emoji}</span>
                  <span className="text-sm text-white font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── Step 2: 지역 ─────────────────────────────────────── */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-bold text-white mb-6">
              사업장이 어디에 있나요?
            </h2>
            <div className="flex flex-col gap-3">
              <select
                value={sido}
                onChange={(e) => { setSido(e.target.value); setSigungu('') }}
                className="w-full px-4 py-3 rounded-lg text-white border border-white/10 focus:outline-none focus:border-[#E8A020] transition"
                style={{ backgroundColor: '#08112A' }}
              >
                <option value="">시·도 선택</option>
                {Object.keys(REGIONS).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={sigungu}
                onChange={(e) => setSigungu(e.target.value)}
                disabled={!sido}
                className="w-full px-4 py-3 rounded-lg text-white border border-white/10 focus:outline-none focus:border-[#E8A020] transition disabled:opacity-40"
                style={{ backgroundColor: '#08112A' }}
              >
                <option value="">시·군·구 선택</option>
                {sigunguList.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-lg border border-white/10 text-white/60 hover:border-white/30 transition"
              >
                뒤로가기
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!sido || !sigungu}
                className="flex-1 py-3 rounded-lg font-semibold text-white transition disabled:opacity-40"
                style={{ backgroundColor: '#E8A020' }}
              >
                다음
              </button>
            </div>
          </>
        )}

        {/* ── Step 3: 규모 ─────────────────────────────────────── */}
        {step === 3 && (
          <>
            <h2 className="text-xl font-bold text-white mb-6">
              직원이 몇 명인가요?
            </h2>
            <div className="flex flex-col gap-3">
              {BIZ_SIZES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => handleSelectSize(s.value)}
                  disabled={saving}
                  className="flex items-center gap-4 px-5 py-4 rounded-xl border border-white/10 hover:border-[#E8A020] transition text-left disabled:opacity-50"
                  style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                >
                  <span className="text-2xl">{s.emoji}</span>
                  <span className="text-white font-medium">{s.label}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(2)}
                disabled={saving}
                className="flex-1 py-3 rounded-lg border border-white/10 text-white/60 hover:border-white/30 transition disabled:opacity-40"
              >
                뒤로가기
              </button>
            </div>
            {saving && (
              <p className="mt-4 text-center text-sm text-white/50">저장 중...</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
