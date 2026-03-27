import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { differenceInDays, parseISO } from 'date-fns'
import type { Subsidy } from '@/lib/supabase/types'

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:[^\s"'>]*/gi, '')
}

export default async function SubsidyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params
  const { data } = await supabase.from('subsidies').select('*').eq('id', id).single()
  if (!data) notFound()

  const subsidy = data as Subsidy
  const days = differenceInDays(parseISO(subsidy.end_date), new Date())

  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
  const canDraft = profile?.plan === 'standard' || profile?.plan === 'premium'

  return (
    <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto text-white">
      {/* 뒤로가기 */}
      <Link href="/dashboard" className="text-sm text-white/50 hover:text-white/80 transition mb-6 block">
        ← 목록으로
      </Link>

      {/* 배지 */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-white/60">
          {subsidy.category}
        </span>
        {days >= 0 && (
          <span
            className="text-xs px-3 py-1 rounded-full"
            style={{
              backgroundColor: days <= 3 ? 'rgba(239,68,68,0.2)' : days <= 7 ? 'rgba(249,115,22,0.2)' : 'rgba(234,179,8,0.2)',
              color: days <= 3 ? '#F87171' : days <= 7 ? '#FB923C' : '#FBBF24',
            }}
          >
            D-{days}
          </span>
        )}
      </div>

      {/* 제목 */}
      <h1 className="text-2xl font-bold leading-snug mb-2">{subsidy.title}</h1>
      <p className="text-white/50 text-sm mb-6">{subsidy.agency} · 마감 {subsidy.end_date}</p>

      {/* 지원금액 */}
      {subsidy.support_amount && (
        <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: '#0D1E3F' }}>
          <p className="text-xs text-white/40 mb-1">지원금액</p>
          <p className="text-xl font-bold" style={{ color: '#E8A020' }}>{subsidy.support_amount}</p>
        </div>
      )}

      {/* 구분선 */}
      <hr className="border-white/10 mb-6" />

      {/* 공고 원문 */}
      <div
        className="text-sm text-white/70 leading-relaxed overflow-y-auto max-h-96 mb-8 prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(subsidy.raw_content || '공고 내용이 없습니다.') }}
      />

      {/* 하단 고정 바 */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-4 border-t border-white/10" style={{ backgroundColor: '#08112A' }}>
        <div className="max-w-3xl mx-auto flex gap-3">
          {!canDraft && (
            <p className="text-xs text-white/40 flex items-center">스탠다드 이상 이용 가능</p>
          )}
          <a
            href={subsidy.detail_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 rounded-lg border border-white/20 text-white text-center text-sm hover:border-white/50 transition"
          >
            원문 공고 보기 →
          </a>
          <Link
            href={canDraft ? `/draft/${subsidy.id}` : '#'}
            className="flex-1 py-3 rounded-lg font-semibold text-center text-sm transition"
            style={{
              backgroundColor: canDraft ? '#E8A020' : 'rgba(255,255,255,0.1)',
              color: canDraft ? '#08112A' : 'rgba(255,255,255,0.3)',
              pointerEvents: canDraft ? 'auto' : 'none',
            }}
          >
            AI 신청서 초안 받기
          </Link>
        </div>
      </div>
      <div className="h-20" />
    </div>
  )
}
