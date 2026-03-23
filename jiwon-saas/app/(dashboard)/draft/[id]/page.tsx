'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import type { DraftResult } from '@/lib/claude'

const SECTION_LABELS: { key: keyof DraftResult; label: string }[] = [
  { key: 'purpose',        label: '신청 목적' },
  { key: 'currentStatus',  label: '현황 및 필요성' },
  { key: 'usagePlan',      label: '활용 계획' },
  { key: 'expectedEffect', label: '기대 효과' },
]

export default function DraftPage() {
  const { id } = useParams<{ id: string }>()
  const [edited, setEdited] = useState<DraftResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function generateDraft() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subsidyId: id }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error); return }
      setEdited(json.draft)
    } catch {
      setError('오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { generateDraft() }, [])

  function copyAll() {
    if (!edited) return
    const text = SECTION_LABELS.map(({ label, key }) => `[${label}]\n${edited[key]}`).join('\n\n')
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto text-white">
      <Link href={`/dashboard/subsidies/${id}`} className="text-sm text-white/50 hover:text-white/80 transition mb-6 block">
        ← 공고로 돌아가기
      </Link>
      <h1 className="text-2xl font-bold mb-8">AI 신청서 초안</h1>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl animate-pulse" style={{ backgroundColor: '#0D1E3F' }} />
          ))}
          <p className="text-center text-white/50 text-sm">AI가 작성 중입니다...</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-4">
          {error}
        </div>
      )}

      {edited && !loading && (
        <>
          <div className="space-y-4 mb-8">
            {SECTION_LABELS.map(({ key, label }) => (
              <div key={key} className="rounded-xl p-5" style={{ backgroundColor: '#0D1E3F' }}>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-semibold" style={{ color: '#E8A020' }}>{label}</p>
                  <button
                    onClick={() => navigator.clipboard.writeText(edited[key])}
                    className="text-xs text-white/40 hover:text-white/70 transition"
                  >
                    복사
                  </button>
                </div>
                <textarea
                  value={edited[key]}
                  onChange={(e) => setEdited({ ...edited, [key]: e.target.value })}
                  rows={4}
                  className="w-full bg-transparent text-white/80 text-sm resize-none focus:outline-none leading-relaxed"
                />
              </div>
            ))}
          </div>
          <button
            onClick={copyAll}
            className="w-full py-3 rounded-xl font-semibold text-white/80 border border-white/20 hover:border-white/50 transition"
          >
            전체 복사
          </button>
        </>
      )}
    </div>
  )
}
