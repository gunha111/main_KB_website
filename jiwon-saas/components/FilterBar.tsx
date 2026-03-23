'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const CATEGORIES = ['전체', '창업', '기술', '수출', '고용', '금융', '시설', '기타']

export default function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('category') ?? '전체'

  function select(cat: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (cat === '전체') params.delete('category')
    else params.set('category', cat)
    router.push(`/dashboard?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 flex-wrap mb-6">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => select(cat)}
          className="px-4 py-1.5 rounded-full text-sm font-medium transition"
          style={{
            backgroundColor: current === cat ? '#E8A020' : 'rgba(255,255,255,0.06)',
            color: current === cat ? '#08112A' : 'rgba(255,255,255,0.7)',
          }}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
