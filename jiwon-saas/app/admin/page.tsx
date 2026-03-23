'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setError('')
    setLoading(true)
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    setLoading(false)
    if (!res.ok) {
      setError('비밀번호가 틀렸습니다')
      return
    }
    router.push('/admin/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#08112A' }}>
      <div className="w-full max-w-sm rounded-2xl p-8" style={{ backgroundColor: '#0D1E3F' }}>
        <h1 className="text-xl font-bold text-white mb-6 text-center">관리자 로그인</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          placeholder="비밀번호"
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#E8A020] transition"
          autoFocus
        />
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="mt-4 w-full py-3 rounded-lg font-semibold transition disabled:opacity-50"
          style={{ backgroundColor: '#E8A020', color: '#08112A' }}
        >
          {loading ? '확인 중...' : '로그인'}
        </button>
      </div>
    </div>
  )
}
