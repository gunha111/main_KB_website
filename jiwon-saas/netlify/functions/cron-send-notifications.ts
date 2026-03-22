import { createClient } from '@supabase/supabase-js'
import { format, addDays } from 'date-fns'
import { sendBulkAlimtalk } from '../../lib/solapi'
import type { AlimtalkMessage, SendResult } from '../../lib/solapi'

const NOTIFY_DAYS = [
  { days: 14, type: 'd14' as const },
  { days: 7,  type: 'd7'  as const },
  { days: 3,  type: 'd3'  as const },
]

// 매일 UTC 01:00 실행 (netlify.toml: schedule = "0 1 * * *")
export default async function handler() {
  console.log('[cron-send-notifications] 알림 발송 시작')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const today = new Date()
  const counts = { d14: 0, d7: 0, d3: 0 }

  for (const { days, type } of NOTIFY_DAYS) {
    const targetDate = format(addDays(today, days), 'yyyy-MM-dd')

    // 해당 마감일 공고 조회
    const { data: subsidies } = await supabase
      .from('subsidies')
      .select('id, title, agency, end_date, detail_url, support_amount')
      .eq('end_date', targetDate)

    if (!subsidies?.length) continue

    for (const subsidy of subsidies) {
      // 대상 사용자: 카카오 동의 + 유료 플랜 + 해당 공고 동일 타입 알림 미발송
      const { data: sentUserIds } = await supabase
        .from('notifications')
        .select('user_id')
        .eq('subsidy_id', subsidy.id)
        .eq('type', type)

      const alreadySentIds = new Set((sentUserIds ?? []).map((n: { user_id: string }) => n.user_id))

      const { data: users } = await supabase
        .from('profiles')
        .select('id, phone')
        .eq('kakao_consent', true)
        .neq('plan', 'free')

      if (!users?.length) continue

      const targets = users.filter((u: { id: string; phone: string | null }) => !alreadySentIds.has(u.id) && u.phone)

      if (!targets.length) continue

      // 알림톡 발송
      const messages: AlimtalkMessage[] = targets.map((u: { id: string; phone: string }) => ({
        to: u.phone,
        templateType: type,
        variables: {
          subsidyTitle:  subsidy.title,
          agencyName:    subsidy.agency,
          endDate:       format(new Date(subsidy.end_date), 'yyyy년 MM월 dd일'),
          detailUrl:     subsidy.detail_url,
          supportAmount: subsidy.support_amount ?? '공고 확인 필요',
        },
      }))

      const results = await sendBulkAlimtalk(messages)

      // 발송 로그 저장
      const logs = results.map((r: SendResult, i: number) => ({
        user_id:    targets[i].id,
        subsidy_id: subsidy.id,
        type,
        channel:    'kakao',
        status:     r.success ? 'sent' : 'failed',
      }))

      await supabase.from('notifications').insert(logs)

      counts[type] += results.filter((r: SendResult) => r.success).length
    }
  }

  console.log(`[cron-send-notifications] 발송 완료: D14 ${counts.d14}건, D7 ${counts.d7}건, D3 ${counts.d3}건`)
  return Response.json({ ok: true, ...counts })
}
