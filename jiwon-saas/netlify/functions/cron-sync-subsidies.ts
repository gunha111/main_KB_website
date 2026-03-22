import { fetchSubsidies, upsertSubsidies } from '../../lib/bizinfo-api'

// 매일 UTC 00:00 실행 (netlify.toml: schedule = "0 0 * * *")
export default async function handler() {
  console.log('[cron-sync-subsidies] 공고 동기화 시작')

  const subsidies = await fetchSubsidies(90)
  console.log(`[cron-sync-subsidies] 수집된 공고: ${subsidies.length}건`)

  const { inserted, updated } = await upsertSubsidies(subsidies)
  console.log(`[cron-sync-subsidies] 동기화 완료: 신규 ${inserted}건, 업데이트 ${updated}건`)

  return Response.json({ ok: true, inserted, updated })
}
