'use client'

export const dynamic = 'force-dynamic'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // 재발송 카운트다운
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown((n) => n - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  // OTP 8자리 완성 시 자동 인증
  useEffect(() => {
    const code = otp.join('')
    if (code.length === 8) handleVerifyOtp(code)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp])

  async function handleSendOtp() {
    setError('')
    if (!isValidEmail(email)) {
      setError('올바른 이메일 주소를 입력해주세요')
      return
    }
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithOtp({ email })
    setLoading(false)
    if (err) {
      setError('잠시 후 다시 시도해주세요')
      return
    }
    setStep('otp')
    setResendCooldown(60)
  }

  const handleVerifyOtp = useCallback(
    async (code: string) => {
      setError('')
      setLoading(true)
      const { data, error: err } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      })
      setLoading(false)
      if (err) {
        setError('인증번호가 맞지 않습니다')
        setOtp(['', '', '', '', '', '', '', ''])
        otpRefs.current[0]?.focus()
        return
      }
      const userId = data.user?.id
      if (!userId) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single()

      router.push(profile ? '/dashboard' : '/onboarding')
    },
    [email, router, supabase]
  )

  function handleOtpChange(index: number, value: string) {
    // 붙여넣기 처리
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 8)
      const newOtp = [...otp]
      digits.split('').forEach((d, i) => {
        if (index + i < 8) newOtp[index + i] = d
      })
      setOtp(newOtp)
      otpRefs.current[Math.min(index + digits.length, 7)]?.focus()
      return
    }
    const digit = value.replace(/\D/g, '')
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)
    if (digit && index < 7) otpRefs.current[index + 1]?.focus()
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#08112A' }}
    >
      <div
        className="w-full max-w-[400px] rounded-2xl p-8"
        style={{ backgroundColor: '#0D1E3F' }}
      >
        {/* 로고 */}
        <div className="text-center mb-8">
          <span className="text-3xl font-bold" style={{ color: '#E8A020' }}>
            🔔 지원알림
          </span>
          <p className="mt-2 text-sm text-white/50">
            정부 지원사업 맞춤 알림 서비스
          </p>
        </div>

        {step === 'email' ? (
          <>
            <label className="block text-sm text-white/70 mb-2">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#E8A020] transition"
              onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
              autoFocus
            />
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="mt-4 w-full py-3 rounded-lg font-semibold text-white transition disabled:opacity-50"
              style={{ backgroundColor: '#E8A020', color: '#08112A' }}
            >
              {loading ? '발송 중...' : '인증번호 받기'}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-white/70 mb-1">
              <span className="text-white font-medium">{email}</span>로
              전송된 6자리 인증번호를 입력해주세요
            </p>
            <div className="flex gap-1.5 mt-4 justify-center">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-9 h-12 text-center text-lg font-bold rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#E8A020] transition"
                />
              ))}
            </div>
            {error && <p className="mt-3 text-sm text-red-400 text-center">{error}</p>}
            {loading && <p className="mt-3 text-sm text-white/50 text-center">인증 중...</p>}
            <button
              onClick={handleSendOtp}
              disabled={resendCooldown > 0 || loading}
              className="mt-5 w-full py-2.5 rounded-lg text-sm text-white/60 border border-white/10 hover:border-white/30 transition disabled:opacity-40"
            >
              {resendCooldown > 0 ? `재발송 (${resendCooldown}초 후 가능)` : '인증번호 재발송'}
            </button>
            <button
              onClick={() => { setStep('email'); setOtp(['','','','','','','','']); setError('') }}
              className="mt-2 w-full py-2 text-sm text-white/40 hover:text-white/60 transition"
            >
              이메일 다시 입력
            </button>
          </>
        )}
      </div>
    </div>
  )
}
