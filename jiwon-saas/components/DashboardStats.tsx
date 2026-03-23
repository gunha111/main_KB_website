'use client'

interface Props {
  total:    number
  urgent:   number
  newToday: number
}

export default function DashboardStats({ total, urgent, newToday }: Props) {
  const stats = [
    { label: '신청 가능 공고', value: total,    color: '#E8A020' },
    { label: '이번 주 마감',   value: urgent,   color: '#F87171' },
    { label: '오늘 신규',      value: newToday, color: '#34D399' },
    { label: '저장한 공고',    value: 0,        color: '#60A5FA' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl p-5"
          style={{ backgroundColor: '#0D1E3F' }}
        >
          <p className="text-xs text-white/50 mb-1">{s.label}</p>
          <p className="text-3xl font-bold" style={{ color: s.color }}>
            {s.value}
          </p>
        </div>
      ))}
    </div>
  )
}
