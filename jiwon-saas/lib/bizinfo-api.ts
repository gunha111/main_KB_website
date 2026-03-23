import { createClient as createServiceClient } from '@supabase/supabase-js'
import type { SubsidyInsert } from './supabase/types'

const BIZINFO_URL = 'https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do'

export interface SubsidyFetch {
  external_id: string
  title: string
  agency: string
  category: string
  end_date: string  // YYYY-MM-DD
  detail_url: string
  raw_content: string
}

// 다양한 날짜 형식 → YYYY-MM-DD
export function normalizeDate(raw: string): string {
  if (!raw) return ''
  const cleaned = raw.trim()

  // YYYYMMDD
  if (/^\d{8}$/.test(cleaned)) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`
  }
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return cleaned
  // YYYY/MM/DD
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(cleaned)) return cleaned.replace(/\//g, '-')
  // YYYY.MM.DD
  if (/^\d{4}\.\d{2}\.\d{2}$/.test(cleaned)) return cleaned.replace(/\./g, '-')

  return cleaned
}

// sleep 헬퍼
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// reqstBeginEndDe 형식: "YYYYMMDD~YYYYMMDD" 또는 "YYYY-MM-DD ~ YYYY-MM-DD"
// 날짜를 파싱할 수 없으면 (예: "예산 소진시까지") 먼 미래로 처리
function parseEndDate(raw: string): string {
  if (!raw) return '2099-12-31'
  const parts = raw.split('~')
  const candidate = normalizeDate((parts[1] ?? parts[0]).trim())
  // YYYY-MM-DD 형식이 아니면 먼 미래로
  return /^\d{4}-\d{2}-\d{2}$/.test(candidate) ? candidate : '2099-12-31'
}

// 단건 페이지 조회 (재시도 포함)
async function fetchPage(params: URLSearchParams, attempt = 0): Promise<unknown[]> {
  try {
    const res = await fetch(`${BIZINFO_URL}?${params.toString()}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const items = json?.jsonArray
    if (!items) return []
    return Array.isArray(items) ? items : [items]
  } catch (err) {
    if (attempt >= 2) throw err
    await sleep(1000 * Math.pow(2, attempt)) // 1s → 2s → 4s
    return fetchPage(params, attempt + 1)
  }
}

// 공고 전체 수집 후 마감일 기준 필터링
export async function fetchSubsidies(_daysFromNow = 90): Promise<SubsidyFetch[]> {
  const today = new Date()
  const results: SubsidyFetch[] = []
  let pageIndex = 1
  const pageUnit = 100

  while (true) {
    const params = new URLSearchParams({
      crtfcKey: process.env.BIZINFO_API_KEY ?? '',
      dataType: 'json',
      pageUnit: String(pageUnit),
      pageIndex: String(pageIndex),
    })

    const items = await fetchPage(params)

    for (const item of items) {
      try {
        const i = item as Record<string, string>
        const endDate = parseEndDate(i.reqstBeginEndDe ?? '')
        // 마감일이 오늘 이후 ~ cutoff 이내인 공고만 (2099-12-31은 항상 포함)
        // 이미 마감된 공고 제외 (2099-12-31은 통과)
        if (endDate !== '2099-12-31' && endDate < today.toISOString().slice(0, 10)) continue

        const entry: SubsidyFetch = {
          external_id: i.pblancId ?? '',
          title:       i.pblancNm ?? '',
          agency:      i.jrsdInsttNm ?? '',
          category:    i.pldirSportRealmLclasCodeNm ?? '',
          end_date:    endDate,
          detail_url:  i.pblancUrl ?? '',
          raw_content: i.bsnsSumryCn ?? '',
        }
        if (entry.external_id && entry.title) {
          results.push(entry)
        }
      } catch (e) {
        console.warn('[bizinfo-api] 항목 파싱 실패, 건너뜀:', e)
      }
    }

    if (items.length < pageUnit) break
    pageIndex++
  }

  return results
}

// service role key로 직접 upsert (RLS 우회)
export async function upsertSubsidies(
  subsidies: SubsidyFetch[]
): Promise<{ inserted: number; updated: number }> {
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let inserted = 0
  let updated = 0

  // 100건씩 청크 upsert
  const CHUNK = 100
  for (let i = 0; i < subsidies.length; i += CHUNK) {
    const chunk = subsidies.slice(i, i + CHUNK)
    const rows: SubsidyInsert[] = chunk.map((s) => ({
      external_id: s.external_id,
      title:       s.title,
      agency:      s.agency,
      category:    s.category,
      end_date:    s.end_date,
      detail_url:  s.detail_url,
      raw_content: s.raw_content,
    }))

    const { data, error } = await supabase
      .from('subsidies')
      .upsert(rows, { onConflict: 'external_id', ignoreDuplicates: false })
      .select('id')

    if (error) {
      console.error('[bizinfo-api] upsert 오류:', error)
      continue
    }

    // Supabase는 upsert 결과에서 insert/update 구분을 제공하지 않으므로
    // 응답 count를 inserted로 간주 (보수적)
    inserted += data?.length ?? 0
  }

  return { inserted, updated }
}
