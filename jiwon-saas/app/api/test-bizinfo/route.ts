import { NextResponse } from 'next/server'

// 개발용 테스트 라우트 — 프로덕션 배포 전 삭제
export async function GET() {

  const params = new URLSearchParams({
    crtfcKey: process.env.BIZINFO_API_KEY ?? '',
    dataType: 'json',
    pageUnit: '5',
    pageIndex: '1',
  })

  const url = `https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do?${params}`

  try {
    const res = await fetch(url)
    const text = await res.text()

    // JSON 파싱 시도
    let json = null
    try { json = JSON.parse(text) } catch { /* not json */ }

    return NextResponse.json({
      status: res.status,
      url: url.replace(process.env.BIZINFO_API_KEY ?? '', '***'),
      rawPreview: text.slice(0, 500),
      parsed: json,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
