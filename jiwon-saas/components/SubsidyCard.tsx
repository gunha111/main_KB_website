'use client'

import Link from 'next/link'
import { differenceInDays, parseISO } from 'date-fns'
import type { Subsidy } from '@/lib/supabase/types'

interface Props {
  subsidy: Subsidy
  blurred?: boolean
}

function DdayBadge({ endDate }: { endDate: string }) {
  const days = differenceInDays(parseISO(endDate), new Date())

  if (days < 0) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">
        마감됨
      </span>
    )
  }
  if (days <= 3) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
        D-{days} 마감임박
      </span>
    )
  }
  if (days <= 7) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400">
        D-{days} 곧 마감
      </span>
    )
  }
  if (days <= 14) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
        D-{days}
      </span>
    )
  }
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">
      D-{days}
    </span>
  )
}

export default function SubsidyCard({ subsidy, blurred = false }: Props) {
  return (
    <div
      className="relative rounded-xl p-5 border border-transparent hover:border-[#E8A020] hover:-translate-y-0.5 transition group"
      style={{ backgroundColor: '#0D1E3F' }}
    >
      {/* 상단: 기관 + 분야 배지 */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-white/40" style={{ fontSize: '13px' }}>
          {subsidy.agency}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
          {subsidy.category}
        </span>
      </div>

      {/* 공고명 */}
      <h3 className="font-bold text-white mb-3 line-clamp-2 leading-snug">
        {subsidy.title}
      </h3>

      {/* 지원금액 */}
      <p className="text-sm mb-3" style={{ color: '#E8A020' }}>
        {subsidy.support_amount ?? '지원금액 공고 확인'}
      </p>

      {/* 마감일 + D-day + 링크 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">{subsidy.end_date} 마감</span>
          <DdayBadge endDate={subsidy.end_date} />
        </div>
        <Link
          href={`/subsidies/${subsidy.id}`}
          className="text-xs text-white/50 hover:text-[#E8A020] transition"
        >
          자세히 보기 →
        </Link>
      </div>

      {/* 블러 오버레이 (free 플랜) */}
      {blurred && (
        <div className="absolute inset-0 rounded-xl backdrop-blur-sm bg-black/40 flex items-center justify-center">
          <p className="text-sm text-white/70 text-center px-4">
            🔒 스탠다드로 업그레이드하면<br />전체 공고를 볼 수 있어요
          </p>
        </div>
      )}
    </div>
  )
}
