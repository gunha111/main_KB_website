'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const PLANS = ['free', 'basic', 'standard', 'premium'] as const
type Plan = typeof PLANS[number]

const PLAN_LABELS: Record<Plan, string> = {
  free: '무료',
  basic: '베이직',
  standard: '스탠다드',
  premium: '프리미엄',
}

interface Stats {
  totalUsers: number
  totalSubsidies: number
  totalNotifications: number
  plans: Record<Plan, number>
}

interface User {
  id: string
  email: string
  plan: Plan
  kakao_consent: boolean
  created_at: string
}

interface Notification {
  id: string
  days_before: number
  sent_at: string
  profiles: { email: string } | null
  subsidies: { title: string } | null
}

export default function AdminDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState<'stats' | 'users' | 'notifications'>('stats')
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])

  // 플랜 변경 폼
  const [grantEmail, setGrantEmail] = useState('')
  const [grantPlan, setGrantPlan] = useState<Plan>('basic')
  const [grantMsg, setGrantMsg] = useState('')
  const [grantLoading, setGrantLoading] = useState(false)

  const fetchStats = useCallback(async () => {
    const res = await fetch('/api/admin/stats')
    if (res.status === 401) { router.push('/admin'); return }
    setStats(await res.json())
  }, [router])

  const fetchUsers = useCallback(async () => {
    const res = await fetch('/api/admin/users')
    if (res.status === 401) { router.push('/admin'); return }
    setUsers(await res.json())
  }, [router])

  const fetchNotifications = useCallback(async () => {
    const res = await fetch('/api/admin/notifications')
    if (res.status === 401) { router.push('/admin'); return }
    setNotifications(await res.json())
  }, [router])

  useEffect(() => {
    if (tab === 'stats') fetchStats()
    if (tab === 'users') fetchUsers()
    if (tab === 'notifications') fetchNotifications()
  }, [tab, fetchStats, fetchUsers, fetchNotifications])

  async function handleGrantPlan() {
    if (!grantEmail) { setGrantMsg('이메일을 입력해주세요'); return }
    setGrantLoading(true)
    setGrantMsg('')
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: grantEmail, plan: grantPlan }),
    })
    setGrantLoading(false)
    if (res.ok) {
      setGrantMsg(`✓ ${grantEmail} → ${PLAN_LABELS[grantPlan]} 변경 완료`)
      setGrantEmail('')
      fetchUsers()
    } else {
      const data = await res.json()
      setGrantMsg(`오류: ${data.error}`)
    }
  }

  const tabClass = (t: string) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition ${
      tab === t ? 'text-[#08112A]' : 'text-white/60 hover:text-white'
    }`

  return (
    <div className="min-h-screen px-6 py-8 max-w-5xl mx-auto" style={{ backgroundColor: '#08112A' }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">관리자 대시보드</h1>
        <button
          onClick={async () => {
            await fetch('/api/admin/logout', { method: 'POST' })
            router.push('/admin')
          }}
          className="text-sm text-white/40 hover:text-white/70 transition"
        >
          로그아웃
        </button>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-6 p-1 rounded-xl w-fit" style={{ backgroundColor: '#0D1E3F' }}>
        {(['stats', 'users', 'notifications'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={tabClass(t)}
            style={tab === t ? { backgroundColor: '#E8A020' } : {}}
          >
            {{ stats: '통계', users: '유저 관리', notifications: '알림 내역' }[t]}
          </button>
        ))}
      </div>

      {/* 통계 탭 */}
      {tab === 'stats' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: '총 유저', value: stats.totalUsers },
              { label: '수집 공고', value: stats.totalSubsidies },
              { label: '발송 알림', value: stats.totalNotifications },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl p-6 text-center" style={{ backgroundColor: '#0D1E3F' }}>
                <p className="text-3xl font-bold" style={{ color: '#E8A020' }}>{item.value ?? 0}</p>
                <p className="text-sm text-white/50 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl p-6" style={{ backgroundColor: '#0D1E3F' }}>
            <h2 className="text-sm font-medium text-white/50 mb-4">플랜별 분포</h2>
            <div className="grid grid-cols-4 gap-3">
              {PLANS.map((p) => (
                <div key={p} className="text-center">
                  <p className="text-2xl font-bold text-white">{stats.plans[p] ?? 0}</p>
                  <p className="text-xs text-white/40 mt-1">{PLAN_LABELS[p]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 유저 관리 탭 */}
      {tab === 'users' && (
        <div className="space-y-6">
          {/* 플랜 무료 부여 */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: '#0D1E3F' }}>
            <h2 className="text-sm font-medium text-white/70 mb-4">플랜 직접 변경</h2>
            <div className="flex gap-3 flex-wrap">
              <input
                type="email"
                value={grantEmail}
                onChange={(e) => setGrantEmail(e.target.value)}
                placeholder="유저 이메일"
                className="flex-1 min-w-48 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#E8A020] transition text-sm"
              />
              <select
                value={grantPlan}
                onChange={(e) => setGrantPlan(e.target.value as Plan)}
                className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#E8A020] transition text-sm"
              >
                {PLANS.map((p) => (
                  <option key={p} value={p} style={{ backgroundColor: '#0D1E3F' }}>
                    {PLAN_LABELS[p]}
                  </option>
                ))}
              </select>
              <button
                onClick={handleGrantPlan}
                disabled={grantLoading}
                className="px-5 py-2.5 rounded-lg font-semibold text-sm transition disabled:opacity-50"
                style={{ backgroundColor: '#E8A020', color: '#08112A' }}
              >
                {grantLoading ? '처리 중...' : '플랜 변경'}
              </button>
            </div>
            {grantMsg && (
              <p className={`mt-3 text-sm ${grantMsg.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>
                {grantMsg}
              </p>
            )}
          </div>

          {/* 유저 목록 */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#0D1E3F' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-3 text-white/40 font-medium">이메일</th>
                  <th className="text-left px-6 py-3 text-white/40 font-medium">플랜</th>
                  <th className="text-left px-6 py-3 text-white/40 font-medium">카카오</th>
                  <th className="text-left px-6 py-3 text-white/40 font-medium">가입일</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="px-6 py-3 text-white">{u.email}</td>
                    <td className="px-6 py-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: u.plan === 'free' ? 'rgba(255,255,255,0.08)' : '#E8A020',
                          color: u.plan === 'free' ? 'rgba(255,255,255,0.5)' : '#08112A',
                        }}
                      >
                        {PLAN_LABELS[u.plan] ?? u.plan}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-white/50">{u.kakao_consent ? '✓' : '-'}</td>
                    <td className="px-6 py-3 text-white/40">
                      {new Date(u.created_at).toLocaleDateString('ko-KR')}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-white/30">유저 없음</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 알림 내역 탭 */}
      {tab === 'notifications' && (
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#0D1E3F' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-3 text-white/40 font-medium">유저</th>
                <th className="text-left px-6 py-3 text-white/40 font-medium">공고</th>
                <th className="text-left px-6 py-3 text-white/40 font-medium">D-</th>
                <th className="text-left px-6 py-3 text-white/40 font-medium">발송일</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((n) => (
                <tr key={n.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-6 py-3 text-white/70">{n.profiles?.email ?? '-'}</td>
                  <td className="px-6 py-3 text-white truncate max-w-xs">{n.subsidies?.title ?? '-'}</td>
                  <td className="px-6 py-3 text-white/50">D-{n.days_before}</td>
                  <td className="px-6 py-3 text-white/40">
                    {new Date(n.sent_at).toLocaleDateString('ko-KR')}
                  </td>
                </tr>
              ))}
              {notifications.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-white/30">발송 내역 없음</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
